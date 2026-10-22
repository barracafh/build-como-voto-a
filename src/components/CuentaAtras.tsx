"use client";

import { useEffect, useState } from "react";

const dos = (n: number) => String(n).padStart(2, "0");

function restante(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 86400)} d ${dos(Math.floor(s / 3600) % 24)} h ${dos(Math.floor(s / 60) % 60)} min ${dos(s % 60)} s`;
}

// Cuenta atrás hasta un instante, segundo a segundo. Después muestra `despues`
// hasta el instante `finDespues` y luego desaparece. No es una región viva:
// los lectores de pantalla no la anuncian cada segundo.
export function CuentaAtras({
  hasta,
  antes,
  despues,
  finDespues = 0,
}: {
  hasta: number;
  antes: string;
  despues?: string;
  finDespues?: number;
}) {
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
        className="font-mono font-medium tabular-nums"
      >
        {restante(ms)}
      </time>
    </li>
  );
}
