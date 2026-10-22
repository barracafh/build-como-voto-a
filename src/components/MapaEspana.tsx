import type { SVGProps } from "react";

// Silueta simplificada de la España peninsular, Mallorca y Canarias, con el
// mismo trazo que los iconos de lucide-react para que combine con ellos.
export function MapaEspana(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M1.2 3.2 3.4 1.8 7.2 2 14.1 2.5 18.4 3.8 22.7 4.8 22.7 5.9 18.7 8.7 16.6 11.4 17.5 13 15.8 15.8 13.5 17.8 9.6 17.8 7.5 19.4 6.3 18.3 4.4 16.7 5.1 14.4 4.4 11.2 5.3 8 6.2 6.4 1.9 5.9Z" />
      <circle cx="22.2" cy="11.2" r="0.9" fill="currentColor" stroke="none" />
      {/* Canarias, abajo a la izquierda como en los mapas oficiales. */}
      <g fill="currentColor" stroke="none">
        <circle cx="1.6" cy="22.4" r="1" />
        <circle cx="4.4" cy="22.9" r="1.3" />
        <circle cx="7.4" cy="22.6" r="1.2" />
        <circle cx="10.2" cy="21.9" r="1" />
      </g>
    </svg>
  );
}
