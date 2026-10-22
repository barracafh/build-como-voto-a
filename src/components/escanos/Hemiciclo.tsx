import { ESCANOS } from "@/datos/hemiciclo";

// Bloques de escaños [desde, hasta) que van en rojo: uno por comunidad señalada.
export type Bloques = readonly (readonly [desde: number, hasta: number])[];
export const enBloques = (bloques: Bloques, i: number) =>
  bloques.some(([desde, hasta]) => i >= desde && i < hasta);

// Hemiciclo de 350 puntos de Barraca.pen. Los escaños de `bloques` se pintan
// en rojo; el resto, en un único gris. Cada punto crece al
// pasar el ratón por encima.
export function Hemiciclo({
  bloques,
  etiqueta,
}: {
  bloques: Bloques;
  etiqueta: string;
}) {
  return (
    <svg
      viewBox="130,90,1020,540"
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
          fill={enBloques(bloques, i) ? "var(--brand)" : "var(--disabled-foreground)"}
          className="origin-center [transform-box:fill-box] hover:scale-140 motion-safe:transition-[fill,scale] motion-safe:duration-100"
        />
      ))}
    </svg>
  );
}
