import { describe, expect, test } from "bun:test";
import type { Plazo } from "./calendario";
import { abiertos, pestanasAbiertas, urgente } from "./plazos-abiertos";

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

describe("urgente", () => {
  const erta = [
    p("pedir", "2026-10-06", "2026-10-31"),
    p("recibir", "2026-11-03", "2026-11-09"),
    p("enviar", "2026-11-03", "2026-11-25"),
  ];

  test("el abierto que antes cierra", () => {
    const largo = p("largo", "2026-10-06", "2026-11-19");
    expect(urgente([largo, ...erta], "2026-10-22")?.id).toBe("pedir");
  });

  test("sin abiertos, el próximo que antes empieza", () => {
    expect(urgente(erta, "2026-11-01")?.id).toBe("recibir");
  });

  test("entre abiertos, gana el que cierra antes aunque empiece igual", () => {
    expect(urgente(erta, "2026-11-05")?.id).toBe("recibir");
  });

  test("null cuando han cerrado todos", () => {
    expect(urgente(erta, "2026-11-26")).toBeNull();
  });
});
