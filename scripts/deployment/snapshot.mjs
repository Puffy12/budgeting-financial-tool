import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

export function hashes(directory) {
  const result = {};
  function walk(current, prefix = '') {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const relative = path.posix.join(prefix, entry.name);
      const full = path.join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error('Symlink in data tree; manual review required');
      if (entry.isDirectory()) walk(full, relative);
      else if (entry.isFile()) result[relative] = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
      else throw new Error('Unexpected data entry');
    }
  }
  walk(directory);
  return result;
}

export function inspect(directory) {
  const read = (file) => {
    const value = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
    if (!Array.isArray(value)) throw new Error('Expected a JSON collection');
    return value;
  };
  if (fs.existsSync(path.join(directory, 'db.json'))) throw new Error('Ancient db.json would trigger startup migration');
  const users = read('users.json');
  if (!users.length) throw new Error('Refusing an empty production database');
  const counts = { users: users.length, categories: 0, transactions: 0, recurring: 0 };
  const ids = new Set();
  let recent = null;
  for (const user of users) {
    if (!user || !/^[a-zA-Z0-9_-]+$/.test(user.id) || ids.has(user.id)) throw new Error('Invalid or duplicate user id');
    ids.add(user.id);
    for (const collection of ['categories', 'transactions', 'recurring']) {
      const rows = read(`${user.id}/${collection}.json`);
      counts[collection] += rows.length;
      const rowIds = new Set();
      for (const row of rows) {
        if (!row || row.userId !== user.id || typeof row.id !== 'string' || rowIds.has(row.id)) {
          throw new Error('Invalid ownership or duplicate record');
        }
        rowIds.add(row.id);
        if (collection !== 'categories' && !Number.isFinite(row.amount)) throw new Error('Invalid amount');
        if (collection === 'transactions') {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) throw new Error('Invalid transaction date');
          const order = `${row.date}:${row.createdAt || ''}`;
          if (!recent || order > recent.order) recent = { order, date: row.date, amount: row.amount };
        }
      }
    }
  }
  return { counts, recent: recent ? { date: recent.date, amount: recent.amount } : null, files: hashes(directory) };
}

export function backup(project, destination) {
  const source = path.join(project, 'data');
  const before = inspect(source);
  const envBefore = fs.readFileSync(path.join(project, '.env'));
  fs.mkdirSync(destination, { mode: 0o700 }); // Never overwrite a backup.
  fs.cpSync(source, path.join(destination, 'data'), { recursive: true, errorOnExist: true, force: false });
  fs.writeFileSync(path.join(destination, '.env'), envBefore, { mode: 0o600, flag: 'wx' });
  const copy = inspect(path.join(destination, 'data'));
  const after = inspect(source);
  if (JSON.stringify(before) !== JSON.stringify(copy) || JSON.stringify(copy) !== JSON.stringify(after)) {
    throw new Error('Data changed during backup; retained incomplete copy, retry with a fresh directory');
  }
  if (!fs.readFileSync(path.join(project, '.env')).equals(envBefore)) throw new Error('Environment changed during backup');
  fs.writeFileSync(path.join(destination, 'manifest.json'), JSON.stringify(copy, null, 2), { mode: 0o600, flag: 'wx' });
  return { backup: destination, ...copy.counts, recent: copy.recent, files: Object.keys(copy.files).length };
}

export function compare(project, destination) {
  const expected = inspect(path.join(destination, 'data'));
  const actual = inspect(path.join(project, 'data'));
  if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error('Production data differs from backup');
  if (!fs.readFileSync(path.join(project, '.env')).equals(fs.readFileSync(path.join(destination, '.env')))) {
    throw new Error('Production environment differs from backup');
  }
  return { unchanged: true, ...actual.counts, recent: actual.recent };
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  const [mode, project, destination] = process.argv.slice(2);
  try {
    if (!['backup', 'compare', 'inspect'].includes(mode)) throw new Error('Expected backup, compare, or inspect');
    const result = mode === 'backup' ? backup(project, destination)
      : mode === 'compare' ? compare(project, destination) : inspect(path.join(project, 'data'));
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
