"use client";

import { Maximize2, Minimize2, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Fuentes } from "@/components/Fuentes";
import { Button } from "@/components/ui/button";
import { ruta } from "@/config/sitio";
import { CORTES_POR_CCAA } from "@/datos/cortes-29n";
import { MAPA_ALTO, MAPA_ANCHO, REGIONES } from "@/datos/mapa-espana";
import { NARRACION } from "@/datos/narracion";
import { CargandoSala } from "./CargandoSala";
import { Hemiciclo } from "./Hemiciclo";
import { useIdioma } from "@/i18n/cliente";

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

// Mapa de Barraca.pen y, a su lado, el hemiciclo con los diputados de la comunidad
// señalada; debajo del mapa, lo que suma en el Congreso y en el Senado el 29N. Pasar
// por una comunidad la muestra; pulsarla la deja fijada hasta pulsarla otra vez. Sin
// comunidad, todo en gris. Funciona con ratón, teclado y toque. «Ver en 3D» abre el
// mismo hemiciclo en 3D a pantalla completa, con el mapa flotando encima; allí solo el
// clic mueve los escaños y la cámara, que enfoca a la comunidad fijada.
export function MapaCortes() {
  const { t } = useIdioma();
  const [fijada, setFijada] = useState<string | null>(null);
  const [encima, setEncima] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  // En 3D, el panel flotante se puede minimizar a una barra para ver la sala entera.
  const [minimizado, setMinimizado] = useState(false);
  const dialogo = useRef<HTMLDialogElement>(null);
  // Narración de la vista 3D: suena solo al pulsar, con su texto y fuentes a la vista.
  const audio = useRef<HTMLAudioElement>(null);
  const [narrando, setNarrando] = useState<string | null>(null);
  const [sonando, setSonando] = useState(false);
  const activa = encima ?? fijada;
  const datos = activa ? CORTES_POR_CCAA[activa] : TOTAL;
  // Bloque [desde, hasta) del hemiciclo y su descripción para una comunidad (o ninguna).
  const hemiciclo = (ccaa: string | null) => {
    if (!ccaa) return { desde: 0, hasta: 0, etiqueta: t("Hemiciclo de 350 escaños") };
    const { diputados, nombre } = CORTES_POR_CCAA[ccaa];
    const desde = CODIGOS.slice(0, CODIGOS.indexOf(ccaa)).reduce((s, c) => s + CORTES_POR_CCAA[c].diputados, 0);
    const etiqueta = t("Hemiciclo de 350 escaños con los {n} de {nombre} en rojo", { n: diputados, nombre });
    return { desde, hasta: desde + diputados, etiqueta };
  };

  useEffect(() => {
    if (abierto) dialogo.current?.showModal();
  }, [abierto]);

  // Cada botón empieza su narración. Si ya suena una, cambiar de comunidad (mapa o
  // anterior/siguiente) pasa a narrar la nueva.
  const narrar = (id: string) => {
    const a = audio.current!;
    a.src = ruta(`/audio/${id}.mp3`);
    a.play().catch(() => setSonando(false));
    setNarrando(id);
  };

  const elegir = (ccaa: string | null) => {
    setFijada(ccaa);
    setEncima(null);
    if (ccaa && sonando) narrar(`ccaa-${ccaa}`);
  };

  const fijar = (ccaa: string) => elegir(fijada === ccaa ? null : ccaa);

  // Recorre las comunidades en orden de código, dando la vuelta al llegar al final.
  const paso = (d: 1 | -1) => {
    const i = fijada ? CODIGOS.indexOf(fijada) : d > 0 ? -1 : 0;
    elegir(CODIGOS[(i + d + CODIGOS.length) % CODIGOS.length]);
  };

  // Sin narración aún, empieza la de lo que se ve; si hay una, la pausa o la reanuda.
  const alternar = () => {
    const a = audio.current!;
    if (!narrando) narrar(fijada ? `ccaa-${fijada}` : "intro");
    else if (a.paused) a.play().catch(() => setSonando(false));
    else a.pause();
  };

  const narraciones = [
    [fijada ? `ccaa-${fijada}` : "intro", fijada ? `Escuchar ${CORTES_POR_CCAA[fijada].nombre}` : "Escuchar"],
    ["reparto", "¿Cómo se reparten?"],
    ["senado", "¿Y el Senado?"],
  ] as const;

  const ficha = (
    <>
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
          {activa ? t("Comunidad autónoma") : t("Total · pulsa una comunidad")}
        </p>
        <p className="mt-1 text-lg leading-tight font-medium">{datos.nombre}</p>
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
      </div>
    </>
  );

  return (
    <div className="grid items-center gap-8 md:grid-cols-2">
      <div>{ficha}</div>

      <div className="relative">
        <Hemiciclo {...hemiciclo(activa)} />
        <Button variant="outline" className="absolute top-0 right-0" onClick={() => setAbierto(true)}>
          {t("Ver en 3D")}
        </Button>
      </div>

      <dialog
        ref={dialogo}
        aria-label={t("Hemiciclo en 3D")}
        onClose={() => {
          audio.current?.pause();
          setAbierto(false);
          // Al volver a abrir, empieza de cero: sin comunidad ni narración.
          setFijada(null);
          setEncima(null);
          setNarrando(null);
          setMinimizado(false);
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none bg-primary p-0 text-primary-foreground backdrop:bg-primary"
      >
        {abierto && (
          <div className="relative h-full">
            <div className="absolute inset-0">
              <Hemiciclo3D {...hemiciclo(fijada)} />
            </div>
            <div
              className={`absolute inset-x-2 bottom-2 flex flex-col gap-2 text-foreground md:inset-x-auto md:right-4 md:bottom-auto md:w-[340px] ${
                minimizado ? "md:top-4" : "md:top-1/2 md:-translate-y-1/2"
              }`}
            >
              <div
                role="toolbar"
                aria-label={t("Controles")}
                className={`flex items-center gap-1 rounded-xl p-2 ${VIDRIO}`}
              >
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
                {ficha}
                <div className="mt-6 border-t border-border pt-4">
                  <div className="flex flex-wrap gap-2">
                    {narraciones.map(([id, texto]) => (
                      <Button key={id} variant="outline" onClick={() => narrar(id)}>
                        {texto}
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
            <div className="absolute top-4 left-4 text-foreground">
              <Button variant="outline" className={VIDRIO} onClick={() => dialogo.current?.close()}>
                {t("Cerrar")}
              </Button>
            </div>
          </div>
        )}
      </dialog>
      <audio ref={audio} onPlay={() => setSonando(true)} onPause={() => setSonando(false)} />
    </div>
  );
}
