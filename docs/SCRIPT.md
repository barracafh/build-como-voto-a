# Guiones de narración · Hemiciclo del Congreso

Textos fijos para generar audio con ElevenLabs en `/escanos`. El texto que se usa vive en `src/datos/narracion.ts`; `bun run narracion` genera `public/audio/<id>.mp3`. Se generan una vez y se sirven como archivos; no se envía a la voz nada que escriba el ciudadano.

## Reglas

- Cada guion sale de `contexto.md` §3 (líneas 190-271) o de `src/datos/cortes-29n.ts`. Si una cifra cambia allí, se regenera el audio.
- Neutral: sin partidos, candidaturas, encuestas ni valoraciones sobre si el reparto es justo o proporcional.
- No se narra lo que está sin verificar: el número de senadores que designan los parlamentos autonómicos (`contexto.md:269`).
- Texto pensado para el oído: cifras en dígitos, sin abreviaturas («artículo», no «art.»; «por ciento», no «%»).
- La voz suena solo cuando la persona la pide con un botón: al abrir la vista 3D o al fijar una comunidad con clic. Nunca al pasar el ratón ni de forma automática.
- Junto al audio se muestra el mismo texto y su fuente con `<Fuentes />`.

## Fuentes

| Clave | Fuente | URL |
| --- | --- | --- |
| `loreg` | Ley Orgánica 5/1985 (LOREG), artículos 161 a 166 · BOE | https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672 |
| `rd` | Real Decreto 806/2026 de convocatoria, anexo · BOE | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742 |

---

## 1. `intro`: al abrir la vista 3D

**Disparador:** se abre el diálogo 3D (`abierto`) sin comunidad fijada.
**Fuentes:** `loreg`, `rd`.

> Esto es el Congreso de los Diputados. Tiene 350 escaños, y cada punto es un diputado. Todos empiezan en el mismo gris: el color no representa partidos, resultados ni previsiones. Los 350 escaños se eligen en 52 circunscripciones: las 50 provincias, Ceuta y Melilla. Señala una comunidad en el mapa para ver cuántos diputados elige.

## 2. `reparto`: cómo se reparten los 350 escaños

**Disparador:** botón «¿Cómo se reparten?» en la vista 3D.
**Fuentes:** `loreg` (artículos 162 y 163).

> El reparto tiene tres pasos. Primero, cada provincia recibe 2 escaños, y Ceuta y Melilla, 1 cada una: en total, 102. Segundo, los 248 restantes se reparten según la población de cada provincia. Así, el decreto de convocatoria fija cuántos diputados elige cada circunscripción. Tercero, el día de la votación, dentro de cada provincia los escaños se asignan según los votos, con la regla D'Hondt. Las candidaturas que no llegan al 3 por ciento de los votos válidos de la provincia no entran en el reparto. Los votos en blanco cuentan como válidos para calcular ese 3 por ciento.

## 3. `senado`: el Senado

**Disparador:** botón «¿Y el Senado?» en la vista 3D.
**Fuentes:** `loreg` (artículos 165 y 166).

> El Senado se elige de otra forma. Cada provincia elige 4 senadores. Gran Canaria, Mallorca y Tenerife eligen 3, y cada una de las demás islas con circunscripción propia, 1. Ceuta y Melilla eligen 2 cada una. En total, 209 senadores de elección directa. Aquí no se usa la regla D'Hondt ni hay barrera del 3 por ciento: cada elector marca hasta 3 nombres en las provincias, y salen elegidos los más votados. Además, los parlamentos autonómicos designan otros senadores, que no se suman en este mapa.

## 4. `ccaa-<código>`: al fijar una comunidad

**Disparador:** `fijada` cambia a una comunidad (clic o Enter en el mapa).
**Fuentes:** `rd` (diputados), `loreg` artículo 165 (senadores).
**Cierre común**, al final de cada guion de esta sección:

> El bloque en rojo es ilustrativo: no indica dónde se sientan.

Las cifras coinciden con `CORTES_POR_CCAA` (suma: 350 diputados y 209 senadores).

| Código | Comunidad | Diputados | Senadores |
| --- | --- | --- | --- |
| 01 | Andalucía | 60 | 32 |
| 02 | Aragón | 13 | 12 |
| 03 | Principado de Asturias | 7 | 4 |
| 04 | Illes Balears | 8 | 6 |
| 05 | Canarias | 15 | 11 |
| 06 | Cantabria | 5 | 4 |
| 07 | Castilla-La Mancha | 21 | 20 |
| 08 | Castilla y León | 31 | 36 |
| 09 | Cataluña | 48 | 16 |
| 10 | Extremadura | 9 | 8 |
| 11 | Galicia | 23 | 16 |
| 12 | Comunidad de Madrid | 38 | 4 |
| 13 | Comunidad Foral de Navarra | 5 | 4 |
| 14 | País Vasco | 18 | 12 |
| 15 | Región de Murcia | 10 | 4 |
| 16 | La Rioja | 4 | 4 |
| 17 | Comunitat Valenciana | 33 | 12 |
| 18 | Ceuta | 1 | 2 |
| 19 | Melilla | 1 | 2 |

### `ccaa-01` Andalucía

> Andalucía elige 60 diputados en sus 8 provincias: Almería 6, Cádiz 8, Córdoba 6, Granada 7, Huelva 5, Jaén 5, Málaga 11 y Sevilla 12. Elige también 32 senadores, 4 por provincia.

### `ccaa-02` Aragón

> Aragón elige 13 diputados: Huesca 3, Teruel 3 y Zaragoza 7. Elige también 12 senadores, 4 por provincia.

### `ccaa-03` Principado de Asturias

> Asturias es una sola provincia y elige 7 diputados y 4 senadores.

### `ccaa-04` Illes Balears

> Illes Balears elige 8 diputados en una sola circunscripción. Para el Senado vota por islas: Mallorca elige 3 senadores, y Menorca, Ibiza y Formentera, 1 cada una. En total, 6. Ibiza y Formentera eligen por separado por primera vez en estas elecciones.

### `ccaa-05` Canarias

> Canarias elige 15 diputados: Las Palmas 8 y Santa Cruz de Tenerife 7. Para el Senado vota por islas: Gran Canaria y Tenerife eligen 3 senadores cada una, y Fuerteventura, Lanzarote, La Gomera, El Hierro y La Palma, 1 cada una. En total, 11.

### `ccaa-06` Cantabria

> Cantabria es una sola provincia y elige 5 diputados y 4 senadores.

### `ccaa-07` Castilla-La Mancha

> Castilla-La Mancha elige 21 diputados: Albacete 4, Ciudad Real 5, Cuenca 3, Guadalajara 3 y Toledo 6. Elige también 20 senadores, 4 por provincia.

### `ccaa-08` Castilla y León

> Castilla y León elige 31 diputados en sus 9 provincias: Ávila 3, Burgos 4, León 4, Palencia 3, Salamanca 4, Segovia 3, Soria 2, Valladolid 5 y Zamora 3. Elige también 36 senadores, 4 por provincia. Soria tiene 2 diputados, el mínimo que la ley da a cada provincia.

### `ccaa-09` Cataluña

> Cataluña elige 48 diputados: Barcelona 32, Girona 6, Lleida 4 y Tarragona 6. Elige también 16 senadores, 4 por provincia.

### `ccaa-10` Extremadura

> Extremadura elige 9 diputados: Badajoz 5 y Cáceres 4. Elige también 8 senadores, 4 por provincia.

### `ccaa-11` Galicia

> Galicia elige 23 diputados: A Coruña 8, Lugo 4, Ourense 4 y Pontevedra 7. Elige también 16 senadores, 4 por provincia.

### `ccaa-12` Comunidad de Madrid

> La Comunidad de Madrid es una sola provincia y elige 38 diputados, la circunscripción con más escaños. Elige también 4 senadores, como cualquier otra provincia.

### `ccaa-13` Comunidad Foral de Navarra

> Navarra es una sola provincia y elige 5 diputados y 4 senadores.

### `ccaa-14` País Vasco

> El País Vasco elige 18 diputados: Araba/Álava 4, Bizkaia 8 y Gipuzkoa 6. Elige también 12 senadores, 4 por provincia.

### `ccaa-15` Región de Murcia

> La Región de Murcia es una sola provincia y elige 10 diputados y 4 senadores.

### `ccaa-16` La Rioja

> La Rioja es una sola provincia y elige 4 diputados y 4 senadores.

### `ccaa-17` Comunitat Valenciana

> La Comunitat Valenciana elige 33 diputados: Alicante 12, Castellón 5 y Valencia 16. Elige también 12 senadores, 4 por provincia.

### `ccaa-18` Ceuta

> Ceuta elige 1 diputado y 2 senadores. Como solo hay un escaño en el Congreso, no se aplica la regla D'Hondt: es elegido el candidato más votado.

### `ccaa-19` Melilla

> Melilla elige 1 diputado y 2 senadores. Como solo hay un escaño en el Congreso, no se aplica la regla D'Hondt: es elegido el candidato más votado.

---

## Fuera de guion

Si se pregunta por algo que no está aquí, la voz no lo improvisa. El texto en pantalla dice que no puede confirmarlo y enlaza la fuente oficial (`rd` o Infoelectoral, https://infoelectoral.interior.gob.es).
