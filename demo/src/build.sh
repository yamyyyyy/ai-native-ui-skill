#!/usr/bin/env bash
# Rebuild demo/assets/tailwind.css from demo/src/app.css without a repo install (uses a temp dir; prefer `npm run build:css`).
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)"
TMP="${TW_DIR:-$(mktemp -d)}"; cd "$TMP"
[ -x node_modules/.bin/tailwindcss ] || { npm init -y >/dev/null && npm i -s @tailwindcss/cli@4 tailwindcss@4 >/dev/null; }
sed "s#@source \"../index.html\";#@source \"$DIR/index.html\";#; s#url(fonts/#url(fonts/#g" "$DIR/src/app.css" > in.css
./node_modules/.bin/tailwindcss -i in.css -o "$DIR/assets/tailwind.css" --minify
