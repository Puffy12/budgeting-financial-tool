import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const included = ['server', 'dist', 'package.json', 'package-lock.json'];
const forbidden = new Set(['data', 'storage', 'node_modules', '.git', 'legacy']);

export function runtimeFiles(root) {
  const files = [];
  function walk(relative) {
    const name = path.basename(relative);
    if (forbidden.has(name) || name.startsWith('.env')) return;
    const stat = fs.lstatSync(path.join(root, relative));
    if (stat.isSymbolicLink()) throw new Error('Runtime archive must not contain symlinks');
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(path.join(root, relative)).sort()) walk(`${relative}/${entry}`);
    } else if (stat.isFile()) files.push(relative);
    else throw new Error('Unexpected runtime file');
  }
  for (const relative of included) walk(relative);
  for (const required of ['server/server.js', 'dist/index.html', 'package.json', 'package-lock.json']) {
    if (!files.includes(required)) throw new Error(`Missing ${required}`);
  }
  return files;
}

export function createArchive(root, destination, release) {
  fs.writeFileSync(path.join(root, 'dist/release.json'), JSON.stringify({ release }));
  const files = runtimeFiles(root);
  execFileSync('tar', ['-czf', destination, '-C', root, ...files], {
    env: { ...process.env, COPYFILE_DISABLE: '1' },
  });
  return { sha256: crypto.createHash('sha256').update(fs.readFileSync(destination)).digest('hex'), files: files.length };
}
