import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { root, appDir, liveDir, backupRoot, connect, execute, quote } from './deployment/connection.mjs';
import { createArchive } from './deployment/archive.mjs';
import { prepareBackup } from './deployment/backup-production.mjs';
import { stage } from './deployment/stage.mjs';

const flags = new Set(process.argv.slice(2));
const allowed = new Set(['--build', '--no-build', '--check-env', '--backup-only']);
for (const flag of flags) {
  if (!allowed.has(flag)) throw new Error(`Unsupported flag: ${flag}. Data reset is not supported.`);
}
const publicUrl = process.env.LIVE_PUBLIC_URL || 'https://budget-tool.advran.opalstacked.com';
if (new URL(publicUrl).protocol !== 'https:') throw new Error('Public verification requires HTTPS');
if (flags.has('--check-env')) {
  console.log(JSON.stringify({ project: liveDir, backupRoot, publicUrl, runtimeEnvironment: 'preserve server .env' }));
  process.exit(0);
}
const release = new Date().toISOString().replaceAll(':', '-');
const local = path.join(root, '.deploy-tmp', release);
fs.mkdirSync(local, { recursive: true, mode: 0o700 });
if (!flags.has('--backup-only') && !flags.has('--no-build')) {
  execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
}
const archive = path.join(local, 'release.tar.gz');
const artifact = flags.has('--backup-only') ? null : createArchive(root, archive, release);
const client = await connect();
const lock = `${appDir}/.budget-deploy-lock`;
let locked = false;
let releaseLock = true;
try {
  await execute(client, `umask 077\nmkdir ${quote(lock)}`);
  locked = true;
  const prepared = await prepareBackup(client, release);
  console.log('Verified production backup:', JSON.stringify(prepared.summary));
  if (!flags.has('--backup-only')) {
    console.log('Installing and checking the staged release while production serves.');
    const preflight = await stage(client, prepared.work, archive, artifact.sha256, release, publicUrl);
    const finalBackup = `${backupRoot}/${release}-cutover`;
    console.log('Staging passed. Taking a final stopped-app snapshot and switching code.');
    releaseLock = false; // A lost connection must leave the lock until remote recovery is checked.
    const result = await execute(client, `bash ${quote(`${prepared.work}/cutover.sh`)} ${quote(appDir)} ${quote(prepared.work)} ${quote(finalBackup)} ${quote(release)} ${quote(publicUrl)} ${quote(preflight.port)}`);
    releaseLock = true;
    console.log(result);
    const receipt = { release, publicUrl, backup: finalBackup, previousCode: `${prepared.work}/previous`, sha256: artifact.sha256 };
    fs.writeFileSync(path.join(local, 'receipt.json'), JSON.stringify(receipt, null, 2));
    console.log('Deployment verified:', JSON.stringify(receipt));
  }
} catch (error) {
  if (error.message.includes('Previous release restored and healthy.')) releaseLock = true;
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (locked && releaseLock) {
    await execute(client, `rmdir ${quote(lock)}`).catch(() => console.error('Deploy lock remains; inspect server before retrying.'));
  } else if (locked) console.error('Deploy outcome requires inspection; retained the remote deploy lock.');
  client.end();
}
