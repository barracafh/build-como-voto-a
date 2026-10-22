import { useId, type SVGProps } from "react";

// El icono de la herramienta: la silueta de un botijo de Zamora (asa de poste en
// el centro, boca y pitorro inclinados en los hombros y panza que se estrecha
// hasta una base plana). La panza lleva el sol de Atardecer (el mismo degradado
// y las mismas franjas) y la marca de voto. Asa, boca y pitorro van en
// currentColor, el color del texto de al lado. Las franjas y la marca son
// huecos: dejan ver el fondo, claro u oscuro. Es el mismo dibujo que
// src/app/icon.svg (el favicon). Decorativo: el nombre va siempre al lado.
export function Votijo(props: SVGProps<SVGSVGElement>) {
  const id = useId();
  const degradado = `votijo-color-${id}`;
  const huecos = `votijo-huecos-${id}`;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id={degradado} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd34d" />
          <stop offset="38%" stopColor="var(--brand-yellow)" />
          <stop offset="66%" stopColor="var(--brand-orange)" />
          <stop offset="100%" stopColor="var(--brand)" />
        </linearGradient>
        <mask id={huecos}>
          <rect width="24" height="24" fill="white" />
          {/* Las franjas de Atardecer y la marca de voto. */}
          <rect x="3" y="16.36" width="18" height="0.21" fill="black" />
          <rect x="3" y="17.48" width="18" height="0.35" fill="black" />
          <rect x="3" y="18.6" width="18" height="0.49" fill="black" />
          <rect x="3" y="19.72" width="18" height="0.63" fill="black" />
          <rect x="3" y="20.84" width="18" height="0.77" fill="black" />
          <path
            d="m8.8 13.6 2.2 2.2 4.2-4.2"
            fill="none"
            stroke="black"
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      <g fill="currentColor">
        {/* Asa. */}
        <path d="M10.3 9.2 10.8 3.4C10.9 2.8 11.4 2.3 12 2.3S13.1 2.8 13.2 3.4L13.7 9.2Z" />
        {/* Boca, a la izquierda, y pitorro, a la derecha. */}
        <path transform="translate(6.3 11.1) rotate(-42)" d="M-2.2 1.2L-1.4 -2.3C-1.4 -2.8 -2.1 -2.9 -2.1 -3.4Q-2.1 -4.0 -1.6 -4.0H1.6Q2.1 -4.0 2.1 -3.4C2.1 -2.9 1.4 -2.8 1.4 -2.3L2.2 1.2Z" />
        <path transform="translate(17.8 11.1) rotate(44)" d="M-1.8 1.2L-0.95 -2.3C-0.95 -2.8 -1.5 -2.9 -1.5 -3.4Q-1.5 -4.0 -1.0 -4.0H1.0Q1.5 -4.0 1.5 -3.4C1.5 -2.9 0.95 -2.8 0.95 -2.3L1.8 1.2Z" />
      </g>
      {/* Panza: el sol. */}
      <path
        d="M12 8.1C15.4 8.1 18.4 9.2 19.6 11.4 20.6 13.3 20.1 16.4 18.6 18.6 17.6 20.1 16.4 21.3 15.6 21.9 15.3 22.1 15 22.2 14.6 22.2H9.4C9 22.2 8.7 22.1 8.4 21.9 7.6 21.3 6.4 20.1 5.4 18.6 3.9 16.4 3.4 13.3 4.4 11.4 5.6 9.2 8.6 8.1 12 8.1Z"
        fill={`url(#${degradado})`}
        mask={`url(#${huecos})`}
      />
    </svg>
  );
}
