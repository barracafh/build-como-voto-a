// Encuentra las fechas escritas en un texto libre (la salida del modelo), en
// castellano, catalán, gallego o euskera, para contrastarlas con el
// calendario. Solo cuenta día + mes y formatos numéricos de fecha: «hasta 10
// días antes» o «a las 9:00» no son fechas.
//
// Devuelve cada fecha como «YYYY-MM-DD» si lleva año y como «MM-DD» si no.

// Nombres y abreviaturas de cada mes (las de fechaCorta() incluidas).
const meses: [number, string][] = [
  [1, "enero|gener|xaneiro|ene|gen|xan"],
  [2, "febrero|febrer|febreiro|febr|feb"],
  [3, "marzo|març|marc|mar"],
  [4, "abril|abr"],
  [5, "mayo|maig|maio|may|mai"],
  [6, "junio|juny|xuño|jun|xuñ"],
  [7, "julio|juliol|xullo|jul|xul"],
  [8, "agosto|agost|ago|ag"],
  [9, "septiembre|setiembre|setembre|setembro|sept|sep|set"],
  [10, "octubre|outubro|oct|out"],
  [11, "noviembre|novembre|novembro|nov"],
  [12, "diciembre|desembre|decembro|dezembro|dic|des|dec"],
];

// Euskera: la raíz del mes, con o sin declinación («azaroa», «azaroaren»), y
// su abreviatura («aza»).
const mesesEu: [number, string][] = [
  [1, "urtarril|urt"],
  [2, "otsail|ots"],
  [3, "martxo|mar"],
  [4, "apiril|api"],
  [5, "maiatz|mai"],
  [6, "ekain|eka"],
  [7, "uztail|uzt"],
  [8, "abuztu|abu"],
  [9, "irail|ira"],
  [10, "urri|urr"],
  [11, "azaro|aza"],
  [12, "abendu|abe"],
];

// Los nombres más largos primero, para que «marzo» no se quede en «mar».
const alternativa = (lista: [number, string][]) =>
  lista
    .flatMap(([, nombres]) => nombres.split("|"))
    .sort((a, b) => b.length - a.length)
    .join("|");

const numeroDe = (lista: [number, string][], nombre: string) => {
  const n = nombre.toLowerCase();
  return lista.find(([, nombres]) => nombres.split("|").includes(n))?.[0];
};

// Mes romance completo o abreviado, con punto o sin él, y no seguido de más
// letras: «noviembre», «nov», «nov.».
// «des» seguido de «de» es la preposición catalana («7 des de casa»).
const MES = String.raw`(${alternativa(meses)})(?!\p{L})(?!(?<=des)\s+d(?:e\b|['’]))\.?`;
// Día con o sin ordinal: «1», «1º», «1.º», «1ª», «1r», «1er», «2n», «4t».
const DIA = String.raw`(\d{1,2})(?:\.?[ºª°]|er|r|n|t)?(?![\d\p{L}])`;
const ANIO = String.raw`(?:,?\s+(?:de\s+|del\s+)?(\d{4})(?!\d))?`;

// «29 de noviembre», «6 d’octubre», «15 oct.», «1r de desembre», «del 4 al
// 24 de noviembre», «13 y 27 de noviembre de 2026».
const romance = new RegExp(
  String.raw`(?<!\d)${DIA}(?:\s*(?:al|ao|a|y|e|i|-|–|—)(?:\s+(?:el|o|la))?\s*${DIA})?\s+(?:de\s+|d['’]\s*)?${MES}${ANIO}`,
  "giu",
);

// Orden mes + día: «octubre 15», «nov. 2», «noviembre 15 de 2026».
const romanceMesDia = new RegExp(
  String.raw`(?<!\p{L})${MES}\s+(?:de\s+)?${DIA}${ANIO}`,
  "giu",
);

// «azaroaren 29», «aza 29», «azaroaren 4tik 24ra», «urriaren 6 eta 9».
const euskera = new RegExp(
  String.raw`(?<!\p{L})(${alternativa(mesesEu)})\p{L}*\.?\s+(\d{1,2})(?!\d)\p{L}*(?:(?:\s*(?:–|-|—|eta)\s*|(?<=tik)\s+)(\d{1,2})(?!\d))?`,
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
  for (const m of texto.matchAll(romanceMesDia)) {
    const mes = numeroDe(meses, m[1]);
    if (mes) halladas.push(fecha(+m[2], mes, m[3]));
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
