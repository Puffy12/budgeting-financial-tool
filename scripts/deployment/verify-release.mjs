import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { compare } from './snapshot.mjs';

const [project, backup, release, publicUrl, mode = 'verify'] = process.argv.slice(2);
const require = createRequire(path.join(project, 'package.json'));
const env = require('dotenv').parse(fs.readFileSync(path.join(project, '.env')));
if (env.NODE_ENV !== 'production' || env.DEV_MODE === 'true' || !env.PIN_AUTH_SECRET) {
  throw new Error('Production mode and existing PIN_AUTH_SECRET are required');
}
const port = Number(env.PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid runtime PORT');
const origin = `http://127.0.0.1:${port}`;
const read = (file) => JSON.parse(fs.readFileSync(path.join(project, 'data', file), 'utf8'));
const users = read('users.json');

if (mode === 'preflight') {
  const today = new Date().toISOString().slice(0, 10);
  for (const user of users) {
    if (read(`${user.id}/recurring.json`).some((item) => item.isActive && item.nextDueDate <= today)) {
      throw new Error('Recurring items are due; let the live processor finish before a strict data comparison');
    }
  }
  const start = fs.readFileSync(path.join(project, '..', 'start'), 'utf8');
  if (!start.includes('STARTCMD="$NPM start"') || !start.includes('PROJECT=myproject')) {
    throw new Error('Unexpected Opalstack launcher; inspect before changing code');
  }
  console.log(JSON.stringify({ port, production: true, pinSecretPresent: true, dueRecurring: 0 }));
  process.exit(0);
}

async function request(base, route, token, options = {}) {
  return fetch(`${base}${route}`, {
    ...options, redirect: 'error', signal: AbortSignal.timeout(10000),
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
}
async function json(route, token) {
  const response = await request(origin, route, token);
  if (!response.ok) throw new Error(`API verification failed (${response.status})`);
  return response.json();
}
function assertRows(expected, actual) {
  if (!Array.isArray(actual) || actual.length !== expected.length) throw new Error('API record count mismatch');
  const byId = new Map(actual.map((item) => [item.id, item]));
  if (byId.size !== actual.length) throw new Error('Duplicate API records');
  for (const row of expected) {
    const found = byId.get(row.id);
    if (!found || Object.keys(row).some((key) => JSON.stringify(found[key]) !== JSON.stringify(row[key]))) {
      throw new Error('API record contents differ from stored data');
    }
  }
}
let healthy = false;
for (let attempt = 0; attempt < 40; attempt++) {
  try {
    const body = await json('/health');
    if (body.status === 'healthy') { healthy = true; break; }
  } catch { /* The new process may still be starting. */ }
  await new Promise((resolve) => setTimeout(resolve, 500));
}
if (!healthy) throw new Error('New server did not become healthy');
const resolved = require(path.join(project, 'server/db/paths.js')).DATA_DIR;
if (resolved !== path.join(project, 'data')) throw new Error('Server resolves the wrong data directory');
if ((await request(origin, '/api/users')).status !== 401) throw new Error('Unauthenticated access is not blocked');
for (const user of users) {
  // Short-lived deployment probe; never logged, saved, or returned to the caller.
  const payload = `${user.id}:${Date.now() + 60000}`;
  const token = `${payload}:${crypto.createHmac('sha256', env.PIN_AUTH_SECRET).update(payload).digest('hex')}`;
  const prefix = `/api/users/${user.id}`;
  const safeUser = { ...user };
  delete safeUser.pinHash;
  assertRows([safeUser], await json('/api/users', token));
  const profile = await json(prefix, token);
  if ('pinHash' in profile) throw new Error('Profile exposes a PIN hash');
  assertRows([safeUser], [profile]);
  for (const collection of ['categories', 'recurring']) {
    assertRows(read(`${user.id}/${collection}.json`), await json(`${prefix}/${collection}`, token));
  }
  const expected = read(`${user.id}/transactions.json`);
  const rows = [];
  do {
    const page = await json(`${prefix}/transactions?limit=1000&offset=${rows.length}`, token);
    if (page.total !== expected.length) throw new Error('Transaction total differs');
    if (!page.transactions.length && rows.length < expected.length) throw new Error('Missing transaction page');
    rows.push(...page.transactions);
  } while (rows.length < expected.length);
  assertRows(expected, rows);
  const other = users.find((candidate) => candidate.id !== user.id);
  if (other && (await request(origin, `/api/users/${other.id}/transactions`, token)).status !== 403) {
    throw new Error('Cross-user access is not blocked');
  }
}
for (const base of [origin, publicUrl]) {
  const response = await request(base, '/release.json');
  if (!response.ok || (await response.json()).release !== release) throw new Error('Release identity mismatch');
  const page = await request(base, `/app/${users[0].id}`, null, { headers: { Accept: 'text/html' } });
  if (!page.ok || !(await page.text()).includes('/assets/')) throw new Error('Frontend route unavailable');
}
console.log(JSON.stringify({ ...compare(project, backup), authenticatedUsersVerified: users.length, publicVerified: true, release }));
