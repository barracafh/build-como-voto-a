// Geometría de las líneas de tiempo: fechas YYYY-MM-DD a porcentajes de ancho.
// Todo en UTC para que el cambio de hora no desplace ningún día.
export type Escala = { desde: string; hasta: string }; // ambos días incluidos

export type Marca = { iso: string; dia: number; izquierda: number; mes?: string };

const DIA = 86_400_000;
const ms = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const recorta = (n: number) => Math.min(100, Math.max(0, n));

export function dias(desde: string, hasta: string): number {
  return Math.round((ms(hasta) - ms(desde)) / DIA);
}

const total = (e: Escala) => dias(e.desde, e.hasta) + 1;

// Dónde empieza el día dentro de la escala, en %.
export function posicion(fecha: string, e: Escala): number {
  return recorta((dias(e.desde, fecha) / total(e)) * 100);
}

// Un plazo del día inicio al día fin, ambos incluidos.
export function tramo(inicio: string, fin: string, e: Escala) {
  const izquierda = posicion(inicio, e);
  const derecha = recorta(((dias(e.desde, fin) + 1) / total(e)) * 100);
  return { izquierda, ancho: derecha - izquierda };
}

const mes = new Intl.DateTimeFormat("es-ES", { month: "short", timeZone: "UTC" });

// Lunes e inicios de mes dentro de la escala, sin el primer ni el último día.
// Un lunes a dos días o menos de un inicio de mes se omite para no pisarlo.
export function marcas(e: Escala): Marca[] {
  const lista: Marca[] = [];
  for (let t = ms(e.desde) + DIA; t < ms(e.hasta); t += DIA) {
    const d = new Date(t);
    const inicioMes = d.getUTCDate() === 1;
    const lunes = d.getUTCDay() === 1 && d.getUTCDate() > 3;
    if (!lunes && !inicioMes) continue;
    lista.push({
      iso: iso(t),
      dia: d.getUTCDate(),
      izquierda: posicion(iso(t), e),
      mes: inicioMes ? mes.format(d).replace(".", "") : undefined,
    });
  }
  return lista;
}

export function cierraEn(fin: string, hoy: string): number {
  return dias(hoy, fin);
}
