"use client";

import { useRef, useState } from "react";
import { Captions, CaptionsOff, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ruta } from "@/config/sitio";
import { useIdioma } from "@/i18n/cliente";
import { cn } from "@/lib/utils";

const VELOCIDADES = [1, 1.5, 2];

// Botón de la cabecera que abre el vídeo de presentación (scripts/video.ts) en un diálogo nativo.
export function VideoPresentacion() {
  const { idioma, t } = useIdioma();
  const dialogo = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [ritmo, setRitmo] = useState(1);
  const [subtitulos, setSubtitulos] = useState(true);
  const formato = new Intl.NumberFormat(idioma);

  const elegir = (v: number) => {
    setRitmo(v);
    if (video.current) video.current.playbackRate = v;
  };

  const alternarSubtitulos = () => {
    const pista = video.current?.textTracks[0];
    if (pista) pista.mode = subtitulos ? "hidden" : "showing";
    setSubtitulos(!subtitulos);
  };

  // Lo abre la persona con un clic, así que el navegador deja arrancar con sonido.
  const abrir = () => {
    dialogo.current?.showModal();
    video.current?.play().catch(() => {});
  };

  return (
    <>
      <Button variant="outline" size="lg" className="rounded-full px-3" onClick={abrir}>
        <Play data-icon="inline-start" aria-hidden="true" />
        {t("Ver vídeo")}
      </Button>
      <dialog
        ref={dialogo}
        aria-labelledby="video-titulo"
        onClose={() => video.current?.pause()}
        // Cierra al pulsar fuera de la tarjeta, sobre el fondo.
        onClick={(e) => e.target === e.currentTarget && dialogo.current?.close()}
        className="m-auto w-[min(960px,calc(100vw-32px))] max-w-none rounded-xl bg-background p-0 text-foreground shadow-xl backdrop:bg-foreground/60"
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <h2 id="video-titulo" className="text-base font-medium">
            {t("Cómo funciona la herramienta")}
          </h2>
          <Button variant="outline" size="icon" aria-label={t("Cerrar")} onClick={() => dialogo.current?.close()}>
            <X aria-hidden="true" />
          </Button>
        </div>
        <video
          ref={video}
          controls
          preload="none"
          playsInline
          src={ruta("/video/como-voto.mp4")}
          onLoadedMetadata={(e) => (e.currentTarget.playbackRate = ritmo)}
          onRateChange={(e) => setRitmo(e.currentTarget.playbackRate)}
          className="aspect-video w-full bg-foreground"
        >
          <track kind="captions" src={ruta("/video/como-voto.vtt")} srcLang="es" label="Castellano" default />
        </video>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div role="group" aria-label={t("Velocidad")} className="flex items-center gap-2">
            <span aria-hidden="true" className="text-sm text-(--text-secondary)">
              {t("Velocidad")}
            </span>
            {VELOCIDADES.map((v) => (
              <Button
                key={v}
                variant="outline"
                size="sm"
                aria-pressed={ritmo === v}
                onClick={() => elegir(v)}
                className={cn("font-mono", ritmo === v && "bg-muted")}
              >
                {formato.format(v)}×
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" aria-pressed={subtitulos} onClick={alternarSubtitulos}>
            {subtitulos ? (
              <Captions data-icon="inline-start" aria-hidden="true" />
            ) : (
              <CaptionsOff data-icon="inline-start" aria-hidden="true" />
            )}
            {t("Subtítulos")}
          </Button>
        </div>
      </dialog>
    </>
  );
}
