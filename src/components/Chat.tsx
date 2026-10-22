"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Modo, Respuesta } from "@/lib/asistente";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Fuentes } from "@/components/Fuentes";
import { Publicadas } from "@/components/Publicadas";
import { ruta } from "@/config/sitio";
import { leerParcial } from "@/lib/parcial";

type Turno = { pregunta: string; respuesta: Respuesta };

const MAXIMO = 1000;

// Encabeza cada respuesta: el sol de Sol y de dónde sale.
function Firma() {
  return (
    <p className="flex items-center gap-2 font-mono text-xs tracking-[0.08em] text-(--text-secondary) uppercase">
      <span aria-hidden="true" className="size-2.5 rounded-full bg-brand-yellow ring-4 ring-brand-yellow/25" />
      Con fuentes oficiales
    </p>
  );
}

const textos: Record<
  Modo,
  { etiqueta: string; placeholder: string; ejemplos: string[] }
> = {
  general: {
    etiqueta: "Escribe tu pregunta",
    placeholder: "Por ejemplo: ¿hasta qué hora puedo votar?",
    ejemplos: [
      "Vivo en València y el día 29 no estoy, ¿cómo voto?",
      "¿Qué documento tengo que llevar para votar?",
      "¿Tengo horas libres en el trabajo para ir a votar?",
    ],
  },
  "correo-aqui": {
    etiqueta: "Cuéntanos tu caso",
    placeholder: "Por ejemplo: el día 29 estaré de viaje, ¿cómo voto?",
    ejemplos: [
      "Vivo en València y el día 29 no estoy, ¿cómo voto?",
      "¿Hasta cuándo puedo pedir el voto por correo?",
      "Estaré de Erasmus en noviembre, ¿qué hago?",
    ],
  },
  "correo-fuera": {
    etiqueta: "Cuéntanos tu caso",
    placeholder: "Por ejemplo: vivo en Lisboa, ¿cómo voto?",
    ejemplos: [
      "Vivo en Berlín, ¿cómo voto?",
      "¿Tengo que pedir el voto si vivo fuera?",
      "¿Hasta cuándo puedo votar en el consulado?",
    ],
  },
  verificar: {
    etiqueta: "¿Qué te han dicho?",
    placeholder: "Por ejemplo: me han dicho que votar es obligatorio",
    ejemplos: [
      "Me han dicho que si pido el voto por correo también puedo votar en la mesa",
      "¿Es verdad que el voto en blanco se reparte entre los más votados?",
      "Puedo votar con una fotocopia del DNI",
    ],
  },
};

// La conversación vive solo en esta pestaña: no se guarda en ningún sitio.
export function Chat({ modo }: { modo: Modo }) {
  const { etiqueta, placeholder, ejemplos } = textos[modo];
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [texto, setTexto] = useState("");
  // La pregunta que espera respuesta; mientras no es null, se está consultando.
  const [pendiente, setPendiente] = useState<string | null>(null);
  const cargando = pendiente !== null;
  // El texto del modelo según llega, antes de validarlo.
  const [parcial, setParcial] = useState("");
  const [error, setError] = useState("");
  // En el verificador el veredicto exige cita validada: no se adelanta nada.
  const vivo =
    modo === "verificar" ? { respuesta: "", pasos: [] } : leerParcial(parcial);
  const campo = useRef<HTMLTextAreaElement>(null);
  const [enfocado, setEnfocado] = useState(false);
  const abierto = enfocado || texto.length > 0 || cargando;
  // Con la barra cerrada, el ejemplo que se ve rota cada pocos segundos (no
  // con movimiento reducido).
  const rotatorio = [placeholder, ...ejemplos];
  const [sugerida, setSugerida] = useState(0);

  useEffect(() => {
    if (abierto || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setSugerida((n) => (n + 1) % rotatorio.length), 3500);
    return () => clearInterval(id);
  }, [abierto, rotatorio.length]);
  const espera = useRef<HTMLElement>(null);

  useEffect(() => {
    if (cargando) espera.current?.scrollIntoView({ block: "center" });
  }, [cargando]);

  async function preguntar(pregunta: string) {
    pregunta = pregunta.trim();
    if (!pregunta || cargando) return;
    setPendiente(pregunta);
    setParcial("");
    setError("");
    const mensajes = [
      ...turnos.flatMap((t) => [
        { role: "user", content: t.pregunta },
        { role: "assistant", content: t.respuesta.respuesta },
      ]),
      { role: "user", content: pregunta },
    ];
    try {
      const res = await fetch(ruta("/api/chat"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ modo, mensajes }),
      });
      if (!res.ok || !res.body) throw new Error((await res.json()).error);
      // NDJSON: {"trozo"} según llega el texto y, al final, {"fin"} o {"error"}.
      const lector = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let resto = "";
      let acumulado = "";
      let fin: Respuesta | undefined;
      for (;;) {
        const { done, value } = await lector.read();
        if (done) break;
        resto += value;
        const lineas = resto.split("\n");
        resto = lineas.pop() ?? "";
        for (const linea of lineas) {
          if (!linea.trim()) continue;
          const dato = JSON.parse(linea);
          if (dato.error) throw new Error(dato.error);
          if (dato.trozo) setParcial((acumulado += dato.trozo));
          if (dato.fin) fin = dato.fin;
        }
      }
      if (!fin) throw new Error();
      const respuesta = fin;
      setTurnos((t) => [...t, { pregunta, respuesta }]);
      setTexto("");
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : "No se ha podido responder. Prueba de nuevo.",
      );
    } finally {
      setPendiente(null);
      setParcial("");
      campo.current?.focus();
    }
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    preguntar(texto);
  }

  return (
    <div className="text-lg [&>*+*]:mt-12">
      {turnos.map((t, i) => (
        <section
          key={i}
          aria-labelledby={`pregunta-${i}`}
          className="[&>*+*]:mt-6 motion-safe:animate-[aparecer_500ms_var(--ease-brand)_both]"
        >
          <h2 id={`pregunta-${i}`} className="ml-auto w-fit max-w-[85%] rounded-3xl rounded-br-lg bg-secondary px-5 py-3 font-sans text-lg leading-[1.4] font-medium tracking-normal">
            {t.pregunta}
          </h2>
          <Firma />
          {t.respuesta.verificacion && (
            <Card
              render={<section />}
              aria-label="Resultado de la comprobación"
              className="gap-3 bg-muted px-6 py-6 text-base ring-0"
            >
              <p className="text-sm text-(--text-secondary)">
                Afirmación: «{t.respuesta.verificacion.afirmacion}»
              </p>
              <p>
                <Badge
                  variant="outline"
                  className="h-auto bg-background px-3 py-1 font-mono text-sm tracking-[0.06em]"
                >
                  {t.respuesta.verificacion.resultado}
                </Badge>
              </p>
              {t.respuesta.verificacion.cita && (
                <blockquote className="border-l-2 border-foreground/20 pl-4">
                  {t.respuesta.verificacion.cita}
                </blockquote>
              )}
              {t.respuesta.verificacion.matiz && (
                <p className="text-(--text-secondary)">
                  Matiz: {t.respuesta.verificacion.matiz}
                </p>
              )}
            </Card>
          )}
          <p>{t.respuesta.respuesta}</p>
          {t.respuesta.pasos.length > 0 && (
            <ol className="grid gap-5">
              {t.respuesta.pasos.map((paso, j) => (
                <li
                  key={j}
                  className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-3 md:grid-cols-[32px_minmax(0,1fr)] md:gap-x-4"
                >
                  <span className="text-[22px] leading-[1.1] font-light text-brand tabular-nums md:text-[26px]">
                    {j + 1}
                  </span>
                  <p>{paso}</p>
                </li>
              ))}
            </ol>
          )}
          <Fuentes fuentes={t.respuesta.fuentes} />
          {!!t.respuesta.publicadas?.length && (
            <Publicadas publicadas={t.respuesta.publicadas} />
          )}
        </section>
      ))}

      {pendiente !== null && (
        <section
          ref={espera}
          aria-labelledby="pregunta-pendiente"
          aria-busy="true"
          className="[&>*+*]:mt-6 motion-safe:animate-[aparecer_400ms_var(--ease-brand)_both]"
        >
          <h2 id="pregunta-pendiente" className="ml-auto w-fit max-w-[85%] rounded-3xl rounded-br-lg bg-secondary px-5 py-3 font-sans text-lg leading-[1.4] font-medium tracking-normal">
            {pendiente}
          </h2>
          <p role="status" className="flex items-center gap-3 font-medium">
            <LoaderCircle
              aria-hidden="true"
              className="size-6 shrink-0 text-brand motion-safe:animate-spin"
            />
            <span className="brillo">
              {vivo.respuesta
                ? "Redactando con las fuentes oficiales…"
                : "Consultando las fuentes oficiales…"}
            </span>
          </p>
          {vivo.respuesta ? (
            // Borrador en vivo: se sustituye por la respuesta validada.
            <div aria-hidden="true" className="[&>*+*]:mt-6">
              <p>{vivo.respuesta}</p>
              {vivo.pasos.length > 0 && (
                <ol className="grid gap-5">
                  {vivo.pasos.map((paso, j) => (
                    <li
                      key={j}
                      className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-3 md:grid-cols-[32px_minmax(0,1fr)] md:gap-x-4"
                    >
                      <span className="text-[22px] leading-[1.1] font-light text-brand tabular-nums md:text-[26px]">
                        {j + 1}
                      </span>
                      <p>{paso}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ) : (
            <div aria-hidden="true" className="grid gap-3">
              {["w-full", "w-11/12", "w-3/4"].map((ancho) => (
                <div
                  key={ancho}
                  className={`h-4 rounded-md bg-muted motion-safe:animate-pulse ${ancho}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <form onSubmit={enviar}>
        <label htmlFor="pregunta" className="sr-only">
          {turnos.length ? "¿Algo más?" : etiqueta}
        </label>
        {/* El campo empieza como una barra de una línea y, al pulsarlo, se
            abre en un editor con atajos y contador. Si se queda vacío al
            salir, se vuelve a cerrar. */}
        <div
          data-abierto={abierto}
          onClick={() => campo.current?.focus()}
          className="group/campo cursor-text rounded-[28px] bg-background ring-1 ring-foreground/15 transition-[box-shadow,border-radius] duration-300 ease-(--ease-brand) hover:ring-foreground/30 focus-within:ring-2 focus-within:ring-foreground data-[abierto=true]:rounded-3xl"
        >
          <div className="flex items-end gap-2 py-2 pr-2 pl-4">
            <Sparkles
              aria-hidden="true"
              className="mt-3 size-5 shrink-0 self-start text-brand transition-transform duration-500 ease-(--ease-brand) group-data-[abierto=true]/campo:rotate-90"
              strokeWidth={1.75}
            />
            <div className="relative min-w-0 flex-1">
              <Textarea
                id="pregunta"
                ref={campo}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onFocus={() => setEnfocado(true)}
                onBlur={() => setEnfocado(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    preguntar(texto);
                  }
                  if (e.key === "Escape") campo.current?.blur();
                }}
                maxLength={MAXIMO}
                rows={1}
                aria-describedby="aviso-privacidad"
                placeholder={abierto ? placeholder : ""}
                className="max-h-60 min-h-11 resize-none rounded-none border-0 bg-transparent px-1 py-2.5 text-lg transition-[min-height] duration-500 ease-(--ease-brand) focus-visible:ring-0 group-data-[abierto=true]/campo:min-h-28 md:text-lg"
              />
              {/* Con la barra cerrada, el texto de ejemplo va rotando. */}
              {!abierto && (
                <span
                  key={sugerida}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-1 top-2.5 truncate text-lg text-(--text-secondary) motion-safe:animate-[aparecer_500ms_var(--ease-brand)_both]"
                >
                  {rotatorio[sugerida]}
                </span>
              )}
            </div>
            <Button
              type="submit"
              variant="sunset"
              size="icon-lg"
              disabled={cargando || !texto.trim()}
              aria-label={
                cargando ? "Consultando" : modo === "verificar" ? "Comprobar" : "Preguntar"
              }
              className="size-11 shrink-0 rounded-full"
            >
              {cargando ? (
                <LoaderCircle aria-hidden="true" className="size-5 motion-safe:animate-spin" />
              ) : (
                <ArrowUp aria-hidden="true" className="size-5" />
              )}
            </Button>
          </div>
          {/* Barra de atajos: se despliega con el editor. */}
          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-(--ease-brand) group-data-[abierto=true]/campo:grid-rows-[1fr]">
            <div className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-t border-foreground/10 px-5 py-2.5 font-mono text-xs text-(--text-secondary)">
                <span className="max-sm:hidden">
                  <kbd className="font-mono">↵</kbd> enviar ·{" "}
                  <kbd className="font-mono">⇧ ↵</kbd> salto de línea ·{" "}
                  <kbd className="font-mono">esc</kbd> cerrar
                </span>
                <span className="sm:hidden">↵ enviar</span>
                <span className="tabular-nums">
                  {texto.length}/{MAXIMO}
                </span>
              </div>
            </div>
          </div>
        </div>
        <p
          id="aviso-privacidad"
          className="mt-3 flex items-start gap-2 px-4 text-sm text-(--text-secondary)"
        >
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          No escribas datos personales. No guardamos lo que escribes.
        </p>
        <p aria-live="polite" className="mt-2 px-4 text-base text-(--text-secondary)">
          {error}
        </p>
      </form>

      {turnos.length === 0 && (
        <div>
          <h2 className="font-mono text-xs tracking-[0.08em] text-(--text-secondary) uppercase">
            Prueba con
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {ejemplos.map((ejemplo, i) => (
              <li
                key={ejemplo}
                className="motion-safe:animate-[aparecer_500ms_var(--ease-brand)_both]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={cargando}
                  onClick={() => {
                    setTexto(ejemplo);
                    preguntar(ejemplo);
                  }}
                  className="group/ejemplo h-auto min-h-11 gap-2 rounded-full py-2 pr-4 pl-4 text-left text-sm whitespace-normal"
                >
                  {ejemplo}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-(--text-secondary) transition-transform group-hover/ejemplo:translate-x-0.5 group-hover/ejemplo:-translate-y-0.5 motion-reduce:transition-none"
                  />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
