# Votijo

Todo para votar el 29N, con fuente oficial. Publicada en <https://build.barraca.house/como-voto-a>. Herramienta experimental, no es un servicio oficial.

## El problema

Para votar en las elecciones generales del 29 de noviembre de 2026 hay plazos que cierran semanas antes (pedir el voto por correo hasta el 19/11, el voto desde el extranjero temporal hasta el 31/10), la información está repartida entre el BOE, la Junta Electoral Central, el INE, Interior y Correos, y circulan afirmaciones sobre cómo se vota sin ninguna fuente.

## Para quién

Cualquier persona con derecho a voto, sobre todo quien no estará en su localidad el día 29, quien vive en el extranjero (CERA) o pasa unos meses fuera (ERTA), quien vota por primera vez y quien duda de algo que le han contado. En castellano, català/valencià, euskara y galego.

## Qué hemos hecho

- **Portada**: día y horario de votación, cuenta atrás a la votación y al último día para enviar el voto por correo, plazos abiertos por tipo de votante en un gráfico y un chat para preguntar directamente.
- **Voto por correo** (`/correo`): para quien vive en España, quien estará fuera unos meses y quien vive fuera, los pasos con su fecha del calendario oficial, el plazo más urgente, dónde se hace y un chat sobre su caso.
- **¿Es verdad lo que me han dicho?** (`/verificar`): 39 fichas con cita literal del BOE, Interior e INE. El modelo solo elige la ficha; el veredicto (coincide, no coincide o no verificable), la cita y la fuente salen de ella. Enlaza verificaciones ya publicadas en Google Fact Check, atribuidas a quien las firma.
- **Del voto al escaño** (`/escanos`): diputados y senadores por comunidad en un mapa y un hemiciclo, también en 3D y narrado; el peso del censo de cada circunscripción y qué pasa con el voto en blanco, el nulo y la abstención.
- **Chat**: respuestas en directo, fechas siempre del calendario oficial y nunca del modelo, y un termómetro de confianza (alta, media o baja) según lo que se ha comprobado. Si la pregunta encaja con una ficha, responde la ficha con su cita.
- **Reglas**: no se piden ni se guardan datos personales, el aviso del chat dice qué se envía al servicio de IA y a Google Fact Check, nada de partidos, candidaturas ni encuestas, y diseño Sol. 128 tests, entre ellos que D'Hondt reproduce los 350 escaños de 2023 y una batería del verificador.

## Qué falta para producción

- Revisión humana de las 39 fichas y de cada paso frente a su fuente, y de las traducciones automáticas por hablantes nativos (sobre todo el euskera).
- Más fichas y más casos reales en el verificador: hoy lo que no encaja con una ficha sale como «no verificable».
- Proveedores de IA y de verificaciones con un acuerdo de tratamiento de datos, o un modelo propio.
- Auditoría de accesibilidad completa (en `/escanos` aún hay scroll horizontal a 320 px) y transcripción de las narraciones.
- Mantener el calendario y las fichas al día si la Junta Electoral publica cambios.
- Validación jurídica y de un organismo oficial antes de ofrecerla como servicio.

---

## Plantilla del evento

Plantilla de cada equipo: Next.js y Tailwind, con rutas de servidor para llamar a la IA. La organización crea un repo por equipo a partir de esta carpeta, con los datos de su track, y lo conecta a su proyecto de Vercel. Este directorio tiene su propio `package.json` y `bun.lock`; no depende del workspace del evento.

Las reglas y el contexto para vuestro asistente de IA están en [AGENTS.md](AGENTS.md); el reto del track, en `SETUP.md`.

## Arrancar

Con Bun y Node 22 o superior, dentro del repo de vuestro equipo:

```sh
bun install --frozen-lockfile
bun run dev
```

Abre `http://localhost:3000/<equipo>`, con el `equipo` de `ficha.json`. Cambia el ejemplo en `src/app/page.tsx`; los metadatos salen de `ficha.json`.

- Pon `<Fuentes fuentes={[{ nombre: "Fuente oficial", url: "https://www.boe.es/" }]} />` debajo de **cada respuesta**. Cita la página concreta que sostiene la respuesta.
- Conserva el aviso de no oficial y `<BotonAviso />`, que abre un issue en vuestro repo.
- La IA se llama desde el servidor con `src/lib/ia.ts`; hay un ejemplo en `src/app/api/ia/route.ts`. Las claves van en `.env.local` y nunca en el código ni en variables `NEXT_PUBLIC_*`.

## Publicar

Cada push a `main` se publica solo en `https://build.barraca.house/<equipo>`. No hace falta entrar en Vercel: las claves ya están puestas en el proyecto. Si `bun run build` falla en local, tampoco se publicará.

## CLI del evento

`buildnight` revisa las seis reglas, entrega la ficha y enseña el tablón. Necesita `gh auth login`. En macOS o Linux:

```sh
curl -fsSL https://build.barraca.house/instalar.sh | sh
buildnight                          # vuestro expediente: equipo, track y cuenta atrás
buildnight observar                 # déjalo abierto: suma vuestros tokens al ranking
```

`observar` cuenta los tokens de Claude Code, Codex y Pi en este proyecto durante el build. La primera vez te pide confirmar tu cuenta en GitHub; no da acceso a nada.

En Windows, descarga `buildnight-windows-x64.exe` de la [última release](https://github.com/barracafh/build-comite/releases/latest).

## Ficha y entrega

`ficha.json` describe la herramienta: nombre, frase, icono, track (`herramienta`), equipo, URL pública y fuentes. `datos` indica `simulados` o datos públicos `reales`, nunca personales. No cambiéis `equipo`: de él sale la ruta.

```sh
git add .
buildnight ficha validar
buildnight revisar
```

Hasta que la herramienta esté publicada, la regla de URL pública fallará; las otras cinco deben pasar. La revisión analiza archivos versionados; no acredita la exactitud del contenido. Incluid en vuestro README media página con problema, usuario, qué habéis hecho y qué falta para producción. Entregad con `buildnight registrar`.

El contrato es `apps/cli/esquemas/ficha.schema.json` en el monorepo del evento. Conservad `.buildnight/plantilla.json`.

## Diseño

Todas las herramientas usan Sol, el sistema visual de [Reforma Digital](https://reforma-digital.es), con el OK de Samu: los tokens de `src/styles/tema.css`, Geist y Geist Mono servidas por `next/font` desde el propio sitio, Georgia en los titulares y las primitivas de shadcn/ui con Base UI de `src/components/ui/`. `src/app/page.tsx` enseña cómo se compone una respuesta. Las reglas están en [AGENTS.md](AGENTS.md#diseño); el origen y la licencia, en [AVISO.md](AVISO.md).

Para añadir componentes: `bunx shadcn@4.22.1 add <componente>`. Responded **no** si pide sobrescribir componentes existentes, para conservar variantes como `sunset`. No uséis `--overwrite` ni `shadcn init`. Subid también los cambios de `package.json` y `bun.lock`.

Referencias: [basePath de Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath), [Tailwind con Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs) y [shadcn/ui con Base UI](https://ui.shadcn.com/docs).
