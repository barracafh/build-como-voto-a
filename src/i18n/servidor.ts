import { cookies } from "next/headers";
import { COOKIE, esIdioma, type Idioma } from "./idiomas";
import { traductorDe } from "./diccionarios";
import type { T } from "./traducir";

// La lengua elegida en el selector (cookie); si no hay, castellano.
export async function idioma(): Promise<Idioma> {
  const valor = (await cookies()).get(COOKIE)?.value;
  return esIdioma(valor) ? valor : "es";
}

export async function getT(): Promise<{ t: T; idioma: Idioma }> {
  const i = await idioma();
  return { t: traductorDe(i), idioma: i };
}
