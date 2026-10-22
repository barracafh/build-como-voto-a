import { useId, type SVGProps } from "react";

// El icono de la herramienta: un botijo de frente cuya panza es el sol de
// Atardecer (el mismo degradado y las mismas franjas). Asa, boca, pitorro y pie
// van en currentColor, el color del texto de al lado. Las franjas son huecos:
// dejan ver el fondo, claro u oscuro. Es el mismo dibujo que src/app/icon.svg
// (el favicon). Decorativo: el nombre va siempre al lado.
export function Votijo(props: SVGProps<SVGSVGElement>) {
  const id = useId();
  const degradado = `votijo-color-${id}`;
  const franjas = `votijo-franjas-${id}`;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id={degradado} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd34d" />
          <stop offset="38%" stopColor="var(--brand-yellow)" />
          <stop offset="66%" stopColor="var(--brand-orange)" />
          <stop offset="100%" stopColor="var(--brand)" />
        </linearGradient>
        <mask id={franjas}>
          <rect width="24" height="24" fill="white" />
          <rect x="5" y="15.84" width="14" height="0.21" fill="black" />
          <rect x="5" y="16.95" width="14" height="0.35" fill="black" />
          <rect x="5" y="18.05" width="14" height="0.48" fill="black" />
          <rect x="5" y="19.15" width="14" height="0.62" fill="black" />
          <rect x="5" y="20.26" width="14" height="0.76" fill="black" />
        </mask>
      </defs>
      {/* Boca a la izquierda, pitorro a la derecha y pie. El trazo fino redondea las esquinas. */}
      <g fill="currentColor" stroke="currentColor" strokeWidth={0.6} strokeLinejoin="round">
        <path d="M6.6 10.4 6.4 8.4C5.8 8.1 5.2 7.5 5.2 6.6h3.7c0 .9-.5 1.5-1.1 1.8l.2 1.4z" />
        <path d="M15.4 9.1C17 8.9 18.4 8.2 19.4 6.9a.6.6 0 0 1 1 .6c-.6 1.5-1.4 2.8-2.4 3.8z" />
        <path d="M10 21.2h4l.9 1.4H9.1z" />
      </g>
      {/* Asa, alta y en el centro. */}
      <path d="M10.3 8.4V4.6a1.7 1.7 0 0 1 3.4 0v3.8" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
      {/* Panza: el sol. */}
      <circle cx="12" cy="14.6" r="6.9" fill={`url(#${degradado})`} mask={`url(#${franjas})`} />
    </svg>
  );
}
