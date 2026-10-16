import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'ssh2';
import dotenv from 'dotenv';

export const root = path.resolve(import.meta.dirname, '../..');
const env = { ...dotenv.parse(fs.readFileSync(path.join(root, '.env'))), ...process.env };
export const config = {
  host: env.OPALSTACK_HOST,
  username: env.OPALSTACK_USER,
  password: env.OPALSTACK_PASSWORD,
  port: Number(env.OPALSTACK_PORT || 22), // This repository uses this key for SSH, not HTTP.
  app: env.APP_NAME,
};
for (const key of ['host', 'username', 'app']) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(config[key] || '')) throw new Error(`Invalid ${key}`);
}
if (!config.password) throw new Error('Missing OPALSTACK_PASSWORD');
if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) throw new Error('Invalid SSH port');
export const appDir = `/home/${config.username}/apps/${config.app}`;
export const liveDir = `${appDir}/myproject`;
if (env.OPALSTACK_PROJECT_DIR && env.OPALSTACK_PROJECT_DIR !== liveDir) throw new Error('Unexpected project path');
export const backupRoot = `/home/${config.username}/backups/${config.app}`;
export const quote = (value) => `'${String(value).replaceAll("'", "'\\''")}'`;

export function connect() {
  return new Promise((resolve, reject) => {
    const client = new Client();
    client.once('ready', () => resolve(client));
    client.once('error', reject);
    client.connect({ ...config, readyTimeout: 20000, keepaliveInterval: 10000 });
  });
}

export function execute(client, script) {
  return new Promise((resolve, reject) => {
    client.exec('bash -s', (error, stream) => {
      if (error) return reject(error);
      let stdout = '';
      let stderr = '';
      stream.on('data', (chunk) => { stdout += chunk; });
      stream.stderr.on('data', (chunk) => { stderr += chunk; });
      stream.on('error', reject);
      stream.on('close', (code) => {
        if (code !== 0) return reject(new Error(`Remote command failed (${code}): ${stderr.slice(-2000)}`));
        resolve(stdout.trim());
      });
      stream.end(`set -euo pipefail\n${script}\n`);
    });
  });
}

export function upload(client, local, remote) {
  return new Promise((resolve, reject) => {
    client.sftp((error, sftp) => {
      if (error) return reject(error);
      sftp.fastPut(local, remote, { mode: 0o600 }, (failure) => {
        sftp.end();
        if (failure) reject(failure); else resolve();
      });
    });
  });
}
