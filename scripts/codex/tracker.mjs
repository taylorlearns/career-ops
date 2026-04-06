import { fail, printWorkflowHeader, runNodeScript } from "./shared.mjs";

const title = "Codex tracker workflow";
const details = [
  "Tracker workflows include verify, normalize, dedup, merge, and sync-check.",
  "Each subcommand delegates to its own helper script.",
];
const commands = [
  ["verify", "verify-pipeline.mjs"],
  ["normalize", "normalize-statuses.mjs"],
  ["dedup", "dedup-tracker.mjs"],
  ["merge", "merge-tracker.mjs"],
  ["sync-check", "cv-sync-check.mjs"],
];

function showHelp() {
  printWorkflowHeader(title, details);
  console.log("Available tracker commands:");
  for (const [name, script] of commands) {
    console.log(`  ${name} -> ${script}`);
  }
  console.log("");
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("--help")) {
  showHelp();
  process.exit(0);
}

const [command, ...rest] = args;
const mapping = commands.find(([name]) => name === command);
if (!mapping) {
  fail(`Unknown tracker command "${command}".`);
}

runNodeScript(mapping[1], rest);
