// Escaños que se eligen el 29/11/2026 por comunidad autónoma (`codigo_ccaa`, códigos del Ministerio del Interior).
// Diputados: anexo del RD 806/2026 (contexto.md §3). Senadores: solo los de elección directa, art. 165 LOREG (contexto.md §3.4).
// Cada entrada es [circunscripción, diputados, senadores]: las islas eligen senadores, no diputados.

type Circunscripcion = readonly [nombre: string, diputados: number, senadores: number];

const CORTES: Record<string, { nombre: string; circunscripciones: readonly Circunscripcion[] }> = {
  "01": {
    nombre: "Andalucía",
    circunscripciones: [
      ["Almería", 6, 4], ["Cádiz", 8, 4], ["Córdoba", 6, 4], ["Granada", 7, 4],
      ["Huelva", 5, 4], ["Jaén", 5, 4], ["Málaga", 11, 4], ["Sevilla", 12, 4],
    ],
  },
  "02": { nombre: "Aragón", circunscripciones: [["Huesca", 3, 4], ["Teruel", 3, 4], ["Zaragoza", 7, 4]] },
  "03": { nombre: "Principado de Asturias", circunscripciones: [["Asturias", 7, 4]] },
  "04": {
    nombre: "Illes Balears",
    circunscripciones: [["Illes Balears", 8, 0], ["Mallorca", 0, 3], ["Menorca", 0, 1], ["Ibiza", 0, 1], ["Formentera", 0, 1]],
  },
  "05": {
    nombre: "Canarias",
    circunscripciones: [
      ["Las Palmas", 8, 0], ["Santa Cruz de Tenerife", 7, 0],
      ["Gran Canaria", 0, 3], ["Fuerteventura", 0, 1], ["Lanzarote", 0, 1],
      ["Tenerife", 0, 3], ["La Gomera", 0, 1], ["El Hierro", 0, 1], ["La Palma", 0, 1],
    ],
  },
  "06": { nombre: "Cantabria", circunscripciones: [["Cantabria", 5, 4]] },
  "07": {
    nombre: "Castilla-La Mancha",
    circunscripciones: [["Albacete", 4, 4], ["Ciudad Real", 5, 4], ["Cuenca", 3, 4], ["Guadalajara", 3, 4], ["Toledo", 6, 4]],
  },
  "08": {
    nombre: "Castilla y León",
    circunscripciones: [
      ["Ávila", 3, 4], ["Burgos", 4, 4], ["León", 4, 4], ["Palencia", 3, 4], ["Salamanca", 4, 4],
      ["Segovia", 3, 4], ["Soria", 2, 4], ["Valladolid", 5, 4], ["Zamora", 3, 4],
    ],
  },
  "09": { nombre: "Cataluña", circunscripciones: [["Barcelona", 32, 4], ["Girona", 6, 4], ["Lleida", 4, 4], ["Tarragona", 6, 4]] },
  "10": { nombre: "Extremadura", circunscripciones: [["Badajoz", 5, 4], ["Cáceres", 4, 4]] },
  "11": { nombre: "Galicia", circunscripciones: [["A Coruña", 8, 4], ["Lugo", 4, 4], ["Ourense", 4, 4], ["Pontevedra", 7, 4]] },
  "12": { nombre: "Comunidad de Madrid", circunscripciones: [["Madrid", 38, 4]] },
  "13": { nombre: "Comunidad Foral de Navarra", circunscripciones: [["Navarra", 5, 4]] },
  "14": { nombre: "País Vasco", circunscripciones: [["Araba/Álava", 4, 4], ["Bizkaia", 8, 4], ["Gipuzkoa", 6, 4]] },
  "15": { nombre: "Región de Murcia", circunscripciones: [["Murcia", 10, 4]] },
  "16": { nombre: "La Rioja", circunscripciones: [["La Rioja", 4, 4]] },
  "17": {
    nombre: "Comunitat Valenciana",
    circunscripciones: [["Alicante/Alacant", 12, 4], ["Castellón/Castelló", 5, 4], ["Valencia/València", 16, 4]],
  },
  "18": { nombre: "Ceuta", circunscripciones: [["Ceuta", 1, 2]] },
  "19": { nombre: "Melilla", circunscripciones: [["Melilla", 1, 2]] },
};

export type CortesCcaa = { nombre: string; diputados: number; senadores: number };

export const CORTES_POR_CCAA: Record<string, CortesCcaa> = Object.fromEntries(
  Object.entries(CORTES).map(([codigo, { nombre, circunscripciones }]) => [
    codigo,
    {
      nombre,
      diputados: circunscripciones.reduce((s, c) => s + c[1], 0),
      senadores: circunscripciones.reduce((s, c) => s + c[2], 0),
    },
  ]),
);
