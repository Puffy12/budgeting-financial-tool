import path from 'node:path';
import { root, appDir, liveDir, quote, execute, upload } from './connection.mjs';

export async function stage(client, work, archive, sha256, release, publicUrl) {
  for (const name of ['verify-release.mjs', 'cutover.sh']) {
    await upload(client, path.join(root, 'scripts/deployment', name), `${work}/${name}`);
  }
  const preflight = JSON.parse(await execute(client, `cd ${quote(appDir)}
set +u
source ./activate >/dev/null
set -u
node ${quote(`${work}/verify-release.mjs`)} ${quote(liveDir)} unused ${quote(release)} ${quote(publicUrl)} preflight`));
  await upload(client, archive, `${work}/release.tar.gz`);
  await execute(client, `cd ${quote(work)}
printf '%s  release.tar.gz\n' ${quote(sha256)} | sha256sum --check >/dev/null
mkdir stage
tar -xzf release.tar.gz -C stage
test -f stage/server/server.js
test -f stage/dist/index.html
test ! -e stage/data
test ! -e stage/.env
test ! -e stage/node_modules
cd ${quote(appDir)}
set +u
source ./activate >/dev/null
set -u
cd ${quote(`${work}/stage`)}
npm ci --omit=dev --ignore-scripts --no-audit --no-fund > ${quote(`${work}/install.log`)} 2>&1
node --check server/server.js
node - <<'NODE'
const fs = require('node:fs');
const p = JSON.parse(fs.readFileSync('package.json'));
if (p.scripts.start !== 'node server/server.js') throw new Error('Wrong production entry');
for (const name of Object.keys(p.dependencies)) require.resolve(name);
NODE`);
  return preflight;
}
