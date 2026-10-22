import { ELECTORES_POR_CIRCUNSCRIPCION } from "@/datos/censo-29n";
import { CORTES } from "@/datos/cortes-29n";

// Electores por diputado el 29N y su «peso» frente a la media de España: la media
// (electores / 350) dividida entre los electores por diputado de cada sitio. Más de 1,
// sobrerrepresentada (menos electores por escaño que la media); menos de 1, infrarrepresentada.
// Solo cuentan las circunscripciones del Congreso: las islas eligen senadores, no diputados.

export type Ponderacion = {
  nombre: string;
  electores: number;
  diputados: number;
  porDiputado: number;
  peso: number;
};

const CIRCUNSCRIPCIONES = Object.entries(CORTES).flatMap(([ccaa, { circunscripciones }]) =>
  circunscripciones
    .filter(([, diputados]) => diputados > 0)
    .map(([nombre, diputados]) => ({ ccaa, nombre, diputados, electores: ELECTORES_POR_CIRCUNSCRIPCION[nombre] })),
);

export const ELECTORES = CIRCUNSCRIPCIONES.reduce((s, c) => s + c.electores, 0);
export const DIPUTADOS = CIRCUNSCRIPCIONES.reduce((s, c) => s + c.diputados, 0);
export const MEDIA = ELECTORES / DIPUTADOS;

function medir(nombre: string, electores: number, diputados: number): Ponderacion {
  const porDiputado = electores / diputados;
  return { nombre, electores, diputados, porDiputado, peso: MEDIA / porDiputado };
}

export const ESPANA = medir("España", ELECTORES, DIPUTADOS);

// De más a menos peso.
export const PROVINCIAS: readonly Ponderacion[] = CIRCUNSCRIPCIONES.map((c) =>
  medir(c.nombre, c.electores, c.diputados),
).sort((a, b) => b.peso - a.peso);

export const POR_CCAA: Record<string, Ponderacion & { provincias: readonly Ponderacion[] }> =
  Object.fromEntries(
    Object.entries(CORTES).map(([ccaa, { nombre }]) => {
      const propias = CIRCUNSCRIPCIONES.filter((c) => c.ccaa === ccaa);
      const electores = propias.reduce((s, c) => s + c.electores, 0);
      const diputados = propias.reduce((s, c) => s + c.diputados, 0);
      const provincias = PROVINCIAS.filter((p) => propias.some((c) => c.nombre === p.nombre));
      return [ccaa, { ...medir(nombre, electores, diputados), provincias }];
    }),
  );

// Varias comunidades juntas: suman electores y diputados, y juntan sus provincias.
export function agrupar(ccaas: readonly string[]) {
  const grupo = ccaas.map((c) => POR_CCAA[c]);
  const electores = grupo.reduce((s, c) => s + c.electores, 0);
  const diputados = grupo.reduce((s, c) => s + c.diputados, 0);
  const provincias = grupo.flatMap((c) => c.provincias).sort((a, b) => b.peso - a.peso);
  return { ...medir(grupo.map((c) => c.nombre).join(" · "), electores, diputados), provincias };
}
