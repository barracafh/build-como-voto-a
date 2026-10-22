import { describe, expect, test } from "bun:test";
import {
  cierraEn,
  dias,
  filas,
  marcas,
  posicion,
  tramo,
} from "./linea-tiempo";

const escala = { desde: "2026-10-06", hasta: "2026-11-29" }; // 55 días

describe("dias", () => {
  test("cuenta días naturales entre dos fechas", () => {
    expect(dias("2026-10-06", "2026-10-06")).toBe(0);
    expect(dias("2026-10-31", "2026-11-01")).toBe(1);
    expect(dias("2026-10-06", "2026-11-29")).toBe(54);
  });

  test("no le afecta el cambio de hora del 25 de octubre", () => {
    expect(dias("2026-10-24", "2026-10-26")).toBe(2);
  });
});

describe("posicion", () => {
  test("el primer día empieza en 0 y el último ocupa la última franja", () => {
    expect(posicion("2026-10-06", escala)).toBe(0);
    expect(posicion("2026-11-29", escala)).toBeCloseTo((54 / 55) * 100);
  });

  test("las fechas fuera de la escala se recortan", () => {
    expect(posicion("2026-09-01", escala)).toBe(0);
    expect(posicion("2026-12-31", escala)).toBe(100);
  });
});

describe("tramo", () => {
  test("incluye el día final", () => {
    const t = tramo("2026-11-29", "2026-11-29", escala);
    expect(t.ancho).toBeCloseTo((1 / 55) * 100);
    expect(t.izquierda + t.ancho).toBeCloseTo(100);
  });

  test("un plazo de toda la escala ocupa el 100 %", () => {
    expect(tramo("2026-10-06", "2026-11-29", escala)).toEqual({
      izquierda: 0,
      ancho: 100,
    });
  });
});

describe("marcas", () => {
  test("marca cada lunes y el inicio de cada mes, sin lunes pegados a él", () => {
    const m = marcas(escala).map((x) => x.iso);
    expect(m).toEqual([
      "2026-10-12",
      "2026-10-19",
      "2026-10-26",
      "2026-11-01",
      "2026-11-09",
      "2026-11-16",
      "2026-11-23",
    ]);
  });

  test("el inicio de mes lleva el nombre del mes", () => {
    const m = marcas(escala);
    expect(m.find((x) => x.iso === "2026-11-01")?.mes).toBe("nov");
    expect(m.find((x) => x.iso === "2026-10-12")?.mes).toBeUndefined();
  });
});

describe("cierraEn", () => {
  test("días que faltan hasta el cierre", () => {
    expect(cierraEn("2026-11-19", "2026-10-22")).toBe(28);
    expect(cierraEn("2026-11-19", "2026-11-19")).toBe(0);
  });
});

describe("filas", () => {
  const p = (id: string) => ({ id });

  test("sin bifurcaciones numera en orden", () => {
    expect(filas([p("a"), p("b")])).toEqual([
      { tipo: "paso", paso: p("a"), numero: "1" },
      { tipo: "paso", paso: p("b"), numero: "2" },
    ]);
  });

  test("una bifurcación numera cada camino con su letra y sigue después", () => {
    const r = filas([
      p("doc"),
      {
        eleccion: "Elige una",
        caminos: [
          { letra: "A", nombre: "Por correo", pasos: [p("correo1"), p("correo2")] },
          { letra: "B", nombre: "En urna", pasos: [p("urna")] },
        ],
      },
      p("votacion"),
    ]);
    expect(r).toEqual([
      { tipo: "paso", paso: p("doc"), numero: "1" },
      { tipo: "camino", letra: "A", nombre: "Por correo", eleccion: "Elige una" },
      { tipo: "paso", paso: p("correo1"), numero: "2A" },
      { tipo: "paso", paso: p("correo2"), numero: "3A" },
      { tipo: "camino", letra: "B", nombre: "En urna" },
      { tipo: "paso", paso: p("urna"), numero: "2B" },
      { tipo: "paso", paso: p("votacion"), numero: "4" },
    ]);
  });
});
