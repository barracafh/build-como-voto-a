import { describe, expect, test } from "bun:test";
import { instanteMadrid } from "./calendario";

const utc = (ms: number) => new Date(ms).toISOString();

describe("instanteMadrid", () => {
  test("en noviembre, hora peninsular de invierno (+01:00)", () => {
    expect(utc(instanteMadrid("2026-11-29", "9:00"))).toBe(
      "2026-11-29T08:00:00.000Z",
    );
  });

  test("24:00 es el final del día", () => {
    expect(utc(instanteMadrid("2026-11-25", "24:00"))).toBe(
      "2026-11-25T23:00:00.000Z",
    );
  });

  test("en verano, +02:00", () => {
    expect(utc(instanteMadrid("2026-07-01", "9:00"))).toBe(
      "2026-07-01T07:00:00.000Z",
    );
  });
});
