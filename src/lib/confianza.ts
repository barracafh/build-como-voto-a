// El termómetro que acompaña cada respuesta del chat. El nivel sale de lo que
// la herramienta ha comprobado de verdad, nunca de una estimación del modelo:
// - alta: el veredicto sale de una ficha con cita literal de la fuente oficial.
// - media: el asistente redacta con la base oficial y sus fuentes existen en
//   ella, pero el texto no se contrasta frase a frase.
// - baja: no hay fuente oficial que lo sostenga.
// Los textos van en castellano y se traducen con t() al mostrarlos.
import type { Respuesta } from "@/lib/asistente";
import { marcar, type Vars } from "@/i18n/traducir";

export type Nivel = "alta" | "media" | "baja";

export type Comprobacion = { texto: string; vars?: Vars; ok: boolean };

export type Confianza = {
  nivel: Nivel;
  motivo: string;
  comprobaciones: Comprobacion[];
};

export const NIVELES: Record<Nivel, { etiqueta: string; marcas: number }> = {
  alta: { etiqueta: marcar("Alta"), marcas: 3 },
  media: { etiqueta: marcar("Media"), marcas: 2 },
  baja: { etiqueta: marcar("Baja"), marcas: 1 },
};

const fuentes = (n: number): Comprobacion =>
  n === 1
    ? { texto: marcar("1 fuente oficial comprobada en la base"), ok: true }
    : {
        texto: marcar("{n} fuentes oficiales comprobadas en la base"),
        vars: { n },
        ok: n > 0,
      };

// Solo el verificador consulta Google Fact Check.
const publicadas = (n: number): Comprobacion =>
  n > 0
    ? {
        texto: marcar("{n} verificaciones publicadas en Google Fact Check"),
        vars: { n },
        ok: true,
      }
    : {
        texto: marcar("Sin verificaciones publicadas en Google Fact Check"),
        ok: false,
      };

// null: no hay nada que medir (fuera de alcance).
export function confianza(r: Respuesta): Confianza | null {
  if (r.tipo === "fuera_de_alcance") return null;

  const v = r.verificacion;
  if (v) {
    const conCita = v.resultado !== "NO VERIFICABLE" && !!v.cita;
    return {
      nivel: conCita ? "alta" : "baja",
      motivo: conCita
        ? marcar("El veredicto sale de una ficha con cita literal de la fuente oficial.")
        : marcar("Ninguna ficha oficial lo confirma ni lo contradice."),
      comprobaciones: [
        {
          texto: conCita
            ? marcar("Cita literal de la fuente oficial")
            : marcar("Sin cita literal"),
          ok: conCita,
        },
        ...(conCita ? [fuentes(r.fuentes.length)] : []),
        publicadas(r.publicadas?.length ?? 0),
      ],
    };
  }

  if (r.sinConfirmar)
    return {
      nivel: "baja",
      motivo: marcar("No hay una fuente oficial en la base que lo sostenga."),
      comprobaciones: [
        { texto: marcar("Sin fuente oficial que lo sostenga"), ok: false },
      ],
    };

  return {
    nivel: "media",
    motivo: marcar(
      "Lo redacta el asistente con la base oficial. Sus fuentes existen en la base, pero el texto no se contrasta frase a frase.",
    ),
    comprobaciones: [
      fuentes(r.fuentes.length),
      { texto: marcar("Sin cita literal: el texto lo redacta el asistente"), ok: false },
    ],
  };
}
