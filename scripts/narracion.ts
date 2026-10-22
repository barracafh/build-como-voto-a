// Genera public/audio/<id>.mp3 para cada guion de src/datos/narracion.ts con ElevenLabs.
// Uso: bun run narracion. Bun lee ELEVENLABS_API_KEY y ELEVENLABS_VOICE_ID de .env.local.
// Solo genera los que faltan: para regenerar uno, borra su mp3.
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { NARRACION } from "../src/datos/narracion";

const clave = process.env.ELEVENLABS_API_KEY;
const voz = process.env.ELEVENLABS_VOICE_ID;
if (!clave || !voz) throw new Error("Faltan ELEVENLABS_API_KEY o ELEVENLABS_VOICE_ID en .env.local");

const carpeta = "public/audio";
await mkdir(carpeta, { recursive: true });

for (const [id, { texto }] of Object.entries(NARRACION)) {
  const archivo = `${carpeta}/${id}.mp3`;
  if (existsSync(archivo)) continue;
  const respuesta = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voz}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": clave, "Content-Type": "application/json" },
      body: JSON.stringify({ text: texto, model_id: "eleven_multilingual_v2", language_code: "es" }),
    },
  );
  if (!respuesta.ok) throw new Error(`${id}: ${respuesta.status} ${await respuesta.text()}`);
  await writeFile(archivo, Buffer.from(await respuesta.arrayBuffer()));
  console.log(`${archivo} (${texto.length} caracteres)`);
}
