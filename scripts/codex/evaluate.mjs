import { printSetupChecklist, printWorkflowHeader } from "./shared.mjs";

const title = "Codex evaluate workflow";
const details = [
  "Reads AGENTS.md plus modes/_shared.md and modes/oferta.md.",
  "Use the modes docs to guide offer reviews and responses.",
];

function renderHeader() {
  printWorkflowHeader(title, details);
}

function showHelp() {
  renderHeader();
  console.log("This workflow depends on AGENTS.md plus the offer playbooks in modes.");
  console.log("");
}

const args = process.argv.slice(2);
if (args.includes("--help")) {
  showHelp();
  process.exit(0);
}

renderHeader();
printSetupChecklist();
console.log("Next step: Review AGENTS.md and the modes docs before running evaluation tasks.");
