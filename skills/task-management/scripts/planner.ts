/// <reference types="node" />
import * as fs from "node:fs";
import * as path from "node:path";

export interface TaskRequirement {
  agentKey: string;
  files: string[];
  complexity: number;
  canParallelize: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXCLUSIVE OWNERSHIP MAP
// One agent owns each domain. This is the single source of truth for routing.
// ─────────────────────────────────────────────────────────────────────────────
const OWNERSHIP_RULES: Array<{
  agentKey: string;
  patterns: RegExp[];
  keywords: string[];
}> = [
  // ── Auth & Identity ────────────────────────────────────────────────────────
  {
    agentKey: "auth-engineer",
    patterns: [/auth/, /login/, /logout/, /register/, /password/, /token/, /jwt/, /refresh/, /session/, /rbac/, /permission/, /oauth/, /sanctum/],
    keywords: ["auth", "login", "jwt", "oauth", "session", "rbac", "token", "sanctum", "password"],
  },
  // ── Database & Persistence ─────────────────────────────────────────────────
  {
    agentKey: "database-engineer",
    patterns: [/migration/, /schema/, /model/, /eloquent/, /seeder/, /factory/, /index/, /foreign_key/, /pivot/],
    keywords: ["migration", "schema", "model", "seeder", "factory", "eloquent", "database"],
  },
  // ── External Integrations ──────────────────────────────────────────────────
  {
    agentKey: "integration-engineer",
    patterns: [/stripe/, /paystack/, /twilio/, /sendgrid/, /mailgun/, /webhook/, /external/, /third.party/],
    keywords: ["stripe", "payment", "twilio", "sms", "sendgrid", "email", "webhook", "integration"],
  },
  // ── Async / Queues ─────────────────────────────────────────────────────────
  {
    agentKey: "async-engineer",
    patterns: [/job/, /queue/, /horizon/, /event/, /listener/, /broadcast/, /cron/, /schedule/],
    keywords: ["queue", "job", "listener", "event", "horizon", "schedule", "async"],
  },
  // ── Performance ───────────────────────────────────────────────────────────
  {
    agentKey: "performance-engineer",
    patterns: [/cache/, /redis/, /n\+1/, /eager.load/, /query.optim/, /performance/, /profil/],
    keywords: ["cache", "redis", "performance", "optimize", "n+1", "eager"],
  },
  // ── Frontend Architecture ──────────────────────────────────────────────────
  {
    agentKey: "frontend-architect",
    patterns: [/router/, /route/, /layout/, /app\.tsx/, /main\.tsx/, /vite\.config/, /bundle/, /folder.structure/],
    keywords: ["router", "routing", "layout", "bundle", "architecture", "structure"],
  },
  // ── Design System ─────────────────────────────────────────────────────────
  {
    agentKey: "design-system-engineer",
    patterns: [/tailwind/, /token/, /theme/, /primitive/, /color/, /typography/, /spacing/, /design.system/],
    keywords: ["tailwind", "token", "theme", "color", "typography", "design system"],
  },
  // ── State Management ──────────────────────────────────────────────────────
  {
    agentKey: "state-engineer",
    patterns: [/zustand/, /tanstack/, /react.query/, /store/, /hook/, /useQuery/, /useMutation/],
    keywords: ["zustand", "tanstack", "react-query", "store", "useQuery", "state"],
  },
  // ── UX & Accessibility ────────────────────────────────────────────────────
  {
    agentKey: "ui-ux-designer",
    patterns: [/wcag/, /a11y/, /aria/, /accessibility/, /wireframe/, /ux.spec/, /figma/],
    keywords: ["wcag", "a11y", "aria", "accessibility", "wireframe", "ux"],
  },
  // ── Frontend Components ───────────────────────────────────────────────────
  {
    agentKey: "frontend-dev",
    patterns: [/component/, /page/, /view/, /screen/, /form/, /\.tsx$/, /\.jsx$/],
    keywords: ["component", "page", "view", "screen", "form", "jsx", "tsx"],
  },
  // ── Data & Analytics ──────────────────────────────────────────────────────
  {
    agentKey: "data-engineer",
    patterns: [/analytic/, /embedding/, /etl/, /pipeline/, /report/, /chart/, /dashboard.data/],
    keywords: ["analytics", "embedding", "etl", "pipeline", "report"],
  },
  // ── Security ──────────────────────────────────────────────────────────────
  {
    agentKey: "security-engineer",
    patterns: [/owasp/, /xss/, /csrf/, /sql.inject/, /secret/, /vulnerability/, /audit/],
    keywords: ["owasp", "xss", "csrf", "injection", "secret", "vulnerability", "audit"],
  },
  // ── CI/CD ─────────────────────────────────────────────────────────────────
  {
    agentKey: "cicd-engineer",
    patterns: [/github.action/, /pipeline/, /workflow/, /\.yml$/, /deploy/, /ci.cd/],
    keywords: ["github actions", "pipeline", "workflow", "ci/cd", "deploy"],
  },
  // ── Infrastructure / DevOps ───────────────────────────────────────────────
  {
    agentKey: "devops-engineer",
    patterns: [/docker/, /kubernetes/, /terraform/, /helm/, /nginx/, /infra/],
    keywords: ["docker", "kubernetes", "terraform", "helm", "nginx", "infrastructure"],
  },
  // ── Observability ─────────────────────────────────────────────────────────
  {
    agentKey: "observability-engineer",
    patterns: [/prometheus/, /grafana/, /opentelemetry/, /loki/, /metric/, /trace/, /span/],
    keywords: ["prometheus", "grafana", "opentelemetry", "loki", "metric", "trace"],
  },
  // ── SRE / Reliability ─────────────────────────────────────────────────────
  {
    agentKey: "sre-engineer",
    patterns: [/slo/, /sli/, /runbook/, /incident/, /reliability/, /postmortem/],
    keywords: ["slo", "sli", "runbook", "incident", "reliability", "postmortem"],
  },
  // ── E2E Testing ───────────────────────────────────────────────────────────
  {
    agentKey: "e2e-tester",
    patterns: [/playwright/, /cypress/, /e2e/, /browser.test/, /user.flow/],
    keywords: ["playwright", "cypress", "e2e", "browser test", "user flow"],
  },
  // ── Load / Perf Testing ───────────────────────────────────────────────────
  {
    agentKey: "perf-tester",
    patterns: [/k6/, /artillery/, /load.test/, /stress.test/, /benchmark/],
    keywords: ["k6", "artillery", "load test", "stress", "benchmark"],
  },
  // ── Cost ──────────────────────────────────────────────────────────────────
  {
    agentKey: "cost-engineer",
    patterns: [/cost/, /billing/, /right.siz/, /cloud.bill/],
    keywords: ["cost", "billing", "cloud", "rightsizing"],
  },
  // ── Compliance ────────────────────────────────────────────────────────────
  {
    agentKey: "compliance-engineer",
    patterns: [/gdpr/, /pci/, /hipaa/, /iso.27001/, /soc.2/, /compliance/],
    keywords: ["gdpr", "pci", "hipaa", "iso27001", "soc2", "compliance"],
  },
  // ── Documentation ─────────────────────────────────────────────────────────
  {
    agentKey: "documentation-writer",
    patterns: [/readme/, /\.md$/, /changelog/, /adr/, /docs\//],
    keywords: ["readme", "docs", "changelog", "adr", "documentation"],
  },
  // ── API Contracts ─────────────────────────────────────────────────────────
  {
    agentKey: "api-architect",
    patterns: [/openapi/, /swagger/, /dto/, /contract/, /interface.definition/],
    keywords: ["openapi", "swagger", "dto", "contract", "interface"],
  },
  // ── Backend Services (default fallback) ───────────────────────────────────
  {
    agentKey: "backend-dev",
    patterns: [/controller/, /service/, /repository/, /api\//, /routes\//, /request\./],
    keywords: ["controller", "service", "repository", "api", "routes"],
  },
];

export class TaskPlanner {
  private memoryDir: string;

  constructor(rootDir: string) {
    this.memoryDir = path.join(rootDir, ".tmp", "memory");
  }

  /** Complexity 1–5 based on file count and domain sensitivity */
  public estimateComplexity(files: string[]): number {
    if (files.length === 0) return 1;
    const isHighRisk = files.some((f) =>
      /auth|security|payment|stripe|jwt|migration|schema/.test(f)
    );
    if (isHighRisk) return 5;
    if (files.length >= 10) return 4;
    if (files.length >= 5) return 3;
    if (files.length >= 2) return 2;
    return 1;
  }

  /**
   * Determine the single exclusive owner for a set of files/keywords.
   * Returns the agent key and the matched rule for full traceability.
   */
  public routeTask(
    files: string[],
    additionalKeywords: string[] = []
  ): { agentKey: string; matchedOn: string } {
    const allText = [
      ...files.map((f) => f.toLowerCase()),
      ...additionalKeywords.map((k) => k.toLowerCase()),
    ].join(" ");

    const scores: Record<string, number> = {};

    for (const rule of OWNERSHIP_RULES) {
      let score = 0;
      for (const pattern of rule.patterns) {
        if (pattern.test(allText)) score += 2;
      }
      for (const keyword of rule.keywords) {
        if (allText.includes(keyword)) score += 1;
      }
      if (score > 0) scores[rule.agentKey] = (scores[rule.agentKey] ?? 0) + score;
    }

    if (Object.keys(scores).length === 0) {
      return { agentKey: "backend-dev", matchedOn: "default fallback" };
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    // Conflict detection: if two agents tie, escalate instead of guessing
    if (sorted.length >= 2 && sorted[0][1] === sorted[1][1]) {
      console.warn(
        `⚠  OWNERSHIP CONFLICT: "${sorted[0][0]}" and "${sorted[1][0]}" score equally (${sorted[0][1]}). ` +
          `Escalating to CEO for manual assignment.`
      );
      return {
        agentKey: "builder",
        matchedOn: `conflict between ${sorted[0][0]} and ${sorted[1][0]}`,
      };
    }

    return { agentKey: sorted[0][0], matchedOn: `score=${sorted[0][1]}` };
  }

  /**
   * Detect overlapping file ownership between two active assignments.
   * Returns conflicting file paths.
   */
  public detectConflicts(
    assignedFiles: string[],
    incomingFiles: string[]
  ): string[] {
    return incomingFiles.filter((f) => assignedFiles.includes(f));
  }

  /**
   * Determine if a set of tasks can run in parallel based on non-overlapping file ownership.
   */
  public resolveParallelTasks(
    tasks: { id: string; files: string[] }[]
  ): { parallel: string[][]; sequential: string[] } {
    const groups: string[][] = [];
    const sequential: string[] = [];
    const usedFiles = new Set<string>();

    for (const task of tasks) {
      const conflicts = task.files.filter((f) => usedFiles.has(f));
      if (conflicts.length > 0) {
        sequential.push(task.id);
      } else {
        task.files.forEach((f) => usedFiles.add(f));
        // Try to add to an existing parallel group
        const existingGroup = groups.find(
          (g) => !g.some((id) => tasks.find((t) => t.id === id)?.files.some((f) => task.files.includes(f)))
        );
        if (existingGroup) {
          existingGroup.push(task.id);
        } else {
          groups.push([task.id]);
        }
      }
    }

    return { parallel: groups, sequential };
  }
}
