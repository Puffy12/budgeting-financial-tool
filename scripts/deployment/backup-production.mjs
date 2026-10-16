import path from 'node:path';
import { root, appDir, liveDir, backupRoot, quote, execute, upload } from './connection.mjs';

export async function prepareBackup(client, release) {
  const work = `${appDir}/.deploy/${release}`;
  const backup = `${backupRoot}/${release}-before`;
  await execute(client, `umask 077
mkdir -p ${quote(backupRoot)} ${quote(`${appDir}/.deploy`)}
mkdir ${quote(work)}
chmod 700 ${quote(backupRoot)} ${quote(work)}
test -f ${quote(`${liveDir}/.env`)}
test -f ${quote(`${liveDir}/data/users.json`)}`);
  await upload(client, path.join(root, 'scripts/deployment/snapshot.mjs'), `${work}/snapshot.mjs`);
  const result = await execute(client, `cd ${quote(appDir)}
set +u
source ./activate >/dev/null
set -u
node ${quote(`${work}/snapshot.mjs`)} backup ${quote(liveDir)} ${quote(backup)}
cp -p start stop activate ${quote(backup)}/`);
  return { work, backup, summary: JSON.parse(result) };
}
