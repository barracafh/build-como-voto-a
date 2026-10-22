"use client";

import { AlignLeft, Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Fuentes } from "@/components/Fuentes";
import { Button } from "@/components/ui/button";
import { ruta } from "@/config/sitio";
import { NARRACION } from "@/datos/narracion";
import { ONDAS } from "@/datos/ondas";
import { useIdioma } from "@/i18n/cliente";

export type Pista = { id: string; titulo: string };

const VELOCIDADES = [1, 1.25, 1.5, 0.75] as const;
const minutos = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const velocidad = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 });
// Aviso entre reproductores de la página: el que empieza a sonar para a los demás.
export const EVENTO = "narracion:suena";

// Una barra compacta por narración: play redondo, la onda que se rellena al avanzar (con un
// range nativo encima para buscar con ratón o teclado), el tiempo, la transcripción con sus
// fuentes y la velocidad. Un solo <audio> para todas: al darle a otra, se para la anterior.
// Solo suena al pulsar, y nunca dos a la vez aunque haya varios reproductores en la página.
// La onda y la duración salen de src/datos/ondas.ts.
export function Reproductor({ pistas }: { pistas: readonly Pista[] }) {
  const yo = useId();
  const audio = useRef<HTMLAudioElement>(null);
  const [actual, setActual] = useState<string | null>(null);
  const [sonando, setSonando] = useState(false);
  const [tiempo, setTiempo] = useState(0);
  const [ritmo, setRitmo] = useState(0);

  // Si la pista que sonaba deja de estar en la lista (cambia la comunidad), se para.
  const ids = pistas.map((p) => p.id).join(",");
  useEffect(() => {
    if (actual && !pistas.some((p) => p.id === actual)) {
      audio.current?.pause();
      setActual(null);
      setTiempo(0);
    }
  }, [ids]);

  useEffect(() => {
    const parar = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== yo) audio.current?.pause();
    };
    window.addEventListener(EVENTO, parar);
    return () => window.removeEventListener(EVENTO, parar);
  }, [yo]);

  const tocar = (id: string) => {
    const a = audio.current!;
    if (id === actual) return sonando ? a.pause() : void a.play().catch(() => setSonando(false));
    a.src = ruta(`/audio/${id}.mp3`);
    a.playbackRate = VELOCIDADES[ritmo];
    setActual(id);
    setTiempo(0);
    a.play().catch(() => setSonando(false));
  };

  const buscar = (id: string, segundos: number) => {
    if (id !== actual) tocar(id);
    if (audio.current) audio.current.currentTime = segundos;
    setTiempo(segundos);
  };

  const cambiarRitmo = () => {
    const siguiente = (ritmo + 1) % VELOCIDADES.length;
    setRitmo(siguiente);
    if (audio.current) audio.current.playbackRate = VELOCIDADES[siguiente];
  };

  return (
    <>
      <ul className="grid gap-5">
        {pistas.map((p) => (
          <Barra
            key={p.id}
            pista={p}
            activa={p.id === actual}
            sonando={p.id === actual && sonando}
            tiempo={p.id === actual ? tiempo : 0}
            ritmo={VELOCIDADES[ritmo]}
            onTocar={() => tocar(p.id)}
            onBuscar={(s) => buscar(p.id, s)}
            onRitmo={cambiarRitmo}
          />
        ))}
      </ul>
      <audio
        ref={audio}
        preload="none"
        onPlay={() => {
          setSonando(true);
          window.dispatchEvent(new CustomEvent(EVENTO, { detail: yo }));
        }}
        onPause={() => setSonando(false)}
        onEnded={() => setSonando(false)}
        onTimeUpdate={(e) => setTiempo(e.currentTarget.currentTime)}
      />
    </>
  );
}

function Barra({
  pista,
  activa,
  sonando,
  tiempo,
  ritmo,
  onTocar,
  onBuscar,
  onRitmo,
}: {
  pista: Pista;
  activa: boolean;
  sonando: boolean;
  tiempo: number;
  ritmo: number;
  onTocar: () => void;
  onBuscar: (segundos: number) => void;
  onRitmo: () => void;
}) {
  const { t } = useIdioma();
  const id = useId();
  const [texto, setTexto] = useState(false);
  const { segundos, barras } = ONDAS[pista.id];
  const hecho = tiempo / segundos;

  return (
    <li>
      <p className="text-base font-medium">{pista.titulo}</p>
      <div className="mt-2 flex items-center gap-2 rounded-xl px-2 py-2 ring-1 ring-foreground/10 sm:gap-3 sm:px-3">
        <Button
          size="icon-lg"
          className="size-11 shrink-0 rounded-full"
          aria-label={
            sonando
              ? t("Pausa: {titulo}", { titulo: pista.titulo })
              : t("Escuchar: {titulo}", { titulo: pista.titulo })
          }
          onClick={onTocar}
        >
          {sonando ? <Pause className="size-5" /> : <Play className="size-5" />}
        </Button>

        <div className="relative h-10 min-w-0 flex-1 rounded-md has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50">
          {/* Dos capas iguales de barras finas: gris debajo y roja encima, recortada hasta
              donde va el audio, para que el color avance sin saltos de barra en barra. */}
          {[
            ["bg-(--disabled-foreground)/45", undefined],
            ["bg-brand", `inset(0 ${100 - (activa ? hecho : 0) * 100}% 0 0)`],
          ].map(([color, recorte]) => (
            <div
              key={color}
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-between motion-safe:transition-[clip-path] motion-safe:duration-300 motion-safe:ease-linear"
              style={{ clipPath: recorte }}
            >
              {barras.map((v, i) => (
                <span
                  key={i}
                  className={`w-0.5 shrink-0 rounded-full sm:w-[3px] ${color}`}
                  style={{ height: `${10 + v * 90}%` }}
                />
              ))}
            </div>
          ))}
          <input
            type="range"
            min={0}
            max={segundos}
            step={0.5}
            value={tiempo}
            onChange={(e) => onBuscar(Number(e.target.value))}
            aria-label={t("Posición en {titulo}", { titulo: pista.titulo })}
            aria-valuetext={`${minutos(tiempo)} / ${minutos(segundos)}`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>

        <span className="w-10 shrink-0 text-right font-mono text-sm tabular-nums">
          {minutos(activa ? tiempo : segundos)}
        </span>
        <Button
          variant="ghost"
          size="icon-lg"
          className="shrink-0"
          aria-label={t("Transcripción")}
          aria-expanded={texto}
          aria-controls={`${id}-texto`}
          onClick={() => setTexto((v) => !v)}
        >
          <AlignLeft />
        </Button>
        <Button
          variant="ghost"
          className="hidden h-9 w-12 shrink-0 font-mono tabular-nums sm:inline-flex"
          aria-label={t("Velocidad: {v}×", { v: velocidad.format(ritmo) })}
          onClick={onRitmo}
        >
          {velocidad.format(ritmo)}×
        </Button>
      </div>
      {texto && (
        <div id={`${id}-texto`} className="mt-3 [&>*+*]:mt-4">
          <p className="text-base">{NARRACION[pista.id].texto}</p>
          <Fuentes fuentes={NARRACION[pista.id].fuentes} />
        </div>
      )}
    </li>
  );
}
