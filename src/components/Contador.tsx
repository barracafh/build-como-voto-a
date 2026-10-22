"use client";

import { useEffect, useState } from "react";
import { partes } from "@/lib/cuenta-atras";

const dos = (n: number) => String(n).padStart(2, "0");

// Cuenta atrás en fichas (días, horas, minutos, segundos) hasta un instante.
// Después muestra `despues` hasta `finDespues` y luego nada. Las fichas se
// ocultan a los lectores de pantalla: leen solo los días, que no cambian cada
// segundo.
export function Contador({
  hasta,
  para,
  despues,
  finDespues = 0,
}: {
  hasta: number;
  para: string; // «para votar»
  despues?: string;
  finDespues?: number;
}) {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const ms = hasta - ahora;
  if (ms <= 0) {
    return despues && ahora < finDespues ? (
      <p className="font-heading text-[clamp(26px,4vw,36px)] leading-[1.1]">{despues}</p>
    ) : null;
  }

  const p = partes(ms);
  const fichas = [
    [String(p.dias), p.dias === 1 ? "día" : "días"],
    [dos(p.horas), "horas"],
    [dos(p.minutos), "min"],
    [dos(p.segundos), "seg"],
  ];

  return (
    <div>
      <p className="sr-only" suppressHydrationWarning>
        Faltan {p.dias} {p.dias === 1 ? "día" : "días"} {para}.
      </p>
      <p aria-hidden="true" className="mb-3 font-mono text-xs tracking-[0.08em] uppercase">
        Faltan {para}
      </p>
      <div aria-hidden="true" className="grid grid-cols-4 gap-2 sm:gap-3">
        {fichas.map(([n, etiqueta]) => (
          <div
            key={etiqueta}
            className="rounded-xl bg-background px-2 pt-3 pb-2.5 text-center text-foreground sm:px-3 sm:pt-4"
          >
            <span
              suppressHydrationWarning
              className="block text-[clamp(28px,6.5vw,48px)] leading-none font-medium tracking-[-0.04em] tabular-nums"
            >
              {n}
            </span>
            <span className="mt-1.5 block font-mono text-[11px] tracking-[0.08em] text-(--text-secondary) uppercase sm:text-xs">
              {etiqueta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
