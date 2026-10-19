# Fuentes y procesamiento: generales 23-J 2023 (Congreso) y calendario del 29-N

## Origen de los datos

**Fuente primaria (oficial):** Ministerio del Interior, Área de descargas de Infoelectoral:
https://infoelectoral.interior.gob.es (sección Resultados electorales, Área de descargas).
Elección: Congreso, julio de 2023. Paquete municipal `02202307_MUNI.zip`. Los equipos pueden descargar ahí los ficheros originales.
URL histórica del área de descargas: `http://www.infoelectoral.mir.es/infoelectoral/min/areaDescarga.html` (dominio antiguo).

**Espejo usado (el portal oficial no era accesible desde el entorno de trabajo):**
repositorio GitHub `dadosdelaplace/pollspain-data`, datos asociados al paquete R {pollspain}
(J. Álvarez-Liébana et al.). Contiene los `.DAT` oficiales de Infoelectoral sin modificar, extraídos del ZIP.
Fijado al commit `22cd9f30b92ed9f25943e47e01ee9ce9676b0fa0` (4 de mayo de 2025).

Ficheros descargados con `curl`:

| Fichero      | Contenido                                                  | URL                                                                                                                                             | sha256                                                             |
| ------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 03022307.DAT | Candidaturas (siglas, denominación, código nacional)       | https://raw.githubusercontent.com/dadosdelaplace/pollspain-data/22cd9f30b92ed9f25943e47e01ee9ce9676b0fa0/data/02-congress/02202307/03022307.DAT | `d09dfeb275f7af832a737ee06c1086394930c473381cad957fa11ede6a43dac3` |
| 05022307.DAT | Datos comunes por municipio (censo, blancos, nulos)        | …/05022307.DAT                                                                                                                                  | `539e9442f3e40fdfb8140ff0654d9e28b2e6947fe234f3f7f260b4de7ea2fb77` |
| 06022307.DAT | Votos por candidatura y municipio                          | …/06022307.DAT                                                                                                                                  | `8eaf9317affd2515cb547038f7035a351b7f09be4cc680eaecb907de2de10fe5` |
| 07022307.DAT | Datos comunes de ámbito superior (provincia, CCAA, España) | …/07022307.DAT                                                                                                                                  | `17240486a5550875bcbe05c06880c7cd25cc9fd82ecc60a41dd4ee5d8c8082f6` |
| 08022307.DAT | Votos y escaños por candidatura en ese ámbito              | …/08022307.DAT                                                                                                                                  | `dd383f724fb77b044315a4fb50fdb6ad6d05164933cebd5fb2aa61d67a2042a1` |

(Las URLs abreviadas comparten el prefijo de la primera fila. Los ficheros 01 y 02, de control e identificación, también se descargaron.)

**Diseño de registro:** especificación "Ficheros de resultados electorales" del Ministerio del Interior. Las posiciones de campo
se han comprobado con el código del paquete R `rOpenSpain/infoelectoral` (`R/read03.R`, `read05.R`, `read06.R`, `read07.R`, `read08.R`),
https://github.com/rOpenSpain/infoelectoral.

## Fiabilidad y comprobaciones

- El fichero 07 marca las 52 circunscripciones como datos oficiales (`datos_oficiales = S`, escrutinio definitivo, CERA incluido).
- Los totales nacionales coinciden con el resultado oficial publicado: PP 8.160.837 votos y 137 escaños; PSOE 7.821.718 y 121; VOX 3.057.000 y 33; SUMAR 3.044.996 y 31; ERC 7; JUNTS 7; EH Bildu 6; PNV 5; BNG 1; CCa 1; UPN 1. En total, 350 escaños.
- En cada provincia, la suma de votos por candidatura coincide con el campo `votos_candidaturas` del fichero 07.
- Recalculando con D'Hondt (umbral del 3 % sobre votos válidos, blancos incluidos; LOREG art. 163) se obtienen los escaños oficiales en las 52 circunscripciones.

## Licencia y condiciones

- **Datos:** información del sector público reutilizable conforme a la Ley 37/2007 y al RD 1495/2011. Aviso legal del Ministerio del Interior: https://www.interior.gob.es/opencms/es/aviso-legal/.
  Se permite el uso comercial y no comercial con estas condiciones: citar **"Origen de los datos: Ministerio del Interior"**, no desnaturalizar la información,
  no dar a entender que el Ministerio patrocina el uso y conservar los metadatos de actualización.
- **Espejo:** el repositorio `pollspain-data` declara licencia MIT (© 2024 Javier Álvarez Liébana). No cambia la naturaleza de los datos de origen.

## Procesamiento

1. Lee los `.DAT` en ISO-8859-1 y los escribe en UTF-8.
2. **Provincias:** fichero 07 (se descartan los agregados con código de provincia 99) unido al 08 por provincia y al 03 por código de candidatura.
   - `censo` = censo de escrutinio (CER + CERA).
   - `votantes` = blancos + nulos + votos a candidaturas.
   - `votos_validos` = blancos + votos a candidaturas.
   - `partido` = siglas de la candidatura en esa provincia (p. ej. PSC, PSdeG-PSOE).
   - `partido_agrupado` = siglas del código de agrupación nacional (PSC → PSOE, SUMAR-ECP → SUMAR…), útil para totales estatales.
   - Columnas extra: `codigo_candidatura`, `denominacion`, `codigo_ccaa`.
3. **Municipios de València (46):** fichero 05 (distrito 99 = total municipal) unido al 06.

## Salidas

- `resultados_congreso_2023_provincias.csv`: 550 filas (provincia × candidatura) de 52 circunscripciones, que suman 350 escaños.
- `resultados_congreso_2023_municipios_valencia.csv`: 2.926 filas (266 municipios × candidatura). **Aviso:** no incluye el voto CERA
  (residentes en el extranjero), que solo se agrega a nivel provincial. La suma municipal es 7.334 votos a candidaturas, 43 blancos y 142 nulos menor que el total provincial.
  No tiene `escanos_obtenidos`, porque los escaños solo se asignan a nivel provincial.
- `calendario_29N_2026.json`: fechas del 29-N 2026, comprobadas el 18/10/2026 en el BOE (Real Decreto 806/2026, BOE-A-2026-20742, y LOREG) y en el [calendario electoral de la Junta Electoral Central](https://www.juntaelectoralcentral.es/cs/jec/documentos/eg2026_calendario.pdf), y el 19/10/2026 en los [plazos para electores del INE](https://www.ine.es/dyngs/CEL/index.htm?cid=1702). Incluye el voto de los residentes en el extranjero (CERA) y de los temporalmente ausentes (ERTA). El último día para enviar el voto por correo desde España es el 25 de noviembre, según la JEC.
