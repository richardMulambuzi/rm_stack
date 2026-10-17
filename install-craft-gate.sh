#!/usr/bin/env sh
# Install the craft-gate pre-commit hook into a target git repository.
#
#   sh install-craft-gate.sh          # target defaults to the current directory
#   sh install-craft-gate.sh ~/code/my-repo
#
# The hook blocks commits whose staged additions contain AI slop patterns.
# Bypass with: SKIP_CRAFT_GATE=1 git commit ...

set -eu

HERE="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-.}"
TARGET="$(cd "$TARGET" && pwd)"

if [ ! -d "$TARGET/.git" ]; then
  echo "error: $TARGET is not a git repository" >&2
  exit 1
fi

mkdir -p "$TARGET/.git/hooks"
cp "$HERE/scripts/pre-commit-craft-gate.sh" "$TARGET/.git/hooks/pre-commit"
chmod +x "$TARGET/.git/hooks/pre-commit"

echo "Installed craft gate into $TARGET/.git/hooks/pre-commit"
