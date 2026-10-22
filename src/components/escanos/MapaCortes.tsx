"use client";

import { useState } from "react";
import { CORTES_POR_CCAA } from "@/datos/cortes-29n";
import { MAPA_ALTO, MAPA_ANCHO, REGIONES } from "@/datos/mapa-espana";

// Agrupa los trazados del mapa por comunidad: una isla o un enclave resalta toda su comunidad.
const COMUNIDADES = Object.entries(Object.groupBy(REGIONES, (r) => r.ccaa));

const TOTAL = { nombre: "España", diputados: 350, senadores: 209 };

// Mapa de Barraca.pen con un indicador a la derecha: la comunidad señalada y lo que suma
// en el Congreso y en el Senado el 29N. Funciona con ratón, teclado y toque.
export function MapaCortes() {
  const [activa, setActiva] = useState<string | null>(null);
  const datos = activa ? CORTES_POR_CCAA[activa] : TOTAL;

  return (
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_200px]">
      <svg
        viewBox={`0 0 ${MAPA_ANCHO} ${MAPA_ALTO}`}
        role="group"
        aria-label="Mapa de España por comunidades autónomas"
        className="block h-auto w-full"
        onMouseLeave={() => setActiva(null)}
      >
        {COMUNIDADES.map(([ccaa, regiones]) => (
          <g
            key={ccaa}
            tabIndex={0}
            role="button"
            aria-label={CORTES_POR_CCAA[ccaa].nombre}
            aria-pressed={activa === ccaa}
            onMouseEnter={() => setActiva(ccaa)}
            onFocus={() => setActiva(ccaa)}
            onBlur={() => setActiva(null)}
            onClick={() => setActiva(ccaa)}
            className={`cursor-pointer outline-none focus-visible:[&>path]:stroke-[3] motion-safe:[&>path]:transition-colors ${
              activa === ccaa ? "fill-brand" : "fill-border"
            }`}
          >
            {regiones!.map((r) => (
              <path
                key={r.nombre}
                transform={r.transform}
                d={r.d}
                vectorEffect="non-scaling-stroke"
                className="stroke-primary [stroke-linejoin:round] [stroke-width:1.5]"
              />
            ))}
          </g>
        ))}
      </svg>

      <div aria-live="polite" className="border-t border-border pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-6">
        <p className="font-mono text-xs tracking-[0.06em] text-(--text-secondary) uppercase">
          {activa ? "Comunidad autónoma" : "Total · pasa por una comunidad"}
        </p>
        <p className="mt-2 text-lg leading-tight font-medium">{datos.nombre}</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-1">
          {(
            [
              ["Diputados", datos.diputados],
              ["Senadores", datos.senadores],
            ] as const
          ).map(([etiqueta, valor]) => (
            <div key={etiqueta}>
              <dt className="text-base text-(--text-secondary)">{etiqueta}</dt>
              <dd className="font-heading text-5xl leading-none tabular-nums">{valor}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
