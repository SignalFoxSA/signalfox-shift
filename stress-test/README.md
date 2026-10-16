# SignalFox Shift — Stress Test Live Dashboard

Standalone page (no login, no app code, no service worker) that Ian watches
while the stress test runs.

**URL:** https://signalfoxsa.github.io/signalfox-shift/stress-test/

## Files

- `index.html` — the dashboard. Polls `results.json` every 5 seconds
  (cache-busting `?t=Date.now()`) and re-renders.
- `results.json` — the live state the dashboard reads. Written by the
  stress test bot as it goes.

## `results.json` schema

```json
{
  "status": "waiting",
  "stage": "Waiting for the stress test to start",
  "progress": { "current": 0, "total": 7 },
  "thresholds": { "perfect": null, "glitch": null, "break": null },
  "metrics": [],
  "totals": { "companies": null, "staff": null, "rosters": null, "changes": null },
  "history": [],
  "log": [ { "time": "20:55", "message": "Dashboard ready — waiting for the stress test to start." } ],
  "updatedAt": "2026-10-16T20:55:00+02:00"
}
```

- `status`: `"waiting"` | `"running"` | `"done"`.
  Waiting = gold banner, Running = electric blue, Done = green.
- `stage`: human-readable current stage, e.g.
  `"Stage 3 of 7 — 500 staff, 24 months"`.
- `progress.current` / `progress.total`: drives the progress bar.
- `thresholds.perfect` / `.glitch` / `.break`: strings (e.g.
  `"500 staff, 24 months — load 1.2s"`) or `null` until found.
- `metrics`: array of `{ "label": "Load time", "value": "1.2s" }`.
- `totals`: the current system totals (numbers or `null` until the
  stress test writes them). Drives the four big counters:
  Companies / Staff rostered / Active rosters / Changes.
- `history`: array of `{ "time": "HH:MM", "companies": 1, "staff": 200,
  "rosters": 12, "changes": 340 }`, SAST, oldest first. Drives the
  movement graph (inline SVG line chart, no library). Append one point
  each time the totals change — the lines should visibly go UP as the
  stress test scales.
- `log`: array of `{ "time": "HH:MM", "message": "..." }`,
  SAST, newest last (dashboard renders in file order).
- `updatedAt`: ISO timestamp with SAST offset (`+02:00`).

## Contract for the stress test bot

The stress test bot writes its progress to `stress-test/results.json` as it
goes (and commits + pushes to the public repo so the dashboard updates
live).

- Set `status` to `"running"` when the test starts, `"done"` when it
  finishes. Leave it `"waiting"` until then.
- Update `progress.current`, `stage`, `thresholds`, `metrics`, and append
  to `log` as the test runs.
- Write `totals` + append to `history` as you scale up (never invent
  numbers — only what the test actually measured). The dashboard draws
  the graph from `history`.
- Do NOT invent numbers — only write what the test actually measured.
- Keep the schema above exactly (same keys, same types).
- Do NOT touch the app (`index.html`, `sw.js`, BUILD) or the private repo.
  Only `stress-test/` in the public repo.

## Devices Active

Placeholder: the section shows "Not connected — device ping comes later."

- The device ping idea was DROPPED for now (Ian, 16 Oct 2026 — do it at
  a later stage). Do NOT build the Supabase read. Do NOT use a Supabase
  key here. Do NOT ask for SQL.
- When the ping is built later, this section will show devices active.
