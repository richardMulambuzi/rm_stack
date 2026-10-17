#!/usr/bin/env sh
# Install the craft-gate pre-commit hook into a target git repository.
#
#   ./install-craft-gate.sh                 # target defaults to the current directory
#   ./install-craft-gate.sh ~/code/my-repo
#   ./install-craft-gate.sh --help
#
# The hook blocks commits whose staged additions contain AI slop patterns.
# Bypass with: SKIP_CRAFT_GATE=1 git commit ...

set -eu

HERE="$(cd "$(dirname "$0")" && pwd)"

case "${1:-}" in
  -h|--help)
    echo "usage: ./install-craft-gate.sh [repo]"
    echo
    echo "Copies the craft-gate pre-commit hook into <repo>/.git/hooks/pre-commit."
    echo "  repo   target git repository (default: current directory)"
    echo
    echo "The hook blocks staged AI slop vocabulary and em dashes. Bypass one"
    echo "commit with: SKIP_CRAFT_GATE=1 git commit ..."
    exit 0
    ;;
esac

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
