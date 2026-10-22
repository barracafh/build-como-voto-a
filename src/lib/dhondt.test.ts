// ponytail: sin @types/bun en el repo; con `bun add -d @types/bun` sobra esta línea.
// @ts-ignore
import { describe, expect, test } from "bun:test";
import { cargarProvincias } from "@/datos/resultados";
import { dhondt } from "./dhondt";

describe("dhondt", () => {
  test("caso de ejemplo: 7 escaños, E no llega al 3 %", () => {
    const { resultados, cocientes } = dhondt(
      [
        { nombre: "A", votos: 340000 },
        { nombre: "B", votos: 280000 },
        { nombre: "C", votos: 160000 },
        { nombre: "D", votos: 60000 },
        { nombre: "E", votos: 15000 },
      ],
      855000,
      7,
    );
    expect(resultados.map((r) => r.escanos)).toEqual([3, 3, 1, 0, 0]);
    expect(resultados.map((r) => r.superaUmbral)).toEqual([
      true, true, true, true, false,
    ]);
    // Los cocientes ganadores, en orden: 340k A, 280k B, 170k A, 160k C…
    const ganadores = cocientes
      .filter((c) => c.orden !== null)
      .sort((a, b) => a.orden! - b.orden!)
      .map((c) => `${c.nombre}${c.divisor}`);
    expect(ganadores).toEqual(["A1", "B1", "A2", "C1", "B2", "A3", "B3"]);
    expect(cocientes.some((c) => c.nombre === "E")).toBe(false);
  });

  test("reproduce los escaños oficiales de 2023 en las 52 circunscripciones", () => {
    const provincias = cargarProvincias();
    expect(provincias).toHaveLength(52);
    expect(provincias.reduce((s, p) => s + p.escanos, 0)).toBe(350);
    const fallos = provincias.filter((p) => {
      const { resultados } = dhondt(p.candidaturas, p.votosValidos, p.escanos);
      return resultados.some((r, i) => r.escanos !== p.candidaturas[i].escanosOficiales);
    });
    expect(fallos.map((p) => p.nombre)).toEqual([]);
  });
});
