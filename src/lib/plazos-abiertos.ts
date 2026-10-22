import { estado, type Plazo } from "./calendario";

// Plazos agrupados por tipo de elector. Se quitan los cerrados y los grupos
// que se quedan sin ninguno.
export function abiertos<P extends { plazo: Plazo }, G extends { pasos: readonly P[] }>(
  grupos: readonly G[],
  hoy: string,
): G[] {
  return grupos.flatMap((g) => {
    const pasos = g.pasos.filter((p) => estado(p.plazo, hoy) !== "cerrado");
    return pasos.length > 0 ? [{ ...g, pasos }] : [];
  });
}

// Lo mismo por pestañas: cada una filtra sus grupos y se quita si se queda vacía.
export function pestanasAbiertas<
  P extends { plazo: Plazo },
  G extends { pasos: readonly P[] },
  T extends { grupos: readonly G[] },
>(pestanas: readonly T[], hoy: string): T[] {
  return pestanas.flatMap((t) => {
    const grupos = abiertos(t.grupos, hoy);
    return grupos.length > 0 ? [{ ...t, grupos }] : [];
  });
}

// El plazo que más apremia: el abierto que antes cierra; si no hay ninguno
// abierto, el próximo que antes empieza. null si ya han cerrado todos.
export function urgente(plazos: readonly Plazo[], hoy: string): Plazo | null {
  const abiertos = plazos.filter((p) => estado(p, hoy) === "abierto");
  if (abiertos.length > 0)
    return abiertos.reduce((a, b) => (b.fin < a.fin ? b : a));
  const proximos = plazos.filter((p) => estado(p, hoy) === "proximo");
  if (proximos.length > 0)
    return proximos.reduce((a, b) => (b.inicio < a.inicio ? b : a));
  return null;
}
