/**
 * Qoreban Model Fabric — dynamic model router plugin.
 *
 * WHAT IT DOES
 *   At opencode startup the documented `config(cfg)` hook fires once with the
 *   live merged config. This plugin resolves each agent's fallback chain from
 *   model-routing.json against measured health data (model-health.json,
 *   written by scripts/model-probe.sh via the /model-health command) and
 *   rewrites `cfg.agent[name].model`, plus top-level `cfg.model` and
 *   `cfg.small_model`, to the first healthy model in each chain.
 *
 * FAILOVER SEMANTICS
 *   - Health entry {ok:false, ts} inside cooldown_ms  -> model skipped.
 *   - Health entry {ok:false, ts} older than cooldown -> recovery: model eligible again.
 *   - No health file / no entry                       -> assume healthy (fresh installs work).
 *
 * SAFETY
 *   - Dependency-free (node:fs only). Never throws: any failure logs and leaves
 *     the static config untouched, so opencode always starts.
 */
import { readFileSync, existsSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

type Health = { ok?: boolean; ms?: number; ts?: number }
type Routing = {
  settings?: { cooldown_ms?: number; health_file?: string; top_level_chain?: string; small_model_chain?: string }
  chains?: Record<string, string[]>
  agents?: Record<string, { chain?: string }>
}

const BASE = join(homedir(), ".config", "opencode")
const ROUTING_FILE = join(BASE, "model-routing.json")

function readJson(path: string): any | null {
  try {
    return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null
  } catch {
    return null
  }
}

function firstHealthy(chain: string[] | undefined, health: Record<string, Health>, cooldownMs: number): string | undefined {
  if (!chain || chain.length === 0) return undefined
  const now = Date.now()
  for (const model of chain) {
    const h = health[model]
    // Normalize legacy second-based timestamps to milliseconds
    const tsMs = h?.ts !== undefined && h.ts < 1e12 ? h.ts * 1000 : h?.ts
    if (h && h.ok === false && typeof tsMs === "number" && now - tsMs < cooldownMs) continue // cooling down
    return model // healthy or recovered or unknown
  }
  return chain[0] // total outage: degrade to primary rather than nothing
}

export default async function modelRouter() {
  const routing: Routing = readJson(ROUTING_FILE) || {}
  const cooldownMs = routing.settings?.cooldown_ms ?? 600000
  const healthFile = (routing.settings?.health_file || "~/.config/opencode/model-health.json").replace(/^~/, homedir())
  const health: Record<string, Health> = readJson(healthFile) || {}

  return {
    config: (cfg: any) => {
      try {
        const pick = (chainId?: string) => firstHealthy(routing.chains?.[chainId || ""], health, cooldownMs)

        // Top-level session + small models — the fabric is authoritative
        const main = pick(routing.settings?.top_level_chain)
        const light = pick(routing.settings?.small_model_chain)
        if (main) cfg.model = main
        if (light) cfg.small_model = light

        // Per-agent chains — only touch agents that exist in live config
        let switched = 0
        for (const [name, spec] of Object.entries(routing.agents || {})) {
          const agentCfg = cfg.agent?.[name]
          if (!agentCfg || !spec?.chain) continue
          const chosen = pick(spec.chain)
          if (chosen) {
            agentCfg.model = chosen
            switched++
          }
        }
        console.log(
          `[model-fabric] routed ${switched} agent(s); main=${cfg.model ?? "(static)"} small=${cfg.small_model}` +
            (Object.keys(health).length ? "" : " [no health data — assuming all healthy]"),
        )
      } catch (err) {
        console.log(`[model-fabric] routing skipped: ${err instanceof Error ? err.message : String(err)}`)
      }
    },
  }
}
