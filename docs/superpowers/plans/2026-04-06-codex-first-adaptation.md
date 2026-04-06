# Career-Ops Codex-First Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `career-ops` Codex-first by adding `AGENTS.md`, Codex docs, Codex workflow entry scripts, and README/package wiring while preserving Claude compatibility.

**Architecture:** Keep the existing domain assets (`CLAUDE.md`, `modes/*.md`, PDF generator, tracker scripts) intact and add a thin Codex orchestration layer. The new layer consists of repository instructions in `AGENTS.md`, human-facing docs under `docs/`, Node entrypoints under `scripts/codex/`, and additive `package.json` scripts that expose the four main workflows.

**Tech Stack:** Markdown, Node.js ESM (`.mjs`), built-in `node:test`, existing npm scripts

---

### Task 1: Create Codex CLI Scaffolding

**Files:**
- Create: `C:\Users\Administrator\career-ops\scripts\codex\shared.mjs`
- Create: `C:\Users\Administrator\career-ops\scripts\codex\evaluate.mjs`
- Create: `C:\Users\Administrator\career-ops\scripts\codex\scan.mjs`
- Create: `C:\Users\Administrator\career-ops\scripts\codex\pdf.mjs`
- Create: `C:\Users\Administrator\career-ops\scripts\codex\tracker.mjs`
- Create: `C:\Users\Administrator\career-ops\tests\codex-entrypoints.test.mjs`

- [ ] **Step 1: Write the failing CLI smoke test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = "C:/Users/Administrator/career-ops";
const scripts = [
  ["evaluate", ["--help"], "Codex evaluate workflow"],
  ["scan", ["--help"], "Codex scan workflow"],
  ["pdf", ["--help"], "Codex pdf workflow"],
  ["tracker", ["--help"], "Codex tracker workflow"],
];

for (const [name, args, expected] of scripts) {
  test(`${name} help text is available`, () => {
    const scriptPath = path.join(root, "scripts", "codex", `${name}.mjs`);
    const result = spawnSync("node", [scriptPath, ...args], {
      cwd: root,
      encoding: "utf8",
    });

    assert.equal(result.status, 0);
    assert.match(result.stdout, new RegExp(expected));
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/codex-entrypoints.test.mjs`
Expected: FAIL because `scripts/codex/*.mjs` do not exist yet.

- [ ] **Step 3: Write minimal shared utility module**

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const repoRoot = path.resolve(__dirname, "..", "..");

export function repoPath(...parts) {
  return path.join(repoRoot, ...parts);
}

export function fileExists(relativePath) {
  return fs.existsSync(repoPath(relativePath));
}

export function getSetupStatus() {
  return {
    cv: fileExists("cv.md"),
    profile: fileExists(path.join("config", "profile.yml")),
    portals: fileExists("portals.yml"),
  };
}

export function printSetupChecklist() {
  const status = getSetupStatus();
  console.log("Setup checklist");
  console.log(`- cv.md: ${status.cv ? "present" : "missing"}`);
  console.log(`- config/profile.yml: ${status.profile ? "present" : "missing"}`);
  console.log(`- portals.yml: ${status.portals ? "present" : "missing"}`);
  return status;
}

export function printWorkflowHeader(title, details = []) {
  console.log(title);
  for (const detail of details) {
    console.log(`- ${detail}`);
  }
}

export function runNodeScript(scriptRelativePath, extraArgs = []) {
  return spawnSync("node", [repoPath(scriptRelativePath), ...extraArgs], {
    cwd: repoRoot,
    stdio: "inherit",
  });
}

export function fail(message) {
  console.error(message);
  process.exit(1);
}
```

- [ ] **Step 4: Write minimal workflow entrypoints**

```js
// scripts/codex/evaluate.mjs
import { printSetupChecklist, printWorkflowHeader } from "./shared.mjs";

if (process.argv.includes("--help")) {
  printWorkflowHeader("Codex evaluate workflow", [
    "Reads AGENTS.md plus modes/_shared.md and modes/oferta.md",
    "Validates onboarding files before evaluating a JD",
    "Use: npm run codex:evaluate -- --job <url-or-file>",
  ]);
  process.exit(0);
}

printSetupChecklist();
printWorkflowHeader("Codex evaluate workflow", [
  "Next: provide --job <url-or-file> and evaluate in Codex",
]);
```

```js
// scripts/codex/scan.mjs
import { printSetupChecklist, printWorkflowHeader } from "./shared.mjs";

if (process.argv.includes("--help")) {
  printWorkflowHeader("Codex scan workflow", [
    "Uses portals.yml and existing scanner conventions",
    "Use: npm run codex:scan",
  ]);
  process.exit(0);
}

printSetupChecklist();
printWorkflowHeader("Codex scan workflow", [
  "Next: review portals.yml and run the scanner flow in Codex",
]);
```

```js
// scripts/codex/pdf.mjs
import { printSetupChecklist, printWorkflowHeader, runNodeScript } from "./shared.mjs";

if (process.argv.includes("--help")) {
  printWorkflowHeader("Codex pdf workflow", [
    "Wraps the existing generate-pdf.mjs script",
    "Use: npm run codex:pdf -- --help",
  ]);
  process.exit(0);
}

printSetupChecklist();
printWorkflowHeader("Codex pdf workflow", [
  "Delegating to generate-pdf.mjs",
]);

const result = runNodeScript("generate-pdf.mjs", process.argv.slice(2));
process.exit(result.status ?? 0);
```

```js
// scripts/codex/tracker.mjs
import { printWorkflowHeader, runNodeScript } from "./shared.mjs";

const commandMap = new Map([
  ["verify", "verify-pipeline.mjs"],
  ["normalize", "normalize-statuses.mjs"],
  ["dedup", "dedup-tracker.mjs"],
  ["merge", "merge-tracker.mjs"],
  ["sync-check", "cv-sync-check.mjs"],
]);

if (process.argv.includes("--help") || process.argv.length === 2) {
  printWorkflowHeader("Codex tracker workflow", [
    "Commands: verify | normalize | dedup | merge | sync-check",
    "Use: npm run codex:tracker -- verify",
  ]);
  process.exit(0);
}

const subcommand = process.argv[2];
const script = commandMap.get(subcommand);

if (!script) {
  console.error(`Unknown tracker command: ${subcommand}`);
  process.exit(1);
}

const result = runNodeScript(script, process.argv.slice(3));
process.exit(result.status ?? 0);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/codex-entrypoints.test.mjs`
Expected: PASS with 4 passing help-text tests.

- [ ] **Step 6: Commit**

```bash
git add scripts/codex/shared.mjs scripts/codex/evaluate.mjs scripts/codex/scan.mjs scripts/codex/pdf.mjs scripts/codex/tracker.mjs tests/codex-entrypoints.test.mjs
git commit -m "feat: add codex workflow entrypoints"
```

### Task 2: Add Codex Repository Instructions and Workflow Docs

**Files:**
- Create: `C:\Users\Administrator\career-ops\AGENTS.md`
- Create: `C:\Users\Administrator\career-ops\docs\CODEX.md`
- Create: `C:\Users\Administrator\career-ops\docs\codex-workflows.md`
- Create: `C:\Users\Administrator\career-ops\tests\codex-docs.test.mjs`
- Test: `C:\Users\Administrator\career-ops\tests\codex-docs.test.mjs`

- [ ] **Step 1: Write the failing docs verification test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const root = "C:/Users/Administrator/career-ops";

test("AGENTS.md declares Codex-first workflows", () => {
  const content = read(`${root}/AGENTS.md`);
  assert.match(content, /Codex-first/i);
  assert.match(content, /evaluate/i);
  assert.match(content, /scan/i);
  assert.match(content, /pdf/i);
  assert.match(content, /tracker/i);
});

test("docs/CODEX.md explains onboarding files", () => {
  const content = read(`${root}/docs/CODEX.md`);
  assert.match(content, /cv\.md/);
  assert.match(content, /config\/profile\.yml/);
  assert.match(content, /portals\.yml/);
});

test("docs/codex-workflows.md maps Claude concepts to Codex workflows", () => {
  const content = read(`${root}/docs/codex-workflows.md`);
  assert.match(content, /\/career-ops/);
  assert.match(content, /codex:evaluate/);
  assert.match(content, /codex:scan/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/codex-docs.test.mjs`
Expected: FAIL because the three documentation files do not exist yet.

- [ ] **Step 3: Write `AGENTS.md`**

```md
# Career-Ops Codex Instructions

This repository is Codex-first. Use Codex as the default agent runtime. `CLAUDE.md` remains available for Claude-compatible usage, but it is no longer the primary entry point.

## Primary Workflows

- `evaluate`: assess one JD or job URL using `modes/_shared.md` and `modes/oferta.md`
- `scan`: review `portals.yml` and scan for new roles
- `pdf`: generate or refresh tailored PDF output through `generate-pdf.mjs`
- `tracker`: inspect and maintain pipeline integrity through the existing maintenance scripts

## Onboarding Checks

Before any workflow:
- verify `cv.md` exists
- verify `config/profile.yml` exists
- verify `portals.yml` exists

If any file is missing, stop and onboard the user before continuing.

## Sources of Truth

- `cv.md` is the canonical CV
- `config/profile.yml` is the candidate profile
- `portals.yml` is the portal scan configuration
- `data/applications.md` is the tracker
- `reports/` stores evaluation reports

## Operational Rules

- Do not submit applications automatically
- Preserve the existing tracker merge and dedup flow
- Reuse the existing `modes/` files rather than duplicating prompt logic
- Route tracker maintenance through the existing `.mjs` scripts
```

- [ ] **Step 4: Write `docs/CODEX.md` and `docs/codex-workflows.md`**

```md
# Using Career-Ops in Codex

## Setup

1. Install dependencies with `npm install`
2. Install Chromium with `npx playwright install chromium`
3. Create `cv.md`
4. Copy `config/profile.example.yml` to `config/profile.yml`
5. Copy `templates/portals.example.yml` to `portals.yml`

## Main Workflows

- Evaluate: `npm run codex:evaluate -- --job <url-or-file>`
- Scan: `npm run codex:scan`
- PDF: `npm run codex:pdf -- <args>`
- Tracker: `npm run codex:tracker -- verify`

## How Codex Uses the Repo

Codex reads `AGENTS.md` first, then reuses the existing `modes/` files and scripts already present in the repository.
```

```md
# Codex Workflow Mapping

| Previous Claude-first concept | Codex-first equivalent |
|---|---|
| `/career-ops {jd}` | `npm run codex:evaluate -- --job <url-or-file>` |
| `/career-ops scan` | `npm run codex:scan` |
| `/career-ops pdf` | `npm run codex:pdf -- <args>` |
| `/career-ops tracker` | `npm run codex:tracker -- verify` |

## Workflow Sources

- Evaluation uses `modes/_shared.md` and `modes/oferta.md`
- PDF uses `generate-pdf.mjs`
- Tracker uses `verify-pipeline.mjs`, `normalize-statuses.mjs`, `dedup-tracker.mjs`, `merge-tracker.mjs`, and `cv-sync-check.mjs`
- Scanner remains compatible with `portals.yml` and current repository conventions
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/codex-docs.test.mjs`
Expected: PASS with 3 passing doc-content tests.

- [ ] **Step 6: Commit**

```bash
git add AGENTS.md docs/CODEX.md docs/codex-workflows.md tests/codex-docs.test.mjs
git commit -m "docs: add codex-first repository instructions"
```

### Task 3: Wire Package Scripts and Shift the Default Docs

**Files:**
- Modify: `C:\Users\Administrator\career-ops\package.json`
- Modify: `C:\Users\Administrator\career-ops\README.md`
- Modify: `C:\Users\Administrator\career-ops\docs\SETUP.md`
- Test: `C:\Users\Administrator\career-ops\tests\codex-docs.test.mjs`

- [ ] **Step 1: Extend the docs test to cover package scripts and README defaults**

```js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root = "C:/Users/Administrator/career-ops";

test("package.json exposes codex scripts", () => {
  const pkg = JSON.parse(fs.readFileSync(`${root}/package.json`, "utf8"));
  assert.equal(pkg.scripts["codex:evaluate"], "node scripts/codex/evaluate.mjs");
  assert.equal(pkg.scripts["codex:scan"], "node scripts/codex/scan.mjs");
  assert.equal(pkg.scripts["codex:pdf"], "node scripts/codex/pdf.mjs");
  assert.equal(pkg.scripts["codex:tracker"], "node scripts/codex/tracker.mjs");
  assert.equal(pkg.scripts["test:codex"], "node --test tests/codex-entrypoints.test.mjs tests/codex-docs.test.mjs");
});

test("README quick start is Codex-first", () => {
  const readme = fs.readFileSync(`${root}/README.md`, "utf8");
  assert.match(readme, /Codex-first/i);
  assert.match(readme, /Open the repo in Codex/i);
  assert.match(readme, /npm run codex:evaluate/);
});

test("SETUP guide mentions Codex before Claude", () => {
  const setup = fs.readFileSync(`${root}/docs/SETUP.md`, "utf8");
  assert.match(setup, /Codex/i);
  assert.match(setup, /AGENTS\.md/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/codex-docs.test.mjs`
Expected: FAIL because `package.json`, `README.md`, and `docs/SETUP.md` do not yet reference the Codex-first entrypoints.

- [ ] **Step 3: Update `package.json`**

```json
{
  "scripts": {
    "verify": "node verify-pipeline.mjs",
    "normalize": "node normalize-statuses.mjs",
    "dedup": "node dedup-tracker.mjs",
    "merge": "node merge-tracker.mjs",
    "pdf": "node generate-pdf.mjs",
    "sync-check": "node cv-sync-check.mjs",
    "codex:evaluate": "node scripts/codex/evaluate.mjs",
    "codex:scan": "node scripts/codex/scan.mjs",
    "codex:pdf": "node scripts/codex/pdf.mjs",
    "codex:tracker": "node scripts/codex/tracker.mjs",
    "test:codex": "node --test tests/codex-entrypoints.test.mjs tests/codex-docs.test.mjs"
  }
}
```

- [ ] **Step 4: Rewrite the quick-start sections in `README.md` and `docs/SETUP.md`**

````md
## Quick Start

```bash
git clone https://github.com/santifer/career-ops.git
cd career-ops
npm install
npx playwright install chromium
```

Open the repo in Codex first. Codex reads `AGENTS.md`, validates onboarding files, and uses the existing repository assets for evaluation, scanning, PDF generation, and tracker maintenance.

### Main Commands

- `npm run codex:evaluate -- --job <url-or-file>`
- `npm run codex:scan`
- `npm run codex:pdf -- <args>`
- `npm run codex:tracker -- verify`

Claude compatibility is still available through `CLAUDE.md`, but Codex is the default path.
````

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:codex`
Expected: PASS with both test files passing.

- [ ] **Step 6: Commit**

```bash
git add package.json README.md docs/SETUP.md tests/codex-docs.test.mjs
git commit -m "feat: make career-ops codex-first"
```

### Task 4: Verify the Adaptation End-to-End

**Files:**
- Modify: `C:\Users\Administrator\career-ops\README.md` (only if command examples or wording need final correction after verification)
- Modify: `C:\Users\Administrator\career-ops\docs\CODEX.md` (only if command examples or wording need final correction after verification)
- Modify: `C:\Users\Administrator\career-ops\docs\codex-workflows.md` (only if command examples or wording need final correction after verification)
- Test: `C:\Users\Administrator\career-ops\tests\codex-entrypoints.test.mjs`
- Test: `C:\Users\Administrator\career-ops\tests\codex-docs.test.mjs`

- [ ] **Step 1: Run the Codex smoke suite**

```bash
npm run test:codex
```

Expected: PASS with all Codex CLI and docs assertions passing.

- [ ] **Step 2: Run the existing maintenance checks**

```bash
npm run verify
npm run sync-check
```

Expected:
- `npm run verify` completes without introducing new tracker-format regressions
- `npm run sync-check` completes and reports the current setup state without crashing

- [ ] **Step 3: Run direct CLI help checks**

```bash
node scripts/codex/evaluate.mjs --help
node scripts/codex/scan.mjs --help
node scripts/codex/pdf.mjs --help
node scripts/codex/tracker.mjs --help
```

Expected:
- each command exits `0`
- each command prints the correct workflow title

- [ ] **Step 4: Fix any wording or command mismatches discovered during verification**

```md
If `README.md`, `docs/CODEX.md`, or `docs/codex-workflows.md` contains command examples that do not match the final implementation, edit those files immediately so the shipped docs match the code exactly.
```

- [ ] **Step 5: Re-run the smoke suite after any edits**

Run: `npm run test:codex`
Expected: PASS again after the final documentation corrections.

- [ ] **Step 6: Commit**

```bash
git add README.md docs/CODEX.md docs/codex-workflows.md
git add tests/codex-entrypoints.test.mjs tests/codex-docs.test.mjs
git commit -m "test: verify codex-first workflow adaptation"
```
