import { printSetupChecklist, printWorkflowHeader } from "./shared.mjs";

const title = "Codex scan workflow";
const details = [
  "Scanner guidance lives in modes/scan.md and modes/_shared.md.",
  "Use this workflow to stage automated scanner runs.",
];

function renderHeader() {
  printWorkflowHeader(title, details);
}

function showHelp() {
  renderHeader();
  console.log("Refer to the scanner sections of the modes docs before running scans.");
  console.log("");
}

const args = process.argv.slice(2);
if (args.includes("--help")) {
  showHelp();
  process.exit(0);
}

renderHeader();
printSetupChecklist();
console.log("Next step: Validate scanner guidance in modes/scan.md before executing scans.");
