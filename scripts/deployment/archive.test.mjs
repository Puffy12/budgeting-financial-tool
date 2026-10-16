import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createArchive } from './archive.mjs';

test('only runtime files enter the archive; local data, env, storage and modules stay out', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'budget-archive-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const name of ['server/server.js', 'dist/index.html', 'package.json', 'package-lock.json',
    'data/users.json', '.env', 'storage/private.txt', 'node_modules/private.js', 'server/.env', 'server/data/secret.json']) {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), '{}');
  }
  const archive = path.join(root, 'release.tar.gz');
  createArchive(root, archive, 'test-release');
  const entries = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' }).trim().split('\n');
  assert.deepEqual(entries.sort(), ['server/server.js', 'dist/index.html', 'dist/release.json', 'package.json', 'package-lock.json'].sort());
});
