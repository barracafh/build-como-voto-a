import type { Cociente } from "@/lib/dhondt";

export const fmt = new Intl.NumberFormat("es-ES");
const pct = new Intl.NumberFormat("es-ES", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type Fila = { nombre: string; votos: number; superaUmbral: boolean; escanos: number };

// Las candidaturas siempre en gris: nunca colores de partido.
export function TablaResultados({
  filas,
  votosValidos,
  titulo,
}: {
  filas: readonly Fila[];
  votosValidos: number;
  titulo: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
      <table className="w-full min-w-[520px] text-left text-base tabular-nums">
        <caption className="sr-only">{titulo}</caption>
        <thead className="bg-muted text-sm text-(--text-secondary)">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Candidatura</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Votos</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">% válidos</th>
            <th scope="col" className="px-4 py-3 font-medium">Llega al 3 %</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Escaños</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filas.map((f) => (
            <tr key={f.nombre} className={f.superaUmbral ? "" : "text-(--text-secondary)"}>
              <th scope="row" className="px-4 py-3 font-normal">{f.nombre}</th>
              <td className="px-4 py-3 text-right">{fmt.format(f.votos)}</td>
              <td className="px-4 py-3 text-right">
                {votosValidos ? pct.format(f.votos / votosValidos) : "—"}
              </td>
              <td className="px-4 py-3">{f.superaUmbral ? "Sí" : "No"}</td>
              <td className="px-4 py-3 text-right font-medium">{f.escanos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TablaCocientes({
  cocientes,
  escanos,
  titulo,
}: {
  cocientes: readonly Cociente[];
  escanos: number;
  titulo: string;
}) {
  const nombres = [...new Set(cocientes.map((c) => c.nombre))];
  const divisores = Array.from({ length: escanos }, (_, i) => i + 1);
  const celda = new Map(cocientes.map((c) => [`${c.nombre}|${c.divisor}`, c]));
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
      <table className="w-max min-w-full text-right text-base tabular-nums">
        <caption className="sr-only">{titulo}</caption>
        <thead className="bg-muted text-sm text-(--text-secondary)">
          <tr>
            <th scope="col" className="sticky left-0 bg-muted px-4 py-3 text-left font-medium">
              Candidatura
            </th>
            {divisores.map((d) => (
              <th key={d} scope="col" className="px-3 py-3 font-mono font-medium">
                ÷{d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {nombres.map((n) => (
            <tr key={n}>
              <th
                scope="row"
                className="sticky left-0 max-w-[160px] bg-background px-4 py-3 text-left font-normal"
              >
                {n}
              </th>
              {divisores.map((d) => {
                const c = celda.get(`${n}|${d}`)!;
                return c.orden ? (
                  <td key={d} className="px-3 py-3 font-semibold text-brand">
                    {fmt.format(Math.round(c.valor))}
                    <span className="ml-1 font-mono text-xs">
                      <span className="sr-only">, escaño </span>#{c.orden}
                    </span>
                  </td>
                ) : (
                  <td key={d} className="px-3 py-3 text-(--text-secondary)">
                    {fmt.format(Math.round(c.valor))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
