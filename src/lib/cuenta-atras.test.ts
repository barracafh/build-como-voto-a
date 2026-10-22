import { describe, expect, test } from "bun:test";
import { partes } from "./cuenta-atras";

const s = 1000;
const min = 60 * s;
const h = 60 * min;
const d = 24 * h;

describe("partes", () => {
  test("separa días, horas, minutos y segundos", () => {
    expect(partes(37 * d + 14 * h + 5 * min + 9 * s)).toEqual({
      dias: 37,
      horas: 14,
      minutos: 5,
      segundos: 9,
    });
  });

  test("redondea hacia abajo los milisegundos", () => {
    expect(partes(1999)).toEqual({ dias: 0, horas: 0, minutos: 0, segundos: 1 });
  });

  test("sin tiempo o con tiempo negativo, todo a cero", () => {
    const cero = { dias: 0, horas: 0, minutos: 0, segundos: 0 };
    expect(partes(0)).toEqual(cero);
    expect(partes(-5 * s)).toEqual(cero);
  });
});
