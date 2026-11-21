#!/usr/bin/env bash
# Refresh the mirror of fawazahmed0/hadith-api and restart the hadistweb containers, which cache what they read.
# Installed on the server as /usr/local/lib/hadistweb/mirror-sync.sh (with sync-mirror.mjs beside it) and run by
# hadistweb-mirror-sync.timer. The host has no Node.js, so the sync runs in the node image the app is built from,
# as the owner of the mirror directory, with umask 022 so the app's container user (uid 1001) can read the files.
set -euo pipefail

LIB_DIR="${LIB_DIR:-/usr/local/lib/hadistweb}"
MIRROR_ROOT="${MIRROR_ROOT:-/srv/hadith-mirror}"
OWNER="$(stat -c '%u:%g' "$MIRROR_ROOT")"

docker run --rm --user "$OWNER" \
  -v "$LIB_DIR:/app:ro" -v "$MIRROR_ROOT:$MIRROR_ROOT" \
  node:26-alpine sh -c "umask 022 && node /app/sync-mirror.mjs $MIRROR_ROOT/hadith-api" </dev/null

for name in hadistweb-qa hadistweb-prod; do
  if docker inspect "$name" >/dev/null 2>&1 </dev/null; then
    docker restart "$name" >/dev/null </dev/null
    echo "restarted $name"
  fi
done
