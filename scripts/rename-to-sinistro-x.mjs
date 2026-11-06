// Troca o nome visível "Nexora Forex" / "NEXORA" / "Nexora" por "Sinistro X".
// Por defeito só MOSTRA o que mudaria. Para aplicar: node scripts/rename-to-sinistro-x.mjs --apply
//
// Não mexe em: link de afiliado (utm_campaign=NEXORA), URLs e chaves em minúsculas (banckend-nexora.onrender.com, nexora_token...),
// nomes de ficheiros/hooks (useNexoraWs), linhas de import, node_modules, dist, package-lock.json.
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";

const APPLY = process.argv.includes("--apply");
const ROOT = process.cwd();
const SKIP_DIRS = new Set(["node_modules", "dist", "build", ".git", ".vercel"]);
const SKIP_FILES = new Set(["package-lock.json", "rename-to-sinistro-x.mjs"]);
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".html", ".md", ".css", ".json", ".yaml", ".yml"]);

const RULES = [
  [/NEXORA FOREX/g, "SINISTRO X"],
  [/Nexora Forex/g, "Sinistro X"],
  [/\bNEXORA\b/g, "SINISTRO X"],
  [/\bNexora\b/g, "Sinistro X"],
];

const isImportLine = (l) =>
  /^\s*import\b/.test(l) || /\bfrom\s+['"]/.test(l) || /require\(/.test(l) ||
  /utm_(campaign|source|medium)=/.test(l); // não mexe no link de afiliado

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (!SKIP_DIRS.has(name)) yield* walk(p);
    } else if (EXTS.has(extname(name)) && !SKIP_FILES.has(basename(name))) {
      yield p;
    }
  }
}

let total = 0;
for (const file of walk(ROOT)) {
  const lines = readFileSync(file, "utf8").split("\n");
  let changed = false;
  const out = lines.map((line, i) => {
    if (isImportLine(line)) return line;
    let next = line;
    for (const [re, to] of RULES) next = next.replace(re, to);
    if (next !== line) {
      changed = true;
      total++;
      console.log(`${file}:${i + 1}\n  - ${line.trim()}\n  + ${next.trim()}`);
    }
    return next;
  });
  if (APPLY && changed) writeFileSync(file, out.join("\n"));
}

console.log(
  `\n${total} linha(s) ${APPLY ? "alteradas." : "seriam alteradas. Corre com --apply para gravar."}`
);
