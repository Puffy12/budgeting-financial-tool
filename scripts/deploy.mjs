/**
 * Deploy is stopped on purpose.
 *
 * backend/deploy.mjs deploys the directory it lives in. The remote app root
 * must contain server.js and package.json, and user data stays beside that
 * server.js in a data/ folder that the archive never uploads.
 *
 * This repository is now one package:
 * - the API entry is server/server.js, not a root server.js
 * - the installable package.json is the repo root and includes the client
 * - Vite writes dist/ at the repo root
 * - JSON storage is <repo>/data, resolved from server/db as ../../data
 *
 * Archiving the repo root, or archiving server/ alone, would not match that
 * remote contract. A new archive layout is a deploy decision and is not guessed here.
 */
console.error('npm run deploy is stopped. The previous deploy script cannot package this layout.')
console.error('')
console.error('backend/deploy.mjs conflict:')
console.error('  1. It builds ../frontend and copies frontend/dist into its own dist/.')
console.error('  2. It archives its own directory. The remote check requires server.js and package.json at myproject/.')
console.error('  3. The remote install is npm install --omit=dev against that backend-only package.json.')
console.error('  4. Production data lived beside server.js and was excluded from the archive.')
console.error('     Local data is now <repo>/data. server/db resolves ../../data from server/db.')
console.error('     If server.js is no longer the deployed project root, that relative path misses production data.')
console.error('  5. OpalStack starts the app with an external bash start that this repo does not own.')
console.error('')
console.error('No files were uploaded. Ask Mike how the remote root should look before changing deploy.')
process.exit(1)
