import { esModo, leerJson, sistema, validar } from "@/lib/asistente";
import { completar, type Mensaje } from "@/lib/ia";

const MAX_TURNOS = 6;
const MAX_CARACTERES = 1000;

// POST {"modo": "correo-aqui" | "correo-fuera" | "verificar",
//       "mensajes": [{"role": "user" | "assistant", "content": "…"}]}.
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

  try {
    const texto = await completar([
      { role: "system", content: sistema(modo) },
      ...historial,
    ]);
    return Response.json(
      validar(leerJson(texto), modo, mensajes.at(-1).content),
    );
  } catch {
    return Response.json(
      { error: "El asistente no responde ahora. Prueba en un momento." },
      { status: 503 },
    );
  }
}
