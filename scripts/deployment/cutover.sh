#!/usr/bin/env bash
set -euo pipefail
APP=$1
WORK=$2
BACKUP=$3
RELEASE=$4
PUBLIC_URL=$5
PORT=$6
LIVE="$APP/myproject"
STAGE="$WORK/stage"
PREVIOUS="$WORK/previous"
FAILED="$WORK/failed"
cd "$APP"
set +u
source ./activate >/dev/null
set -u
mkdir "$PREVIOUS" "$FAILED"
stopped=0
phase=0
committed=0
new_names=(server dist package.json package-lock.json node_modules)
old_names=(server server.js dist package.json package-lock.json node_modules auth middleware routes utils validation)

control() {
  local result=0
  bash "$1" || result=$?
  [[ "$result" == 0 || "$result" == 99 ]]
}
port_free() {
  PORT_TO_CHECK="$PORT" node - <<'NODE'
const net = require('node:net');
const server = net.createServer();
server.once('error', () => process.exit(1));
server.listen(Number(process.env.PORT_TO_CHECK), '0.0.0.0', () => server.close());
NODE
}
wait_free() {
  for attempt in {1..100}; do
    if port_free 2>/dev/null; then return 0; fi
    sleep 0.1
  done
  return 1
}
rollback() {
  local result=$?
  trap - EXIT HUP INT TERM
  if [[ "$committed" == 0 && "$stopped" == 1 ]]; then
    echo 'Verification failed; restoring previous code. Production data stays in place.' >&2
    control stop || { echo 'Rollback stop failed; manual recovery required.' >&2; exit 1; }
    wait_free || { echo 'Rollback port still busy; manual recovery required.' >&2; exit 1; }
    if [[ "$phase" == 2 ]]; then
      for name in "${new_names[@]}"; do
        if [[ ! -e "$STAGE/$name" && -e "$LIVE/$name" ]]; then
          mv "$LIVE/$name" "$FAILED/$name" || exit 1
        fi
      done
    fi
    for entry in "$PREVIOUS"/*; do
      [[ -e "$entry" ]] || continue
      mv "$entry" "$LIVE/" || exit 1
    done
    control start || { echo 'Previous code restored but restart failed.' >&2; exit 1; }
    local healthy=0
    for attempt in {1..40}; do
      if curl --fail --silent --max-time 2 "http://127.0.0.1:$PORT/health" >/dev/null; then healthy=1; break; fi
      sleep 0.5
    done
    [[ "$healthy" == 1 ]] || { echo 'Previous release health failed; manual recovery required.' >&2; exit 1; }
    echo 'Previous release restored and healthy.' >&2
  fi
  exit "$result"
}
trap rollback EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

# Nothing below moves, uploads, overwrites, or deletes data/, .env, or storage/.
stopped=1
control stop
wait_free
node "$WORK/snapshot.mjs" backup "$LIVE" "$BACKUP"
cp -p start stop activate "$BACKUP/"
node "$WORK/verify-release.mjs" "$LIVE" "$BACKUP" "$RELEASE" "$PUBLIC_URL" preflight >/dev/null
phase=1
for name in "${old_names[@]}"; do
  if [[ -e "$LIVE/$name" ]]; then mv "$LIVE/$name" "$PREVIOUS/$name"; fi
done
phase=2
for name in "${new_names[@]}"; do mv "$STAGE/$name" "$LIVE/$name"; done
node "$WORK/snapshot.mjs" compare "$LIVE" "$BACKUP"
control start
node "$WORK/verify-release.mjs" "$LIVE" "$BACKUP" "$RELEASE" "$PUBLIC_URL" > "$WORK/verified.json"
committed=1
cat "$WORK/verified.json"
