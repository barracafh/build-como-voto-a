"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CORTES_POR_CCAA } from "@/datos/cortes-29n";
import { MAPA_ALTO, MAPA_ANCHO, REGIONES } from "@/datos/mapa-espana";
import { Hemiciclo } from "./Hemiciclo";

const Hemiciclo3D = dynamic(() => import("./Hemiciclo3D"), { ssr: false });

// Agrupa los trazados del mapa por comunidad: una isla o un enclave resalta toda su comunidad.
const COMUNIDADES = Object.entries(Object.groupBy(REGIONES, (r) => r.ccaa));

const TOTAL = { nombre: "España", diputados: 350, senadores: 209 };

// Cada comunidad ocupa un bloque contiguo del hemiciclo, en orden de código.
const CODIGOS = Object.keys(CORTES_POR_CCAA).sort();

// Mapa de Barraca.pen y, a su lado, el hemiciclo con los diputados de la comunidad
// señalada; debajo del mapa, lo que suma en el Congreso y en el Senado el 29N. Pasar
// por una comunidad la muestra; pulsarla la deja fijada hasta pulsarla otra vez. Sin
// comunidad, todo en gris. Funciona con ratón, teclado y toque. «Ver en 3D» abre el
// mismo hemiciclo en 3D a pantalla completa, con el mapa flotando a la derecha.
export function MapaCortes() {
  const [fijada, setFijada] = useState<string | null>(null);
  const [encima, setEncima] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const dialogo = useRef<HTMLDialogElement>(null);
  const activa = encima ?? fijada;
  const datos = activa ? CORTES_POR_CCAA[activa] : TOTAL;
  const desde = activa
    ? CODIGOS.slice(0, CODIGOS.indexOf(activa)).reduce((s, c) => s + CORTES_POR_CCAA[c].diputados, 0)
    : 0;
  const hasta = activa ? desde + datos.diputados : 0;
  const etiqueta = activa
    ? `Hemiciclo de 350 escaños con los ${datos.diputados} de ${datos.nombre} en rojo`
    : "Hemiciclo de 350 escaños";

  useEffect(() => {
    if (abierto) dialogo.current?.showModal();
  }, [abierto]);

  const fijar = (ccaa: string) => {
    setFijada((f) => (f === ccaa ? null : ccaa));
    setEncima(null);
  };

  const ficha = (
    <>
      <svg
        viewBox={`0 0 ${MAPA_ANCHO} ${MAPA_ALTO}`}
        role="group"
        aria-label="Mapa de España por comunidades autónomas"
        className="block h-auto w-full"
        onMouseLeave={() => setEncima(null)}
      >
        {COMUNIDADES.map(([ccaa, regiones]) => (
          <g
            key={ccaa}
            tabIndex={0}
            role="button"
            aria-label={CORTES_POR_CCAA[ccaa].nombre}
            aria-pressed={fijada === ccaa}
            onMouseEnter={() => setEncima(ccaa)}
            onFocus={() => setEncima(ccaa)}
            onBlur={() => setEncima(null)}
            onClick={() => fijar(ccaa)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fijar(ccaa);
              }
            }}
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

      <div aria-live="polite" className="mt-6 border-t border-border pt-4">
        <p className="font-mono text-xs tracking-[0.06em] text-(--text-secondary) uppercase">
          {activa ? "Comunidad autónoma" : "Total · pulsa una comunidad"}
        </p>
        <p className="mt-1 text-lg leading-tight font-medium">{datos.nombre}</p>
        <dl className="mt-4 grid grid-cols-2 gap-4">
          {(
            [
              ["Diputados", datos.diputados],
              ["Senadores", datos.senadores],
            ] as const
          ).map(([nombre, valor]) => (
            <div key={nombre}>
              <dt className="text-base text-(--text-secondary)">{nombre}</dt>
              <dd className="font-heading text-4xl leading-none tabular-nums">{valor}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );

  return (
    <div className="grid items-center gap-8 md:grid-cols-2">
      <div>{ficha}</div>

      <div className="relative">
        <Hemiciclo desde={desde} hasta={hasta} etiqueta={etiqueta} />
        <Button variant="outline" className="absolute top-0 right-0" onClick={() => setAbierto(true)}>
          Ver en 3D
        </Button>
      </div>

      <dialog
        ref={dialogo}
        aria-label="Hemiciclo en 3D"
        onClose={() => setAbierto(false)}
        className="fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none bg-primary p-0 text-primary-foreground backdrop:bg-primary"
      >
        {abierto && (
          <div className="flex h-full flex-col md:block">
            <div className="min-h-0 flex-1 md:absolute md:inset-y-0 md:left-0 md:right-[min(380px,40vw)]">
              <Hemiciclo3D desde={desde} hasta={hasta} etiqueta={etiqueta} />
            </div>
            <div className="max-h-[45dvh] overflow-y-auto rounded-t-xl bg-background p-5 text-foreground md:absolute md:top-1/2 md:right-4 md:max-h-[calc(100dvh-2rem)] md:w-[min(340px,calc(40vw-2rem))] md:-translate-y-1/2 md:rounded-xl md:shadow-(--shadow-overlay)">
              {ficha}
            </div>
            <Button
              variant="outline"
              className="absolute top-4 left-4 text-foreground"
              onClick={() => dialogo.current?.close()}
            >
              Cerrar
            </Button>
          </div>
        )}
      </dialog>
    </div>
  );
}
