import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function setup(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'budget-cutover-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const app = path.join(root, 'app');
  const live = path.join(app, 'myproject');
  const work = path.join(app, '.deploy/test');
  const write = (file, value, mode = 0o600) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, value, { mode });
  };
  write(`${live}/data/users.json`, '[{"id":"u1"}]');
  for (const name of ['categories', 'transactions', 'recurring']) write(`${live}/data/u1/${name}.json`, '[]');
  write(`${live}/.env`, 'PIN_AUTH_SECRET=fixture-only\n');
  write(`${live}/storage/keep`, 'original storage');
  write(`${live}/server.js`, 'original server');
  write(`${live}/package.json`, 'original package');
  write(`${live}/node_modules/keep`, 'original modules');
  write(`${work}/stage/server/server.js`, 'new server');
  write(`${work}/stage/dist/index.html`, 'new frontend');
  write(`${work}/stage/package.json`, 'new package');
  write(`${work}/stage/package-lock.json`, 'new lock');
  write(`${work}/stage/node_modules/keep`, 'new modules');
  write(`${app}/start`, 'echo start >> control.log\n');
  write(`${app}/stop`, 'echo stop >> control.log\n');
  write(`${app}/activate`, `export PATH="${root}/bin:$PATH"\n`);
  // Only the port bind and HTTP process checks are mocked; all filesystem moves and snapshots are real.
  write(`${root}/bin/node`, `#!/bin/bash\nif [[ "$1" == '-' ]]; then cat >/dev/null; exit 0; fi\nexec '${process.execPath}' "$@"\n`, 0o700);
  write(`${root}/bin/curl`, '#!/bin/bash\nexit 0\n', 0o700);
  fs.copyFileSync(path.join(import.meta.dirname, 'snapshot.mjs'), `${work}/snapshot.mjs`);
  write(`${work}/verify-release.mjs`, `if (process.env.FAIL_VERIFY === '1' && !process.argv.includes('preflight')) process.exit(1);\nconsole.log('{}');\n`);
  return { root, app, live, work };
}

for (const fail of [false, true]) {
  test(fail ? 'failed verification restores original code without changing data or env' : 'successful cutover preserves data, env, storage and previous dependencies', (t) => {
    const { root, app, live, work } = setup(t);
    const before = fs.readFileSync(`${live}/data/users.json`);
    const result = spawnSync('bash', [path.join(import.meta.dirname, 'cutover.sh'), app, work,
      `${root}/backup`, 'test', 'https://example.test', '3141'], {
      env: { ...process.env, FAIL_VERIFY: fail ? '1' : '0' }, encoding: 'utf8', timeout: 15000,
    });
    assert.equal(result.status, fail ? 1 : 0, result.stderr);
    assert.ok(fs.readFileSync(`${live}/data/users.json`).equals(before));
    assert.equal(fs.readFileSync(`${live}/.env`, 'utf8'), 'PIN_AUTH_SECRET=fixture-only\n');
    assert.equal(fs.readFileSync(`${live}/storage/keep`, 'utf8'), 'original storage');
    assert.ok(fs.readFileSync(`${root}/backup/data/users.json`).equals(before));
    if (fail) {
      assert.equal(fs.readFileSync(`${live}/server.js`, 'utf8'), 'original server');
      assert.equal(fs.readFileSync(`${live}/node_modules/keep`, 'utf8'), 'original modules');
      assert.equal(fs.readFileSync(`${work}/failed/server/server.js`, 'utf8'), 'new server');
    } else {
      assert.equal(fs.readFileSync(`${live}/server/server.js`, 'utf8'), 'new server');
      assert.equal(fs.readFileSync(`${work}/previous/node_modules/keep`, 'utf8'), 'original modules');
    }
  });
}
