import { ESCANOS } from "@/datos/hemiciclo";

// Hemiciclo de 350 puntos de Barraca.pen. Los escaños [desde, hasta) se pintan
// en rojo; el resto, en un único gris. Cada punto crece al
// pasar el ratón por encima.
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
      viewBox="130 90 1020 540"
      role="img"
      aria-label={etiqueta}
      className="block h-auto w-full"
    >
      {ESCANOS.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="10"
          fill={i >= desde && i < hasta ? "var(--brand)" : "var(--disabled-foreground)"}
          className="origin-center [transform-box:fill-box] hover:scale-140 motion-safe:transition-[fill,scale] motion-safe:duration-100"
        />
      ))}
    </svg>
  );
}
