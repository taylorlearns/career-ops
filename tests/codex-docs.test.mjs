import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const read = (relativePath) =>
  readFileSync(path.join(rootDir, relativePath), 'utf-8');

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
});
});
