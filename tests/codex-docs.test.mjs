import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const read = (relativePath) =>
  readFileSync(path.join(rootDir, relativePath), 'utf-8');

const readJson = (relativePath) => JSON.parse(read(relativePath));

const exists = (relativePath) => existsSync(path.join(rootDir, relativePath));

test('AGENTS.md is Codex-first with key workflows', () => {
  assert(exists('AGENTS.md'), 'AGENTS.md must exist for Codex-first operations.');
  const content = read('AGENTS.md');
  assert.match(content, /Codex-?first/i, 'AGENTS.md should state that this repo is Codex-first.');
  const lowered = content.toLowerCase();
  ['evaluate', 'scan', 'pdf', 'tracker'].forEach((workflow) => {
    assert(
      lowered.includes(workflow),
      `AGENTS.md should mention the ${workflow} workflow for Codex-first operations.`
    );
  });
});

test('package.json exposes Codex entrypoint scripts', () => {
  const pkg = readJson('package.json');
  const scripts = pkg.scripts ?? {};
  const required = {
    'codex:evaluate': 'scripts/codex/evaluate.mjs',
    'codex:scan': 'scripts/codex/scan.mjs',
    'codex:pdf': 'scripts/codex/pdf.mjs',
    'codex:tracker': 'scripts/codex/tracker.mjs'
  };

  Object.entries(required).forEach(([scriptName, target]) => {
    assert(scripts[scriptName], `package.json should expose the ${scriptName} script.`);
    assert(
      scripts[scriptName].includes(target),
      `package.json ${scriptName} should run ${target}.`
    );
  });

  assert(scripts['test:codex'], 'package.json should expose the test:codex script.');
  assert(
    scripts['test:codex'].includes('tests/codex-entrypoints.test.mjs') &&
      scripts['test:codex'].includes('tests/codex-docs.test.mjs'),
    'test:codex should run the codex entrypoint and docs tests.'
  );
});

test('README quick start is Codex-first and references codex:evaluate', () => {
  const content = read('README.md');
  const quickStartIndex = content.indexOf('## Quick Start');
  assert(quickStartIndex !== -1, 'README should include a Quick Start section.');
  const afterQuickStart = content.slice(quickStartIndex);
  const nextHeadingIndex = afterQuickStart.indexOf('\n## ', 1);
  const quickStartSection =
    nextHeadingIndex === -1 ? afterQuickStart : afterQuickStart.slice(0, nextHeadingIndex);

  assert.match(
    quickStartSection,
    /Codex/i,
    'Quick Start should mention opening the repo in Codex.'
  );
  assert.match(
    quickStartSection,
    /open .*codex/i,
    'Quick Start should instruct users to open the repo in Codex.'
  );
  assert.match(
    quickStartSection,
    /npm run codex:evaluate/i,
    'Quick Start should mention npm run codex:evaluate.'
  );
});

test('docs/SETUP.md is Codex-first and points to AGENTS.md', () => {
  const content = read('docs/SETUP.md');
  assert.match(
    content,
    /AGENTS\.md/,
    'docs/SETUP.md should point to AGENTS.md for Codex-first instructions.'
  );
  const codexIndex = content.search(/Codex/i);
  const claudeIndex = content.search(/Claude/i);
  assert(codexIndex !== -1, 'docs/SETUP.md should mention Codex.');
  assert(claudeIndex !== -1, 'docs/SETUP.md should still mention Claude.');
  assert(
    codexIndex < claudeIndex,
    'docs/SETUP.md should mention Codex before Claude.'
  );
});

test('docs/CODEX.md references onboarding files', () => {
  assert(exists('docs/CODEX.md'), 'docs/CODEX.md must exist and describe the Codex workflow.');
  const content = read('docs/CODEX.md');
  ['cv.md', 'config/profile.yml', 'portals.yml'].forEach((required) => {
    assert(
      content.includes(required),
      `docs/CODEX.md should mention ${required} as part of Codex onboarding.`
    );
  });
});

test('docs/codex-workflows.md maps /career-ops to codex:evaluate and codex:scan', () => {
  assert(
    exists('docs/codex-workflows.md'),
    'docs/codex-workflows.md must exist to explain the Codex workflow mapping.'
  );
  const content = read('docs/codex-workflows.md');
  assert(
    content.includes('/career-ops'),
    'codex-workflows.md should reference the /career-ops legacy flows.'
  );
  ['codex:evaluate', 'codex:scan'].forEach((plan) => {
    assert(
      content.includes(plan),
      `codex-workflows.md should describe ${plan} as a replacement flow.`
    );
  });
});

test('docs/codex-workflows.md calls out entry-point behavior and the shared modes', () => {
  const content = read('docs/codex-workflows.md');
  assert(
    content.includes('Entry point'),
    'codex-workflows.md should describe Codex commands as entry points.'
  );
  assert(
    content.includes('modes/_shared.md'),
    'codex-workflows.md should reference modes/_shared.md for archetype guidance.'
  );
  assert(
    content.includes('wraps `scripts/codex/evaluate.mjs`'),
    'codex-workflows.md should say codex:evaluate wraps the evaluate script.'
  );
  assert(
    content.includes('invokes `scripts/codex/scan.mjs`'),
    'codex-workflows.md should say codex:scan invokes the scan script on request.'
  );
});

test('docs/CODEX.md accurately reflects the helper relationship', () => {
  const content = read('docs/CODEX.md');
  assert(
    content.includes('CLI helpers'),
    'docs/CODEX.md should mention scripts/codex/shared.mjs provides CLI helpers.'
  );
  assert(
    !content.includes('loads the same context'),
    'docs/CODEX.md should not claim scripts/codex/shared.mjs loads the modes context.'
  );
});
