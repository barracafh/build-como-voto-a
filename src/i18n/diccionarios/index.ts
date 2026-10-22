import type { Idioma } from "../idiomas";
import { traductor, type Diccionario, type T } from "../traducir";
import ca from "./ca";
import eu from "./eu";
import gl from "./gl";

// Solo en el servidor: al cliente se le pasa el diccionario de su lengua.
export const DICCIONARIOS: Record<Idioma, Diccionario> = { es: {}, ca, eu, gl };

export const traductorDe = (idioma: Idioma): T =>
  traductor(DICCIONARIOS[idioma]);
