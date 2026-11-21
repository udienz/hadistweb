#!/usr/bin/env bash
# Deploy hadistweb on the server. Run ON THE SERVER by the GitHub workflow (same server and pattern as quranweb):
#   ssh server 'bash -s' -- <qa|prod> <git-ref> < scripts/deploy.sh
# nginx + certbot on the host forward each domain to the local port below.
#   qa   -> hadist-qa.udienz.web.id, 127.0.0.1:3010
#   prod -> hadist.udienz.web.id,    127.0.0.1:3012
# (quranweb uses 3000 and 3002 on the same server.)
set -euo pipefail

ENVIRONMENT="${1:?usage: deploy.sh <qa|prod> <git-ref>}"
REF="${2:?usage: deploy.sh <qa|prod> <git-ref>}"

case "$ENVIRONMENT" in
  qa)   PORT=3010 ;;
  prod) PORT=3012 ;;
  *) echo "environment must be qa or prod" >&2; exit 2 ;;
esac

# The books are read from our mirror of fawazahmed0/hadith-api (scripts/sync-mirror.mjs), mounted read-only. The
# parent directory is mounted, not the mirror itself: sync-mirror swaps the mirror directory, and a bind mount of it
# would keep showing the old one. HadeethEnc (topics, the Indonesian an-Nawawi) is read live, not mirrored.
MIRROR_ROOT="${MIRROR_ROOT:-/srv/hadith-mirror}"
if [ ! -f "$MIRROR_ROOT/hadith-api/info.min.json" ] || [ ! -d "$MIRROR_ROOT/hadith-api/editions" ]; then
  echo "mirror $MIRROR_ROOT/hadith-api is missing: run scripts/sync-mirror.mjs $MIRROR_ROOT/hadith-api" >&2
  exit 2
fi
DATA_ARGS=(-v "$MIRROR_ROOT:/data:ro" -e HADITH_FAWAZ_URL=/data/hadith-api)

NAME="hadistweb-$ENVIRONMENT"
IMAGE="hadistweb:$ENVIRONMENT"
DIR="${DEPLOY_DIR:-$HOME/deploy/$NAME}"
REPO="https://github.com/udienz/hadistweb.git"

if [ ! -d "$DIR/.git" ]; then
  mkdir -p "$(dirname "$DIR")"
  git clone "$REPO" "$DIR" </dev/null
fi
cd "$DIR"
git fetch --tags origin </dev/null
git checkout --force --detach "$REF"

# Keep the previous image under its own tag so a failed deploy can roll back (quranweb, QA 2026-11-19).
PREVIOUS=""
if sudo docker image inspect "$IMAGE" >/dev/null 2>&1; then
  PREVIOUS="$IMAGE-previous"
  sudo docker tag "$IMAGE" "$PREVIOUS"
fi

# </dev/null on every command that could read stdin: this script itself arrives on stdin (`bash -s`), and a command
# that reads it would swallow the rest of the script (workspace notes, deploy of udienz/auth 2026-11-18).
sudo docker build -t "$IMAGE" . </dev/null
sudo docker rm -f "$NAME" >/dev/null 2>&1 </dev/null || true
sudo docker run -d --name "$NAME" --restart unless-stopped \
  "${DATA_ARGS[@]}" \
  -p "127.0.0.1:$PORT:3000" "$IMAGE" >/dev/null </dev/null

# The home page needs no data; a chapter page proves the mirror is readable from the container.
for i in $(seq 1 20); do
  if [ "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/")" = "200" ] \
    && [ "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/bukhari/chapter/1")" = "200" ]; then
    echo "deploy $ENVIRONMENT OK: $REF"
    sudo docker image prune -f >/dev/null </dev/null
    exit 0
  fi
  sleep 2
done

echo "deploy $ENVIRONMENT FAILED: the app does not answer" >&2
sudo docker logs --tail 30 "$NAME" >&2 </dev/null
if [ -n "$PREVIOUS" ]; then
  echo "rolling back to the previous image" >&2
  sudo docker rm -f "$NAME" >/dev/null 2>&1 </dev/null || true
  sudo docker run -d --name "$NAME" --restart unless-stopped \
    "${DATA_ARGS[@]}" \
    -p "127.0.0.1:$PORT:3000" "$PREVIOUS" >/dev/null </dev/null
fi
exit 1
