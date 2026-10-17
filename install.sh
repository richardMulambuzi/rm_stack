#!/usr/bin/env sh
# Install this curated OpenCode stack into an OpenCode profile directory.
#
#   ./install.sh                          # -> ~/.config/opencode
#   OPENCODE_HOME=/some/other/profile ./install.sh
#   ./install.sh --help
#
# Non-destructive: files that exist only in the destination are left alone and
# nothing is ever deleted. Files shared with this repo are overwritten, but any
# destination file whose content differs is copied to a timestamped backup
# folder inside the destination first.

set -eu

REPO="$(cd "$(dirname "$0")" && pwd)"
DEST="${OPENCODE_HOME:-$HOME/.config/opencode}"

case "${1:-}" in
  -h|--help)
    echo "usage: ./install.sh"
    echo
    echo "Copies this stack into an OpenCode profile directory."
    echo "  OPENCODE_HOME  target profile (default: ~/.config/opencode)"
    echo
    echo "Existing destination files that differ from this stack are backed up"
    echo "to <profile>/.install-backup-<timestamp>/ before being overwritten."
    exit 0
    ;;
  "")
    ;;
  *)
    echo "error: unknown argument: $1" >&2
    echo "run ./install.sh --help" >&2
    exit 1
    ;;
esac

mkdir -p "$DEST"

STAMP="$(date +%Y%m%d%H%M%S)"
BAK="$DEST/.install-backup-$STAMP"
COUNT_FILE="$(mktemp)"

# List files this stack would write, skipping the repo metadata and the
# installer itself (which is never copied into a profile).
cd "$REPO"
find . -type f ! -path './.git/*' ! -name 'install.sh' ! -name '.DS_Store' |
  while IFS= read -r rel; do
    if [ -f "$DEST/$rel" ] && ! cmp -s "$REPO/$rel" "$DEST/$rel"; then
      mkdir -p "$(dirname "$BAK/$rel")"
      cp "$DEST/$rel" "$BAK/$rel"
      printf 'x\n' >> "$COUNT_FILE"
    fi
  done

BACKED_UP="$(wc -l < "$COUNT_FILE" | tr -d ' ')"
rm -f "$COUNT_FILE"

rsync -a --exclude '.git' --exclude 'install.sh' --exclude '.DS_Store' "$REPO/" "$DEST/"

if [ "$BACKED_UP" -gt 0 ]; then
  echo "Backed up $BACKED_UP changed file(s) to $BAK"
fi

echo "Installed OpenCode stack into $DEST"
echo "Restart OpenCode to pick up the config and skills."
echo "Verify with: ./verify.sh"
