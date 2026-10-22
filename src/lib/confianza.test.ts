import { describe, expect, test } from "bun:test";
import type { Respuesta } from "./asistente";
import { confianza } from "./confianza";

const fuente = { nombre: "BOE", url: "https://www.boe.es/" };
const base: Respuesta = { tipo: "pregunta", respuesta: "…", pasos: [], fuentes: [fuente] };

describe("confianza", () => {
  test("fuera de alcance: sin termómetro", () => {
    expect(confianza({ ...base, tipo: "fuera_de_alcance" })).toBeNull();
  });

  test("respuesta redactada con fuentes de la base: media", () => {
    const c = confianza({ ...base, fuentes: [fuente, fuente] })!;
    expect(c.nivel).toBe("media");
    expect(c.comprobaciones[0]).toMatchObject({ ok: true, vars: { n: 2 } });
  });

  test("«no puedo confirmarlo»: baja", () => {
    expect(confianza({ ...base, sinConfirmar: true })!.nivel).toBe("baja");
  });

  test("veredicto con cita literal: alta, y cuenta las verificaciones publicadas", () => {
    const c = confianza({
      ...base,
      tipo: "afirmacion",
      verificacion: { afirmacion: "x", resultado: "NO COINCIDE", cita: "«…»" },
      publicadas: [
        { afirmacion: "x", verificador: "V", calificacion: "Falso", titulo: "x", url: "https://v.es" },
      ],
    })!;
    expect(c.nivel).toBe("alta");
    expect(c.comprobaciones.at(-1)).toMatchObject({ ok: true, vars: { n: 1 } });
  });

  test("no verificable: baja, aunque no haya verificaciones publicadas", () => {
    const c = confianza({
      ...base,
      tipo: "afirmacion",
      verificacion: { afirmacion: "x", resultado: "NO VERIFICABLE" },
    })!;
    expect(c.nivel).toBe("baja");
    expect(c.comprobaciones.at(-1)!.ok).toBe(false);
  });
});
