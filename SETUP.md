# ¿Cómo voto? · Guía de las elecciones generales 2026

## El reto

Todo lo que necesitas para votar el 29 de noviembre, con fuentes oficiales y también si vives en el extranjero: el voto por correo, los plazos y qué es la ley D'Hondt o qué significan el voto en blanco, el nulo y la abstención. Y un verificador que contrasta lo que te han dicho sobre cómo se vota con la fuente oficial. Solo cómo se vota: nada de candidatos, programas ni encuestas.

Puede haber hasta dos squads en este track, los dos con el mismo reto. Cada uno construye las piezas que le dé tiempo, en el orden que prefiera.

## Qué se espera en la demo

Por ejemplo, alguna de estas cosas:

- Responder «vivo en València y el día 29 no estoy» con los pasos y las fechas del voto por correo.
- Responder «vivo en Berlín, ¿cómo voto?» con las dos opciones del voto desde el extranjero (en el consulado o por correo) y sus fechas.
- Contrastar algo que circula sobre cómo se vota con la fuente oficial que lo confirma o lo desmiente.
- Mostrar cómo se reparten los escaños de una provincia con los resultados oficiales de 2023, sin cambiar votos.

## Piezas

El reto se puede abordar por partes. Elegid las que os dé tiempo y en el orden que queráis.

| Pieza                           | Alcance en unas 4 h                                                                                                                   | Hecho cuando…                                                                                                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Voto por correo, aquí y fuera   | Convertir el calendario y las fuentes oficiales en pasos para quien vive en España y para quien vive en el extranjero o estará fuera. | Cada paso y cada fecha salen de `calendario_29N_2026.json` y enlazan a BOE, JEC, Correos o INE; la consulta del censo se enlaza sin pedir datos.                                                   |
| ¿Es verdad lo que me han dicho? | Contrastar lo que te han dicho sobre cómo se vota con la fuente oficial.                                                              | Responde «coincide», «no coincide» o «no verificable» con la cita de la fuente; lo que no trate de cómo se vota queda fuera de alcance, y nunca juzga partidos, candidatos, programas ni promesas. |
| Cómo se reparten los escaños    | Aplicar D'Hondt a una provincia con los resultados oficiales de 2023.                                                                 | Reproduce los escaños oficiales de 2023 con el umbral del 3 %, sin campos para cambiar votos; para jugar con cifras, usa candidaturas genéricas (A, B, C…), como el apartado 3.2 de `contexto.md`. |

## Materiales en esta carpeta

| Archivo                                            | Contenido                                                                                                                                                                                                                                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `resultados_congreso_2023_provincias.csv`          | Elecciones al Congreso del 23-J de 2023: 550 filas (provincia × candidatura), 52 circunscripciones y 350 escaños. Incluye censo, votantes, votos válidos, en blanco y nulos, y votos y escaños por candidatura. La columna `partido_agrupado` permite sumar totales nacionales |
| `resultados_congreso_2023_municipios_valencia.csv` | 266 municipios de la provincia de Valencia. No incluye el voto CERA (residentes en el extranjero)                                                                                                                                                                              |
| `calendario_29N_2026.json`                         | 26 fechas del BOE, del calendario de la Junta Electoral Central y de los plazos del INE, cada una con su fuente. Incluye el voto desde el extranjero (CERA) y el de los temporalmente ausentes (ERTA)                                                                          |
| `FUENTES.md`                                       | Origen de los datos, comprobaciones y condiciones de reutilización. Hay que citar «Origen de los datos: Ministerio del Interior»                                                                                                                                               |

**Fechas clave**

| Fecha          | Hito                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------- |
| 6/10           | Convocatoria                                                                             |
| 21–26/10       | Presentación de candidaturas                                                             |
| 24–30/10       | Envío de la documentación a quien vive en el extranjero (sin solicitarla)                |
| hasta el 31/10 | Solicitud del voto si estarás temporalmente en el extranjero (ERTA), en el consulado     |
| hasta el 19/11 | Solicitud del voto por correo (residentes en España)                                     |
| 4–24/11        | Envío del voto por correo al consulado (residentes en el extranjero)                     |
| 3–25/11        | Envío del voto ERTA por correo certificado a tu mesa, desde que recibes la documentación |
| hasta el 25/11 | Envío del voto por correo en Correos (residentes en España)                              |
| 21–26/11       | Voto en el consulado (residentes en el extranjero)                                       |
| 13–27/11       | Campaña electoral                                                                        |
| 28/11          | Jornada de reflexión                                                                     |
| 29/11          | Votación, de 9:00 a 20:00                                                                |

La consulta del censo y las reclamaciones (12–19/10) ya están cerradas el 22/10: la herramienta no debe ofrecerlas como trámite abierto. Sí puede enlazar la consulta de mesa y local del INE (<https://sede.ine.gob.es/ce-mesas/?lang=es_ES>).

Comprobación útil: aplicando D'Hondt con un umbral del 3 % sobre los votos válidos (blancos incluidos) se reproducen los escaños oficiales de 2023 en las 52 circunscripciones.

## Fuentes oficiales

| Fuente                                                                                                  | Qué ofrece                                                         |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [Infoelectoral (Ministerio del Interior)](https://infoelectoral.interior.gob.es)                        | Resultados históricos oficiales (área de descargas)                |
| [Junta Electoral Central](https://www.juntaelectoralcentral.es/cs/jec/documentos/eg2026_calendario.pdf) | Calendario electoral oficial, acuerdos e instrucciones del proceso |
| [INE · Oficina del Censo Electoral](https://www.ine.es/dyngs/CEL/index.htm?cid=1702)                    | Plazos para cada tipo de elector, consulta del censo y voto CERA   |
| [Correos](https://www.correos.es/es/es/particulares/para-el-ciudadano/voto-por-correo)                  | Solicitud y depósito del voto por correo                           |
| [BOE](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742)                                        | Real Decreto 806/2026 de convocatoria (6/10/2026)                  |

Otras fuentes, no oficiales:

- [Google Fact Check Tools](https://developers.google.com/fact-check-tools): opcional. Solo para enlazar verificaciones ya publicadas sobre cómo se vota; descarta las que hablen de partidos o candidatos. La herramienta funciona sin clave, con su propio corpus (`contexto.md`, apartado 6.3). Si la organización os da la clave, está en `FACTCHECK_API_KEY`.
- [Maldita · fuentes electorales](https://maldita.es/malditateexplica/20230717/herramientas-datos-fuentes-elecciones-generales-23j/): mapa de fuentes oficiales elaborado por verificadores para las generales de 2023.

## A tener en cuenta

- **Neutralidad estricta:**
  - Ni recomendaciones de voto ni valoraciones de partidos o candidatos.
  - Ni candidatos, ni programas, ni encuestas: no se enlazan ni se resumen.
- **Sin fuentes no hay veredicto:** el verificador responde «no verificable».
- **Plazos:** las fechas deben salir del calendario oficial, no del conocimiento del modelo.

## Resumen para el agente

```markdown
# ¿Cómo voto? · Elecciones generales 29-N 2026 · Build night · BARRACA x SOTI

Objetivo: ayudar a votar el 29/11/2026, también desde el extranjero (voto por correo, voto en el consulado, plazos, D'Hondt, voto nulo y en blanco), con fuentes oficiales, y/o contrastar lo que dicen sobre cómo se vota.
Datos: resultados_congreso_2023_provincias.csv, resultados_congreso_2023_municipios_valencia.csv, calendario_29N_2026.json; origen en FUENTES.md (citar "Origen de los datos: Ministerio del Interior").
Fuentes: infoelectoral.interior.gob.es, JEC, INE, Correos y BOE. Opcional: Google Fact Check Tools (clave en FACTCHECK_API_KEY; sin clave, corpus propio).
Reglas: solo cómo se vota, nada de candidatos, partidos, programas ni encuestas, y ninguna recomendación de voto; D'Hondt sin cambiar votos de candidaturas reales; las fechas salen de calendario_29N_2026.json; sin fuentes, "no verificable"; no guardar datos del usuario; claves solo en servidor; la herramienta se sirve bajo /<equipo> (campo equipo de ficha.json) y muestra el aviso "No es un servicio oficial".
```
