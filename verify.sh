#!/usr/bin/env sh
# Check that this stack actually landed in an OpenCode profile.
#
#   ./verify.sh                              # checks ~/.config/opencode
#   OPENCODE_HOME=/some/profile ./verify.sh
#   ./verify.sh /some/profile ~/code/my-repo # also checks the gate in that repo
#
# Prints PASS/FAIL per check and exits non-zero if any check fails.

set -u

REPO="$(cd "$(dirname "$0")" && pwd)"
DEST="${1:-${OPENCODE_HOME:-$HOME/.config/opencode}}"
GATE_REPO="${2:-}"

PASS=0
FAIL=0

ok() {
  printf 'PASS  %s\n' "$1"
  PASS=$((PASS + 1))
}

bad() {
  printf 'FAIL  %s\n' "$1"
  FAIL=$((FAIL + 1))
}

printf 'Verifying profile: %s\n\n' "$DEST"

if [ -f "$DEST/opencode.json" ]; then
  ok "profile config present (opencode.json)"
else
  bad "profile config missing ($DEST/opencode.json)"
fi

if [ -f "$DEST/context/engineering-intelligence.md" ]; then
  if grep -q 'Craft Skills Wiring' "$DEST/context/engineering-intelligence.md"; then
    ok "craft skills wiring present (engineering-intelligence.md section 7)"
  else
    bad "engineering-intelligence.md is present but has no craft skills wiring section"
  fi
else
  bad "context/engineering-intelligence.md missing"
fi

if [ -f "$DEST/plugin/model-router.ts" ]; then
  ok "model router plugin present (plugin/model-router.ts)"
else
  bad "plugin/model-router.ts missing"
fi

if [ -d "$DEST/skills" ]; then
  COUNT="$(find "$DEST/skills" -maxdepth 2 -name 'SKILL.md' 2>/dev/null | wc -l | tr -d ' ')"
  if [ "$COUNT" -ge 30 ]; then
    ok "skills installed: $COUNT"
  else
    bad "expected at least 30 skills, found $COUNT"
  fi

  NO_FRONTMATTER="$(find "$DEST/skills" -maxdepth 2 -name 'SKILL.md' 2>/dev/null | while IFS= read -r f; do
    head -5 "$f" | grep -q '^name:' || printf '%s\n' "$f"
  done)"
  if [ -z "$NO_FRONTMATTER" ]; then
    ok "every skill declares a name in its frontmatter"
  else
    bad "skills without a frontmatter name: $(printf '%s' "$NO_FRONTMATTER" | wc -l | tr -d ' ')"
  fi
else
  bad "skills directory missing ($DEST/skills)"
fi

if [ -x "$REPO/scripts/pre-commit-craft-gate.sh" ]; then
  ok "craft gate source present and executable"
else
  bad "scripts/pre-commit-craft-gate.sh missing or not executable"
fi

if [ -n "$GATE_REPO" ]; then
  if [ -x "$GATE_REPO/.git/hooks/pre-commit" ]; then
    ok "craft gate armed in $GATE_REPO"
  else
    bad "no pre-commit hook in $GATE_REPO (run ./install-craft-gate.sh $GATE_REPO)"
  fi
fi

printf '\n%d passed, %d failed\n' "$PASS" "$FAIL"

[ "$FAIL" -eq 0 ] || exit 1
