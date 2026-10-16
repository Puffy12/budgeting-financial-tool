import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { backup, compare, inspect } from './snapshot.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'budget-backup-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const project = path.join(root, 'app');
  const directory = path.join(project, 'data/u1');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(project, '.env'), 'PIN_AUTH_SECRET=test-only\n');
  fs.writeFileSync(path.join(project, 'data/users.json'), JSON.stringify([{ id: 'u1' }]));
  for (const collection of ['categories', 'recurring', 'transactions']) {
    fs.writeFileSync(path.join(directory, `${collection}.json`), JSON.stringify(collection === 'transactions'
      ? [{ id: 't1', userId: 'u1', date: '2026-10-15', amount: 19.99 }] : []));
  }
  return { project, destination: path.join(root, 'backup'), directory };
}

test('backup preserves exact JSON bytes, dates, amounts and environment; cannot overwrite a backup', (t) => {
  const { project, destination } = fixture(t);
  const result = backup(project, destination);
  assert.equal(result.transactions, 1);
  assert.deepEqual(result.recent, { date: '2026-10-15', amount: 19.99 });
  assert.equal(compare(project, destination).unchanged, true);
  assert.throws(() => backup(project, destination), /EEXIST/);
  fs.writeFileSync(path.join(project, '.env'), 'PIN_AUTH_SECRET=changed\n');
  assert.throws(() => compare(project, destination), /environment differs/);
});

test('comparison catches lost or changed money even with the same transaction count', (t) => {
  const { project, destination, directory } = fixture(t);
  backup(project, destination);
  const file = path.join(directory, 'transactions.json');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('19.99', '19.98'));
  assert.throws(() => compare(project, destination), /data differs/);
});

test('invalid ownership, missing files and ancient migration source abort instead of silently reading empty', (t) => {
  const { project, directory } = fixture(t);
  const file = path.join(directory, 'transactions.json');
  const original = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, original.replace('u1', 'u2'));
  assert.throws(() => inspect(path.join(project, 'data')), /ownership/);
  fs.unlinkSync(file);
  assert.throws(() => inspect(path.join(project, 'data')), /ENOENT/);
  fs.writeFileSync(file, original);
  fs.writeFileSync(path.join(project, 'data/db.json'), '{}');
  assert.throws(() => inspect(path.join(project, 'data')), /Ancient/);
});
