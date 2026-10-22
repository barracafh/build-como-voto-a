"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Modo, Respuesta } from "@/lib/asistente";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Fuentes } from "@/components/Fuentes";
import { ruta } from "@/config/sitio";

type Turno = { pregunta: string; respuesta: Respuesta };

const textos: Record<
  Modo,
  { etiqueta: string; placeholder: string; ejemplos: string[] }
> = {
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
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const campo = useRef<HTMLTextAreaElement>(null);

  async function preguntar(pregunta: string) {
    pregunta = pregunta.trim();
    if (!pregunta || cargando) return;
    setCargando(true);
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTurnos((t) => [...t, { pregunta, respuesta: data }]);
      setTexto("");
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : "No se ha podido responder. Prueba de nuevo.",
      );
    } finally {
      setCargando(false);
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
          className="[&>*+*]:mt-6"
        >
          <h2
            id={`pregunta-${i}`}
            className="font-sans text-[clamp(26px,4vw,34px)] leading-[1.15] tracking-[-0.02em]"
          >
            {t.pregunta}
          </h2>
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
        </section>
      ))}

      <form onSubmit={enviar} className="[&>*+*]:mt-4">
        <label htmlFor="pregunta" className="block text-base font-medium">
          {turnos.length ? "¿Algo más?" : etiqueta}
        </label>
        <Textarea
          id="pregunta"
          ref={campo}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              preguntar(texto);
            }
          }}
          maxLength={1000}
          rows={3}
          aria-describedby="aviso-privacidad"
          placeholder={placeholder}
          className="md:text-base"
        />
        <p
          id="aviso-privacidad"
          className="text-base text-(--text-secondary)"
        >
          No escribas datos personales. No guardamos lo que escribes.
        </p>
        <Button
          type="submit"
          variant="sunset"
          size="lg"
          disabled={cargando || !texto.trim()}
          className="max-md:w-full"
        >
          {modo === "verificar" ? "Comprobar" : "Preguntar"}
        </Button>
        <p aria-live="polite" className="text-base text-(--text-secondary)">
          {cargando ? "Consultando las fuentes oficiales…" : error}
        </p>
      </form>

      {turnos.length === 0 && (
        <div>
          <h2 className="text-sm font-medium text-(--text-secondary)">
            Prueba con
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {ejemplos.map((ejemplo) => (
              <li key={ejemplo}>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={cargando}
                  onClick={() => {
                    setTexto(ejemplo);
                    preguntar(ejemplo);
                  }}
                  className="h-auto min-h-9 py-2 text-left whitespace-normal"
                >
                  {ejemplo}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
