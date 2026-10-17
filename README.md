# rm_stack

An OpenCode agent org that plans like a company and refuses to ship slop.

`rm_stack` is a working OpenCode profile: the agents, context files, skills, commands, and hooks that run a 30+ agent engineering org from one directory. Clone it, run one script, restart OpenCode.

## The problem

Most AI coding setups fail in one of two ways.

The first is **speed without discipline**. The agent writes working code and leaves behind narration comments, workaround shims, and prose full of "delve" and "pivotal". It ships, and the mess compounds.

The second is **discipline without a spine**. The rules are written down, and nothing enforces them. Every session starts by re-reading the same instructions, and every session the agent quietly ignores them.

`rm_stack` is built to close both gaps at once. Two lines of thought are deliberately mixed here, and they are mixed on purpose.

## Two parents, two jobs

`rm_stack` carries ideas from two open-source projects, and they govern different halves of the org.

| Source | Who follows it | What it contributes |
|---|---|---|
| [gstack](https://github.com/garrytan/gstack) | The CEO and the user | Plan-first workflow. Nothing executes before a plan is approved. Org chart, role ownership, review gates. |
| [pstack](https://github.com/cursor/plugins/tree/main/pstack) | The VP of Engineering | Craft discipline. Cut the commentary, cut the slop, interrogate the requirements, fix the root cause. |

The split is the point. gstack decides *what* gets built and *who* signs off. pstack decides *how* the code is written once work starts. A plan-first CEO and a slop-hating engineering org do not fight here, because they are answering different questions.

The 24 one-line principles in `skills/principle-*` are pstack's, ported verbatim. The org structure, review order, and approval gates are gstack's, and they stay.

## Features

| Feature | What it does |
|---|---|
| 30 skills | Loaded on demand by the agent, or by name. 28 ported craft skills plus `context7` and `task-management`. |
| Craft auto-wiring | `context/engineering-intelligence.md` section 7 routes commits through `no-comments`, prose through `unslop`, and risky diffs through `interrogate`. |
| Pre-commit craft gate | A git hook that hard-blocks any commit whose staged lines contain AI slop or an em dash. |
| Two installers | `install.sh` puts the profile in place. `install-craft-gate.sh` arms the gate in any repo you own. |
| Multi-model routing | `plugin/model-router.ts` plus `model-routing.json` bind each agent to a provider chain with failover. |
| Plan-first org | Global `instructions` force-load the planning, memory, and routing protocol files into every session. |
| Engineering Intelligence | Every task ends with rationale, alternatives considered, risks, and next actions, not just a diff. |

## Install

```sh
git clone https://github.com/richardMulambuzi/rm_stack.git
cd rm_stack
./install.sh
```

`install.sh` copies the stack into `${OPENCODE_HOME:-$HOME/.config/opencode}`. It never deletes existing files, and it skips `.git` and itself. Restart OpenCode afterwards.

Set `OPENCODE_HOME` to install somewhere else:

```sh
OPENCODE_HOME=/tmp/profile ./install.sh
```

### Arm the commit gate in one of your repos

```sh
./install-craft-gate.sh ~/path/to/repo
```

This copies `scripts/pre-commit-craft-gate.sh` to `<repo>/.git/hooks/pre-commit`. The next commit inspects its own staged additions and refuses if they contain slop vocabulary or an em dash, with an escape hatch for the rare case you mean it:

```sh
SKIP_CRAFT_GATE=1 git commit -m "..."
```

The gate catches vocabulary and punctuation. It cannot judge whether a comment earns its place, so it prints a reminder to run `no-comments` and leaves that call to the agent.

## What is inside

```
opencode.json          agents, permissions, model, subagent depth
model-routing.json     per-agent provider chains and capabilities
dcp.jsonc              context compression policy
context/               protocol files force-loaded into every session
  engineering-intelligence.md   review, reporting, and craft-gate wiring
  routing-protocol.md           model fabric and failover rules
skills/                30 skill directories, each with SKILL.md
command/               slash commands
plugin/model-router.ts binds agents to healthy models at startup
tool/env/index.ts      loads .env values into process.env for tools and agents
scripts/               pre-commit-craft-gate.sh
install.sh             install the profile
install-craft-gate.sh  install the commit gate into a repo
```

## Credits

The org skeleton is [gstack](https://github.com/garrytan/gstack) by Garry Tan. The craft skills are [pstack](https://github.com/cursor/plugins/tree/main/pstack) by poteto. Both are MIT licensed. `context/openagents-repo/` and the agent registry in `config/` derive from OpenAgents Control.

MIT. See [LICENSE](LICENSE).
