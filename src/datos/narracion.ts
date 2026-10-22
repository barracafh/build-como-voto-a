// Guiones fijos de la narración del hemiciclo (docs/SCRIPT.md). `scripts/narracion.ts` los
// convierte en public/audio/<id>.mp3 con ElevenLabs; si cambia un texto, borra su mp3 y regenera.
import type { Source } from "@/components/Fuentes";

const LOREG: Source = {
  nombre: "Ley Orgánica 5/1985 (LOREG), arts. 161 a 166 · BOE",
  url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672",
};
const RD: Source = {
  nombre: "Real Decreto 806/2026 de convocatoria, anexo · BOE",
  url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742",
};

const LOREG_VOTO: Source = {
  nombre: "Ley Orgánica 5/1985 (LOREG), arts. 5, 96, 108 y 163 · BOE",
  url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672",
};
const JEC: Source = {
  nombre: "Instrucción 1/2012 de la Junta Electoral Central · BOE",
  url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2012-3859",
};

export type Narracion = { texto: string; fuentes: readonly Source[] };

const CIERRE = " El bloque en rojo es ilustrativo: no indica dónde se sientan.";

// Diputados por provincia y senadores de elección directa de cada comunidad (src/datos/cortes-29n.ts).
const COMUNIDADES: Record<string, string> = {
  "01": "Andalucía elige 60 diputados en sus 8 provincias: Almería 6, Cádiz 8, Córdoba 6, Granada 7, Huelva 5, Jaén 5, Málaga 11 y Sevilla 12. Elige también 32 senadores, 4 por provincia.",
  "02": "Aragón elige 13 diputados: Huesca 3, Teruel 3 y Zaragoza 7. Elige también 12 senadores, 4 por provincia.",
  "03": "Asturias es una sola provincia y elige 7 diputados y 4 senadores.",
  "04": "Illes Balears elige 8 diputados en una sola circunscripción. Para el Senado vota por islas: Mallorca elige 3 senadores, y Menorca, Ibiza y Formentera, 1 cada una. En total, 6. Ibiza y Formentera eligen por separado por primera vez en estas elecciones.",
  "05": "Canarias elige 15 diputados: Las Palmas 8 y Santa Cruz de Tenerife 7. Para el Senado vota por islas: Gran Canaria y Tenerife eligen 3 senadores cada una, y Fuerteventura, Lanzarote, La Gomera, El Hierro y La Palma, 1 cada una. En total, 11.",
  "06": "Cantabria es una sola provincia y elige 5 diputados y 4 senadores.",
  "07": "Castilla-La Mancha elige 21 diputados: Albacete 4, Ciudad Real 5, Cuenca 3, Guadalajara 3 y Toledo 6. Elige también 20 senadores, 4 por provincia.",
  "08": "Castilla y León elige 31 diputados en sus 9 provincias: Ávila 3, Burgos 4, León 4, Palencia 3, Salamanca 4, Segovia 3, Soria 2, Valladolid 5 y Zamora 3. Elige también 36 senadores, 4 por provincia. Soria tiene 2 diputados, el mínimo que la ley da a cada provincia.",
  "09": "Cataluña elige 48 diputados: Barcelona 32, Girona 6, Lleida 4 y Tarragona 6. Elige también 16 senadores, 4 por provincia.",
  "10": "Extremadura elige 9 diputados: Badajoz 5 y Cáceres 4. Elige también 8 senadores, 4 por provincia.",
  "11": "Galicia elige 23 diputados: A Coruña 8, Lugo 4, Ourense 4 y Pontevedra 7. Elige también 16 senadores, 4 por provincia.",
  "12": "La Comunidad de Madrid es una sola provincia y elige 38 diputados, la circunscripción con más escaños. Elige también 4 senadores, como cualquier otra provincia.",
  "13": "Navarra es una sola provincia y elige 5 diputados y 4 senadores.",
  "14": "El País Vasco elige 18 diputados: Araba/Álava 4, Bizkaia 8 y Gipuzkoa 6. Elige también 12 senadores, 4 por provincia.",
  "15": "La Región de Murcia es una sola provincia y elige 10 diputados y 4 senadores.",
  "16": "La Rioja es una sola provincia y elige 4 diputados y 4 senadores.",
  "17": "La Comunitat Valenciana elige 33 diputados: Alicante 12, Castellón 5 y Valencia 16. Elige también 12 senadores, 4 por provincia.",
  "18": "Ceuta elige 1 diputado y 2 senadores. Como solo hay un escaño en el Congreso, no se aplica la regla D'Hondt: es elegido el candidato más votado.",
  "19": "Melilla elige 1 diputado y 2 senadores. Como solo hay un escaño en el Congreso, no se aplica la regla D'Hondt: es elegido el candidato más votado.",
};

// El id es también el nombre del archivo: public/audio/<id>.mp3.
export const NARRACION: Record<string, Narracion> = {
  intro: {
    texto:
      "Esto es el Congreso de los Diputados. Tiene 350 escaños, y cada punto es un diputado. Todos empiezan en el mismo gris: el color no representa partidos, resultados ni previsiones. Los 350 escaños se eligen en 52 circunscripciones: las 50 provincias, Ceuta y Melilla. Señala una comunidad en el mapa para ver cuántos diputados elige.",
    fuentes: [LOREG, RD],
  },
  reparto: {
    texto:
      "El reparto tiene tres pasos. Primero, cada provincia recibe 2 escaños, y Ceuta y Melilla, 1 cada una: en total, 102. Segundo, los 248 restantes se reparten según la población de cada provincia. Así, el decreto de convocatoria fija cuántos diputados elige cada circunscripción. Tercero, el día de la votación, dentro de cada provincia los escaños se asignan según los votos, con la regla D'Hondt. Las candidaturas que no llegan al 3 por ciento de los votos válidos de la provincia no entran en el reparto. Los votos en blanco cuentan como válidos para calcular ese 3 por ciento.",
    fuentes: [LOREG],
  },
  senado: {
    texto:
      "El Senado se elige de otra forma. Cada provincia elige 4 senadores. Gran Canaria, Mallorca y Tenerife eligen 3, y cada una de las demás islas con circunscripción propia, 1. Ceuta y Melilla eligen 2 cada una. En total, 209 senadores de elección directa. Aquí no se usa la regla D'Hondt ni hay barrera del 3 por ciento: cada elector marca hasta 3 nombres en las provincias, y salen elegidos los más votados. Además, los parlamentos autonómicos designan otros senadores, que no se suman en este mapa.",
    fuentes: [LOREG],
  },
  // contexto.md §3.3 (LOREG arts. 5, 96, 108 y 163; Instrucción JEC 1/2012).
  blanco: {
    texto:
      "Votar en blanco, votar nulo y abstenerse no es lo mismo. El voto en blanco es un sobre sin papeleta. Es un voto válido: no va a ninguna candidatura ni da escaños, pero cuenta para calcular el 3 por ciento de los votos válidos que hace falta para entrar en el reparto. Por eso, cuantos más votos en blanco, más votos necesita una candidatura para llegar a ese 3 por ciento. El voto nulo es, por ejemplo, una papeleta que no es la oficial, un sobre con papeletas de candidaturas distintas, o una papeleta tachada, con añadidos o con leyendas. No es un voto válido: no cuenta para el 3 por ciento ni para el reparto. Según la Junta Electoral Central, una señal o una cruz junto a un candidato no anula el voto si no altera la papeleta ni expresa reproche. La abstención es no votar. Votar no es obligatorio, y la abstención no altera el reparto: los escaños se asignan solo con los votos válidos.",
    fuentes: [LOREG_VOTO, JEC],
  },
  ...Object.fromEntries(
    Object.entries(COMUNIDADES).map(([codigo, texto]) => [
      `ccaa-${codigo}`,
      { texto: texto + CIERRE, fuentes: [RD, LOREG] },
    ]),
  ),
};
