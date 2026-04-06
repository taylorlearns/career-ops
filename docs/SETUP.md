# Setup Guide

## Prerequisites

- Codex installed and configured (primary entry point)
- Node.js 18+ (for PDF generation and utility scripts)
- (Optional) Go 1.21+ (for the dashboard TUI)
- (Optional) [Claude Code](https://claude.ai/code) installed and configured (reference flow)

## Quick Start (5 steps)

### 1. Clone and install

```bash
git clone https://github.com/santifer/career-ops.git
cd career-ops
npm install
npx playwright install chromium   # Required for PDF generation
```

### 2. Onboarding files

```bash
cp config/profile.example.yml config/profile.yml
cp templates/portals.example.yml portals.yml
```

Create `cv.md` in the project root with your full CV in markdown format. This is the source of truth for all evaluations and PDFs.

(Optional) Create `article-digest.md` with proof points from your portfolio projects/articles.

### 3. Open in Codex

Open the repo in Codex and start with `AGENTS.md` for the Codex-first instructions.

### 4. Run Codex entry points

```bash
npm run codex:evaluate -- --job <url-or-file>
npm run codex:scan
npm run codex:pdf -- <args>
npm run codex:tracker -- verify
```

`codex:evaluate` and `codex:scan` are entry points that wrap the `scripts/codex/*.mjs` helpers. `codex:pdf` forwards to `generate-pdf.mjs` through the wrapper, and `codex:tracker` focuses on status and the merge/dedup reminders. They do not auto-submit applications.

### 5. Claude (secondary)

If you prefer Claude Code for reference, open it and use the `/career-ops` commands. Codex remains the default flow.

## Available Commands

| Action | How |
|--------|-----|
| Evaluate an offer | `npm run codex:evaluate -- --job <url-or-file>` |
| Search for offers | `npm run codex:scan` |
| Generate a PDF | `npm run codex:pdf -- <args>` |
| Check tracker status | `npm run codex:tracker -- verify` |

Claude Code remains supported for reference, but the Codex entry points are the default.

## Verify Setup

```bash
node cv-sync-check.mjs      # Check configuration
node verify-pipeline.mjs     # Check pipeline integrity
```

## Build Dashboard (Optional)

```bash
cd dashboard
go build -o career-dashboard .
./career-dashboard            # Opens TUI pipeline viewer
```
