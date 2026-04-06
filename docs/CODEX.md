# Codex Setup & Onboarding

This repository is now Codex-first. Claude remains supported for reference, but the Codex workflows are the primary onboarding, evaluation, and scanning surface. The Codex commands run the same shared `modes/*.md` context and the `scripts/codex/*.mjs` implementation instead of duplicating prompt logic.

## Prerequisites

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/santifer/career-ops.git
   cd career-ops
   npm install
   npx playwright install chromium
   ```
2. Ensure `cv.md` exists in the project root (the canonical CV that Codex reads for every evaluation).
3. Copy `config/profile.example.yml` to `config/profile.yml` and complete the profile (name, email, target roles, narrative).
4. Copy `templates/portals.example.yml` to `portals.yml` and customize `title_filter` keywords and tracked companies.
5. Open Codex in this directory and use the `codex:*` commands below.

## Codex onboarding flow

Before triggering any workflow, Codex runs the onboarding guardrails:

1. **CV check:** If `cv.md` is missing, ask the user to paste their CV or share a LinkedIn/resume link; convert the response into markdown and save it as `cv.md`.
2. **Profile check:** If `config/profile.yml` is missing, copy from the example and prompt the user for name, email, timezone, target roles, salary range, and personal narratives.
3. **Portals check:** If `portals.yml` is absent, copy `templates/portals.example.yml` and optionally adjust `tracked_companies` or `title_filter.positive` to match the target roles outlined in the profile.

Codex will not proceed with evaluations, scans, PDFs, or tracker updates until these files exist. This document outlines the flow for Codex users whenever onboarding stalls.

## Main Codex workflows

| Command | Description | Implementation |
|---------|-------------|----------------|
| `codex:evaluate` | Auto-pipeline for a pasted JD/URL. Generates blocks A-F, a report, a PDF, and writes TSVs for the tracker. | `scripts/codex/evaluate.mjs` + `modes/oferta.md` + `modes/_shared.md` |
| `codex:scan` | Portal scanner that reuses `portals.yml` + `scripts/codex/scan.mjs` to discover new jobs. | `scripts/codex/scan.mjs` + shared context |
| `codex:pdf` | Generates ATS-optimized PDF using the HTML template and `scripts/codex/pdf.mjs`. | `templates/cv-template.html`, `generate-pdf.mjs`, `scripts/codex/pdf.mjs` |
| `codex:tracker` | Shows tracker status and helps sync TSV additions via `merge-tracker.mjs` + `dedup-tracker.mjs`. | `batch/tracker-additions/`, `scripts/codex/tracker.mjs`, `merge-tracker.mjs`, and `dedup-tracker.mjs` |

Each command references the shared context in `scripts/codex/shared.mjs`, which mirrors the `modes/_shared.md` guidance for archetypes, comp intelligence, and tracker rules. Reuse those files rather than copying prompt logic elsewhere.

## Codex onboarding checklist

- `cv.md`: canonical CV. Update it with the latest experience before every evaluation.
- `config/profile.yml`: candidate metadata, archetypes, comp expectations, location availability.
- `portals.yml`: scanner configuration; keep `title_filter`, `tracked_companies`, and `search_queries` aligned with the profile.
- `batch/tracker-additions/` + `merge-tracker.mjs`/`dedup-tracker.mjs`: tracker integrity. Do not edit `data/applications.md` directly for new entries.

Codex reads these files on each run. When onboarding a new user or session, follow the steps above, then move to the commands table to run evaluations.

## Implementation substrate

Codex keeps the original `modes/` definitions as the source of truth:

- `modes/_shared.md` contains the archetype definitions, sources of truth, and global rules that both Claude and Codex consume.
- `modes/oferta.md` spells out the six evaluation blocks referenced by `codex:evaluate`.
- `scripts/codex/shared.mjs` loads the same context and shares utilities across the codex workflows.

This means any update to the modes automatically updates the Codex behavior. When explaining Codex flows to a newcomer, point them to `CLAUDE.md` for deeper policy context but keep all execution inside the Codex commands.

## Operational reminders

- Always run `node merge-tracker.mjs` after adding TSVs and `node dedup-tracker.mjs` before closing the session.
- Never submit an application without explicit user approval. Draft everything (report, PDF, tracker entry) and ask the user to send the final submission.
