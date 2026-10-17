#!/usr/bin/env bash
# Qoreban Model Fabric — health probe.
# Probes every model registered in model-routing.json and writes model-health.json,
# which plugin/model-router.ts consumes at startup to pick each agent's active model.
#
# Usage:
#   model-probe.sh            # probe all external-provider models (merge with existing health)
#   model-probe.sh --quick    # probe only the primary of each chain
#   model-probe.sh --zen      # ALSO runtime-proof opencode/* Zen models via `opencode run` (slow)
#   model-probe.sh --zen-only # probe ONLY Zen models (for the low-frequency launchd job)
set -u
BASE="$HOME/.config/opencode"
ROUTING="$BASE/model-routing.json"
HEALTH="$BASE/model-health.json"
QUICK=0; ZEN=0; ZEN_ONLY=0
[ "${1:-}" = "--quick" ] && QUICK=1
[ "${1:-}" = "--zen" ] && ZEN=1
[ "${2:-}" = "--zen" ] && ZEN=1
[ "${1:-}" = "--zen-only" ] && ZEN_ONLY=1

[ -f "$BASE/secrets.env" ] && source "$BASE/secrets.env"

# Portable epoch-milliseconds (BSD date lacks %N)
ms_now() {
  python3 -c 'import time; print(int(time.time()*1000))' 2>/dev/null \
    || perl -MTime::HiRes=time -e 'printf "%d", time*1000' 2>/dev/null \
    || echo "$(date +%s)000"
}

# --- collect candidate models -------------------------------------------
if [ "$ZEN_ONLY" = "1" ]; then
  MODELS=$(jq -r '.chains[][]' "$ROUTING" | grep '^opencode/' | sort -u)
elif [ "$QUICK" = "1" ]; then
  MODELS=$(jq -r '.chains | to_entries[] | .value[0]' "$ROUTING" | sort -u)
else
  MODELS=$(jq -r '.chains[][]' "$ROUTING" | sort -u)
fi

TMP_HEALTH=$(mktemp)
# Seed with {} when no valid prior health data exists (jq cannot merge into an empty file)
if [ -f "$HEALTH" ] && jq -e . "$HEALTH" >/dev/null 2>&1; then
  cp "$HEALTH" "$TMP_HEALTH"
else
  echo '{}' > "$TMP_HEALTH"
fi
NOW=$(ms_now)   # epoch millis — must match plugin Date.now() units

probe_http() { # $1=model $2=url $3=key-env-name
  local key="${!3:-}"
  if [ -z "$key" ]; then echo "{\"ok\":false,\"ts\":$NOW,\"error\":\"missing $3\"}"; return; fi
  local body tmp code ms
  tmp=$(mktemp)
  body="{\"model\":\"$1\",\"messages\":[{\"role\":\"user\",\"content\":\"Reply with exactly: OK\"}],\"max_tokens\":300,\"stream\":false}"
  ms=$(ms_now)
  code=$(curl -s --max-time 30 -o "$tmp" -w "%{http_code}" "$2" \
    -H "Authorization: Bearer $key" -H "Content-Type: application/json" -d "$body")
  ms=$(( $(ms_now) - ms ))
  local valid
  valid=$(jq -e '(.choices[0].message.content != null) or (.choices[0].message.reasoning != null)' "$tmp" 2>/dev/null)
  rm -f "$tmp"
  if [ "$code" = "200" ] && [ "$valid" = "true" ]; then
    echo "{\"ok\":true,\"ms\":$ms,\"ts\":$NOW}"
  else
    echo "{\"ok\":false,\"ms\":$ms,\"ts\":$NOW,\"http\":$code}"
  fi
}

printf "%-52s %-6s %-8s %s\n" "MODEL" "OK" "MS" "NOTE"
for m in $MODELS; do
  provider="${m%%/*}"
  api_model="${m#*/}"   # upstream APIs expect provider-local IDs (e.g. openai/gpt-oss-120b, not groq/openai/gpt-oss-120b)
  result=""; note=""
  case "$provider" in
    groq)        result=$(probe_http "$api_model" "https://api.groq.com/openai/v1/chat/completions" GROQ_API_KEY) ;;
    huggingface) result=$(probe_http "$api_model" "https://router.huggingface.co/v1/chat/completions" HUGGINGFACE_API_KEY) ;;
    openrouter)  result=$(probe_http "$api_model" "https://openrouter.ai/api/v1/chat/completions" OPENROUTER_API_KEY) ;;
    opencode)
      if [ "$ZEN" = "1" ] || [ "$ZEN_ONLY" = "1" ]; then
        ms=$(ms_now)
        if opencode run -m "$m" "Reply with exactly: OK" >/dev/null 2>&1; then
          ms=$(( $(ms_now) - ms )); result="{\"ok\":true,\"ms\":$ms,\"ts\":$NOW}"
        else
          result="{\"ok\":false,\"ts\":$NOW,\"error\":\"opencode run failed\"}"
        fi
      else
        continue  # leave existing Zen entries untouched
      fi ;;
    *) continue ;;
  esac
  TMP_HEALTH2=$(mktemp)
  jq --arg m "$m" --argjson r "$result" '.[$m] = $r' "$TMP_HEALTH" > "$TMP_HEALTH2" && mv "$TMP_HEALTH2" "$TMP_HEALTH"
  ok=$(echo "$result" | jq -r '.ok'); ms=$(echo "$result" | jq -r '.ms // "-"')
  [ "$ok" = "false" ] && note=$(echo "$result" | jq -r '.http // .error // "fail"')
  printf "%-52s %-6s %-8s %s\n" "$m" "$ok" "$ms" "$note"
done

mkdir -p "$BASE"
mv "$TMP_HEALTH" "$HEALTH"
echo ""
echo "Health written: $HEALTH ($(jq 'to_entries | map(select(.value.ok == false)) | length' "$HEALTH") unhealthy / $(jq 'length' "$HEALTH") tracked)"
echo "Restart opencode so plugin/model-router.ts re-routes agents onto healthy models."
