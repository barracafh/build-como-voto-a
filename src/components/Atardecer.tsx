import { useId } from "react";
import { cn } from "@/lib/utils";

// Franjas que cortan el sol por abajo: [y, alto] en un sol de 200 de diámetro.
const franjas = [
  [118, 3],
  [134, 5],
  [150, 7],
  [166, 9],
  [182, 11],
];

// Un sol de cartel: amarillo arriba, naranja en medio y el rojo de Sol solo en
// las franjas de abajo, sobre una línea de horizonte. Sube al cargar la página
// (con motion-safe). Es decorativo. Con `logo`, el sol entero, quieto y sin
// horizonte (cabecera y pie).
export function Atardecer({ className, logo = false }: { className?: string; logo?: boolean }) {
  const id = useId();
  const degradado = `atardecer-color-${id}`;
  const recorte = `atardecer-sol-${id}`;

  return (
    <div aria-hidden="true" className={cn("relative", className)}>
      <div className={cn("overflow-hidden", logo && "size-full")}>
        {/* Se corta antes del borde de abajo: el sol está saliendo. */}
        <svg
          viewBox={logo ? "0 0 200 200" : "0 0 200 186"}
          className={cn(
            // size-full en el logo: dentro de un Button, si no, lo encoge a size-4.
            logo ? "block size-full" : "block w-full",
            !logo && "motion-safe:animate-[amanecer_1400ms_var(--ease-brand)_both]",
          )}
        >
          <defs>
            <linearGradient id={degradado} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffd34d" />
              <stop offset="38%" stopColor="var(--brand-yellow)" />
              <stop offset="66%" stopColor="var(--brand-orange)" />
              <stop offset="100%" stopColor="var(--brand)" />
            </linearGradient>
            <clipPath id={recorte}>
              <circle cx="100" cy="100" r="100" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${recorte})`}>
            <rect width="200" height="200" fill={`url(#${degradado})`} />
            {franjas.map(([y, alto]) => (
              <rect key={y} y={y} width="200" height={alto} fill="var(--background)" />
            ))}
          </g>
        </svg>
      </div>
      {!logo && <div className="h-px bg-foreground" />}
    </div>
  );
}
