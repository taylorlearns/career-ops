# Codex Workflow Mapping

This document clarifies how the old `/career-ops` commands translate into the new Codex-first flows. Codex commands act as workflow entry points that wrap the helper scripts in `scripts/codex/` while the reference guidance still lives in `modes/_shared.md` (archetypes, rules) and `modes/oferta.md` (the evaluation block layout).

## Legacy `/career-ops` -> Codex flow

| `/career-ops` command | Codex command | What it now does |
|----------------------|---------------|------------------|
| `/career-ops {paste a JD or URL}` | `codex:evaluate` | Entry point that surfaces the onboarding reminders, references the `modes/_shared.md`/`modes/oferta.md` guidance, and wraps `scripts/codex/evaluate.mjs` so the agent can follow the planned evaluation workflow when you request it. |
| `/career-ops scan` | `codex:scan` | Entry point that reiterates the portal configuration reminders and invokes `scripts/codex/scan.mjs` whenever you choose to trigger a scan. |
| `/career-ops pdf` | `codex:pdf` | Entry point that delegates to `generate-pdf.mjs`, so the existing CV/template-based PDF pipeline remains unchanged. `scripts/codex/pdf.mjs` simply forwards the call. |
| `/career-ops tracker` | `codex:tracker` | Entry point that shows the tracker, encourages TSV additions, and reminds you to run `node merge-tracker.mjs` + `node dedup-tracker.mjs`. |

## Workflow notes

- `codex:evaluate` and `codex:scan` both import `scripts/codex/shared.mjs` for repository-path helpers, setup checks, and script execution. The workflow guidance stays in `modes/_shared.md` and the relevant mode docs, not inside the helper module.
- `codex:scan` honors the same `portals.yml` schema (title filters, tracked companies, search queries) that `/career-ops scan` used.
- Tracker updates still funnel through `batch/tracker-additions/`; after any Codex evaluation, run `node merge-tracker.mjs` and `node dedup-tracker.mjs` before considering the tracker clean.
- `codex:pdf` is still available for quick ATS exports; it simply calls the existing PDF generator from `generate-pdf.mjs` via the wrapper `scripts/codex/pdf.mjs`.

## When to reach for each command

1. **Onboarding:** Reference `docs/CODEX.md` to ensure `cv.md`, `config/profile.yml`, and `portals.yml` exist before touching codex commands.
2. **Evaluate a role:** Paste a JD/URL -> run `codex:evaluate`.
3. **Scan portals for new roles:** Run `codex:scan` (or schedule it, respecting the tracker and no-auto-submit rule).
4. **Generate a CV/PDF:** Use `codex:pdf` so the ATS output stays consistent.
5. **Review status:** Use `codex:tracker` to confirm TSV merges, dedup runs, and the latest application statuses.

Codex commands follow the CLAUDE.md emphasis on quality over quantity and the need for manual approval before submitting anything; generate content, show it to the user, and wait for their go-ahead. AGENTS.md documents the same guidance for easy reference.
