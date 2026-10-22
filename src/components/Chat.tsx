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
import { Atardecer } from "@/components/Atardecer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Fuentes } from "@/components/Fuentes";
import { Publicadas } from "@/components/Publicadas";
import { Termometro } from "@/components/Termometro";
import { ruta } from "@/config/sitio";
import { useIdioma } from "@/i18n/cliente";
import { marcar } from "@/i18n/traducir";
import { leerParcial } from "@/lib/parcial";

type Turno = { pregunta: string; respuesta: Respuesta };

const MAXIMO = 1000;

// Encabeza cada respuesta: el sol de Sol y de dónde sale.
function Firma() {
  const { t } = useIdioma();
  return (
    <p className="flex items-center gap-2 font-mono text-xs tracking-[0.08em] text-(--text-secondary) uppercase">
      <Atardecer logo className="size-4" />
      {t("Con fuentes oficiales")}
    </p>
  );
}

const textos: Record<
  Modo,
  { etiqueta: string; placeholder: string; ejemplos: string[] }
> = {
  general: {
    etiqueta: marcar("Escribe tu pregunta"),
    placeholder: marcar("Por ejemplo: ¿hasta qué hora puedo votar?"),
    ejemplos: [
      marcar("Vivo en València y el día 29 no estoy, ¿cómo voto?"),
      marcar("¿Qué documento tengo que llevar para votar?"),
      marcar("¿Tengo horas libres en el trabajo para ir a votar?"),
    ],
  },
  "correo-aqui": {
    etiqueta: marcar("Cuéntanos tu caso"),
    placeholder: marcar("Por ejemplo: el día 29 estaré de viaje, ¿cómo voto?"),
    ejemplos: [
      marcar("Vivo en València y el día 29 no estoy, ¿cómo voto?"),
      marcar("¿Hasta cuándo puedo pedir el voto por correo?"),
      marcar("Estaré de Erasmus en noviembre, ¿qué hago?"),
    ],
  },
  "correo-fuera": {
    etiqueta: marcar("Cuéntanos tu caso"),
    placeholder: marcar("Por ejemplo: vivo en Lisboa, ¿cómo voto?"),
    ejemplos: [
      marcar("Vivo en Berlín, ¿cómo voto?"),
      marcar("¿Tengo que pedir el voto si vivo fuera?"),
      marcar("¿Hasta cuándo puedo votar en el consulado?"),
    ],
  },
  verificar: {
    etiqueta: marcar("¿Qué te han dicho?"),
    placeholder: marcar("Por ejemplo: me han dicho que votar es obligatorio"),
    ejemplos: [
      marcar("Me han dicho que si pido el voto por correo también puedo votar en la mesa"),
      marcar("¿Es verdad que el voto en blanco se reparte entre los más votados?"),
      marcar("Puedo votar con una fotocopia del DNI"),
    ],
  },
};

// La conversación vive solo en esta pestaña: no se guarda en ningún sitio.
export function Chat({ modo }: { modo: Modo }) {
  const { t, idioma } = useIdioma();
  const etiqueta = t(textos[modo].etiqueta);
  const placeholder = t(textos[modo].placeholder);
  const ejemplos = textos[modo].ejemplos.map((e) => t(e));
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
    // La ruta solo admite los 6 últimos mensajes.
    const mensajes = [
      ...turnos.flatMap((turno) => [
        { role: "user", content: turno.pregunta },
        { role: "assistant", content: turno.respuesta.respuesta },
      ]),
      { role: "user", content: pregunta },
    ].slice(-6);
    try {
      const res = await fetch(ruta("/api/chat"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ modo, mensajes, idioma }),
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
          : t("No se ha podido responder. Prueba de nuevo."),
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
      {turnos.map((turno, i) => (
        <section
          key={i}
          aria-labelledby={`pregunta-${i}`}
          className="[&>*+*]:mt-6 motion-safe:animate-[aparecer_500ms_var(--ease-brand)_both]"
        >
          <h2 id={`pregunta-${i}`} className="ml-auto w-fit max-w-[85%] rounded-3xl rounded-br-lg bg-secondary px-5 py-3 font-sans text-lg leading-[1.4] font-medium tracking-normal">
            {turno.pregunta}
          </h2>
          <Firma />
          {turno.respuesta.verificacion && (
            <Card
              render={<section />}
              aria-label={t("Resultado de la comprobación")}
              className="gap-3 bg-muted px-6 py-6 text-base ring-0"
            >
              <p className="text-sm text-(--text-secondary)">
                {t("Afirmación: «{afirmacion}»", {
                  afirmacion: turno.respuesta.verificacion.afirmacion,
                })}
              </p>
              <p>
                <Badge
                  variant="outline"
                  className="h-auto bg-background px-3 py-1 font-mono text-sm tracking-[0.06em]"
                >
                  {t(turno.respuesta.verificacion.resultado)}
                </Badge>
              </p>
              {turno.respuesta.verificacion.articulo && (
                <p className="text-sm text-(--text-secondary)">
                  {t("Fuente: {articulo}", {
                    articulo: turno.respuesta.verificacion.articulo,
                  })}
                  {turno.respuesta.verificacion.fechaConsulta &&
                    t(" · consultada el {fecha}", {
                      fecha: turno.respuesta.verificacion.fechaConsulta
                        .split("-")
                        .reverse()
                        .join("/"),
                    })}
                </p>
              )}
              {turno.respuesta.verificacion.cita && (
                <blockquote className="border-l-2 border-foreground/20 pl-4">
                  {turno.respuesta.verificacion.cita}
                </blockquote>
              )}
              {turno.respuesta.verificacion.matiz && (
                <p className="text-(--text-secondary)">
                  {t("Matiz: {matiz}", { matiz: turno.respuesta.verificacion.matiz })}
                </p>
              )}
            </Card>
          )}
          <p>{turno.respuesta.respuesta}</p>
          {turno.respuesta.pasos.length > 0 && (
            <ol className="grid gap-5">
              {turno.respuesta.pasos.map((paso, j) => (
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
          <Fuentes fuentes={turno.respuesta.fuentes} />
          {!!turno.respuesta.publicadas?.length && (
            <Publicadas publicadas={turno.respuesta.publicadas} />
          )}
          <Termometro respuesta={turno.respuesta} />
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
                ? t("Redactando con las fuentes oficiales…")
                : t("Consultando las fuentes oficiales…")}
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
          {turnos.length ? t("¿Algo más?") : etiqueta}
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
                cargando
                  ? t("Consultando")
                  : modo === "verificar"
                    ? t("Comprobar")
                    : t("Preguntar")
              }
              // Al pasar por encima (o con el foco) sale el sol de cartel desde
              // abajo en vez del resplandor de sunset, y la flecha se oscurece.
              className="group/enviar size-11 shrink-0 rounded-full before:hidden"
            >
              <Atardecer
                logo
                className="absolute inset-0 translate-y-full transition-transform duration-500 ease-(--ease-brand) group-hover/enviar:translate-y-0 group-focus-visible/enviar:translate-y-0 motion-reduce:transition-none"
              />
              {cargando ? (
                <LoaderCircle aria-hidden="true" className="relative size-5 motion-safe:animate-spin" />
              ) : (
                <ArrowUp
                  aria-hidden="true"
                  className="relative size-5 transition-colors duration-300 group-hover/enviar:text-foreground group-focus-visible/enviar:text-foreground"
                />
              )}
            </Button>
          </div>
          {/* Barra de atajos: se despliega con el editor. */}
          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-(--ease-brand) group-data-[abierto=true]/campo:grid-rows-[1fr]">
            <div className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-t border-foreground/10 px-5 py-2.5 font-mono text-xs text-(--text-secondary)">
                <span className="max-sm:hidden">
                  <kbd className="font-mono">↵</kbd> {t("enviar")} ·{" "}
                  <kbd className="font-mono">⇧ ↵</kbd> {t("salto de línea")} ·{" "}
                  <kbd className="font-mono">esc</kbd> {t("cerrar")}
                </span>
                <span className="sm:hidden">↵ {t("enviar")}</span>
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
          {t("No escribas datos personales. No guardamos lo que escribes.")}
        </p>
        <p aria-live="polite" className="mt-2 px-4 text-base text-(--text-secondary)">
          {error}
        </p>
      </form>

      {turnos.length === 0 && (
        <div>
          <h2 className="font-mono text-xs tracking-[0.08em] text-(--text-secondary) uppercase">
            {t("Prueba con")}
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
