import { readFileSync } from "node:fs";
import { join } from "node:path";

// Elecciones al Congreso, 23 de julio de 2023. Origen: Ministerio del Interior.
// Se lee en el servidor (en el build) desde datos/, que no se edita.
export type CandidaturaReal = {
  nombre: string;
  votos: number;
  escanosOficiales: number;
};
export type Provincia = {
  nombre: string;
  codigo: string;
  escanos: number;
  votosValidos: number;
  votosBlanco: number;
  candidaturas: CandidaturaReal[];
};

export function cargarProvincias(): Provincia[] {
  const csv = readFileSync(
    join(process.cwd(), "datos/resultados_congreso_2023_provincias.csv"),
    "utf8",
  );
  const porCodigo = new Map<string, Provincia>();
  // ponytail: split simple; el CSV no tiene comillas ni comas dentro de campos.
  for (const linea of csv.trim().split("\n").slice(1)) {
    const [nombre, codigo, escanos, , , validos, blanco, , partido, votos, obtenidos] =
      linea.split(",");
    let p = porCodigo.get(codigo);
    if (!p) {
      p = {
        nombre,
        codigo,
        escanos: +escanos,
        votosValidos: +validos,
        votosBlanco: +blanco,
        candidaturas: [],
      };
      porCodigo.set(codigo, p);
    }
    p.candidaturas.push({ nombre: partido, votos: +votos, escanosOficiales: +obtenidos });
  }
  return [...porCodigo.values()].sort((a, b) => a.codigo.localeCompare(b.codigo));
}
