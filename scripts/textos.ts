// Lista los textos que se traducen: los de t("…") y marcar("…") en src/, los
// eventos del calendario y las etiquetas del verificador. Con --faltan, dice
// cuántos faltan en cada diccionario.
//   bun scripts/textos.ts            → JSON con todos los textos
//   bun scripts/textos.ts --faltan   → resumen por lengua
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import calendario from "../datos/calendario_29N_2026.json";
import { DICCIONARIOS } from "../src/i18n/diccionarios";

function ficheros(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const ruta = join(dir, f);
    if (statSync(ruta).isDirectory())
      return f === "diccionarios" ? [] : ficheros(ruta);
    return /\.tsx?$/.test(f) && !f.includes(".test.") ? [ruta] : [];
  });
}

const textos = new Set<string>();
const llamada = /\b(?:t|marcar)\(\s*"((?:[^"\\]|\\.)*)"/g;
for (const f of ficheros("src")) {
  for (const m of readFileSync(f, "utf8").matchAll(llamada))
    textos.add(JSON.parse(`"${m[1]}"`));
}
for (const e of calendario.fechas) textos.add(e.evento);
for (const r of ["COINCIDE", "NO COINCIDE", "NO VERIFICABLE"]) textos.add(r);

const lista = [...textos].sort();
if (process.argv.includes("--faltan")) {
  for (const [idioma, d] of Object.entries(DICCIONARIOS)) {
    if (idioma === "es") continue;
    const faltan = lista.filter((s) => !(s in d));
    const sobran = Object.keys(d).filter((s) => !textos.has(s));
    console.log(`${idioma}: faltan ${faltan.length}, sobran ${sobran.length}`);
    for (const s of faltan) console.log(`  - ${s}`);
  }
} else {
  console.log(JSON.stringify(lista, null, 2));
}
