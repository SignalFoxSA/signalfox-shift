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
  "perfHistory": [],
  "storageHistory": [],
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
- `perfHistory`: array of `{ "staff": 200, "loadMs": 2301,
  "renderMs": 145, "exportMs": 8200 }`. Drives the three
  "Performance vs size" charts (one per metric, own scale, ms on the
  y-axis, staff count on the x-axis). Append one point after each
  measurement — this shows WHERE the app starts to slow down as the
  company grows (the "glitch" threshold).
- `storageHistory`: array of `{ "time": "HH:MM", "kb": 4828 }`,
  SAST, oldest first. Drives the "Storage" chart (localStorage usage in
  KB over time). Append as localStorage usage changes — this shows when
  storage nears its limit.
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
- Write `totals` as you scale up (never invent numbers — only what the
  test actually measured).
- Write `perfHistory` after each measurement, append
  `storageHistory` as localStorage usage changes — never invent numbers.
  The dashboard shows "Waiting for data…" for any of these fields until
  you write them.
- **Breakdown + Movement graph removed per Ian (16 Oct 2026)** — both
  had no meaning at scale ("That movement one also becomes irrelevant
  once it's higher. Both of those are not very good."); the relevant
  graphs are performance vs size and storage. The dashboard ignores any
  `breakdown` / `history` data in `results.json` (do NOT error, do NOT
  show it). You may stop writing them.
- Do NOT invent numbers — only write what the test actually measured.
- Keep the schema above exactly (same keys, same types).
- Do NOT touch the app (`index.html`, `sw.js`, BUILD) or the private repo.
  Only `stress-test/` in the public repo.

## Test buttons (UI only)

Two buttons at the top: **Run functionality test** and **Run stress
test**. For NOW they are UI only — clicking one shows
"Not connected — trigger coming soon" and does nothing else. No API
calls, no tokens, no keys.

The trigger (GitHub Actions + a safe proxy) is a SEPARATE later build.
Do NOT wire the buttons to run tests from this page. Do NOT put any
token/key in this folder.

Placeholder: the section shows "Not connected — device ping comes later."

- The device ping idea was DROPPED for now (Ian, 16 Oct 2026 — do it at
  a later stage). Do NOT build the Supabase read. Do NOT use a Supabase
  key here. Do NOT ask for SQL.
- When the ping is built later, this section will show devices active.
