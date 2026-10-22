"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CORTES_POR_CCAA } from "@/datos/cortes-29n";
import { MAPA_ALTO, MAPA_ANCHO, REGIONES } from "@/datos/mapa-espana";
import { useIdioma } from "@/i18n/cliente";
import { ESPANA, agrupar } from "@/lib/ponderacion";
import { type Bloques, Hemiciclo } from "./Hemiciclo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Pista, Reproductor } from "./Reproductor";
import { GraficoPeso, Indicador, electoresPorDiputado, fmt } from "./Ponderacion";

const Hemiciclo3D = dynamic(() => import("./Hemiciclo3D"), { ssr: false });

// Agrupa los trazados del mapa por comunidad: una isla o un enclave resalta toda su comunidad.
const COMUNIDADES = Object.entries(Object.groupBy(REGIONES, (r) => r.ccaa));

const TOTAL = { nombre: "España", diputados: 350, senadores: 209 };

// Cada comunidad ocupa un bloque contiguo del hemiciclo, en orden de código.
const CODIGOS = Object.keys(CORTES_POR_CCAA).sort();
const BLOQUE: Record<string, readonly [number, number]> = Object.fromEntries(
  CODIGOS.map((c, i) => {
    const desde = CODIGOS.slice(0, i).reduce((s, d) => s + CORTES_POR_CCAA[d].diputados, 0);
    return [c, [desde, desde + CORTES_POR_CCAA[c].diputados]];
  }),
);

// Una columna: arriba, el hemiciclo con los diputados de las comunidades señaladas;
// debajo, el mapa de Barraca.pen; luego, lo que suman en el Congreso y en el Senado el
// 29N, sus electores frente a la media de España y sus provincias en tarjetas con scroll
// horizontal. Pulsar una comunidad la deja marcada y se pueden marcar varias; pulsarla
// otra vez la quita. Pasar por encima añade la comunidad mientras dura. Sin comunidad,
// todo en gris. Funciona con ratón, teclado y toque. «Ver en 3D» abre el mismo hemiciclo
// en 3D a pantalla completa, con el mapa flotando a la derecha. Bajo el hemiciclo, el
// reproductor de las narraciones. Al final, el peso de las 52 circunscripciones, con las
// de las comunidades señaladas en rojo.
export function MapaCortes() {
  const { t } = useIdioma();
  const [fijadas, setFijadas] = useState<readonly string[]>([]);
  const [encima, setEncima] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const dialogo = useRef<HTMLDialogElement>(null);
  const activas = encima && !fijadas.includes(encima) ? [...fijadas, encima] : fijadas;
  const cortes = activas.map((c) => CORTES_POR_CCAA[c]);
  const datos = activas.length
    ? {
        nombre: cortes.map((c) => c.nombre).join(" · "),
        diputados: cortes.reduce((s, c) => s + c.diputados, 0),
        senadores: cortes.reduce((s, c) => s + c.senadores, 0),
      }
    : TOTAL;
  const grupo = activas.length ? agrupar(activas) : null;
  const censo = grupo ?? ESPANA;
  const provincias = grupo?.provincias ?? [];
  const bloques: Bloques = activas.map((c) => BLOQUE[c]);
  const etiqueta = activas.length
    ? t("Hemiciclo de 350 escaños con los {n} de {nombre} en rojo", {
        n: datos.diputados,
        nombre: datos.nombre,
      })
    : t("Hemiciclo de 350 escaños");

  useEffect(() => {
    if (abierto) dialogo.current?.showModal();
  }, [abierto]);

  const fijar = (ccaa: string) => {
    setFijadas((f) => (f.includes(ccaa) ? f.filter((c) => c !== ccaa) : [...f, ccaa]));
    setEncima(null);
  };

  // Narraciones: con una sola comunidad marcada, la primera pista es esa; si no, la introducción.
  const unica = fijadas.length === 1 ? fijadas[0] : null;
  const pistas: Pista[] = [
    unica
      ? { id: `ccaa-${unica}`, titulo: CORTES_POR_CCAA[unica].nombre }
      : { id: "intro", titulo: t("Qué es el hemiciclo") },
    { id: "reparto", titulo: t("¿Cómo se reparten?") },
    { id: "senado", titulo: t("¿Y el Senado?") },
  ];

  const mapa = (
    <svg
      viewBox={`0 0 ${MAPA_ANCHO} ${MAPA_ALTO}`}
      role="group"
      aria-label={t("Mapa de España por comunidades autónomas")}
      className="block h-auto w-full"
      onMouseLeave={() => setEncima(null)}
    >
      {COMUNIDADES.map(([ccaa, regiones]) => (
        <g
          key={ccaa}
          tabIndex={0}
          role="button"
          aria-label={CORTES_POR_CCAA[ccaa].nombre}
          aria-pressed={fijadas.includes(ccaa)}
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
            activas.includes(ccaa) ? "fill-brand" : "fill-border"
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
  );

  const leyenda = (
    <div aria-live="polite" className="border-t border-border pt-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-[0.06em] text-(--text-secondary) uppercase">
            {activas.length === 0
              ? t("Total · pulsa una o varias comunidades")
              : activas.length === 1
                ? t("Comunidad autónoma")
                : t("{n} comunidades", { n: activas.length })}
          </p>
          <p className="mt-1 text-lg leading-tight font-medium">{datos.nombre}</p>
        </div>
        {fijadas.length > 0 && (
          <Button variant="outline" onClick={() => setFijadas([])}>
            {t("Quitar selección")}
          </Button>
        )}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4">
        {(
          [
            [t("Diputados"), datos.diputados],
            [t("Senadores"), datos.senadores],
          ] as const
        ).map(([nombre, valor]) => (
          <div key={nombre}>
            <dt className="text-base text-(--text-secondary)">{nombre}</dt>
            <dd className="font-heading text-4xl leading-none tabular-nums">{valor}</dd>
          </div>
        ))}
      </dl>
      <dl className="mt-6 grid gap-x-4 gap-y-2 text-base sm:grid-cols-[auto_minmax(0,1fr)]">
        <dt className="text-(--text-secondary)">{t("Electores")}</dt>
        <dd className="tabular-nums">{fmt.format(censo.electores)}</dd>
        <dt className="text-(--text-secondary)">{t("Por diputado")}</dt>
        <dd className="tabular-nums">{electoresPorDiputado(censo)}</dd>
        <dt className="text-(--text-secondary)">{t("Frente a la media")}</dt>
        <dd className="font-medium">{grupo ? <Indicador p={grupo} /> : t("Es la media de España")}</dd>
      </dl>
      {provincias.length > 1 && (
        <ul
          aria-label={t("Provincias de {nombre}", { nombre: datos.nombre })}
          tabIndex={0}
          className="mt-6 flex snap-x gap-3 overflow-x-auto rounded-xl pb-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {provincias.map((p) => (
            <li key={p.nombre} className="w-56 shrink-0 snap-start">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{p.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-1 text-base">
                  <p className="tabular-nums">
                    {t("{n} electores por diputado", { n: electoresPorDiputado(p) })}
                  </p>
                  <p className="text-(--text-secondary) tabular-nums">
                    {t("{d} diputados · {e} electores", {
                      d: p.diputados,
                      e: fmt.format(p.electores),
                    })}
                  </p>
                  <p className="mt-2 font-medium">
                    <Indicador p={p} />
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8">
        <div className="relative flex flex-col items-end gap-3 sm:block">
          <Hemiciclo bloques={bloques} etiqueta={etiqueta} />
          <Button variant="outline" className="-order-1 sm:absolute sm:top-0 sm:right-0" onClick={() => setAbierto(true)}>
            {t("Ver en 3D")}
          </Button>
        </div>

        <Reproductor pistas={pistas} />

        {mapa}

        {leyenda}

        <dialog
          ref={dialogo}
          aria-label={t("Hemiciclo en 3D")}
          onClose={() => setAbierto(false)}
          className="fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none bg-primary p-0 text-primary-foreground backdrop:bg-primary"
        >
          {abierto && (
            <div className="flex h-full flex-col md:block">
              <div className="min-h-0 flex-1 md:absolute md:inset-y-0 md:left-0 md:right-[min(380px,40vw)]">
                <Hemiciclo3D bloques={bloques} etiqueta={etiqueta} />
              </div>
              <div className="max-h-[45dvh] overflow-y-auto rounded-t-xl bg-background p-5 text-foreground md:absolute md:top-1/2 md:right-4 md:max-h-[calc(100dvh-2rem)] md:w-[min(340px,calc(40vw-2rem))] md:-translate-y-1/2 md:rounded-xl md:shadow-(--shadow-overlay)">
                {mapa}
                <div className="mt-6">{leyenda}</div>
              </div>
              <Button
                variant="outline"
                className="absolute top-4 left-4 text-foreground"
                onClick={() => dialogo.current?.close()}
              >
                {t("Cerrar")}
              </Button>
            </div>
          )}
        </dialog>
      </div>
      <GraficoPeso resaltadas={provincias.map((p) => p.nombre)} />
    </>
  );
}
