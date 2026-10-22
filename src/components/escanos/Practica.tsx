"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { dhondt } from "@/lib/dhondt";
import { TablaCocientes, TablaResultados } from "./Tablas";

const INICIO = { A: "340000", B: "280000", C: "160000", D: "60000", blanco: "15000" };
type Campo = keyof typeof INICIO;
const NOMBRES = ["A", "B", "C", "D"] as const;
const num = (s: string) => Math.max(0, Math.floor(Number(s)) || 0);

export function Practica() {
  const id = useId();
  const [votos, setVotos] = useState(INICIO);
  const [escanosTexto, setEscanosTexto] = useState("7");
  const escanos = Math.min(37, Math.max(1, num(escanosTexto)));
  const candidaturas = NOMBRES.map((n) => ({ nombre: `Candidatura ${n}`, votos: num(votos[n]) }));
  const validos = candidaturas.reduce((s, c) => s + c.votos, 0) + num(votos.blanco);
  const { resultados, cocientes } = dhondt(candidaturas, validos, escanos);

  const campo = (k: Campo, etiqueta: string) => (
    <div key={k} className="grid gap-2">
      <label htmlFor={`${id}-${k}`} className="text-base font-medium">
        {etiqueta}
      </label>
      <Input
        id={`${id}-${k}`}
        type="number"
        inputMode="numeric"
        min={0}
        step={1000}
        value={votos[k]}
        onChange={(e) => setVotos({ ...votos, [k]: e.target.value })}
        className="h-11 md:text-base"
      />
    </div>
  );

  return (
    <section aria-labelledby={`${id}-titulo`} className="[&>*+*]:mt-6">
      <div>
        <p className="font-mono text-xs tracking-[0.06em] text-(--text-secondary) uppercase">
          Práctica · datos ficticios
        </p>
        <h2 id={`${id}-titulo`} className="mt-3 text-[clamp(28px,4vw,40px)] leading-[1.1]">
          Prueba la regla con tus números
        </h2>
        <p className="mt-3 text-base text-(--text-secondary)">
          Candidaturas inventadas (A, B, C y D). Cambia los votos o los escaños y el
          reparto se recalcula al momento. No son resultados reales.
        </p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
        {NOMBRES.map((n) => campo(n, `Votos de ${n}`))}
        {campo("blanco", "Votos en blanco")}
        <div className="grid gap-2">
          <label htmlFor={`${id}-escanos`} className="text-base font-medium">
            Escaños (1 a 37)
          </label>
          <Input
            id={`${id}-escanos`}
            type="number"
            inputMode="numeric"
            min={1}
            max={37}
            value={escanosTexto}
            onChange={(e) => setEscanosTexto(e.target.value)}
            className="h-11 md:text-base"
          />
        </div>
      </div>
      <ul aria-label="Escaños por candidatura" className="grid gap-2">
        {resultados.map((r) => (
          <li key={r.nombre} className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3">
            <span className="text-base">{r.nombre}</span>
            <span className="flex flex-wrap gap-1">
              <span className="sr-only">{r.escanos} escaños</span>
              {Array.from({ length: r.escanos }, (_, i) => (
                <span key={i} aria-hidden="true" className="size-4 rounded-full bg-foreground" />
              ))}
              {r.escanos === 0 && (
                <span aria-hidden="true" className="text-(--text-secondary)">0</span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <TablaResultados filas={resultados} votosValidos={validos} titulo="Práctica: candidaturas" />
      <TablaCocientes cocientes={cocientes} escanos={escanos} titulo="Práctica: cocientes" />
    </section>
  );
}
