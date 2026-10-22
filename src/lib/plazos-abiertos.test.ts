import { describe, expect, test } from "bun:test";
import type { Plazo } from "./calendario";
import { abiertos, pestanasAbiertas } from "./plazos-abiertos";

const p = (id: string, inicio: string, fin: string): Plazo => ({
  id,
  evento: id,
  inicio,
  fin,
  fuente: "",
  fuentesAdicionales: [],
});

const grupos = [
  {
    nombre: "España",
    pasos: [
      { plazo: p("pedir", "2026-10-06", "2026-11-19") },
      { plazo: p("enviar", "2026-11-10", "2026-11-25") },
    ],
  },
  { nombre: "Braille", pasos: [{ plazo: p("braille", "2026-10-06", "2026-11-02") }] },
];

describe("abiertos", () => {
  test("conserva los pasos abiertos y próximos, en el orden dado", () => {
    expect(abiertos(grupos, "2026-10-22")).toEqual(grupos);
  });

  test("quita los pasos cerrados y los grupos que se quedan vacíos", () => {
    expect(abiertos(grupos, "2026-11-20")).toEqual([
      { nombre: "España", pasos: [grupos[0].pasos[1]] },
    ]);
  });

  test("un plazo sigue abierto el día que cierra", () => {
    expect(abiertos(grupos, "2026-11-02")).toHaveLength(2);
  });

  test("sin nada abierto devuelve una lista vacía", () => {
    expect(abiertos(grupos, "2026-11-26")).toEqual([]);
  });
});

describe("pestanasAbiertas", () => {
  const pestanas = [
    { id: "aqui", grupos: [grupos[0]] },
    { id: "braille", grupos: [grupos[1]] },
  ];

  test("filtra los pasos de cada pestaña", () => {
    expect(pestanasAbiertas(pestanas, "2026-11-20")).toEqual([
      { id: "aqui", grupos: [{ nombre: "España", pasos: [grupos[0].pasos[1]] }] },
    ]);
  });

  test("quita las pestañas que se quedan sin plazos", () => {
    expect(pestanasAbiertas(pestanas, "2026-11-03").map((p) => p.id)).toEqual([
      "aqui",
    ]);
  });
});
