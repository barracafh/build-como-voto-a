export type Candidatura = { nombre: string; votos: number };
export type Cociente = {
  nombre: string;
  divisor: number;
  valor: number;
  /** Número de escaño que gana este cociente (1, 2…), o null si no gana ninguno. */
  orden: number | null;
};

// Regla D'Hondt (LOREG, art. 163): fuera las candidaturas con menos del 3 %
// de los votos válidos (que incluyen el voto en blanco); se divide entre 1..n
// y los n cocientes mayores ganan escaño. Empate: más votos totales.
export function dhondt(
  candidaturas: readonly Candidatura[],
  votosValidos: number,
  escanos: number,
  umbral = 0.03,
) {
  const superan = candidaturas.map((c) => c.votos >= umbral * votosValidos);
  const cocientes: Cociente[] = [];
  candidaturas.forEach((c, i) => {
    if (!superan[i]) return;
    for (let d = 1; d <= escanos; d++)
      cocientes.push({ nombre: c.nombre, divisor: d, valor: c.votos / d, orden: null });
  });
  const votosDe = new Map(candidaturas.map((c) => [c.nombre, c.votos]));
  const ranking = [...cocientes].sort(
    (a, b) => b.valor - a.valor || votosDe.get(b.nombre)! - votosDe.get(a.nombre)!,
  );
  ranking.slice(0, escanos).forEach((c, i) => (c.orden = i + 1));
  const resultados = candidaturas.map((c, i) => ({
    ...c,
    superaUmbral: superan[i],
    escanos: cocientes.filter((q) => q.nombre === c.nombre && q.orden !== null).length,
  }));
  return { resultados, cocientes };
}
