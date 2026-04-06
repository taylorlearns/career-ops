import {
  printSetupChecklist,
  printWorkflowHeader,
  runNodeScript,
} from "./shared.mjs";

const title = "Codex pdf workflow";
const details = [
  "Guided by modes/pdf.md plus the shared workflow notes.",
  "Delegates to generate-pdf.mjs for PDF creation.",
];

function renderHeader() {
  printWorkflowHeader(title, details);
}

function showHelp() {
  renderHeader();
  console.log("This workflow wraps generate-pdf.mjs to keep PDF generation consistent.");
  console.log("");
}

const args = process.argv.slice(2);
if (args.includes("--help")) {
  showHelp();
  process.exit(0);
}

renderHeader();
printSetupChecklist();
console.log("Delegating to generate-pdf.mjs with the provided flags.");
runNodeScript("generate-pdf.mjs", args);
