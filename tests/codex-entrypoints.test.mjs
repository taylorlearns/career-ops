import test from "node:test";
import assert from "node:assert";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
const execFileAsync = promisify(execFile);

const entrypoints = [
  ["evaluate", "Codex evaluate workflow"],
  ["scan", "Codex scan workflow"],
  ["pdf", "Codex pdf workflow"],
  ["tracker", "Codex tracker workflow"],
];

for (const [name, title] of entrypoints) {
  test(`${name} --help prints workflow title`, async () => {
    const scriptPath = fileURLToPath(
      new URL(`../scripts/codex/${name}.mjs`, import.meta.url),
    );
    const { stdout } = await execFileAsync("node", [
      scriptPath,
      "--help",
    ]);
    assert.match(stdout, new RegExp(title));
  });
}
