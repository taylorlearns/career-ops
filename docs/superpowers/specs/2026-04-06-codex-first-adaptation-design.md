# Career-Ops Codex-First Adaptation Design

**Date:** 2026-04-06
**Status:** Approved design
**Target repo:** `career-ops`

## Goal

Adapt `career-ops` from a Claude Code-first workflow repository into a Codex-first workflow repository without rewriting the core job-search assets that already exist.

The default user experience should become:

- Open the repo in Codex
- Follow `AGENTS.md`
- Use clear Codex-oriented workflow entry points for evaluation, scan, PDF generation, and tracker maintenance

Claude compatibility should remain available, but it should no longer be the primary path documented in the repository.

## Current State

The repository already contains the valuable domain assets:

- `CLAUDE.md` as the main agent instruction file
- `modes/*.md` for workflow-specific guidance
- `generate-pdf.mjs` for PDF generation
- tracker integrity scripts such as `verify-pipeline.mjs`, `merge-tracker.mjs`, and `cv-sync-check.mjs`
- scanner and batch-related directories
- dashboard assets under `dashboard/`

The current problem is not missing functionality. The problem is that the repository is organized around Claude-specific entry semantics such as `/career-ops`, mode switching, and Claude-oriented onboarding language in the docs.

## Non-Goals

This adaptation will not:

- rewrite the scanner, dashboard, or PDF engine from scratch
- replace the current evaluation logic with a brand-new framework
- delete `CLAUDE.md` or the existing `modes/` files
- redesign the tracker data model unless required for Codex execution compatibility

## Design Principles

1. Codex becomes the default documented and instructed runtime.
2. Existing scripts remain the source of execution for PDF and pipeline integrity work.
3. Existing prompt assets remain reusable instead of being duplicated blindly.
4. Compatibility with Claude is preserved where cheap to maintain.
5. The adaptation should favor a thin orchestration layer over a deep refactor.

## Recommended Approach

Use a thin Codex orchestration layer on top of the existing repository.

That layer has three responsibilities:

1. Define Codex-native behavior and repository rules in `AGENTS.md`
2. Provide Codex-friendly workflow documentation and stable command entry points
3. Map high-level workflows such as `evaluate`, `scan`, `pdf`, and `tracker` to the existing scripts and prompt assets

This is intentionally a medium-depth adaptation:

- larger than a documentation-only patch
- much smaller than a full repository rewrite

## Target User Experience

### Before

- The repository tells the user to open Claude Code
- The repository expects slash-command semantics such as `/career-ops`
- The repository modes are documented mainly as Claude behaviors

### After

- The repository tells the user to open the repo in Codex first
- The repository explains the four default workflows directly
- The repository offers stable script entry points for common operations
- The repository still notes that Claude-compatible instructions remain available

## Workflow Model

The Codex-first workflow surface should be normalized into four top-level operations:

### 1. `evaluate`

Purpose:
- evaluate one JD or job URL
- generate a structured report
- prepare downstream actions such as tailored PDF and tracker update

Codex behavior:
- read `AGENTS.md`
- use shared context from the existing repository
- consume the current evaluation guidance, initially mapped from `modes/oferta.md` and `modes/_shared.md`

### 2. `scan`

Purpose:
- scan configured portals for new roles
- append or stage results into the existing pipeline/tracker flow

Codex behavior:
- rely on existing config and scanner conventions
- keep data format compatible with current downstream scripts

### 3. `pdf`

Purpose:
- generate ATS-ready PDF output from the existing template and current job context

Codex behavior:
- call the existing PDF generation path rather than replacing it

### 4. `tracker`

Purpose:
- verify, normalize, deduplicate, and inspect pipeline state

Codex behavior:
- expose existing maintenance commands through obvious Codex-facing docs and package scripts

## File-Level Design

### New files

#### `AGENTS.md`

Role:
- primary repository instruction file for Codex

Content requirements:
- repository purpose and high-level workflows
- onboarding checks for `cv.md`, `config/profile.yml`, and `portals.yml`
- default execution order for evaluation, scan, PDF, and tracker work
- rules on what data files are authoritative
- safety rules for tracker updates and application submission
- references to existing scripts and reusable prompt assets

#### `docs/CODEX.md`

Role:
- human-readable Codex setup and usage guide

Content requirements:
- how to open and use the repository in Codex
- how to onboard candidate data
- how to trigger the four default workflows
- how Codex interacts with the existing scripts

#### `docs/codex-workflows.md`

Role:
- workflow mapping document for maintainers

Content requirements:
- mapping from old Claude-first concepts to Codex-first operations
- which existing files each workflow depends on
- expected inputs and outputs for each workflow

#### `codex/` or `scripts/codex/`

Role:
- thin orchestration layer for Codex-first entry points

Expected contents:
- shared utility module for loading paths, validating setup, and resolving workflow inputs
- separate entry modules for `evaluate`, `scan`, `pdf`, and `tracker`

These files should orchestrate existing assets instead of re-implementing their domain logic.

### Modified files

#### `README.md`

Changes:
- shift quick start from Claude-first to Codex-first
- describe Codex as the default runtime
- document the new workflow entry points
- mention Claude compatibility as secondary

#### `package.json`

Changes:
- add `codex:*` scripts for obvious workflow entry points
- keep current verification and PDF-related scripts intact

#### Optional setup docs

Changes:
- update setup language where it currently assumes Claude as the only entry point

### Preserved files

These should remain intact or only receive minimal compatibility edits:

- `CLAUDE.md`
- `modes/*.md`
- `generate-pdf.mjs`
- tracker maintenance scripts
- dashboard implementation

## Prompt and Instruction Mapping

The adaptation should avoid copying the entire `modes/` directory into a second prompt tree unless strictly necessary.

Preferred mapping:

- `AGENTS.md` becomes the Codex control plane
- existing `modes/_shared.md` and selected mode files remain the business-logic prompt source
- the Codex entry layer references those existing assets where useful

If a Codex-specific wrapper prompt is needed, create a small, focused wrapper that points at the existing files rather than duplicating them.

## Compatibility Strategy

Compatibility should be maintained with these rules:

- `CLAUDE.md` stays in place
- Claude-facing workflow documentation is retained but no longer primary in `README.md`
- Codex additions should not break repository use by Claude users
- package scripts should be additive rather than destructive

## Data and Safety Rules

The Codex-first adaptation must preserve the repository's existing operational constraints:

- `cv.md` remains the canonical CV source
- `config/profile.yml` remains the user profile source
- tracker additions must respect the existing merge and dedup flow
- generated output continues to land in existing folders unless there is a compelling reason to change this
- the system must continue to require user review before final application submission

## Verification Plan

The implementation phase must verify at least the following:

1. The repository opens cleanly with the new `AGENTS.md` path in place.
2. The new Codex documentation matches the actual scripts and files.
3. `package.json` scripts for Codex entry points resolve correctly.
4. Existing integrity commands continue to work:
   - `npm run verify`
   - `npm run normalize`
   - `npm run dedup`
   - `npm run merge`
   - `npm run sync-check`
5. Existing PDF generation remains callable through the adapted flow.
6. Claude compatibility files remain present and coherent.

## Implementation Boundaries

The first implementation pass should deliver:

- Codex-first repository instructions
- Codex-first docs
- package script entry points
- thin orchestration scaffolding for the four workflows
- minimal README and setup rewrites

The first pass does not need to fully automate end-to-end evaluation if the repository currently depends on agent interaction for part of that flow. In that case, the implementation should still give Codex a clean and explicit execution path that is better than the current Claude-only entry model.

## Risks

### Risk: accidental duplication of prompt logic

If Codex wrappers copy large chunks of `modes/*.md`, the repository will drift.

Mitigation:
- keep Codex wrappers thin
- reference existing prompt assets whenever possible

### Risk: docs promise more automation than exists

If the new docs imply full CLI automation for evaluation while the workflow still requires agent reasoning, users will get a broken mental model.

Mitigation:
- clearly separate agent-guided workflows from script-driven workflows

### Risk: tracker conventions break

If Codex-facing tooling bypasses the current merge and integrity flow, data quality will degrade.

Mitigation:
- route tracker maintenance through the existing scripts and conventions

## Success Criteria

This adaptation is successful when:

- a Codex user can understand the repository without reading Claude-specific instructions first
- the default docs point to Codex, not Claude
- the four main workflows are obvious and consistently named
- the repository still preserves its current scripts, tracker conventions, and prompt assets
- Claude compatibility remains available as a secondary path

## Immediate Next Step

After this design is approved in-repo, the next artifact should be a detailed implementation plan that breaks the adaptation into small tasks covering:

- instruction layer
- documentation layer
- package scripts
- Codex orchestration files
- verification
