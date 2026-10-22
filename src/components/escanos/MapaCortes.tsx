"use client";

import { Maximize2, Minimize2, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Fuentes } from "@/components/Fuentes";
import { Button } from "@/components/ui/button";
import { ruta } from "@/config/sitio";
import { NARRACION } from "@/datos/narracion";
import { CORTES_POR_CCAA } from "@/datos/cortes-29n";
import { MAPA_ALTO, MAPA_ANCHO, REGIONES } from "@/datos/mapa-espana";
import { useIdioma } from "@/i18n/cliente";
import { ESPANA, agrupar } from "@/lib/ponderacion";
import { type Bloques, Hemiciclo } from "./Hemiciclo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CargandoSala } from "./CargandoSala";
import { EVENTO, type Pista, Reproductor } from "./Reproductor";
import { GraficoPeso, Indicador, electoresPorDiputado, fmt } from "./Ponderacion";

const Hemiciclo3D = dynamic(() => import("./Hemiciclo3D"), {
  ssr: false,
  loading: () => (
    <div className="relative h-full w-full">
      <CargandoSala />
    </div>
  ),
});

// Agrupa los trazados del mapa por comunidad: una isla o un enclave resalta toda su comunidad.
const COMUNIDADES = Object.entries(Object.groupBy(REGIONES, (r) => r.ccaa));

// Frosted glass for what floats over the 3D scene: existing tokens with opacity, solid
// again for people who ask for reduced transparency.
const VIDRIO =
  "border border-border/60 bg-background/75 shadow-(--shadow-overlay) backdrop-blur-xl backdrop-saturate-150 [@media(prefers-reduced-transparency:reduce)]:bg-background";

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
// en 3D a pantalla completa, inmersivo, con una barra de control y el mapa flotando
// encima; allí solo el clic mueve los escaños y la cámara. Bajo el hemiciclo, el
// reproductor de las narraciones. Al final, el peso de las 52 circunscripciones, con las
// de las comunidades señaladas en rojo.
export function MapaCortes() {
  const { t } = useIdioma();
  const [fijadas, setFijadas] = useState<readonly string[]>([]);
  const [encima, setEncima] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const dialogo = useRef<HTMLDialogElement>(null);
  // En 3D, el panel del mapa se puede minimizar para ver la sala entera.
  const [minimizado, setMinimizado] = useState(false);
  // Narración de la vista 3D: suena solo al pulsar, con su texto y fuentes a la vista.
  const audio = useRef<HTMLAudioElement>(null);
  const [narrando, setNarrando] = useState<string | null>(null);
  const [sonando, setSonando] = useState(false);
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
  const describir = (lista: readonly string[]) => {
    if (!lista.length) return t("Hemiciclo de 350 escaños");
    const cs = lista.map((c) => CORTES_POR_CCAA[c]);
    return t("Hemiciclo de 350 escaños con los {n} de {nombre} en rojo", {
      n: cs.reduce((s, c) => s + c.diputados, 0),
      nombre: cs.map((c) => c.nombre).join(" · "),
    });
  };
  const etiqueta = describir(activas);

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

  const narrar = (id: string) => {
    const a = audio.current!;
    a.src = ruta(`/audio/${id}.mp3`);
    a.play().catch(() => setSonando(false));
    setNarrando(id);
  };

  // Sin narración aún, empieza la primera pista; si hay una, la pausa o la reanuda.
  const alternar = () => {
    const a = audio.current!;
    if (!narrando) narrar(pistas[0].id);
    else if (a.paused) a.play().catch(() => setSonando(false));
    else a.pause();
  };

  // Si suena la narración de la comunidad (o la introducción) y cambia la selección, pasa
  // a narrar la nueva primera pista.
  const primera = pistas[0].id;
  useEffect(() => {
    if (sonando && narrando !== primera && (narrando === "intro" || narrando?.startsWith("ccaa-")))
      narrar(primera);
  }, [primera]);

  // Nunca dos narraciones a la vez: el reproductor de la página y el del 3D se avisan.
  useEffect(() => {
    const parar = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== "3d") audio.current?.pause();
    };
    window.addEventListener(EVENTO, parar);
    return () => window.removeEventListener(EVENTO, parar);
  }, []);

  // Anterior/siguiente: deja marcada solo la comunidad vecina, en orden de código.
  const paso = (d: 1 | -1) => {
    const ultima = fijadas.at(-1);
    const i = ultima ? CODIGOS.indexOf(ultima) : d > 0 ? -1 : 0;
    setFijadas([CODIGOS[(i + d + CODIGOS.length) % CODIGOS.length]]);
    setEncima(null);
  };

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
          onClose={() => {
            audio.current?.pause();
            setAbierto(false);
            // Al volver a abrir, empieza de cero: sin comunidades ni narración.
            setFijadas([]);
            setEncima(null);
            setNarrando(null);
            setMinimizado(false);
          }}
          className="fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none bg-primary p-0 text-primary-foreground backdrop:bg-primary"
        >
          {abierto && (
            <div className="relative h-full">
              <div className="absolute inset-0">
                <Hemiciclo3D bloques={fijadas.map((c) => BLOQUE[c])} etiqueta={describir(fijadas)} />
              </div>
              <div
                className={`absolute inset-x-2 bottom-2 flex flex-col gap-2 text-foreground md:inset-x-auto md:right-4 md:bottom-auto md:w-[340px] ${
                  minimizado ? "md:top-4" : "md:top-1/2 md:-translate-y-1/2"
                }`}
              >
                <div role="toolbar" aria-label={t("Controles")} className={`flex items-center gap-1 rounded-xl p-2 ${VIDRIO}`}>
                  <Button variant="outline" size="icon" aria-label={t("Comunidad anterior")} onClick={() => paso(-1)}>
                    <SkipBack />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={sonando ? t("Pausar narración") : t("Reproducir narración")}
                    onClick={alternar}
                  >
                    {sonando ? <Pause /> : <Play />}
                  </Button>
                  <Button variant="outline" size="icon" aria-label={t("Comunidad siguiente")} onClick={() => paso(1)}>
                    <SkipForward />
                  </Button>
                  <p className="min-w-0 flex-1 truncate px-2 font-mono text-xs tracking-[0.06em] text-(--text-secondary) uppercase">
                    {minimizado && datos.nombre}
                  </p>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={minimizado ? t("Mostrar panel") : t("Minimizar panel")}
                    aria-expanded={!minimizado}
                    aria-controls="panel-3d"
                    onClick={() => setMinimizado((m) => !m)}
                  >
                    {minimizado ? <Maximize2 /> : <Minimize2 />}
                  </Button>
                </div>
                <div
                  id="panel-3d"
                  hidden={minimizado}
                  className={`max-h-[calc(45dvh-3.5rem)] overflow-y-auto rounded-xl p-5 md:max-h-[calc(100dvh-6rem)] ${VIDRIO}`}
                >
                  {mapa}
                  <div className="mt-6">{leyenda}</div>
                  <div className="mt-6 border-t border-border pt-4">
                    <div className="flex flex-wrap gap-2">
                      {pistas.map((p) => (
                        <Button key={p.id} variant="outline" onClick={() => narrar(p.id)}>
                          {p.titulo}
                        </Button>
                      ))}
                    </div>
                    {narrando && (
                      <div className="mt-4 [&>*+*]:mt-4">
                        <p className="text-base">{NARRACION[narrando].texto}</p>
                        <Fuentes fuentes={NARRACION[narrando].fuentes} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="outline" className={`absolute top-4 left-4 text-foreground `} onClick={() => dialogo.current?.close()}>
                {t("Cerrar")}
              </Button>
            </div>
          )}
          <audio
            ref={audio}
            onPlay={() => {
              setSonando(true);
              window.dispatchEvent(new CustomEvent(EVENTO, { detail: "3d" }));
            }}
            onPause={() => setSonando(false)}
            onEnded={() => setSonando(false)}
          />
        </dialog>
      </div>
      <GraficoPeso resaltadas={provincias.map((p) => p.nombre)} />
    </>
  );
}
