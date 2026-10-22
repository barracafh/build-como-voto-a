import { esModo, leerJson, sistema, validar } from "@/lib/asistente";
import { buscarPublicadas } from "@/lib/factcheck";
import { completarEnVivo, type Mensaje } from "@/lib/ia";
import { traductorDe } from "@/i18n/diccionarios";
import { esIdioma } from "@/i18n/idiomas";

const MAX_TURNOS = 6;
const MAX_CARACTERES = 1000;
// GLM completo, no flash: razona mejor sobre la base oficial.
const MODELO = "glm5.3";

// POST {"modo": "correo-aqui" | "correo-fuera" | "verificar",
//       "mensajes": [{"role": "user" | "assistant", "content": "…"}],
//       "idioma": "es" | "ca" | "eu" | "gl"}.
// Responde en NDJSON: líneas {"trozo": "…"} con el texto del modelo según llega
// y una última {"fin": Respuesta} ya validada, o {"error": "…"}.
// Las instrucciones dependen solo del modo. No se guarda ni se registra nada
// de lo que escribe el ciudadano.
export async function POST(req: Request) {
  const { modo, mensajes, idioma: pedido } = await req.json().catch(() => ({}));
  const idioma = esIdioma(pedido) ? pedido : "es";
  const t = traductorDe(idioma);
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
      { error: t("Escribe un mensaje de hasta 1.000 caracteres.") },
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
          [{ role: "system", content: sistema(modo, idioma) }, ...historial],
          MODELO,
        )) {
          texto += trozo;
          enviar({ trozo });
        }
        const fin = validar(leerJson(texto), modo, ultima, t);
        if (fin.verificacion)
          fin.publicadas = await buscarPublicadas(fin.verificacion.afirmacion);
        enviar({ fin });
      } catch {
        enviar({
          error: t("El asistente no responde ahora. Prueba en un momento."),
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
