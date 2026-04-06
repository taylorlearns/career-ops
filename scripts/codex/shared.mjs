import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const repoRoot = dirname(dirname(__dirname));

export function repoPath(...parts) {
  return join(repoRoot, ...parts);
}

export function fileExists(relativePath) {
  try {
    fs.accessSync(repoPath(relativePath));
    return true;
  } catch {
    return false;
  }
}

export function getSetupStatus() {
  return [
    {
      label: "AGENTS instructions",
      ready: fileExists("AGENTS.md"),
      detail: "Add AGENTS.md to document workflow expectations.",
    },
    {
      label: "Node dependencies",
      ready: fileExists("node_modules"),
      detail: "Run `npm install` to install modules.",
    },
    {
      label: "Modes docs",
      ready: fileExists("modes/_shared.md") && fileExists("modes/oferta.md"),
      detail: "Ensure `modes/_shared.md` and `modes/oferta.md` are present.",
    },
    {
      label: "Lockfile",
      ready: fileExists("package-lock.json"),
      detail: "Keep `package-lock.json` in sync with installs.",
    },
  ];
}

export function printSetupChecklist() {
  const statuses = getSetupStatus();
  if (statuses.length === 0) {
    return;
  }
  console.log("Setup checklist:");
  for (const { label, ready, detail } of statuses) {
    const marker = ready ? "x" : " ";
    console.log(`  [${marker}] ${label}${detail ? ` — ${detail}` : ""}`);
  }
  console.log("");
}

export function printWorkflowHeader(title, details = []) {
  console.log("");
  console.log(title);
  for (const detail of details) {
    console.log(`  - ${detail}`);
  }
  if (details.length > 0) {
    console.log("");
  }
}

export function runNodeScript(scriptRelativePath, extraArgs = []) {
  const scriptPath = repoPath(scriptRelativePath);
  const argv = [scriptPath, ...extraArgs];
  const result = spawnSync("node", argv, {
    stdio: "inherit",
    cwd: repoRoot,
  });
  if (result.error) {
    fail(`Unable to run ${scriptRelativePath}: ${result.error.message}`);
  }
  if (typeof result.status === "number" && result.status !== 0) {
    fail(`"${scriptRelativePath}" exited with ${result.status}`);
  }
  return result.status ?? 0;
}

export function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}
