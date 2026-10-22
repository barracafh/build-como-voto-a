// Los textos se escriben en castellano en el código y se buscan tal cual en el
// diccionario de la lengua. Lo que no esté traducido sale en castellano.
// {nombre} se sustituye por el valor de `vars`.
export type Diccionario = Readonly<Record<string, string>>;
export type Vars = Record<string, string | number | undefined>;
export type T = (texto: string, vars?: Vars) => string;

export function traductor(diccionario: Diccionario): T {
  return (texto, vars) => {
    const s = diccionario[texto] ?? texto;
    return vars
      ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k] ?? "") : m))
      : s;
  };
}

// Marca un texto para traducir más tarde con t(): no cambia nada, pero deja que
// el extractor (scripts/textos.ts) lo encuentre en listas y datos.
export const marcar = (texto: string) => texto;
