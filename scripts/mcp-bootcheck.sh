#!/usr/bin/env bash
# OpenCode MCP boot-time fallback: restart service if any configured MCP fails.
set -u
LOG="$HOME/.config/opencode/logs/mcp-bootcheck.log"
mkdir -p "$(dirname "$LOG")"
{
  echo "=== $(date) ==="
  opencode service restart >/dev/null 2>&1
  sleep 4
  out="$(opencode mcp list 2>&1)"
  echo "$out"
  # health test: every server listed should report 'connected' or at least no ContactError
  if echo "$out" | grep -CiE "error|disconnected|fail|ECONN|ENOENT" >/dev/null; then
    for i in 1 2 3; do
      echo "retry $i..."
      opencode service restart >/dev/null 2>&1
      sleep $((i*5))
      out2="$(opencode mcp list 2>&1)"
      echo "$out2"
      if echo "$out2" | grep -CiE "error|disconnected" >/dev/null; then continue; else break; fi
    done
  fi
  echo "=== done ==="
} >> "$LOG" 2>&1
