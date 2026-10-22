import { esModo, leerJson, sistema, validar } from "@/lib/asistente";
import { completarEnVivo, type Mensaje } from "@/lib/ia";

const MAX_TURNOS = 6;
const MAX_CARACTERES = 1000;
// GLM completo, no flash: razona mejor sobre la base oficial.
const MODELO = "glm5.3";

// POST {"modo": "correo-aqui" | "correo-fuera" | "verificar",
//       "mensajes": [{"role": "user" | "assistant", "content": "…"}]}.
// Responde en NDJSON: líneas {"trozo": "…"} con el texto del modelo según llega
// y una última {"fin": Respuesta} ya validada, o {"error": "…"}.
// Las instrucciones dependen solo del modo. No se guarda ni se registra nada
// de lo que escribe el ciudadano.
export async function POST(req: Request) {
  const { modo, mensajes } = await req.json().catch(() => ({}));
  const validos =
    esModo(modo) &&
    Array.isArray(mensajes) &&
    mensajes.length > 0 &&
    mensajes.every(
      (m) =>
        (m?.role === "user" || m?.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim() &&
        m.content.length <= MAX_CARACTERES,
    ) &&
    mensajes.at(-1).role === "user";
  if (!validos)
    return Response.json(
      { error: "Escribe un mensaje de hasta 1.000 caracteres." },
      { status: 400 },
    );

  const historial: Mensaje[] = mensajes
    .slice(-MAX_TURNOS)
    .map((m: Mensaje) => ({ role: m.role, content: m.content }));

  const ultima = mensajes.at(-1).content;
  const codificador = new TextEncoder();
  const cuerpo = new ReadableStream({
    async start(control) {
      const enviar = (linea: object) =>
        control.enqueue(codificador.encode(JSON.stringify(linea) + "\n"));
      let texto = "";
      try {
        for await (const trozo of completarEnVivo(
          [{ role: "system", content: sistema(modo) }, ...historial],
          MODELO,
        )) {
          texto += trozo;
          enviar({ trozo });
        }
        enviar({ fin: validar(leerJson(texto), modo, ultima) });
      } catch {
        enviar({
          error: "El asistente no responde ahora. Prueba en un momento.",
        });
      }
      control.close();
    },
  });
  return new Response(cuerpo, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
