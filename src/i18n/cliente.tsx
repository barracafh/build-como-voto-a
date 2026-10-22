"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Idioma } from "./idiomas";
import { traductor, type Diccionario, type T } from "./traducir";

// El layout pasa solo el diccionario de la lengua elegida.
const Contexto = createContext<{ idioma: Idioma; t: T }>({
  idioma: "es",
  t: traductor({}),
});

export function ProveedorIdioma({
  idioma,
  diccionario,
  children,
}: {
  idioma: Idioma;
  diccionario: Diccionario;
  children: ReactNode;
}) {
  const valor = useMemo(
    () => ({ idioma, t: traductor(diccionario) }),
    [idioma, diccionario],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export const useIdioma = () => useContext(Contexto);
