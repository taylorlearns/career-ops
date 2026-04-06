# Codex Workflow Mapping

This document clarifies how the old `/career-ops` commands translate into the new Codex-first flows. Codex commands reuse the same shared context (`modes/_shared.md`, `modes/oferta.md`) and the helper scripts in `scripts/codex/` instead of duplicating prompt logic.

## Legacy `/career-ops` → Codex flow

| `/career-ops` command | Codex command | What it now does |
|----------------------|---------------|------------------|
| `/career-ops {paste a JD or URL}` | `codex:evaluate` | Runs the full auto-pipeline (six evaluation blocks, report, PDF, TSV tracker addition). Mirrors `/career-ops` auto-pipeline but now executes `scripts/codex/evaluate.mjs`, and pulls archetypes from `modes/oferta.md`. |
| `/career-ops scan` | `codex:scan` | Reuses `portals.yml` + `scripts/codex/scan.mjs` to scrape job boards, just as `/career-ops scan` did inside Claude. |
| `/career-ops pdf` | `codex:pdf` | Generates the ATS PDF from `cv.md` / `templates/cv-template.html` via `scripts/codex/pdf.mjs`. |
| `/career-ops tracker` | `codex:tracker` | Shows the tracker, encourages TSV additions, and reminds you to run `node merge-tracker.mjs` + `node dedup-tracker.mjs`. |

## Workflow notes

- `codex:evaluate` and `codex:scan` both import `scripts/codex/shared.mjs`, so any improvements to shared context (`modes/_shared.md`, `CLAUDE.md`) automatically affect both Codex and Claude.
- `codex:scan` honors the same `portals.yml` schema (title filters, tracked companies, search queries) that `/career-ops scan` used.
- Tracker updates still funnel through `batch/tracker-additions/`; after any Codex evaluation, run `node merge-tracker.mjs` and `node dedup-tracker.mjs` before considering the tracker clean.
- `codex:pdf` is available for quick ATS exports, matching `/career-ops pdf`, but now lives in `scripts/codex/pdf.mjs` and plugs into the Codex CLI.

## When to reach for each command

1. **Onboarding:** Reference `docs/CODEX.md` to ensure `cv.md`, `config/profile.yml`, and `portals.yml` exist before touching codex commands.
2. **Evaluate a role:** Paste a JD/URL → run `codex:evaluate`.
3. **Scan portals for new roles:** Run `codex:scan` (or schedule it, respecting the tracker and no-auto-submit rule).
4. **Generate a CV/PDF:** Use `codex:pdf` so the ATS output stays consistent.
5. **Review status:** Use `codex:tracker` to confirm TSV merges, dedup runs, and the latest application statuses.

Codex commands follow the CLAUDE.md emphasis on quality over quantity and the need for manual approval before submitting anything; generate content, show it to the user, and wait for their go-ahead. AGENTS.md documents the same guidance for easy reference.
