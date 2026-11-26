// Copies what a stage needs at run time (GSAP and the Geist typeface) from node_modules into
// public/vendor, so the site serves them itself.
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "..", "public", "vendor");
const require = createRequire(import.meta.url);
mkdirSync(out, { recursive: true });
copyFileSync(require.resolve("gsap/dist/gsap.min.js"), path.join(out, "gsap.min.js"));
copyFileSync(path.join(here, "..", "node_modules", "geist", "dist", "fonts", "geist-sans", "Geist-Variable.woff2"), path.join(out, "Geist-Variable.woff2"));
writeFileSync(
  path.join(out, "geist.css"),
  `@font-face { font-family: "Geist"; src: url("/vendor/Geist-Variable.woff2") format("woff2"); font-weight: 100 900; font-display: block; }\n`
);
