# Tareas · Votijo · equipo como-voto-a

Tablero compartido del squad. Añadid tareas con `- [ ]`, poned vuestro nombre entre corchetes al cogerla (`- [ ] [Ana] …`) y marcad `- [x]` al terminar. `git pull --rebase` antes de cada push; `bun run build` tiene que pasar.

## El problema en una frase

Una guía para votar el 29/11/2026 (aquí, por correo y desde el extranjero) y un verificador de lo que te cuentan sobre **cómo se vota**, siempre con fuente oficial. Nada de partidos, candidatos, programas ni encuestas.

## Demo objetivo (elegir 2–3)

1. «Vivo en València y el 29 no estoy» → pasos y fechas del voto por correo.
2. «Vivo en Berlín, ¿cómo voto?» → CERA: en el consulado o por correo, con fechas.
3. «Me han dicho que si pido el voto por correo puedo votar también en la mesa» → **No coincide**, art. 73.1 LOREG.
4. Reparto D'Hondt de una provincia con los resultados de 2023 (sin tocar votos).

## Decisiones de partida

- **Fechas**: solo de `datos/calendario_29N_2026.json` (26 entradas, cada una con `fuente`). El modelo nunca escribe una fecha.
- **IA solo para clasificar/redactar**: el veredicto y la cita salen de fichas propias, no del LLM (`contexto.md` §6.7).
- **Sin datos personales**: no se pide DNI ni se consulta el censo; se enlaza la sede del INE.
- La consulta del censo y las reclamaciones (12–19/10) ya están cerradas: no ofrecerlas.
- Nuestros datos derivados van en `src/datos/`. No editar `datos/`, `comun/`, `contexto.md`, `SETUP.md`.

## Primeros pasos (hora 0)

- [x] `bun install` ✓, `.env.local` con `HELMCODE_API_KEY` y `HELMCODE_MODEL`, `bun run dev` → `localhost:3000/como-voto-a`
- [x] Repartir piezas entre el squad (A: voto por correo · B: verificador · C: D'Hondt)
- [x] `ficha.json`: `datos` → `"reales"` (son datos públicos) y añadir Infoelectoral a `fuentes`
- [x] Portada (`src/app/page.tsx`): día de votación, índice de piezas, plazos abiertos y consulta de mesa del INE
- [x] Rutas vacías por pieza para trabajar sin conflictos: `/correo` (A), `/verificar` (B), `/escanos` (C). Cabecera y pie comunes en `src/components/Pagina.tsx`
- [x] Calendario tipado en `src/lib/calendario.ts`: `plazo(id)`, `estado(p)` (cerrado/abierto/próximo, hora de Madrid), `rango(p)`, `fuenteCalendario`

## Pieza A · Voto por correo, aquí y fuera

Base: `contexto.md` §2.2 (España), §2.3 (CERA), §2.4 (ERTA), calendario.

- [x] [Implementador] Selector de perfil con controles nativos: resido en España y no estaré / resido fuera (CERA) / estaré fuera temporalmente (ERTA, `?donde=erta`)
- [x] [Implementador] Mapear cada perfil a sus `id` del calendario → pasos numerados con fecha y enlace a la fuente de cada plazo
- [x] [Implementador] Marcar plazos cerrados según la fecha de hoy y «cierra en N días» en los abiertos
- [x] [Implementador] Tarjeta sol para el plazo más urgente del perfil (`urgente()` en `src/lib/plazos-abiertos.ts`)
- [x] [Implementador] «Dónde se hace»: Correos, consulado, consulta de mesa del INE (`sede.ine.gob.es/ce-mesas`)
- [ ] Opcional: texto libre → IA clasifica en un perfil (sin guardar el texto) y se muestra la misma respuesta determinista
- [x] [Javier] Selector «Vivo en España / Vivo fuera de España» en `/correo` (`?donde=aqui|fuera`) con tarjeta sol del plazo clave
- [x] [Javier] Chatbot por perfil (`modo` `correo-aqui` / `correo-fuera` en `src/lib/asistente.ts`), sin guardar el texto
- [x] [Sandra] Calendario gráfico del voto por correo en España en `?donde=aqui` (`CalendarioEspana` sobre `LineaTiempo`), con el camino ERTA como alternativa
- [x] [Sandra] Calendario gráfico CERA en `?donde=fuera` (`CalendarioExtranjero`): documentación, papeletas y correo o urna en el consulado
- [ ] Revisar con más casos reales que los pasos y fechas coinciden con el calendario
- [x] [Implementador] Chat: el modelo devuelve el `id` del plazo y la fecha de cada paso sale de `rango()`; una fecha fuera del calendario → «no puedo confirmarlo» (PLUT-25, `src/lib/asistente.test.ts`)
- [x] [Implementador] Chat: `/api/chat` ya no manda el texto del modelo antes de `validar()`; solo `{"progreso"}` sin contenido y el `{"fin"}` validado. Se quita el borrador en vivo y `src/lib/parcial.ts` (PLUT-26)

## Pieza B · ¿Es verdad lo que me han dicho?

Base: `contexto.md` §6 (alcance, formato §6.2, ejemplos §6.3, plan §6.8).

- [x] [Implementador] Corpus `src/datos/afirmaciones.json`: 39 fichas `{id, afirmacion, variantes, resultado, articulo, cita, url, fecha_consulta}` (las 8 de §6.3 y hechos de §1–3), cada cita literal de BOE (LOREG consolidada), Interior o INE, consultados el 22/10
- [ ] Revisión humana de cada ficha contra la fuente
- [x] [Javier] Chatbot verificador en `/verificar` (`modo` `verificar`, ruta común `src/app/api/chat/route.ts`): COINCIDE / NO COINCIDE solo con cita literal de `contexto.md` y fuente permitida; si no, «No verificable»
- [x] [Implementador] El verificador ya usa las fichas (`src/lib/verificador.ts`): el modelo solo elige ficha; veredicto, cita y fuente salen de ella. Si HelmCode falla, comparación léxica local (solo da veredicto con casi la misma frase)
- [x] Tipos (b)–(d) → respuesta fija «fuera de alcance: aquí solo comprobamos cómo se vota»
- [x] UI con el formato de §6.2: Afirmación · Resultado (COINCIDE / NO COINCIDE / NO VERIFICABLE) · Fuente · Cita · Matiz. Sin «verdadero/falso/bulo»
- [x] [Implementador] Batería de prueba: 15 afirmaciones (§6.3 + fuera de alcance + fuera de corpus) en `src/lib/verificador.test.ts` (`bun test`)
- [x] [Implementador] Endpoint `/api/chat`: exige `content-type: application/json`, cuerpo de 32 KB como máximo y 6 mensajes; sin registro del texto
- [x] [Javier] Opcional: Google Fact Check (`FACTCHECK_API_KEY`) para enlazar verificaciones publicadas, atribuidas (`src/lib/factcheck.ts`, `<Publicadas />`)

## Pieza C · Cómo se reparten los escaños

Base: `datos/resultados_congreso_2023_provincias.csv`, `contexto.md` §3.1–3.3.

- [x] Función pura `dhondt(votos, escaños, válidos)` con umbral del 3 % sobre válidos (blancos incluidos)
- [x] Test: reproduce los 350 escaños de 2023 en las 52 circunscripciones
- [x] Selector de provincia (`<select>`) → tabla de cocientes y escaños, sin campos editables (ahora oculto: `MOSTRAR_SELECTOR = false` en `Escanos.tsx`, se muestra València)
- [x] Modo «juega con cifras» solo con candidaturas genéricas A, B, C…
- [x] [Implementador] Explicación de voto en blanco, nulo y abstención (§3.3)
- [x] Citar «Origen de los datos: Ministerio del Interior»
- [x] [Nubi] Hemiciclo interactivo y D'Hondt con los resultados de 2023
- [x] [Nubi] [Fran] Mapa de diputados y senadores por comunidad que ilumina su bloque en el hemiciclo
- [x] [Nubi] Hemiciclo en 3D a pantalla completa, con el mapa al lado

## Portada y transversal

- [x] [Sandra] Plazos abiertos en la portada como gráfico por tipo de votante, en pestañas (`PlazosAbiertos`)
- [x] [Sandra] Portada con héroe de atardecer y cuenta atrás en fichas; páginas interiores con el mismo estilo; sol de cartel en cabeceras, pie y botón de enviar
- [x] [Javier] Respuestas del chat en streaming con `glm5.3`
- [x] [akae] Chat directo en la portada (modo `general`) con tres preguntas de ejemplo
- [x] [akae] Cuentas atrás a la votación y al envío del voto por correo, al segundo, y tarjeta flotante arriba a la derecha al bajar
- [x] [akae] Portada sin caché: los plazos cierran a su hora, y tras las 20:00 del 29/11 dice que la votación ha terminado
- [x] [akae] Espera del chat visible: la pregunta aparece al momento, con indicador y líneas de carga
- [x] [akae] Iconos de las tres piezas (sobre, lupa, mapa de España con Canarias)
- [x] [akae] Toda la web en català/valencià, euskara y galego: selector en la cabecera, diccionarios en `src/i18n/diccionarios/`, el chat responde en la lengua elegida. `bun scripts/textos.ts --faltan` dice qué falta
- [x] [akae] Termómetro de confianza al final de cada respuesta del chat (`src/lib/confianza.ts`): alta con ficha y cita literal, media con fuentes de la base, baja sin fuente; incluye si hay verificaciones en Google Fact Check
- [x] [Fran] Next.js 16.4.2 por dos avisos de seguridad
- [x] [Sandra] Skill `revisar-commit` con la checklist antes de cada commit
- [x] [Implementador] Serif solo en `h1`, `h2` y cifras (pie y «hoy se vota» en sans); `/escanos` enlaza Resultados electorales de Infoelectoral y cita arts. 161 a 165 en las dos fuentes (PLUT-33)
- [x] [Implementador] «¿Algo está mal? Avísanos» pasa a `outline`: un solo `sunset` por pantalla (el de enviar del chat) (PLUT-29)
- [ ] Revisión de las traducciones por hablantes nativos, sobre todo el euskera (las fechas no se pueden declinar)

## Cierre y demo

- [ ] Revisar diseño Sol: un `sunset` por pantalla, una tarjeta sol por vista, 320 px sin scroll horizontal, foco visible
- [ ] Revisar neutralidad: ningún partido, candidato, programa ni encuesta enlazado o valorado
- [x] Cada respuesta con `<Fuentes />` enlazando la página concreta (portada, `/correo`, `/verificar`, `/escanos` y cada respuesta del chat)
- [ ] Guion de demo con los 4 casos de arriba
- [ ] Push a `main` con build verde y comprobar `build.barraca.house/como-voto-a`

## Ideas / pendientes

- `/escanos` tiene scroll horizontal a 360 px por la tabla de resultados (`min-w-[520px]`), también en castellano.
- En local hace falta Node 22 (`engines`): con Node 20, `/escanos` falla por `Object.groupBy`.
- Los títulos de las páginas (`metadata`) siguen solo en castellano.
