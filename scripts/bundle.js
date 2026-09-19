const fs = require("fs");
const path = require("path");

const COMPILED_DIR = path.join(__dirname, "..", ".compiled");
const BUILD_DIR = path.join(__dirname, "..", "build");
const OUTPUT_FILE = path.join(BUILD_DIR, "bundle.js");

const FILES_IN_ORDER = [
  "types/appointment.types.js",
  "services/serviceCatalog.js",
  "services/appointmentService.js",
  "hours/businessHours.js",
  "utils/validation.js",
  "main.js",
];

function stripModuleSyntax(code) {
  return code
    .split("\n")
    .filter((line) => !line.trim().startsWith("import "))
    .filter((line) => line.trim() !== "export {};")
    .filter((line) => !line.trim().startsWith("//# sourceMappingURL"))
    .map((line) => line.replace(/^export (class|function|const|let)/, "$1"))
    .join("\n");
}

function buildBundle() {
  if (!fs.existsSync(COMPILED_DIR)) {
    console.error('Could not find ".compiled/". Run "npx tsc" first.');
    process.exit(1);
  }

  if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
  }

  const bundledCode = FILES_IN_ORDER.map((relativePath) => {
    const fullPath = path.join(COMPILED_DIR, relativePath);
    const content = fs.readFileSync(fullPath, "utf-8");
    return stripModuleSyntax(content);
  }).join("\n");

  fs.writeFileSync(OUTPUT_FILE, bundledCode, "utf-8");
  console.log(
    `Bundle created at: ${path.relative(process.cwd(), OUTPUT_FILE)}`,
  );
}

buildBundle();
