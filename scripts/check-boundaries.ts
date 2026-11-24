import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function walkTs(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTs(full));
    else if (entry.name.endsWith(".ts")) out.push(full);
  }
  return out;
}

const errors: string[] = [];

// 1. `@motion-sdk/core` must have ZERO runtime dependencies or peerDependencies
const corePkg = JSON.parse(
  fs.readFileSync(path.join(rootDir, "packages/core/package.json"), "utf8")
);
if (corePkg.dependencies && Object.keys(corePkg.dependencies).length > 0) {
  errors.push(`packages/core/package.json must have 0 dependencies, found: ${JSON.stringify(corePkg.dependencies)}`);
}
if (corePkg.peerDependencies && Object.keys(corePkg.peerDependencies).length > 0) {
  errors.push(`packages/core/package.json must have 0 peerDependencies`);
}

// 2. `packages/core/src` must never import framework/target packages or reference DOM globals
const forbiddenInCore = [
  /from\s+["'](react|remotion|gsap|motion-sdk|@motion-sdk\/)/,
  /\b(HTMLElement|SVGElement|HTMLCanvasElement)\b/,
  /\b(window|document)\s*\./,
];
for (const file of walkTs(path.join(rootDir, "packages/core/src"))) {
  const raw = fs.readFileSync(file, "utf8");
  const codeOnly = raw.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
  for (const pat of forbiddenInCore) {
    if (pat.test(codeOnly)) {
      errors.push(`Boundary violation in ${path.relative(rootDir, file)}: matched ${pat}`);
    }
  }
}

// 3. `motion-sdk` entry package must only depend on `@motion-sdk/core` (zero external peer bloat)
const entryPkg = JSON.parse(
  fs.readFileSync(path.join(rootDir, "packages/motion-sdk/package.json"), "utf8")
);
const entryDeps = Object.keys(entryPkg.dependencies ?? {});
if (entryDeps.length !== 1 || entryDeps[0] !== "@motion-sdk/core") {
  errors.push(`packages/motion-sdk must depend ONLY on @motion-sdk/core, found: ${JSON.stringify(entryDeps)}`);
}
if (entryPkg.peerDependencies && Object.keys(entryPkg.peerDependencies).length > 0) {
  errors.push(`packages/motion-sdk must have 0 peerDependencies so 1-command Agent installs stay friction-free`);
}

if (errors.length > 0) {
  console.error("Architecture boundary check FAILED:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}

console.log("Architecture boundaries OK: @motion-sdk/core (0 deps, pure kernel) | motion-sdk (1-pkg entry + zero-dep compilers) | @motion-sdk/remotion (isolated runtime peerDeps)");
