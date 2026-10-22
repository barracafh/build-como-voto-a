// @ts-ignore -- the template ships without @types/bun; `bun test` resolves this at runtime.
import { expect, test } from "bun:test";
import { CORTES_POR_CCAA } from "./cortes-29n";
import { REGIONES } from "./mapa-espana";

const todas = Object.values(CORTES_POR_CCAA);

test("19 communities add up to 350 deputies and 209 directly elected senators", () => {
  expect(todas.length).toBe(19);
  expect(todas.reduce((s, c) => s + c.diputados, 0)).toBe(350);
  expect(todas.reduce((s, c) => s + c.senadores, 0)).toBe(209);
});

test("every map region has seat data and every community is on the map", () => {
  for (const r of REGIONES) expect(CORTES_POR_CCAA[r.ccaa]).toBeDefined();
  expect(new Set(REGIONES.map((r) => r.ccaa)).size).toBe(19);
});

test("spot checks against the RD 806/2026 annex and LOREG art. 165", () => {
  expect(CORTES_POR_CCAA["17"]).toEqual({ nombre: "Comunitat Valenciana", diputados: 33, senadores: 12 });
  expect(CORTES_POR_CCAA["05"]).toMatchObject({ diputados: 15, senadores: 11 });
  expect(CORTES_POR_CCAA["04"]).toMatchObject({ diputados: 8, senadores: 6 });
});
