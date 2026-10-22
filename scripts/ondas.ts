// Calcula la onda (48 barras, de 0 a 1) y la duración de cada public/audio/<id>.mp3 y las
// escribe en src/datos/ondas.ts, para dibujar el reproductor sin descargar el audio.
// Uso: bun run ondas (después de bun run narracion). Decodifica con afconvert, que
// viene con macOS.
import { spawnSync } from "node:child_process";
import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BARRAS = 48;
const HZ = 8000;
const carpeta = "public/audio";

const ondas: Record<string, { segundos: number; barras: number[] }> = {};
for (const archivo of (await readdir(carpeta)).filter((a) => a.endsWith(".mp3")).sort()) {
  const id = archivo.replace(/\.mp3$/, "");
  const wav = join(tmpdir(), `${id}.wav`);
  const proc = spawnSync("afconvert", ["-f", "WAVE", "-d", `LEI16@${HZ}`, "-c", "1", join(carpeta, archivo), wav]);
  if (proc.status !== 0) throw new Error(`${archivo}: afconvert falló (${proc.stderr?.toString()})`);
  const datos = await readFile(wav);
  await rm(wav);
  // Muestras PCM de 16 bits tras la cabecera: se busca el bloque «data».
  const inicio = datos.indexOf("data") + 8;
  const muestras = new Int16Array(datos.buffer, datos.byteOffset + inicio, (datos.length - inicio) >> 1);
  const tramo = Math.floor(muestras.length / BARRAS);
  const rms = Array.from({ length: BARRAS }, (_, b) => {
    let suma = 0;
    for (let i = b * tramo; i < (b + 1) * tramo; i++) suma += muestras[i] ** 2;
    return Math.sqrt(suma / tramo);
  });
  const max = Math.max(...rms);
  ondas[id] = {
    segundos: Math.round((muestras.length / HZ) * 10) / 10,
    barras: rms.map((v) => Math.round((v / max) * 100) / 100),
  };
}

await writeFile(
  "src/datos/ondas.ts",
  `// Generado por scripts/ondas.ts a partir de public/audio: no editar a mano.\n` +
    `export const ONDAS: Record<string, { segundos: number; barras: readonly number[] }> = ${JSON.stringify(ondas)};\n`,
);
console.log(`src/datos/ondas.ts: ${Object.keys(ondas).length} pistas`);
