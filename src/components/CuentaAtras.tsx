"use client";

import { useEffect, useState } from "react";
import { useIdioma } from "@/i18n/cliente";
import type { T } from "@/i18n/traducir";

const dos = (n: number) => String(n).padStart(2, "0");

function restante(ms: number, corto: boolean, t: T) {
  const s = Math.floor(ms / 1000);
  const [d, h, m, seg] = [
    Math.floor(s / 86400),
    dos(Math.floor(s / 3600) % 24),
    dos(Math.floor(s / 60) % 60),
    dos(s % 60),
  ];
  return corto
    ? t("{d}d {h}h {m}m {s}s", { d, h, m, s: seg })
    : t("{d} d {h} h {m} min {s} s", { d, h, m, s: seg });
}

// Cuenta atrás hasta un instante, segundo a segundo. Después muestra `despues`
// hasta el instante `finDespues` y luego desaparece. No es una región viva:
// los lectores de pantalla no la anuncian cada segundo.
export function CuentaAtras({
  hasta,
  antes,
  despues,
  finDespues = 0,
  corto = false,
}: {
  hasta: number;
  antes: string;
  despues?: string;
  finDespues?: number;
  corto?: boolean;
}) {
  const { t } = useIdioma();
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const ms = hasta - ahora;
  if (ms <= 0) return despues && ahora < finDespues ? <li>{despues}</li> : null;
  return (
    <li>
      {antes}{" "}
      <time
        dateTime={new Date(hasta).toISOString()}
        suppressHydrationWarning
        className="font-medium whitespace-nowrap tabular-nums"
      >
        {restante(ms, corto, t)}
      </time>
    </li>
  );
}
