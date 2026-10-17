# OpenCode JSOC Engineering Intelligence & Governance Standards

This document establishes the mandatory Engineering Intelligence, Recommendations, Risk Analysis, and Governance standards for all 30+ agents in the OpenCode JSOC system.

---

## 1. Engineering Intelligence Core Requirement

Agents do not merely write code. Every task completion, PR creation, or handoff must produce **implementation, evidence, engineering rationale, recommendations, risk assessments, and next actions**.

A human reviewer or downstream agent must be able to understand:
> **What the agent is doing → Why it is doing it → How it is doing it → Which principles it follows → What risks exist → What alternatives were considered → What the agent recommends → What should happen next.**

---

## 2. Mandatory Engineering Summary Template

Every task completion or handoff must present an **Engineering Summary**:

```markdown
## Engineering Summary

### What I Did
[Clear, precise description of implementation and files changed.]

### Why I Did It
[Business rationale and technical objective.]

### How It Works
[Concise architecture breakdown and data flow.]

### Why This Approach
[Justification for selecting this implementation strategy.]

### Alternatives Considered
1. [Alternative 1]
   - Reason rejected: [Specific technical/security/architectural reason]
2. [Alternative 2]
   - Reason rejected: [Specific technical/security/architectural reason]

### Engineering Principles Applied
- [e.g., Separation of Concerns]
- [e.g., Single Responsibility / Least Privilege / Defense in Depth / Fail-safe Defaults]

### Standards / Modern Practices
- [e.g., OWASP ASVS / RFC 6749 / WCAG 2.2 AA / Modern Web Standards]

### Explicit Uncertainty Matrix
- Database behavior: **CONFIRMED**
- Production load characteristics: **UNKNOWN**
- Browser compatibility: **TESTED**
- Security impact: **AUDITED**

### Risks & Mitigation
- **[Risk Title]**: [Severity: LOW/MEDIUM/HIGH/CRITICAL] | Mitigation: [Strategy]

### Trade-offs
- [Trade-off made and why it was acceptable]

### Recommendations
- **REQUIRED**: [Must address before merge]
- **RECOMMENDED**: [Strongly advised improvement]
- **OPTIONAL**: [Nice-to-have improvement]
- **FUTURE**: [Architectural item for later tracking]

### Human Review Guidance
- **Review Areas**: [Specific files, endpoints, or states to verify]
- **What Was Verified**: [Unit/Integration/E2E test pass evidence]
- **What Was NOT Verified**: [Explicit scope limitations]

### Next Action & Handoff
- **Next Agent**: [Agent Key]
- **Recommended Model**: [Model Tier/Capability]
- **Instructions**: [Step-by-step instructions for next agent]
```

---

## 3. Best-Practice Recommendations System

All recommendations identified during task execution must be categorized into 4 priorities:

1. **REQUIRED**: Critical security, architectural, or safety flaw. Implementation MUST NOT proceed without addressing it.
2. **RECOMMENDED**: Strong engineering improvement. Does not block current task but highly advised.
3. **OPTIONAL**: Minor optimization or code polish.
4. **FUTURE**: Strategic or scale improvement. Tracked for future sprints to prevent scope creep.

### Standard Recommendation Object Format:
```markdown
Recommendation: [Title/Description]
Priority: REQUIRED | RECOMMENDED | OPTIONAL | FUTURE
Reason: [Why it matters]
Benefit: [Expected improvement]
Risk if Ignored: [Consequences of non-action]
Implementation Impact: LOW | MEDIUM | HIGH
Estimated Complexity: LOW | MEDIUM | HIGH
Recommended Owner: [Agent Key]
Recommended Model: [Model capability tier]
Status: OPEN | ACCEPTED | REJECTED | DEFERRED
```

---

## 4. Engineering Principles & Standards Framework

### Applicable Principles (Do not mechanically list; cite only what genuinely applies):
- **Architecture**: Separation of Concerns, Single Responsibility, High Cohesion, Low Coupling, Dependency Inversion, Bounded Contexts.
- **Security**: Least Privilege, Defense in Depth, Secure by Default, Fail-safe Defaults, Zero Trust, Data Minimization.
- **Reliability**: Idempotency, Fault Isolation, Graceful Degradation, Retry with Backoff, Transactional Consistency.
- **Performance**: Measure before Optimizing, Avoid N+1 Queries, Eager Loading, Resource Limits.
- **Maintainability**: Explicit Contracts, Type Safety (Strict TS / PHP 8.3+), Testability, Minimal Complexity.

### Compliance Terminology Rule (NO MANUFACTURED COMPLIANCE):
- ❌ **Forbidden**: "OWASP compliant", "Fully secure", "ISO compliant", "Production ready".
- ✅ **Required**: "Aligned with OWASP ASVS principle X", "Meets project security requirements for scope Y", "Security review completed with 0 findings in tested scope".

---

## 5. Architectural Decision Records (ADR) & Technical Debt

### When to create an ADR:
For major architectural changes, new third-party integrations, or domain boundary updates.
Persist via Memory Fabric: `decision record "<title>" --reason=... --alternatives=... --consequences=...`

### Technical Debt Tracking:
Record non-blocking technical debt using:
```markdown
Debt ID: TD-XXXX
Description: [Technical debt description]
Why It Exists: [Context / Deadline / Dependency]
Impact: [Future maintenance / performance / readability impact]
Priority: LOW | MEDIUM | HIGH | CRITICAL
Recommended Owner: [Agent Key]
Status: OPEN | PLANNED | RESOLVED | DEFERRED
```

---

## 6. Escalation Protocol & Requirements Challenge

### Explicit Escalation Levels:
- **LEVEL 0**: Agent handles task independently within scope.
- **LEVEL 1**: Agent consults specialized peer (e.g. backend consults database-engineer).
- **LEVEL 2**: Reassignment requested from VP Engineering / Builder.
- **LEVEL 3**: Mandatory Security / DevOps / QA Review trigger.
- **LEVEL 4**: Human decision required (unresolvable trade-off or dangerous requirement).

### Challenging Dangerous Requirements:
If a requirement violates security, data protection, reliability, or system architecture, the agent MUST respectfully challenge it:
```markdown
## Engineering Concern
The requested approach introduces [Vulnerability / Architectural Flaw].

### Risk
[Specific risk and impact]

### Recommended Approach
[Alternative safe implementation]

### Reason & Principles
[Engineering justification]

### Decision Required
Human / VP Engineering approval required before proceeding.
```

---

## 7. Craft Skills Wiring (MANDATORY)

The ported pstack craft skills are installed in `~/.config/opencode/skills/` (versioned source of truth: `tooling/opencode-skills/` + `scripts/install-opencode-skills.sh` in the njira_auto_fx repo). Skills fire only when invoked, so these hooks are mandatory, not optional:

| Trigger | Skill to load first |
|---|---|
| Before writing any commit | `no-comments` (runs `comment-sicko` over the diff) |
| Before any report, doc, or prose deliverable | `unslop` |
| On a risky, large, or security-relevant diff | `interrogate` |
| When fixing a bug or refactoring shared code | `principle-fix-root-causes`, `principle-prove-it-works` |

Load the named skill with the `skill` tool before performing the trigger action. These are gates: a commit is not ready until `no-comments` has run on its diff; a report is not ready until `unslop` has run on it.
