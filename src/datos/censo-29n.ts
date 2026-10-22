// Electores del 29N por circunscripción del Congreso: nota de prensa del INE de
// 9/10/2026 («Elecciones a Cortes Generales de 29 de noviembre de 2026»), tabla
// «Número de electores … por circunscripciones». Los residentes en el extranjero
// (CERA) votan en la circunscripción en la que están inscritos, así que cuentan en
// su provincia. Los nombres son los de `cortes-29n.ts`.

export const FUENTE_CENSO = {
  nombre: "Electores del 29N por circunscripción · INE, nota de prensa de 9/10/2026",
  url: "https://www.ine.es/dyngs/Prensa/es/EG2026.htm",
};

type Fila = readonly [codigoIne: string, nombre: string, electores: number, residentesEspana: number, residentesExtranjero: number];

export const CENSO: readonly Fila[] = [
  ["01", "Araba/Álava", 267325, 256995, 10330],
  ["02", "Albacete", 308541, 299580, 8961],
  ["03", "Alicante/Alacant", 1359229, 1303765, 55464],
  ["04", "Almería", 541093, 487815, 53278],
  ["05", "Ávila", 136598, 126996, 9602],
  ["06", "Badajoz", 552081, 538991, 13090],
  ["07", "Illes Balears", 870718, 828603, 42115],
  ["08", "Barcelona", 4398757, 4133070, 265687],
  ["09", "Burgos", 300630, 278257, 22373],
  ["10", "Cáceres", 339508, 320973, 18535],
  ["11", "Cádiz", 1042157, 1007105, 35052],
  ["12", "Castellón/Castelló", 448196, 435080, 13116],
  ["13", "Ciudad Real", 393421, 385613, 7808],
  ["14", "Córdoba", 648792, 627881, 20911],
  ["15", "A Coruña", 1106690, 928212, 178478],
  ["16", "Cuenca", 151410, 147707, 3703],
  ["17", "Girona", 575269, 545107, 30162],
  ["18", "Granada", 791066, 728641, 62425],
  ["19", "Guadalajara", 208773, 202546, 6227],
  ["20", "Gipuzkoa", 597859, 561932, 35927],
  ["21", "Huelva", 408911, 399666, 9245],
  ["22", "Huesca", 175954, 166279, 9675],
  ["23", "Jaén", 515524, 500560, 14964],
  ["24", "León", 425983, 370903, 55080],
  ["25", "Lleida", 326300, 304391, 21909],
  ["26", "La Rioja", 259798, 238491, 21307],
  ["27", "Lugo", 341031, 264112, 76919],
  ["28", "Madrid", 5536913, 5038039, 498874],
  ["29", "Málaga", 1292972, 1218939, 74033],
  ["30", "Murcia", 1144308, 1099682, 44626],
  ["31", "Navarra", 537194, 500413, 36781],
  ["32", "Ourense", 360252, 249128, 111124],
  ["33", "Asturias", 979077, 835489, 143588],
  ["34", "Palencia", 137466, 128729, 8737],
  ["35", "Las Palmas", 939211, 872976, 66235],
  ["36", "Pontevedra", 926408, 776260, 150148],
  ["37", "Salamanca", 304762, 268176, 36586],
  ["38", "Santa Cruz de Tenerife", 927138, 802038, 125100],
  ["39", "Cantabria", 523083, 473210, 49873],
  ["40", "Segovia", 121460, 117282, 4178],
  ["41", "Sevilla", 1606972, 1563407, 43565],
  ["42", "Soria", 77069, 68009, 9060],
  ["43", "Tarragona", 626161, 599563, 26598],
  ["44", "Teruel", 106251, 100360, 5891],
  ["45", "Toledo", 569549, 553863, 15686],
  ["46", "Valencia/València", 2067797, 1984563, 83234],
  ["47", "Valladolid", 440219, 422478, 17741],
  ["48", "Bizkaia", 959702, 909301, 50401],
  ["49", "Zamora", 162251, 138147, 24104],
  ["50", "Zaragoza", 760968, 730065, 30903],
  ["51", "Ceuta", 65591, 62234, 3357],
  ["52", "Melilla", 63968, 57089, 6879],
];

export const ELECTORES_POR_CIRCUNSCRIPCION: Record<string, number> = Object.fromEntries(
  CENSO.map(([, nombre, electores]) => [nombre, electores]),
);
