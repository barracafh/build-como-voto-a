import { describe, expect, test } from "bun:test";
import { conFicha, type Respuesta } from "./asistente";
import { confianza } from "./confianza";

const delModelo: Respuesta = {
  tipo: "pregunta",
  respuesta: "texto del modelo",
  pasos: [],
  fuentes: [{ nombre: "BOE", url: "https://www.boe.es/" }],
};

describe("conFicha", () => {
  test("una pregunta que encaja con una ficha se responde con la ficha", () => {
    const r = conFicha(delModelo, "¿Cuántos diputados tiene el Congreso?");
    expect(r.verificacion).toMatchObject({
      afirmacion: "El Congreso tiene 350 diputados",
      resultado: "COINCIDE",
    });
    expect(r.verificacion?.cita).toBeTruthy();
    expect(confianza(r)?.nivel).toBe("alta");
  });

  test("también cuando la ficha no coincide", () => {
    const r = conFicha(delModelo, "¿Puedo votar con una fotocopia del DNI?");
    expect(r.verificacion?.resultado).toBe("NO COINCIDE");
    expect(r.respuesta).toContain("no coincide");
  });

  test("si no encaja con ninguna, se queda la respuesta del asistente", () => {
    for (const q of [
      "Vivo en València y el día 29 no estoy, ¿cómo voto?",
      "¿Tengo horas libres en el trabajo para ir a votar?",
    ])
      expect(conFicha(delModelo, q)).toBe(delModelo);
  });

  test("fuera de alcance no se toca", () => {
    const fuera = { ...delModelo, tipo: "fuera_de_alcance" as const };
    expect(conFicha(fuera, "¿Es obligatorio votar?")).toBe(fuera);
  });
});
