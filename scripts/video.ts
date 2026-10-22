// Graba un video de presentación recorriendo la app real, con voz en off de ElevenLabs.
// Uso: con `bun run dev` en marcha, `bun run video`. Sale en public/video/como-voto.mp4, con subtítulos en .vtt.
// Bun lee ELEVENLABS_API_KEY y ELEVENLABS_VOICE_ID de .env.local; VIDEO_URL cambia la app que se graba.
// La voz de cada escena se guarda en video/audio y solo se regenera si cambia su texto.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, type Page } from "playwright";

const base = process.env.VIDEO_URL ?? "http://localhost:3000/como-voto-a";
const clave = process.env.ELEVENLABS_API_KEY;
const voz = process.env.ELEVENLABS_VOICE_ID;
if (!clave || !voz) throw new Error("Faltan ELEVENLABS_API_KEY o ELEVENLABS_VOICE_ID en .env.local");

const salida = "public/video/como-voto";
const ancho = 1280;
const alto = 720;

const bajarA = (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "start" }));

// Cada escena dura lo que su narración; las acciones corren mientras suena.
// Guiones neutrales: solo cómo se vota, nada de partidos, candidaturas ni encuestas.
const escenas: { texto: string; acciones: (page: Page) => Promise<void> }[] = [
  {
    texto:
      "Esto es Votijo, una herramienta experimental para las elecciones generales del 29 de noviembre. Explica cómo, dónde y hasta cuándo se vota, con la fuente oficial de cada dato. Solo cómo se vota: nada de partidos, programas ni encuestas.",
    acciones: async (page) => {
      await page.goto(base);
    },
  },
  {
    texto:
      "Desde el inicio eliges qué necesitas: votar por correo, comprobar algo que has oído o entender cómo se reparten los escaños. Y si tienes una duda concreta, puedes preguntarla directamente.",
    acciones: async (page) => {
      await bajarA(page, "#que-necesitas");
      await page.waitForTimeout(5500);
      await bajarA(page, "#pregunta-directa");
    },
  },
  {
    texto: "Debajo están los plazos que siguen abiertos, para que sepas qué puedes hacer todavía.",
    acciones: async (page) => {
      await bajarA(page, "#plazos");
    },
  },
  {
    texto:
      "En Voto por correo eliges dónde vives, y la herramienta te muestra tus fechas paso a paso y dónde se hace cada trámite.",
    acciones: async (page) => {
      await page.goto(`${base}/correo`);
      await page.waitForTimeout(1800);
      await page.getByRole("link", { name: "Vivo en España", exact: false }).first().click();
      await page.waitForURL(/donde=/);
      await page.waitForTimeout(1200);
      await bajarA(page, "#fechas");
      await page.waitForTimeout(2500);
      await bajarA(page, "#donde-se-hace");
    },
  },
  {
    texto:
      "¿Te han contado algo sobre cómo se vota y no sabes si es cierto? Escríbelo y lo contrastamos con la fuente oficial: coincide, no coincide o no se puede verificar.",
    acciones: async (page) => {
      await page.goto(`${base}/verificar`);
      await page.waitForTimeout(1500);
      await page.locator("#pregunta").pressSequentially("Me han dicho que se puede votar por internet", { delay: 45 });
      await page.waitForTimeout(1200);
      await bajarA(page, "#que-puede-salir");
    },
  },
  {
    texto:
      "En Del voto al escaño, cada punto del hemiciclo es un escaño. Pulsa una comunidad en el mapa y verás cuántos diputados y senadores elige.",
    acciones: async (page) => {
      await page.goto(`${base}/escanos`);
      await page.waitForTimeout(2500);
      await bajarA(page, "#comunidades");
      await page.waitForTimeout(1500);
      const mapa = page.locator("main").getByRole("group", { name: "Mapa de España por comunidades autónomas" });
      await mapa.scrollIntoViewIfNeeded();
      await mapa.getByRole("button", { name: "Comunitat Valenciana" }).click();
    },
  },
  {
    texto: "Y puedes recorrer el Congreso en tres dimensiones, comunidad a comunidad.",
    acciones: async (page) => {
      await page.locator("main").getByRole("button", { name: "Ver en 3D" }).click();
      const cargando = page.getByText("Cargando el hemiciclo");
      await cargando.waitFor({ timeout: 10_000 }).catch(() => {});
      await cargando.waitFor({ state: "hidden", timeout: 60_000 });
      await page.waitForTimeout(2500);
      await page.getByRole("button", { name: "Comunidad siguiente" }).click();
      await page.waitForTimeout(3000);
    },
  },
  {
    texto:
      "Está en castellano, catalán, euskera y gallego. Cada respuesta enlaza la página oficial que la sostiene. Es una herramienta experimental: no es un servicio oficial.",
    acciones: async (page) => {
      await page.keyboard.press("Escape");
      await page.goto(base);
      await page.waitForTimeout(1200);
      await page.getByLabel("Idioma").selectOption("ca");
      await page.waitForTimeout(3000);
      await page.getByLabel("Idioma").selectOption("es");
      await page.waitForTimeout(1500);
      await bajarA(page, 'aside[aria-label="Fuentes oficiales"]');
    },
  },
];

async function narrar(texto: string, i: number) {
  const archivo = `video/audio/${i}-${createHash("sha1").update(texto).digest("hex").slice(0, 10)}.mp3`;
  if (existsSync(archivo)) return archivo;
  const respuesta = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voz}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": clave!, "Content-Type": "application/json" },
    body: JSON.stringify({ text: texto, model_id: "eleven_multilingual_v2", language_code: "es" }),
  });
  if (!respuesta.ok) throw new Error(`escena ${i}: ${respuesta.status} ${await respuesta.text()}`);
  await writeFile(archivo, Buffer.from(await respuesta.arrayBuffer()));
  console.log(`${archivo} (${texto.length} caracteres)`);
  return archivo;
}

const segundos = (archivo: string) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", archivo], { encoding: "utf8" }));

await mkdir("video/audio", { recursive: true });
await mkdir("public/video", { recursive: true });
const audios: { archivo: string; duracion: number }[] = [];
for (const [i, { texto }] of escenas.entries()) {
  const archivo = await narrar(texto, i);
  audios.push({ archivo, duracion: segundos(archivo) });
}

const navegador = await chromium.launch();
const contexto = await navegador.newContext({
  viewport: { width: ancho, height: alto },
  recordVideo: { dir: "video/crudo", size: { width: ancho, height: alto } },
  locale: "es-ES",
});
// Oculta el indicador de `next dev` para que no salga en el video.
await contexto.addInitScript(() =>
  document.addEventListener("DOMContentLoaded", () =>
    document.head.append(Object.assign(document.createElement("style"), { textContent: "nextjs-portal{display:none!important}" })),
  ),
);
const page = await contexto.newPage();
const inicio = Date.now();
const entradas: number[] = [];

for (const [i, { acciones }] of escenas.entries()) {
  entradas.push(Date.now() - inicio);
  // ponytail: si las acciones tardan más que la voz, la escena se alarga y la voz queda en silencio el resto.
  await Promise.all([acciones(page), page.waitForTimeout(audios[i].duracion * 1000 + 600)]);
}
await page.waitForTimeout(1000);
const crudo = await page.video()!.path();
await contexto.close();

const voces = audios.flatMap((a) => ["-i", a.archivo]);
const retrasos = entradas.map((ms, i) => `[${i + 1}:a]adelay=${ms}|${ms}[a${i}]`).join(";");
const mezcla = `${retrasos};${entradas.map((_, i) => `[a${i}]`).join("")}amix=inputs=${entradas.length}:normalize=0[voz]`;
execFileSync("ffmpeg", [
  ...["-y", "-loglevel", "error", "-i", crudo, ...voces, "-filter_complex", mezcla, "-map", "0:v", "-map", "[voz]"],
  ...["-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-c:a", "aac", "-b:a", "160k", `${salida}.mp4`],
]);

// Subtítulos: cada frase de una escena dura en proporción a su longitud.
const hora = (ms: number) => new Date(ms).toISOString().slice(11, 23);
const cues = escenas.flatMap(({ texto }, i) => {
  const frases = texto.split(/(?<=[.?])\s+/);
  const msPorLetra = (audios[i].duracion * 1000) / texto.length;
  let t = entradas[i];
  return frases.map((frase) => {
    const desde = t;
    t += frase.length * msPorLetra;
    return `${hora(desde)} --> ${hora(t)}\n${frase}`;
  });
});
await writeFile(`${salida}.vtt`, `WEBVTT\n\n${cues.join("\n\n")}\n`);
console.log(`${salida}.mp4 y ${salida}.vtt`);
// Con Bun, `navegador.close()` a veces no vuelve; salir cierra Chromium igual.
process.exit(0);
