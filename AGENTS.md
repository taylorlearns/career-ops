# AGENTS — Codex First

This repository is Codex-first. Claude compatibility still exists for reference, but the Codex workflows now drive installations, onboarding, and day-to-day operations. `codex:evaluate`, `codex:scan`, `codex:pdf`, and `codex:tracker` serve as the entry-point commands that wrap the helper scripts, while the shared modes supply the policy context.

## Onboarding checks

Before you do anything that produces evaluations, scans, PDFs, or tracker changes, verify the three onboarding sources of truth:

1. `cv.md` exists in the project root (your canonical CV).
2. `config/profile.yml` exists and is filled from `config/profile.example.yml`.
3. `portals.yml` exists (you can copy from `templates/portals.example.yml`).

If any of those files are missing, pause before generating evaluations or tracker updates. Prompt the user to create or populate the missing files, guide them through providing the data, and proceed only after the repo contains each onboarding artifact. The onboarding flow for Codex users is documented in `docs/CODEX.md` and reiterates these checks.

## Sources of truth & operational rules

- `cv.md` and `config/profile.yml` remain the canonical data sources (see `modes/_shared.md` for how Codex uses them). Always read them before matching a job, and treat `article-digest.md` as optional supplemental proof points when it exists.
- `portals.yml` (and any custom filters in `title_filter`) is the scanner’s configuration for `codex:scan`.
- Tracker additions must go through `batch/tracker-additions/` and then `merge-tracker.mjs`. After merging, run `dedup-tracker.mjs` so the tracker stays clean. Never hand-edit `data/applications.md` to add a new row.
- Treat Claude modes such as `modes/oferta.md` as reference implementations but do *not* duplicate their prompt logic; reuse the shared `modes/_shared.md` context and the `scripts/codex/*.mjs` scripts instead. That keeps Codex and Claude aligned on the same data.
- Tracker merges and dedup runs are part of the pipeline: run `node merge-tracker.mjs`, then `node dedup-tracker.mjs` after any batch evaluation touches `batch/tracker-additions/`.
- `templates/states.yml` is the final authority on tracker statuses.
- Applications are never submitted automatically. Generate reports, PDFs, and tracker entries, then ask the user to review or submit, honoring CLAUDE.md's emphasis on quality over quantity and the need for manual approval before submission.

## Workflow guidance

Codex commands are entry points that remind you of onboarding before delegating to the helper scripts. Each session roughly follows:

1. Confirm onboarding (cv/profile/portals).
2. Use `codex:evaluate` (maps to `/career-ops` auto pipeline) to process a pasted JD or URL while following the shared guidance.
3. Run `codex:scan` for portal discovery (maps to `/career-ops scan`) when you are ready for a manual scan.
4. When you need a tailored CV/ATS PDF, use `codex:pdf`.
5. Check progress via `codex:tracker`. Updates still pass through the tracker scripts and the `batch/tracker-additions/` workflow.
