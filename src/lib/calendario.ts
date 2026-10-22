import datos from "../../datos/calendario_29N_2026.json";
import { LOCALES, type Idioma } from "@/i18n/idiomas";
import { marcar, traductor, type T } from "@/i18n/traducir";

// Todas las fechas de la herramienta salen de aquí, nunca del modelo.
export type Plazo = {
  id: string;
  evento: string;
  inicio: string; // YYYY-MM-DD
  fin: string; // YYYY-MM-DD; igual a inicio si es un solo día
  nota?: string;
  fuente: string;
  fuentesAdicionales: string[];
};

export type Estado = "cerrado" | "abierto" | "proximo";

type Entrada = {
  id: string;
  evento: string;
  fecha?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  nota?: string;
  fuente: string;
  fuentes_adicionales?: string[];
};

export const plazos: readonly Plazo[] = (datos.fechas as Entrada[]).map(
  (e) => {
    const inicio = e.fecha ?? e.fecha_inicio;
    const fin = e.fecha ?? e.fecha_fin;
    if (!inicio || !fin) throw new Error(`Calendario: ${e.id} sin fecha`);
    return {
      id: e.id,
      evento: e.evento,
      inicio,
      fin,
      nota: e.nota,
      fuente: e.fuente,
      fuentesAdicionales: e.fuentes_adicionales ?? [],
    };
  },
);

export function plazo(id: string): Plazo {
  const p = plazos.find((p) => p.id === id);
  if (!p) throw new Error(`Calendario: no existe ${id}`);
  return p;
}

// Hoy en España peninsular, como YYYY-MM-DD, para comparar con el calendario.
export function hoy(fecha = new Date()): string {
  return fecha.toLocaleDateString("en-CA", { timeZone: "Europe/Madrid" });
}

export function estado(p: Plazo, dia = hoy()): Estado {
  if (dia > p.fin) return "cerrado";
  if (dia >= p.inicio) return "abierto";
  return "proximo";
}

// Un día del calendario a una hora de Madrid («9:00»), como instante en ms.
// El desfase (+01:00 o +02:00) se toma de ese mismo día.
export function instanteMadrid(iso: string, hora = "0:00"): number {
  const [h, m] = hora.split(":").map(Number);
  const [a, mes, d] = iso.split("-").map(Number);
  const local = Date.UTC(a, mes - 1, d, h, m);
  const desfase = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Madrid",
    timeZoneName: "longOffset",
  })
    .format(local)
    .match(/([+-])(\d{2}):(\d{2})/);
  if (!desfase) return local;
  const signo = desfase[1] === "-" ? -1 : 1;
  const minutos = signo * (+desfase[2] * 60 + +desfase[3]);
  return local - minutos * 60_000;
}

// «29 de noviembre», en la lengua de la página.
export function fechaLarga(iso: string, idioma: Idioma = "es"): string {
  return new Intl.DateTimeFormat(LOCALES[idioma], {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  })
    .format(new Date(`${iso}T00:00:00Z`))
    .replace("(a)", ""); // euskera: «azaroaren 29(a)» → «azaroaren 29»
}

// «29 nov», para ejes y etiquetas.
export function fechaCorta(iso: string, idioma: Idioma = "es"): string {
  return new Intl.DateTimeFormat(LOCALES[idioma], {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
    .format(new Date(`${iso}T00:00:00Z`))
    .replace("(a)", "")
    .replaceAll(".", "");
}

// «29 de noviembre» o «del 4 al 24 de noviembre». `t` traduce la plantilla.
export function rango(
  p: Plazo,
  idioma: Idioma = "es",
  t: T = traductor({}),
): string {
  if (p.inicio === p.fin) return fechaLarga(p.inicio, idioma);
  const [, mi] = p.inicio.split("-");
  const [, mf] = p.fin.split("-");
  const desde =
    mi === mf
      ? String(Number(p.inicio.slice(8)))
      : fechaLarga(p.inicio, idioma);
  return t("del {desde} al {hasta}", { desde, hasta: fechaLarga(p.fin, idioma) });
}

export const fuenteCalendario = {
  nombre: marcar("Calendario electoral · Junta Electoral Central"),
  url: "https://www.juntaelectoralcentral.es/cs/jec/documentos/eg2026_calendario.pdf",
};
