# Qoreban Model Fabric — Routing & Failover Protocol (compact)

> Loaded into every agent. The fabric: `~/.config/opencode/model-routing.json`
> (chains + capabilities) + `plugin/model-router.ts` (startup routing) +
> `scripts/model-probe.sh` (health measurement) + `/model-health` command.

## How models are selected
- Every agent has an ordered cross-provider chain (T1 Zen free → T2 Groq → T3 OpenRouter :free → T4 HF).
- At opencode startup the router plugin walks your chain and binds you to the **first healthy model**.
- Health = measured by probe (`ok`, latency, timestamp). A model failing a probe is skipped for 10 minutes (cooldown), then automatically re-eligible (recovery detection).
- You do NOT choose your own model. If you are curious which model you are running on, check the session model indicator — never assume.

## Failure classification (report the CLASS, not just the error)
When a model call fails or returns garbage, state one of:
`AUTH` (401/403) · `OUTAGE` (5xx/connection) · `RATE_LIMIT` (429) · `TOKEN_LIMIT` · `CONTEXT_OVERFLOW` · `TIMEOUT` · `EMPTY_RESPONSE` · `MALFORMED` (unparseable/tool-call invalid) · `CAPABILITY_GAP` (model can't do the task type) · `LOW_QUALITY` (wrong format, contradictions, hallucination indicators).

## Rules for ALL agents
1. On failure: report the failure class + what you attempted, then STOP. Max 2 attempts on the same task before escalating upstream with both reports.
2. Never silently degrade output quality to survive. A wrong answer is worse than an honest failure report.
3. Token-efficient failover: when re-dispatched after a failure, work from the compact task state in the re-dispatch prompt — never request the full original context again.

## Rules for builder (orchestrator)
1. Before delegating, classify the task: simple lookup → lightweight tier; standard implementation → role tier; deep analysis/architecture → analysis tier; audio input/output → speech-agent; large context (>200k needed) → prefer chains whose primary has ≥1M ctx.
2. If a subagent returns a failure-class report: re-dispatch the SAME agent once (its chain may have recovered or the error was transient). If it fails again with the same class, run `/model-health`, then tell the user to restart opencode so the router re-binds agents onto healthy models. Do NOT retry a third time (loop prevention).
3. Never delegate around a failed quality gate. Model failover never bypasses security → QA → review ordering.
4. Keep delegation prompts scoped: file paths + contracts + acceptance criteria only. No wholesale memory dumps.

## Speech pipeline (speech-agent)
- STT: POST multipart to `https://api.groq.com/openai/v1/audio/transcriptions` (`whisper-large-v3-turbo`, fallback `whisper-large-v3`), temperature 0.
- TTS: POST JSON to `https://api.groq.com/openai/v1/audio/speech` (`canopylabs/orpheus-v1-english` voice=autumn; arabic variant voice=abdullah), response_format wav, write to temp file, return path.
- Other agents NEVER call audio endpoints directly — delegate to speech-agent and consume its transcript/file path.
