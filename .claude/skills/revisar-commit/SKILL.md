---
name: revisar-commit
description: Checklist obligatoria antes de cada commit o push en este repo (¿Cómo voto? 29N, Build night). Úsala siempre que se vaya a hacer git commit, git push o se pida "commitea", "sube esto" o "ship". Verifica reglas de plataforma, neutralidad electoral, fechas, secretos, diseño Sol y build.
---

# Revisar antes de commitear · ¿Cómo voto? (29N)

Ejecuta esta lista sobre `git diff --staged` (o `git diff` si no hay nada en stage) ANTES de crear el commit. Si algo falla, corrígelo o avisa; no commitees en rojo.

## 1. Archivos prohibidos
- [ ] No hay cambios en `datos/`, `comun/`, `contexto.md`, `SETUP.md` (material de la organización). Nuestros datos van en `src/datos/`.
- [ ] `ficha.json`: `equipo` sigue siendo `como-voto-a`. `datos` es `simulados` o `reales` (públicos), nunca personales.
- [ ] No se sube `.env*` ni ninguna clave. Ninguna variable `NEXT_PUBLIC_*` con claves (`HELMCODE_*`, `FACTCHECK_API_KEY`).
- [ ] `.buildnight/plantilla.json` intacto.
- [ ] Si cambia `package.json`, sube también `bun.lock`. Nada de `--overwrite` ni `shadcn init`.

## 2. Reglas de plataforma
- [ ] Cada respuesta lleva `<Fuentes />` con la página concreta que la sostiene.
- [ ] Sin datos personales reales (DNI, expedientes, contraseñas); no se pide ni se consulta el censo, solo se enlaza `https://sede.ine.gob.es/ce-mesas/?lang=es_ES`.
- [ ] No se guarda lo que escribe el ciudadano: sin BD, sin `console.log` ni logs con su texto.
- [ ] Ante la duda: «no puedo confirmarlo» + enlace a la sede oficial. Nada de importes, plazos o requisitos inventados.
- [ ] Se conservan «Herramienta experimental. No es un servicio oficial.» y `<BotonAviso />` («¿Algo está mal? Avísanos»).
- [ ] IA solo desde servidor (`src/app/api/` o Server Actions), vía `src/lib/ia.ts`; nunca en bucle ni por tecla.
- [ ] `fetch` e imágenes de `public/` usan `ruta()` de `src/config/sitio.ts`.

## 3. Contenido electoral (lo más delicado)
- [ ] **Neutralidad estricta**: ningún candidato, partido, programa ni encuesta (ni mostrado, ni enlazado, ni resumido). Cero recomendación de voto ni captación.
- [ ] **Fechas**: salen solo de `datos/calendario_29N_2026.json` (vía `src/lib/calendario.ts`); nunca escritas a mano ni por el LLM. Plazos ya cerrados (censo y reclamaciones 12–19/10) no se ofrecen como abiertos.
- [ ] **Verificador**: resultado solo `COINCIDE` / `NO COINCIDE` / `NO VERIFICABLE`; sin «verdadero/falso/bulo». «No coincide» exige fuente y cita literal. El veredicto y la cita salen de las fichas (`src/datos/afirmaciones.json`), el LLM solo clasifica y redacta. Tipos (b)–(d) → «fuera de alcance: aquí solo comprobamos cómo se vota».
- [ ] **D'Hondt**: umbral 3 % sobre votos válidos (blancos incluidos); sin campos para cambiar votos de candidaturas reales; «juega con cifras» solo con A, B, C…; cita «Origen de los datos: Ministerio del Interior».

## 4. Diseño Sol
- [ ] No se tocan valores de `src/styles/tema.css`; sin colores, fuentes, radios o sombras nuevos; sin modo oscuro ni degradados.
- [ ] Componentes de `src/components/ui/`. Una sola acción principal por pantalla (`Button variant="sunset"`); enlace con aspecto de botón = `<a className={buttonVariants(...)}>`.
- [ ] Una sola tarjeta «sol» por vista. `brand` solo como acento.
- [ ] Serif solo en `h1`, `h2` y cifras grandes; `font-mono` para datos/URLs; texto de lectura ≥ 16 px.
- [ ] Controles nativos, foco visible, contraste AA, `prefers-reduced-motion`, sin scroll horizontal a 320 px.

## 5. Build y git
1. `bun run typecheck` y `bun run build` deben pasar (si falla el build, no se publica). Si añadiste lógica, ejecuta sus tests.
2. Trabajo directo sobre `main`: `git pull --rebase` antes de `git push`. Cada push a `main` se publica solo en `https://build.barraca.house/como-voto-a`.
3. Un commit = un cambio lógico, mensaje claro. Marca la tarea en `TAREAS.md` (`- [x]`) si procede, sin pisar las de otras personas.
4. Antes de la entrega: `git add . && buildnight ficha validar && buildnight revisar`.

## Informe
Resume en 3–5 líneas qué comprobaste y qué quedó pendiente. Si hay una violación de las secciones 1–3, para y avisa antes de commitear.
