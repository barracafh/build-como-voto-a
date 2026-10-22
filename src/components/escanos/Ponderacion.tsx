import { type Ponderacion, MEDIA, PROVINCIAS } from "@/lib/ponderacion";

export const fmt = new Intl.NumberFormat("es-ES");
const factor = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const marca = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 });

// «● ▲ ×1,43 · sobrerrepresentada»: cuántas veces la media de España pesa un elector de
// aquí. Punto gris oscuro si está sobrerrepresentada y rojo si está infrarrepresentada;
// la flecha y la palabra lo dicen también sin color.
export function Indicador({ p }: { p: Ponderacion }) {
  const sobre = p.peso > 1;
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span
        aria-hidden="true"
        className={`mt-[0.4em] size-2.5 shrink-0 self-start rounded-full ${sobre ? "bg-(--text-secondary)" : "bg-brand"}`}
      />
      <span aria-hidden="true">{sobre ? "▲" : "▼"}</span>
      <span>
        ×{factor.format(p.peso)} · {sobre ? "sobrerrepresentada" : "infrarrepresentada"}
      </span>
    </span>
  );
}

export const electoresPorDiputado = (p: Ponderacion) => fmt.format(Math.round(p.porDiputado));

// Escala logarítmica: ×2 y ×0,5 quedan a la misma distancia de la media (×1).
const pesos = PROVINCIAS.map((p) => p.peso);
const MIN = Math.log2(Math.min(...pesos) * 0.95);
const MAX = Math.log2(Math.max(...pesos) * 1.03);
const x = (v: number) => ((Math.log2(v) - MIN) / (MAX - MIN)) * 100;
const CERO = x(1);
const MARCAS = [0.75, 1, 1.5, 2, 3].filter((v) => Math.log2(v) > MIN && Math.log2(v) < MAX);

const FILA = "grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)_3rem] items-center gap-x-3 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_3.5rem]";

// Barras divergentes desde la media: a la derecha, circunscripciones donde un diputado
// representa a menos electores que la media; a la izquierda, a más. Las de la comunidad
// señalada en el mapa, en rojo.
export function GraficoPeso({ resaltadas }: { resaltadas: readonly string[] }) {
  return (
    <figure className="[&>*+*]:mt-4">
      <figcaption>
        <p className="text-lg font-medium">Peso de cada circunscripción frente a la media</p>
        <p className="mt-1 text-base text-(--text-secondary)">
          Media de España: un diputado por cada {fmt.format(Math.round(MEDIA))} electores. Como
          cada provincia tiene un mínimo de escaños (art. 162 LOREG), no todos representan a
          los mismos.
        </p>
      </figcaption>

      <div aria-hidden="true" className={`${FILA} font-mono text-xs text-(--text-secondary)`}>
        <span />
        <div className="relative h-8">
          {MARCAS.map((v) => (
            <span
              key={v}
              className={`absolute bottom-0 -translate-x-1/2 tabular-nums ${Number.isInteger(v) ? "" : "hidden sm:inline"}`}
              style={{ left: `${x(v)}%` }}
            >
              ×{marca.format(v)}
            </span>
          ))}
          <span className="absolute top-0 pr-2 whitespace-nowrap" style={{ right: `${100 - CERO}%` }}>
            ← infra
          </span>
          <span className="absolute top-0 pl-2 whitespace-nowrap" style={{ left: `${CERO}%` }}>
            sobre →
          </span>
        </div>
        <span />
      </div>

      <ol aria-label="Circunscripciones de más a menos peso" className="grid gap-0.5">
        {PROVINCIAS.map((p) => {
          const rojo = resaltadas.includes(p.nombre);
          const extremo = x(p.peso);
          return (
            <li
              key={p.nombre}
              title={`${p.nombre}: ${electoresPorDiputado(p)} electores por diputado (${p.diputados} diputados)`}
              className={`${FILA} group text-sm ${rojo ? "font-medium" : ""}`}
            >
              <span className="truncate">{p.nombre}</span>
              <div aria-hidden="true" className="relative h-4">
                {MARCAS.map((v) => (
                  <span
                    key={v}
                    className={`absolute inset-y-0 w-px ${v === 1 ? "bg-foreground" : "bg-border"}`}
                    style={{ left: `${x(v)}%` }}
                  />
                ))}
                <span
                  className={`absolute inset-y-0.5 ${p.peso >= 1 ? "rounded-r" : "rounded-l"} ${
                    rojo ? "bg-brand" : "bg-(--disabled-foreground) group-hover:bg-foreground"
                  }`}
                  style={
                    p.peso >= 1
                      ? { left: `${CERO}%`, width: `${extremo - CERO}%` }
                      : { left: `${extremo}%`, width: `${CERO - extremo}%` }
                  }
                />
              </div>
              <span className="text-right tabular-nums">
                <span className="sr-only">, peso </span>×{factor.format(p.peso)}
              </span>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
