---
description: Probe every model in the Qoreban routing fabric, refresh model-health.json, and report which models the router will pick per agent chain.
---

Run the fabric health probe and report results:

```bash
bash ~/.config/opencode/scripts/model-probe.sh
```

Then summarize for the user:
1. The probe table (model / ok / latency / note).
2. Which chain positions changed: read `~/.config/opencode/model-health.json` and `~/.config/opencode/model-routing.json`, walk each chain in `chains`, and state which model is now first-healthy per chain (a model with `ok:false` and `ts` younger than 10 minutes is skipped).
3. Remind the user: **quit and restart opencode** so `plugin/model-router.ts` re-routes agents onto healthy models — config and plugin state load once at startup.

If the user passes "full" as $ARGUMENTS, also run `bash ~/.config/opencode/scripts/model-probe.sh --zen` to runtime-proof the Zen gateway models too (slower).
