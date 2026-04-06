import { fail, printSetupChecklist, printWorkflowHeader } from "./shared.mjs";

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
const wantsHelp = args.includes("--help");
if (wantsHelp) {
  showHelp();
  process.exit(0);
}
const jobInput = parseJobArg(args);

renderHeader();
printSetupChecklist();
if (jobInput) {
  console.log(`Job input: ${jobInput}`);
}
console.log("Next step: Review AGENTS.md and the modes docs before running evaluation tasks.");

function parseJobArg(argv) {
  const jobIndex = argv.indexOf("--job");
  if (jobIndex === -1) {
    return undefined;
  }

  const value = argv[jobIndex + 1];
  if (!value || value.startsWith("--")) {
    fail("The --job flag requires a value.");
  }

  return value;
}
