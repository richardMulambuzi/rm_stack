#!/usr/bin/env sh
# Install this curated OpenCode stack into an OpenCode profile directory.
#
#   sh install.sh                      # -> ~/.config/opencode
#   OPENCODE_HOME=~/.config/opencode sh install.sh
#
# Non-destructive: existing files not present here are left alone, and no
# destination file is deleted. Files shared with this repo are overwritten.

set -eu

REPO="$(cd "$(dirname "$0")" && pwd)"
DEST="${OPENCODE_HOME:-$HOME/.config/opencode}"

mkdir -p "$DEST"
rsync -a --exclude '.git' --exclude 'install.sh' --exclude '.DS_Store' "$REPO/" "$DEST/"

echo "Installed OpenCode stack into $DEST"
echo "Restart OpenCode to pick up the config and skills."
