// Encuentra las fechas escritas en un texto libre (la salida del modelo), en
// castellano, catalán, gallego o euskera, para contrastarlas con el
// calendario. Solo cuenta día + mes y formatos numéricos de fecha: «hasta 10
// días antes» o «a las 9:00» no son fechas.
//
// Devuelve cada fecha como «YYYY-MM-DD» si lleva año y como «MM-DD» si no.

const meses: [number, string][] = [
  [1, "enero|gener|xaneiro"],
  [2, "febrero|febrer|febreiro"],
  [3, "marzo|març|marc"],
  [4, "abril"],
  [5, "mayo|maig|maio"],
  [6, "junio|juny|xuño"],
  [7, "julio|juliol|xullo"],
  [8, "agosto|agost"],
  [9, "septiembre|setiembre|setembre|setembro"],
  [10, "octubre|outubro"],
  [11, "noviembre|novembre|novembro"],
  [12, "diciembre|desembre|decembro|dezembro"],
];

// Euskera: la raíz del mes, con o sin declinación («azaroa», «azaroaren»).
const mesesEu: [number, string][] = [
  [1, "urtarril"],
  [2, "otsail"],
  [3, "martxo"],
  [4, "apiril"],
  [5, "maiatz"],
  [6, "ekain"],
  [7, "uztail"],
  [8, "abuztu"],
  [9, "irail"],
  [10, "urri"],
  [11, "azaro"],
  [12, "abendu"],
];

const alternativa = (lista: [number, string][]) =>
  lista.map(([, nombres]) => nombres).join("|");

const numeroDe = (lista: [number, string][], nombre: string) =>
  lista.find(([, nombres]) =>
    nombres.split("|").some((n) => nombre.toLowerCase().startsWith(n)),
  )?.[0];

// «29 de noviembre», «6 d’octubre», «del 4 al 24 de noviembre», «13 y 27 de
// noviembre de 2026».
const romance = new RegExp(
  String.raw`(?<!\d)(\d{1,2})(?:\s*(?:al|ao|a|y|e|i|-|–|—)(?:\s+(?:el|o|la))?\s*(\d{1,2}))?\s+(?:de\s+|d['’]\s*)?(${alternativa(meses)})(?!\p{L})(?:\s+(?:de\s+|del\s+)?(\d{4})(?!\d))?`,
  "giu",
);

// «azaroaren 29», «azaroaren 4tik 24ra», «urriaren 6 eta 9».
const euskera = new RegExp(
  String.raw`(?<!\p{L})(${alternativa(mesesEu)})\p{L}*\s+(\d{1,2})(?!\d)\p{L}*(?:(?:\s*(?:–|-|—|eta)\s*|(?<=tik)\s+)(\d{1,2})(?!\d))?`,
  "giu",
);

const iso = /(?<!\d)(\d{4})-(\d{1,2})-(\d{1,2})(?!\d)/g;
// «29/11», «29/11/2026», «29-11-2026», «29.11.2026». Con guion o punto, solo
// con año: «4-24» o «3.5» no son fechas.
const barras = /(?<![\d/])(\d{1,2})\/(\d{1,2})(?:\/(\d{2}|\d{4}))?(?![\d/])/g;
const conAnio = /(?<![\d.-])(\d{1,2})[.-](\d{1,2})[.-](\d{4})(?![\d.-])/g;

const dos = (n: number) => String(n).padStart(2, "0");

function fecha(dia: number, mes: number, anio?: string): string | null {
  if (!(dia >= 1 && dia <= 31 && mes >= 1 && mes <= 12)) return null;
  const md = `${dos(mes)}-${dos(dia)}`;
  if (!anio) return md;
  return `${anio.length === 2 ? `20${anio}` : anio}-${md}`;
}

export function fechasEnTexto(texto: string): string[] {
  const halladas: (string | null)[] = [];
  for (const m of texto.matchAll(romance)) {
    const mes = numeroDe(meses, m[3]);
    if (!mes) continue;
    halladas.push(fecha(+m[1], mes, m[4]));
    if (m[2]) halladas.push(fecha(+m[2], mes, m[4]));
  }
  for (const m of texto.matchAll(euskera)) {
    const mes = numeroDe(mesesEu, m[1]);
    if (!mes) continue;
    halladas.push(fecha(+m[2], mes));
    if (m[3]) halladas.push(fecha(+m[3], mes));
  }
  for (const m of texto.matchAll(iso)) halladas.push(fecha(+m[3], +m[2], m[1]));
  for (const m of texto.matchAll(barras)) halladas.push(fecha(+m[1], +m[2], m[3]));
  for (const m of texto.matchAll(conAnio)) halladas.push(fecha(+m[1], +m[2], m[3]));
  return halladas.filter((f): f is string => f !== null);
}
