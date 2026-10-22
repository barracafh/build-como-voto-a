// @ts-ignore -- the template ships without @types/bun; `bun test` resolves this at runtime.
import { expect, test } from "bun:test";
import { CENSO } from "@/datos/censo-29n";
import { DIPUTADOS, ELECTORES, MEDIA, POR_CCAA, PROVINCIAS, agrupar } from "./ponderacion";

test("the 52 constituencies add up to the INE totals for 29N", () => {
  expect(CENSO.length).toBe(52);
  for (const [, , total, espana, extranjero] of CENSO) expect(total).toBe(espana + extranjero);
  expect(CENSO.reduce((s, f) => s + f[3], 0)).toBe(35958711);
  expect(CENSO.reduce((s, f) => s + f[4], 0)).toBe(2769645);
  expect(PROVINCIAS.length).toBe(52);
  expect(ELECTORES).toBe(38728356);
  expect(DIPUTADOS).toBe(350);
});

test("national average and the extremes", () => {
  expect(Math.round(MEDIA)).toBe(110652);
  expect(PROVINCIAS[0].nombre).toBe("Teruel");
  expect(PROVINCIAS[0].porDiputado).toBe(35417);
  expect(PROVINCIAS.at(-1)!.nombre).toBe("Madrid");
  expect(Math.round(PROVINCIAS.at(-1)!.porDiputado)).toBe(145708);
});

test("communities add their provinces", () => {
  expect(POR_CCAA["17"]).toMatchObject({ electores: 1359229 + 448196 + 2067797, diputados: 33 });
  expect(POR_CCAA["17"].provincias.map((p) => p.nombre).sort()).toEqual(
    ["Alicante/Alacant", "Castellón/Castelló", "Valencia/València"],
  );
  const suma = Object.values(POR_CCAA).reduce((s, c) => s + c.electores, 0);
  expect(suma).toBe(38728356);
});

test("several communities add up as one group", () => {
  const g = agrupar(["11", "12"]);
  expect(g.electores).toBe(POR_CCAA["11"].electores + 5536913);
  expect(g.diputados).toBe(23 + 38);
  expect(g.provincias.length).toBe(5);
  expect(g.peso).toBeCloseTo(MEDIA / (g.electores / g.diputados));
  expect(agrupar(["17"])).toMatchObject({ electores: POR_CCAA["17"].electores, diputados: 33 });
});
