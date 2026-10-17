# OpenCode JSOC — Existing Setup Enhancement

## IMPORTANT: DO NOT BUILD FROM SCRATCH

This is an enhancement of an  **existing, heavily customized OpenCode JSOC environment** .

The current setup already contains  **30+ custom agents, custom workflows, custom model configuration, orchestration logic, and project-specific customization** .

Do **not** replace this architecture.

Do **not** rebuild the agent system from scratch.

Do **not** create a generic OpenCode multi-agent framework.

Do **not** discard the existing custom agents.

Instead:

> **Inspect the existing OpenCode JSOC implementation first, understand how the current 30+ agents, models, orchestration, tools, memory/context, Git integration, and workflows operate, and then improve the existing system in place.**

The existing customization is the foundation.

The objective is to make the existing system  **more intelligent, persistent, coordinated, observable, secure, and autonomous** , while removing only the unused/default OpenCode functionality that conflicts with or duplicates the existing customized architecture.

---

# 1. First: Audit the Existing Setup

Before modifying anything, perform a complete audit of the existing OpenCode JSOC setup.

Identify:

* Existing custom agents
* Existing 30+ agent definitions
* Existing agent responsibilities
* Existing orchestrator
* Existing model routing
* Existing Zen models
* Existing tools
* Existing MCP servers
* Existing context/memory mechanism
* Existing progress tracking
* Existing Git integration
* Existing GitHub integration
* Existing Pull Request workflow
* Existing DevOps agent
* Existing Security agent
* Existing QA/testing agents
* Existing configuration files
* Existing hooks
* Existing automation
* Existing task routing
* Existing fallback mechanisms
* Existing agent handoff mechanisms
* Existing default OpenCode agents
* Existing default OpenCode configurations

Do not make architectural changes until the current implementation has been understood.

---

# 2. Preserve the Existing 30+ Custom Agents

The existing custom agents are already part of the system and must remain available.

Do not replace them with a smaller generic agent set.

Do not rename existing agents unnecessarily.

Do not remove specialized agents merely because a new agent has overlapping responsibilities.

Instead, determine:

1. Which agents are custom.
2. Which agents are default OpenCode agents.
3. Which agents are actively used.
4. Which agents are unused.
5. Which agents duplicate another agent.
6. Which agents can be improved.
7. Which agents should remain untouched.

The existing customized agent ecosystem should remain the primary architecture.

---

# 3. Remove Unused Default OpenCode Agents

The existing OpenCode installation may contain default agents or generic configurations that are not part of the customized JSOC architecture.

Identify these default components.

Remove, disable, or override  **only the default agents and configurations that are not being used and that conflict with the custom JSOC setup** .

Do not remove custom agents.

Do not remove required infrastructure.

Do not remove MCP tools required by the existing system.

Do not remove models that are actively used.

Do not blindly delete configuration files.

The final configuration should clearly distinguish between:

```text
CUSTOM JSOC AGENTS
        +
REQUIRED INFRASTRUCTURE
        +
REQUIRED DEFAULT CAPABILITIES
```

and:

```text
UNUSED DEFAULT OPENCode AGENTS
UNUSED DEFAULT CONFIGURATION
DUPLICATE AGENTS
CONFLICTING DEFAULT WORKFLOWS
```

The latter should be removed or disabled where safe.

---

# 4. Improve the Existing AI Orchestration

Enhance the existing orchestrator rather than creating another competing orchestrator.

The orchestrator should become better at:

* Task decomposition
* Agent selection
* Model selection
* Agent availability
* Workload distribution
* Dependency detection
* Parallel work
* Sequential work
* Agent handoffs
* Failure recovery
* Blocker resolution
* Context retrieval
* Git coordination
* PR coordination
* Security escalation
* DevOps escalation
* Testing escalation

The orchestrator must understand the capabilities of the existing 30+ agents.

It should not assume that every task belongs to one of the four new developer agents.

The four new developer agents are additional implementation specialists within the existing ecosystem.

---

# 5. Add Four Senior Developer Agents

Add exactly four new senior developer agents  **on top of the existing custom agents** .

## Frontend

### `fe-senior-1`

Senior Frontend Developer.

Primary responsibilities:

* React
* TypeScript
* Vite
* Tailwind
* UI architecture
* Component architecture
* State management
* API integration
* Browser behavior
* Accessibility
* Responsive design
* Performance
* Frontend testing
* E2E workflows

### `fe-senior-2`

Senior Frontend Developer.

Primary responsibilities:

* Complex frontend implementation
* React architecture
* TypeScript
* State management
* API integration
* Performance
* Refactoring
* Browser compatibility
* Accessibility
* Testing
* Complex UI workflows

The two frontend agents must coordinate through the persistent task and progress system.

---

# 6. Backend

### `be-senior-1`

Senior Backend Developer.

Primary responsibilities:

* APIs
* Backend architecture
* Authentication
* Authorization
* Business logic
* Database operations
* Transactions
* Background processing
* Integrations
* Backend testing
* Performance
* Reliability

### `be-senior-2`

Senior Backend Developer.

Primary responsibilities:

* Complex backend architecture
* Database architecture
* API design
* Integrations
* Performance
* Scalability
* Refactoring
* Reliability
* Distributed workflows
* Backend testing

The two backend agents must coordinate through the shared project state rather than relying on conversational memory.

---

# 7. Do Not Duplicate Existing Specialized Agents

Before creating any new agent, determine whether an existing custom agent already performs that role.

For example, if an existing agent already specializes in:

* Database architecture
* Testing
* Security
* DevOps
* UI/UX
* Architecture
* Code review
* Documentation
* Infrastructure

do not create another duplicate agent.

The four new developer agents should complement the existing agents.

---

# 8. Persistent Context Instead of Conversation Memory

The biggest improvement required is  **continuity** .

Agents must not depend on remembering the entire conversation.

Continuity must come from persistent project state.

The system should use existing mechanisms where available and enhance them rather than creating unnecessary parallel systems.

The persistent state should include:

* Project context
* Architecture
* Current task
* Task history
* Progress
* Agent ownership
* Handoffs
* Blockers
* Git history
* Commits
* Branches
* Pull Requests
* Test results
* Security findings
* DevOps findings
* Decisions
* Remaining work

The principle is:

> **Conversation context is temporary. Project state is persistent.**

---

# 9. Improve the Existing Progress Log

Enhance the existing progress-log mechanism.

Each meaningful task update should record:

* Timestamp
* Task ID
* Agent
* Agent role
* Model
* Branch
* PR
* Current status
* Completed work
* In-progress work
* Remaining work
* Files changed
* Tests
* Known issues
* Blockers
* Security status
* DevOps status
* Next agent
* Next action
* Commit SHA

The progress log should function as the handoff mechanism between agents.

---

# 10. Mandatory Agent Handoff

When an agent finishes, becomes blocked, times out, or needs another specialist, it must leave clear instructions.

A handoff must answer:

### What was completed?

### What remains?

### What is currently broken?

### What files were changed?

### What tests passed?

### What tests failed?

### What is blocking progress?

### Which agent should continue?

### Why is that agent appropriate?

### Which model capability is recommended?

### What exact action should the next agent take?

Never leave:

```text
Continue from here.
```

Instead provide actionable continuation instructions.

---

# 11. Automatic Agent Reassignment

Improve the existing routing system so that blocked work is automatically reassigned.

Workflow:

```text
Agent Working
      ↓
Agent encounters blocker
      ↓
Record blocker
      ↓
Save progress
      ↓
Create handoff
      ↓
Analyze required expertise
      ↓
Find available specialist
      ↓
Select appropriate model
      ↓
Reassign
      ↓
Continue from persistent state
```

The new agent must receive the relevant context from:

* Progress log
* Handoff
* Task
* Git
* PR
* Architecture records
* Test results

It should not need the previous conversation.

---

# 12. Improve Model Routing

Enhance the existing model-selection system.

The system should select a model based on:

* Task complexity
* Agent specialization
* Required reasoning
* Codebase complexity
* Number of files affected
* Security sensitivity
* Architecture impact
* Debugging difficulty
* Tool requirements
* Context requirements

Do not use the strongest model for every task.

Use lightweight/free models where appropriate.

Reserve stronger Zen models for complex work.

The model assignment should be visible in the task and PR metadata.

---

# 13. Zen Model Allocation

Improve the existing Zen model routing rather than replacing it.

The system should determine which available Zen model is appropriate for each task.

Example:

```text
Simple task
    ↓
Standard/free model

Normal feature
    ↓
Medium model

Complex implementation
    ↓
High-capability model

Security / architecture / critical debugging
    ↓
Highest suitable available model
```

Model routing must remain configurable.

Do not hardcode model names unnecessarily.

---

# 14. Git Automation After Accepted Changes

Improve the existing Git workflow.

The desired workflow is:

```text
Agent implements change
        ↓
Tests
        ↓
Validation
        ↓
Human accepts change
        ↓
Commit
        ↓
Push to GitHub
        ↓
Create/update PR
        ↓
CI
        ↓
Review
```

The important requirement is:

> **Once I explicitly accept a change, the accepted change should automatically be committed and pushed to GitHub.**

The system should:

1. Generate a meaningful commit message.
2. Commit the accepted changes.
3. Push the branch.
4. Create or update the PR.
5. Record the commit SHA.
6. Record the PR number.
7. Update the progress log.

Do not commit unaccepted work if the existing workflow requires human approval first.

---

# 15. Pull Request Visibility

Improve PR integration so that I can monitor agent activity.

Every meaningful task should expose:

```text
Task
Agent
Role
Model
Branch
Files Changed
Commit
PR
Tests
Security
DevOps
Status
Blockers
Next Action
```

The PR should make it easy to determine:

> **Which agent is doing what, which model is being used, and what remains to be done?**

This allows me to manually override model allocation when necessary.

---

# 16. Agent Status

Improve the existing status system.

Supported statuses should include:

```text
IDLE
ASSIGNED
WORKING
WAITING
BLOCKED
HANDOFF_REQUIRED
READY_FOR_REVIEW
IN_REVIEW
COMPLETED
FAILED
```

The orchestrator should know which agents are currently available.

This prevents assigning multiple conflicting tasks to the same agent.

---

# 17. Concurrency and Conflict Prevention

Because there are now 30+ existing specialized agents plus four senior developer agents, improve coordination.

Before an agent starts work, check:

* Active tasks
* Active agents
* Existing branches
* Existing PRs
* Recent commits
* Files currently being modified
* Related tasks
* Dependencies

Avoid multiple agents independently changing the same critical files without coordination.

When parallel development is safe, allow it.

When changes are likely to conflict, coordinate ownership through the orchestrator.

---

# 18. Security Agent Enhancement

Do not create a duplicate Security Agent if an existing custom Security Agent already exists.

Instead,  **upgrade the existing Security Agent** .

The Security Agent must specifically inspect whether sensitive information is exposed through the browser.

It must inspect:

### Network

* Request URLs
* Request headers
* Request bodies
* Response headers
* Response bodies
* Cookies
* Authorization
* WebSockets
* API responses
* Unexpected fields

### Console

* `console.log`
* `console.error`
* `console.warn`
* Debug output
* Tokens
* Credentials
* Personal information
* Internal IDs
* Stack traces
* Database errors
* Infrastructure details

### Browser Storage

* localStorage
* sessionStorage
* IndexedDB
* Cookies

The guiding principle must be:

> **If the browser does not need the information, the server should not send it to the browser.**

The Security Agent should identify excessive data exposure and recommend or implement appropriate fixes.

---

# 19. Security Requirements

Security review should cover:

* Authentication
* Authorization
* RBAC
* API permissions
* Input validation
* Output filtering
* Sensitive data exposure
* Session security
* Cookie configuration
* CSRF
* CORS
* CSP
* HSTS
* TLS
* Rate limiting
* Error handling
* Logging
* Secrets
* Database permissions
* API responses
* Browser storage
* Source maps
* Debugging information

Production applications must not unnecessarily expose:

* Passwords
* Password hashes
* API keys
* Access tokens
* Refresh tokens
* Private keys
* Database credentials
* Encryption keys
* Sensitive personal data
* Internal infrastructure information
* Stack traces
* Debug information

---

# 20. DevOps Agent Enhancement

Do not create a duplicate DevOps Agent if the existing JSOC setup already contains one.

Enhance the existing DevOps capability.

The DevOps Agent should verify:

* HTTPS
* TLS
* Secure protocols
* DNS
* Firewall
* Ports
* Reverse proxy
* Load balancer
* CORS
* CSP
* HSTS
* Secure cookies
* Network segmentation
* Service-to-service communication
* Secrets management
* Containers
* CI/CD
* Monitoring
* Logging
* Health checks
* Timeouts
* Retry policies
* Deployment
* Rollback
* Infrastructure security

The DevOps agent must ensure that network protocols and infrastructure configurations follow secure production standards.

---

# 21. Security and DevOps Gates

Relevant PRs should automatically trigger specialist review.

For example:

```text
Authentication change
        ↓
Backend Agent
        ↓
Security Agent
        ↓
QA
```

Or:

```text
Network change
        ↓
DevOps Agent
        ↓
Security Agent
        ↓
QA
```

Or:

```text
Frontend API change
        ↓
Frontend Agent
        ↓
Security Agent
        ↓
QA
```

Do not require every PR to go through every specialist when it is irrelevant.

Use intelligent routing.

---

# 22. Improve Existing QA/Test Coordination

Use the existing testing agents where available.

Testing should occur at the appropriate stage:

```text
Implementation
    ↓
Unit Tests
    ↓
Integration Tests
    ↓
E2E Tests
    ↓
Security Validation
    ↓
DevOps Validation
    ↓
Human Acceptance
```

The exact sequence may be optimized based on task type.

Critical workflows should be tested through real user flows whenever browser automation is available.

---

# 23. Progress Log Structure

Enhance the existing progress log with sections similar to:

```text
# OpenCode Multi-Agent Progress Log

## Current Active Context

Last Updated:
Current Sprint:
Current Task:
Active Agent:
Assigned Model:
Branch:
PR:
Status:
Blockers:
Next Agent:
Next Action:

---

## Active Agents

| Agent | Role | Status | Task | Model | Branch | PR |
|------|------|--------|------|-------|--------|----|

---

## Agent Handoff History

### [Timestamp] Handoff

From:
To:
Task:
Reason:

Completed:
- ...

In Progress:
- ...

Remaining:
- ...

Files Changed:
- ...

Tests:
- ...

Blockers:
- ...

Security:
- ...

DevOps:
- ...

Instructions for Next Agent:
1.
2.
3.

Recommended Model:
...

---

## PR Audit & Model Routing Monitor

| PR | Task | Agent | Model | Power | Status | Security | DevOps |
|----|------|-------|-------|-------|--------|----------|--------|

---

## Current Blockers

| Task | Agent | Blocker | Severity | Assigned To | Status |
|------|-------|---------|----------|-------------|--------|

---

## Recent Git Activity

| Time | Agent | Branch | Commit | PR | Status |
|------|-------|--------|--------|----|--------|

---

## Recent Decisions

- ...

---

## Next Actions

1.
2.
3.
```

Use the existing progress mechanism if one already exists; improve it rather than creating a second competing progress system.

---

# 24. No Duplicate Sources of Truth

Do not create multiple independent systems that track the same information.

For example, avoid having:

```text
progress.json
progress.md
agent-state.json
agent-state.md
tasks.json
tasks.md
```

all independently claiming to be authoritative.

If the existing system already has a state store, improve it.

Establish one authoritative state model and generate human-readable views from it where appropriate.

---

# 25. Existing Architecture Takes Priority

The implementation must follow this order:

```text
Existing JSOC Architecture
        ↓
Existing Custom Agents
        ↓
Existing Agent Registry
        ↓
Existing Model System
        ↓
Existing Context System
        ↓
Existing Git/GitHub Integration
        ↓
Existing Task System
        ↓
Enhancements Required By This Specification
```

Do not introduce a new framework merely because it is easier to implement.

Reuse existing abstractions wherever possible.

---

# 26. Safe Configuration Migration

Before modifying configuration:

1. Back up or preserve the current configuration.
2. Inspect all existing agent definitions.
3. Identify dependencies.
4. Identify default OpenCode components.
5. Identify active custom components.
6. Remove only confirmed-unused defaults.
7. Validate configuration.
8. Start OpenCode.
9. Verify agent discovery.
10. Verify model routing.
11. Verify MCP/tool access.
12. Verify Git integration.
13. Verify progress persistence.
14. Verify PR integration.

Do not perform destructive cleanup without determining whether a component is actually being used.

---

# 27. Final Architecture

The final system should conceptually look like:

```text
                 EXISTING JSOC ORCHESTRATOR
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
       EXISTING 30+     NEW DEV       SPECIALISTS
       CUSTOM AGENTS    AGENTS        / REVIEW
             │             │             │
             │       ┌─────┴─────┐       │
             │       │           │       │
             │       ▼           ▼       │
             │    FRONTEND     BACKEND    │
             │    SENIOR ×2   SENIOR ×2  │
             │                           │
             └─────────────┬─────────────┘
                           │
                     TASK ROUTING
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
          SECURITY       DEVOPS          QA
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                    HUMAN ACCEPTANCE
                           │
                           ▼
                     GIT COMMIT
                           │
                           ▼
                     GITHUB PUSH
                           │
                           ▼
                          PR
                           │
                           ▼
                         CI/CD
                           │
                           ▼
                     MERGE / DEPLOY
                           │
                           ▼
                  PERSISTENT PROGRESS
```

The important point is that the  **existing 30+ custom-agent ecosystem remains at the center** .

The four new senior developers are additions to the ecosystem, not replacements for it.

---

# 28. Success Criteria

The enhancement is successful when:

* Existing 30+ custom agents still work.
* Existing custom workflows still work.
* Existing model routing still works.
* Existing MCP integrations still work.
* Unused default OpenCode agents are removed/disabled.
* Duplicate default functionality is eliminated.
* Four senior developer agents are available.
* Agent routing is improved.
* Model routing is improved.
* Zen model allocation is improved.
* Persistent progress is maintained.
* Agent handoffs are explicit.
* Blocked tasks can be automatically reassigned.
* Git commits are generated after accepted changes.
* Accepted changes are pushed to GitHub.
* PRs clearly expose agent/task/model ownership.
* Security reviews inspect browser Network and Console exposure.
* DevOps reviews network and infrastructure protocols.
* QA is integrated into the workflow.
* Agents can resume work without requiring the previous conversation.
* No competing sources of truth are introduced.
* The existing JSOC customization remains intact.

---

# 29. Final Instruction

**Do not rebuild OpenCode JSOC.**

**Do not replace my existing 30+ custom agents.**

**Do not create a generic agent framework.**

**Do not blindly install or retain OpenCode's default agents.**

Instead:

> **Audit the existing customized JSOC implementation, remove only the unused/conflicting default OpenCode agents and configuration, and then enhance the existing architecture with better orchestration, persistent progress, agent handoffs, automatic reassignment, intelligent model/Zen routing, Git/GitHub automation, Pull Request monitoring, security validation, DevOps validation, and four additional senior developer agents: two frontend and two backend.**

The existing customization is the foundation.

The goal is to make it **smarter, more reliable, more observable, more secure, and better at long-running autonomous development without losing the architecture that has already been built.**
