import type { SVGProps } from "react";

// Silueta simplificada de la España peninsular y Mallorca, con el mismo trazo
// que los iconos de lucide-react para que combine con ellos.
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
      <path d="M1.2 4.6 3.4 3.2 7.2 3.4 14.1 3.9 18.4 5.2 22.7 6.2 22.7 7.3 18.7 10.1 16.6 12.8 17.5 14.4 15.8 17.2 13.5 19.2 9.6 19.2 7.5 20.8 6.3 19.7 4.4 18.1 5.1 15.8 4.4 12.6 5.3 9.4 6.2 7.8 1.9 7.3Z" />
      <circle cx="22.2" cy="12.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
