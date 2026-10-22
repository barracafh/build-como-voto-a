# Tareas · ¿Cómo voto? (29N) · equipo como-voto-a

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

- [ ] `bun install` ✓, `.env.local` con `HELMCODE_API_KEY` y `HELMCODE_MODEL`, `bun run dev` → `localhost:3000/como-voto-a`
- [ ] Repartir piezas entre el squad (A: voto por correo · B: verificador · C: D'Hondt)
- [x] `ficha.json`: `datos` → `"reales"` (son datos públicos) y añadir Infoelectoral a `fuentes`
- [x] Portada (`src/app/page.tsx`): día de votación, índice de piezas, plazos abiertos y consulta de mesa del INE
- [x] Rutas vacías por pieza para trabajar sin conflictos: `/correo` (A), `/verificar` (B), `/escanos` (C). Cabecera y pie comunes en `src/components/Pagina.tsx`
- [x] Calendario tipado en `src/lib/calendario.ts`: `plazo(id)`, `estado(p)` (cerrado/abierto/próximo, hora de Madrid), `rango(p)`, `fuenteCalendario`

## Pieza A · Voto por correo, aquí y fuera

Base: `contexto.md` §2.2 (España), §2.3 (CERA), §2.4 (ERTA), calendario.

- [ ] Selector de perfil con controles nativos: resido en España y no estaré / resido fuera (CERA) / estaré fuera temporalmente (ERTA)
- [ ] Mapear cada perfil a sus `id` del calendario → pasos numerados con fecha y enlace (BOE, JEC, Correos, INE)
- [ ] Marcar plazos cerrados según la fecha de hoy (p. ej. ERTA termina el 31/10)
- [ ] Tarjeta sol para el plazo más urgente del perfil
- [ ] «Dónde se hace»: Correos, consulado, consulta de mesa del INE (`sede.ine.gob.es/ce-mesas`)
- [ ] Opcional: texto libre → IA clasifica en un perfil (sin guardar el texto) y se muestra la misma respuesta determinista
- [x] [Javier] Selector «Vivo en España / Vivo fuera de España» en `/correo` (`?donde=aqui|fuera`) con tarjeta sol del plazo clave
- [x] [Javier] Chatbot por perfil (`modo` `correo-aqui` / `correo-fuera` en `src/lib/asistente.ts`), sin guardar el texto
- [ ] Revisar con más casos reales que los pasos y fechas coinciden con el calendario

## Pieza B · ¿Es verdad lo que me han dicho?

Base: `contexto.md` §6 (alcance, formato §6.2, ejemplos §6.3, plan §6.8).

- [ ] Corpus `src/datos/afirmaciones.json`: 30–40 fichas `{id, afirmacion, variantes, resultado, articulo, cita, url, fecha_consulta}` (empezar por las 8 de §6.3)
- [ ] Revisión humana de cada ficha contra la fuente
- [x] [Javier] Chatbot verificador en `/verificar` (`modo` `verificar`, ruta común `src/app/api/chat/route.ts`): COINCIDE / NO COINCIDE solo con cita literal de `contexto.md` y fuente permitida; si no, «No verificable»
- [ ] Sustituir la base de `contexto.md` por las fichas revisadas de `src/datos/afirmaciones.json` cuando estén
- [x] Tipos (b)–(d) → respuesta fija «fuera de alcance: aquí solo comprobamos cómo se vota»
- [x] UI con el formato de §6.2: Afirmación · Resultado (COINCIDE / NO COINCIDE / NO VERIFICABLE) · Fuente · Cita · Matiz. Sin «verdadero/falso/bulo»
- [ ] Batería de prueba: 15 afirmaciones (§6.3 + fuera de alcance + fuera de corpus)
- [ ] Opcional: Google Fact Check (`FACTCHECK_API_KEY`) para enlazar verificaciones publicadas, atribuidas

## Pieza C · Cómo se reparten los escaños

Base: `datos/resultados_congreso_2023_provincias.csv`, `contexto.md` §3.1–3.3.

- [ ] Función pura `dhondt(votos, escaños, válidos)` con umbral del 3 % sobre válidos (blancos incluidos)
- [ ] Test: reproduce los 350 escaños de 2023 en las 52 circunscripciones
- [ ] Selector de provincia (`<select>`) → tabla de cocientes y escaños, sin campos editables
- [ ] Modo «juega con cifras» solo con candidaturas genéricas A, B, C…
- [ ] Explicación de voto en blanco, nulo y abstención (§3.3)
- [ ] Citar «Origen de los datos: Ministerio del Interior»

## Cierre y demo

- [ ] Revisar diseño Sol: un `sunset` por pantalla, una tarjeta sol por vista, 320 px sin scroll horizontal, foco visible
- [ ] Revisar neutralidad: ningún partido, candidato, programa ni encuesta enlazado o valorado
- [ ] Cada respuesta con `<Fuentes />` enlazando la página concreta
- [ ] Guion de demo con los 4 casos de arriba
- [ ] Push a `main` con build verde y comprobar `build.barraca.house/como-voto-a`

## Ideas / pendientes

- …
