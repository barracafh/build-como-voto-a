import { readFileSync } from "node:fs";
import { join } from "node:path";
import afirmaciones from "@/datos/afirmaciones.json";
import { plazos, type Plazo } from "@/lib/calendario";

// Base del chatbot: apartados 1 a 3 de contexto.md (convocatoria, cómo votar y
// sistema electoral), los ejemplos del verificador (6.3) y el calendario
// oficial. El apartado 4 (programas y candidaturas) queda fuera a propósito:
// solo explicamos cómo se vota.
const contexto = readFileSync(join(process.cwd(), "contexto.md"), "utf8");

function apartado(desde: string, hasta: string) {
  const i = contexto.indexOf(desde);
  const j = contexto.indexOf(hasta, i);
  if (i < 0 || j < 0) throw new Error(`contexto.md: falta «${desde}»`);
  return contexto.slice(i, j);
}

export const conocimiento = [
  apartado("## 1. La convocatoria", "## 4. Programas y candidaturas"),
  apartado("### 6.3 Ejemplos del corpus", "### 6.4"),
].join("\n");

const linea = (p: Plazo) =>
  [
    p.id,
    p.inicio === p.fin ? p.inicio : `${p.inicio} a ${p.fin}`,
    p.evento,
    p.nota,
    p.fuente,
    ...p.fuentesAdicionales,
  ]
    .filter(Boolean)
    .join(" | ");

export const calendarioTexto = plazos.map(linea).join("\n");

// Fichas del verificador (src/datos/afirmaciones.json): su cita y su URL
// también forman parte de la base.
const fichas: { cita: string; url: string }[] = afirmaciones;

// Solo se muestran enlaces que estén literalmente en la base: el modelo no
// puede inventar una fuente.
const urls = new Set(
  [
    ...(conocimiento.match(/https?:\/\/[^\s<>()]+/g) ?? []),
    ...plazos.flatMap((p) => [p.fuente, ...p.fuentesAdicionales]),
    ...fichas.map((f) => f.url),
  ]
    .map((u) => u.replace(/[.,;:»]+$/, ""))
    // La página sin el #ancla también vale (p. ej., la LOREG entera).
    .flatMap((u) => [u, u.split("#")[0]]),
);

export function fuentePermitida(url: unknown): url is string {
  return typeof url === "string" && urls.has(url.trim());
}

// Una cita solo vale si está literalmente en la base (sin contar espacios,
// comillas, negritas ni separadores de tabla): la pega el modelo, pero no puede inventarla.
const normalizar = (t: string) =>
  t
    .replace(/[*_`«»"“”|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
const baseNormalizada = normalizar(
  [conocimiento, calendarioTexto, ...fichas.map((f) => f.cita)].join("\n"),
);

export function citaLiteral(cita: unknown): cita is string {
  return (
    typeof cita === "string" &&
    normalizar(cita).length >= 15 &&
    baseNormalizada.includes(normalizar(cita))
  );
}
