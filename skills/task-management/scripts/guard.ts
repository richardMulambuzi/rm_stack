/// <reference types="node" />
import * as fs from "node:fs";
import * as path from "node:path";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentActivity {
  agentKey: string;
  taskId: string;
  startedAt: string;
  lastHeartbeat: string;
  attempts: number;
  status: "running" | "escalated" | "halted" | "completed";
  escalationReason?: string;
}

export interface HallucinationRecord {
  agentKey: string;
  taskId: string;
  detectedAt: string;
  violationType:
    | "invented_endpoint"
    | "invented_table"
    | "invented_field"
    | "invented_requirement"
    | "missing_artifact"
    | "scope_violation"
    | "self_assigned"
    | "boundary_breach";
  description: string;
  autoHalted: boolean;
}

export interface LoopRecord {
  agentKey: string;
  taskId: string;
  detectedAt: string;
  attemptCount: number;
  repeatedPattern: string;
  autoEscalated: boolean;
}

export interface GuardState {
  activities: Record<string, AgentActivity>;   // keyed by agentKey+taskId
  hallucinations: HallucinationRecord[];
  loops: LoopRecord[];
  escalationQueue: string[];                   // taskIds pending CEO review
  lastUpdated: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MAX_ATTEMPTS_PER_TASK = 3;         // auto-escalate after 3 failed attempts
const LOOP_DETECTION_WINDOW_MS = 30_000; // 30s without new state = suspected loop
const HEARTBEAT_TIMEOUT_MS = 60_000;     // 60s without heartbeat = zombie agent

/** Agent tier boundaries: who each agent is ALLOWED to receive tasks from */
export const ALLOWED_TASK_SOURCES: Record<string, string[]> = {
  // Juniors may ONLY receive tasks from their Senior
  "auth-engineer":          ["backend-dev"],
  "integration-engineer":   ["backend-dev"],
  "async-engineer":         ["backend-dev"],
  "data-engineer":          ["backend-dev"],
  "design-system-engineer": ["frontend-architect"],
  "frontend-dev":           ["frontend-architect"],
  "state-engineer":         ["frontend-architect"],
  "ui-ux-designer":         ["frontend-architect"],
  "perf-tester":            ["e2e-tester"],
  "observability-engineer": ["cicd-engineer", "sre-engineer"],
  "documentation-writer":   ["tech-lead"],
  "cost-engineer":          ["devops-engineer"],
  "compliance-engineer":    ["security-engineer"],
  // Seniors may ONLY receive tasks from their Manager
  "backend-dev":            ["tech-lead"],
  "database-engineer":      ["tech-lead"],
  "performance-engineer":   ["tech-lead"],
  "frontend-architect":     ["tech-lead"],
  "e2e-tester":             ["qa-engineer"],
  "cicd-engineer":          ["devops-engineer"],
  "sre-engineer":           ["devops-engineer"],
  // Managers may ONLY receive tasks from CEO
  "tech-lead":              ["builder"],
  "product-manager":        ["builder"],
  "security-engineer":      ["builder"],
  "devops-engineer":        ["builder"],
  "qa-engineer":            ["builder"],
  "code-reviewer":          ["builder"],
  "release-manager":        ["builder"],
  // Executives receive from CEO or user
  "cto":                    ["builder"],
  "api-architect":          ["builder", "cto"],
  // CEO receives from nobody (user-initiated only)
  "builder":                ["__user__"],
};

/** Agents that are FORBIDDEN from performing global repository analysis */
export const GLOBAL_SCAN_FORBIDDEN: string[] = [
  "auth-engineer", "integration-engineer", "async-engineer", "data-engineer",
  "design-system-engineer", "frontend-dev", "state-engineer", "ui-ux-designer",
  "perf-tester", "observability-engineer", "documentation-writer",
  "cost-engineer", "compliance-engineer",
];

/** Agents that MUST NOT write production code */
export const CODE_WRITE_FORBIDDEN: string[] = [
  "builder", "cto", "api-architect",
  "product-manager", "tech-lead",
  "security-engineer", "devops-engineer", "qa-engineer",
  "code-reviewer", "release-manager",
];

// ─────────────────────────────────────────────────────────────────────────────
// OrchestrationGuard
// ─────────────────────────────────────────────────────────────────────────────

export class OrchestrationGuard {
  private guardPath: string;

  constructor(rootDir: string) {
    this.guardPath = path.join(rootDir, ".tmp", "memory", "guard-state.json");
  }

  // ── Persistence ────────────────────────────────────────────────────────────

  private load(): GuardState {
    if (fs.existsSync(this.guardPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.guardPath, "utf-8")) as GuardState;
      } catch {
        /* corrupt file — reset */
      }
    }
    return {
      activities: {},
      hallucinations: [],
      loops: [],
      escalationQueue: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  private save(state: GuardState): void {
    const dir = path.dirname(this.guardPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    state.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.guardPath, JSON.stringify(state, null, 2), "utf-8");
  }

  // ── Activity Tracking ──────────────────────────────────────────────────────

  /**
   * Register an agent starting a task.
   * Returns false + reason if the assignment itself is illegal.
   */
  public registerStart(
    agentKey: string,
    taskId: string,
    requestedBy: string
  ): { allowed: boolean; reason?: string } {
    // 1. Validate chain-of-command
    const allowedSources = ALLOWED_TASK_SOURCES[agentKey] ?? [];
    if (!allowedSources.includes(requestedBy)) {
      const reason = `CHAIN-OF-COMMAND VIOLATION: ${agentKey} received task from ${requestedBy}. ` +
        `Allowed sources: [${allowedSources.join(", ")}]. ` +
        `Task must be re-routed through the correct management channel.`;
      this.recordHallucination({
        agentKey,
        taskId,
        violationType: "self_assigned",
        description: reason,
      });
      return { allowed: false, reason };
    }

    const state = this.load();
    const key = `${agentKey}::${taskId}`;
    const existing = state.activities[key];

    // 2. Check for already-running zombie
    if (existing && existing.status === "running") {
      const elapsed = Date.now() - new Date(existing.lastHeartbeat).getTime();
      if (elapsed < HEARTBEAT_TIMEOUT_MS) {
        return {
          allowed: false,
          reason: `DUPLICATE ASSIGNMENT: ${agentKey} is already running task ${taskId}. ` +
            `Elapsed: ${Math.round(elapsed / 1000)}s. Prevent parallel ownership conflict.`,
        };
      }
      // zombie — reset
    }

    // 3. Check retry budget
    const attempts = existing ? existing.attempts + 1 : 1;
    if (attempts > MAX_ATTEMPTS_PER_TASK) {
      this.addToEscalationQueue(state, taskId,
        `${agentKey} exceeded ${MAX_ATTEMPTS_PER_TASK} attempts on task ${taskId}. Auto-escalating to CEO.`);
      this.save(state);
      return {
        allowed: false,
        reason: `RETRY BUDGET EXCEEDED: ${agentKey} has attempted task ${taskId} ${attempts - 1} times. ` +
          `Task escalated to CEO (builder) for reassignment.`,
      };
    }

    state.activities[key] = {
      agentKey,
      taskId,
      startedAt: existing?.startedAt ?? new Date().toISOString(),
      lastHeartbeat: new Date().toISOString(),
      attempts,
      status: "running",
    };
    this.save(state);
    return { allowed: true };
  }

  /** Heartbeat — call periodically to signal the agent is still making progress */
  public heartbeat(agentKey: string, taskId: string): void {
    const state = this.load();
    const key = `${agentKey}::${taskId}`;
    if (state.activities[key]) {
      state.activities[key].lastHeartbeat = new Date().toISOString();
      this.save(state);
    }
  }

  /** Mark an agent's task as completed */
  public registerComplete(agentKey: string, taskId: string): void {
    const state = this.load();
    const key = `${agentKey}::${taskId}`;
    if (state.activities[key]) {
      state.activities[key].status = "completed";
      this.save(state);
    }
  }

  // ── Loop Detection ─────────────────────────────────────────────────────────

  /**
   * Submit a snapshot of what the agent is currently doing.
   * If the same pattern repeats within the detection window, a loop is declared.
   */
  public checkLoop(
    agentKey: string,
    taskId: string,
    currentPattern: string
  ): { loopDetected: boolean; reason?: string } {
    const state = this.load();
    const recent = state.loops.filter(
      (l) =>
        l.agentKey === agentKey &&
        l.taskId === taskId &&
        Date.now() - new Date(l.detectedAt).getTime() < LOOP_DETECTION_WINDOW_MS
    );

    if (recent.some((l) => l.repeatedPattern === currentPattern)) {
      const record: LoopRecord = {
        agentKey,
        taskId,
        detectedAt: new Date().toISOString(),
        attemptCount: (recent[0]?.attemptCount ?? 1) + 1,
        repeatedPattern: currentPattern,
        autoEscalated: true,
      };
      state.loops.push(record);
      this.addToEscalationQueue(state, taskId,
        `LOOP detected: ${agentKey} repeated pattern "${currentPattern}" on task ${taskId}.`);
      this.save(state);
      return {
        loopDetected: true,
        reason: `AGENT LOOP DETECTED: ${agentKey} is repeating action "${currentPattern}" ` +
          `on task ${taskId} without state change. Auto-escalated to CEO.`,
      };
    }

    // Not a loop yet — record the pattern
    state.loops.push({
      agentKey,
      taskId,
      detectedAt: new Date().toISOString(),
      attemptCount: 1,
      repeatedPattern: currentPattern,
      autoEscalated: false,
    });
    // Keep only last 100 loop records to avoid unbounded growth
    if (state.loops.length > 100) state.loops = state.loops.slice(-100);
    this.save(state);
    return { loopDetected: false };
  }

  // ── Hallucination Detection ────────────────────────────────────────────────

  /**
   * Validate an agent's proposed action against known scope and artifacts.
   * Returns a list of violations (empty = clean).
   */
  public validateAction(params: {
    agentKey: string;
    taskId: string;
    /** Files the agent claims to have read as context */
    contextFiles: string[];
    /** Files the agent proposes to modify */
    targetFiles: string[];
    /** Artifacts the agent claims exist and is consuming */
    consumedArtifacts: string[];
  }): { violations: string[] } {
    const violations: string[] = [];
    const { agentKey, taskId, targetFiles, consumedArtifacts } = params;

    // 1. Global scan detection for junior agents
    if (GLOBAL_SCAN_FORBIDDEN.includes(agentKey)) {
      const suspiciousContext = params.contextFiles.filter(
        (f) =>
          f.includes("/**") ||
          f === "." ||
          f === "/" ||
          f.split("/").length <= 1
      );
      if (suspiciousContext.length > 0) {
        violations.push(
          `SCOPE VIOLATION: ${agentKey} (Junior) attempted global repository context: [${suspiciousContext.join(", ")}]. ` +
          `Juniors must work with scoped file paths only.`
        );
      }
    }

    // 2. Production code write for forbidden executives/managers
    if (CODE_WRITE_FORBIDDEN.includes(agentKey) && targetFiles.length > 0) {
      const codeFiles = targetFiles.filter(
        (f) =>
          f.match(/\.(ts|tsx|js|jsx|php|py|go|rb|java|cs|rs)$/) &&
          !f.includes(".md") &&
          !f.includes(".json") &&
          !f.includes("config")
      );
      if (codeFiles.length > 0) {
        violations.push(
          `BOUNDARY BREACH: ${agentKey} (Executive/Manager) attempted to write production code: [${codeFiles.join(", ")}]. ` +
          `This role must delegate implementation to engineers.`
        );
      }
    }

    // 3. Missing artifact consumption
    consumedArtifacts.forEach((artifact) => {
      if (!fs.existsSync(artifact)) {
        violations.push(
          `HALLUCINATION RISK: ${agentKey} references artifact "${artifact}" which does NOT exist on disk. ` +
          `Do NOT invent or assume artifact content. Stop and escalate.`
        );
      }
    });

    // 4. Record all violations
    violations.forEach((v) => {
      this.recordHallucination({
        agentKey,
        taskId,
        violationType: "scope_violation",
        description: v,
      });
    });

    return { violations };
  }

  // ── Zombie Agent Scan ──────────────────────────────────────────────────────

  /**
   * Scan all running activities and halt those that exceeded the heartbeat timeout.
   * Returns list of halted agent keys.
   */
  public scanZombies(): string[] {
    const state = this.load();
    const halted: string[] = [];
    const now = Date.now();

    for (const [key, activity] of Object.entries(state.activities)) {
      if (activity.status !== "running") continue;
      const elapsed = now - new Date(activity.lastHeartbeat).getTime();
      if (elapsed > HEARTBEAT_TIMEOUT_MS) {
        state.activities[key].status = "halted";
        state.activities[key].escalationReason =
          `No heartbeat for ${Math.round(elapsed / 1000)}s. Agent presumed deadlocked.`;
        this.addToEscalationQueue(
          state,
          activity.taskId,
          `ZOMBIE DETECTED: ${activity.agentKey} stopped responding on task ${activity.taskId}.`
        );
        halted.push(activity.agentKey);
      }
    }

    if (halted.length > 0) this.save(state);
    return halted;
  }

  // ── Escalation Queue ───────────────────────────────────────────────────────

  public getEscalationQueue(): { taskId: string; reason: string }[] {
    const state = this.load();
    return state.escalationQueue.map((entry) => {
      const [taskId, ...reasonParts] = entry.split("::");
      return { taskId, reason: reasonParts.join("::") };
    });
  }

  public clearEscalation(taskId: string): void {
    const state = this.load();
    state.escalationQueue = state.escalationQueue.filter(
      (e) => !e.startsWith(taskId)
    );
    this.save(state);
  }

  // ── Reporting ──────────────────────────────────────────────────────────────

  public report(): void {
    const state = this.load();
    const activities = Object.values(state.activities);
    const running = activities.filter((a) => a.status === "running");
    const halted = activities.filter((a) => a.status === "halted");
    const escalated = activities.filter((a) => a.status === "escalated");

    console.log("\n=== OrchestrationGuard Report ===\n");
    console.log(`Active agents  : ${running.length}`);
    console.log(`Halted agents  : ${halted.length}`);
    console.log(`Escalated tasks: ${escalated.length}`);
    console.log(`Hallucinations : ${state.hallucinations.length}`);
    console.log(`Loop records   : ${state.loops.filter((l) => l.autoEscalated).length} auto-escalated`);
    console.log(`Escalation Q   : ${state.escalationQueue.length} pending CEO review\n`);

    if (state.escalationQueue.length > 0) {
      console.log("--- Escalation Queue ---");
      state.escalationQueue.forEach((e) => console.log(`  • ${e}`));
    }

    if (state.hallucinations.length > 0) {
      console.log("\n--- Recent Hallucination Violations ---");
      state.hallucinations.slice(-5).forEach((h) =>
        console.log(`  [${h.agentKey}] ${h.violationType}: ${h.description.slice(0, 120)}`)
      );
    }
  }

  // ── Internal Helpers ───────────────────────────────────────────────────────

  private recordHallucination(params: {
    agentKey: string;
    taskId: string;
    violationType: HallucinationRecord["violationType"];
    description: string;
    autoHalted?: boolean;
  }): void {
    const state = this.load();
    state.hallucinations.push({
      ...params,
      detectedAt: new Date().toISOString(),
      autoHalted: params.autoHalted ?? true,
    });
    // Keep last 200 records
    if (state.hallucinations.length > 200) {
      state.hallucinations = state.hallucinations.slice(-200);
    }
    this.save(state);
  }

  private addToEscalationQueue(
    state: GuardState,
    taskId: string,
    reason: string
  ): void {
    const entry = `${taskId}::${reason}`;
    if (!state.escalationQueue.includes(entry)) {
      state.escalationQueue.push(entry);
    }
  }
}
