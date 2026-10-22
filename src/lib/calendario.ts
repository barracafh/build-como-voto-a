import datos from "../../datos/calendario_29N_2026.json";

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

const formato = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export function fechaLarga(iso: string): string {
  return formato.format(new Date(`${iso}T00:00:00Z`));
}

// «29 de noviembre» o «del 4 al 24 de noviembre».
export function rango(p: Plazo): string {
  if (p.inicio === p.fin) return fechaLarga(p.inicio);
  const [, mi] = p.inicio.split("-");
  const [, mf] = p.fin.split("-");
  const desde =
    mi === mf ? String(Number(p.inicio.slice(8))) : fechaLarga(p.inicio);
  return `del ${desde} al ${fechaLarga(p.fin)}`;
}

export const fuenteCalendario = {
  nombre: "Calendario electoral · Junta Electoral Central",
  url: "https://www.juntaelectoralcentral.es/cs/jec/documentos/eg2026_calendario.pdf",
};
