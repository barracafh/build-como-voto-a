// HelmCode habla la API de OpenAI. Úsalo solo desde el servidor (rutas de
// src/app/api o Server Actions): en el navegador la clave no existe, y así debe ser.
// El modelo del evento (glm5.3-flash) lee texto e imágenes: para una imagen,
// manda `content` como lista de partes, con la imagen en data URL o https.
export type Parte =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };
export type Mensaje = {
  role: "system" | "user" | "assistant";
  content: string | Parte[];
};

// `modelo` sustituye a HELMCODE_MODEL para esta llamada.
async function pedir(messages: Mensaje[], stream: boolean, modelo?: string) {
  const { HELMCODE_API_KEY, HELMCODE_BASE_URL, HELMCODE_MODEL } = process.env;
  const model = modelo ?? HELMCODE_MODEL;
  if (!HELMCODE_API_KEY || !model)
    throw new Error("Faltan HELMCODE_API_KEY o HELMCODE_MODEL en .env.local");
  // Todos los equipos comparten límites: ante un 429, espera y reintenta.
  for (let intento = 0; ; intento++) {
    const res = await fetch(
      `${HELMCODE_BASE_URL ?? "https://api.helmcode.com/v1"}/chat/completions`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${HELMCODE_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ model, messages, stream }),
      },
    );
    if (res.status === 429 && intento < 3) {
      const espera = Number(res.headers.get("retry-after")) || 2 ** intento;
      await new Promise((r) => setTimeout(r, Math.min(espera, 10) * 1000));
      continue;
    }
    if (!res.ok) throw new Error(`HelmCode respondió ${res.status}`);
    return res;
  }
}

export async function completar(
  messages: Mensaje[],
  modelo?: string,
): Promise<string> {
  const data = await (await pedir(messages, false, modelo)).json();
  return data.choices[0].message.content;
}

// Igual que completar, pero entrega el texto a trozos según llega (SSE).
// Los trozos de razonamiento (reasoning_content) no se entregan.
export async function* completarEnVivo(
  messages: Mensaje[],
  modelo?: string,
): AsyncGenerator<string> {
  const res = await pedir(messages, true, modelo);
  if (!res.body) throw new Error("HelmCode no devolvió el flujo");
  const lector = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let resto = "";
  for (;;) {
    const { done, value } = await lector.read();
    if (done) return;
    resto += value;
    const lineas = resto.split("\n");
    resto = lineas.pop() ?? "";
    for (const linea of lineas) {
      if (!linea.startsWith("data:")) continue;
      const dato = linea.slice(5).trim();
      if (dato === "[DONE]") return;
      try {
        const trozo = JSON.parse(dato).choices?.[0]?.delta?.content;
        if (trozo) yield trozo;
      } catch {
        // Línea incompleta o ajena al formato: se ignora.
      }
    }
  }
}
