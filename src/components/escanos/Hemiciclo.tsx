import { ESCANOS, TONOS } from "@/datos/hemiciclo";

// Hemiciclo de 350 puntos de Barraca.pen. Los escaños [desde, hasta) se pintan
// en rojo; el resto conserva sus tonos grises anónimos. El sol es decorativo.
export function Hemiciclo({
  desde,
  hasta,
  etiqueta,
}: {
  desde: number;
  hasta: number;
  etiqueta: string;
}) {
  return (
    <svg
      viewBox="130 90 1020 630"
      role="img"
      aria-label={etiqueta}
      className="block h-auto w-full"
    >
      <circle cx="643" cy="610" r="180" fill="var(--brand-yellow)" opacity="0.35" />
      <circle cx="643" cy="610" r="150" fill="var(--brand-yellow)" />
      {ESCANOS.map(([cx, cy, tono], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="10"
          fill={i >= desde && i < hasta ? "var(--brand)" : TONOS[tono]}
          className="motion-safe:transition-colors motion-safe:duration-300"
        />
      ))}
    </svg>
  );
}
