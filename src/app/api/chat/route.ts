import { conFicha, esModo, leerJson, sistema, validar } from "@/lib/asistente";
import { buscarPublicadas } from "@/lib/factcheck";
import { completarEnVivo, type Mensaje } from "@/lib/ia";
import { traductorDe } from "@/i18n/diccionarios";
import { esIdioma } from "@/i18n/idiomas";
import { verificarLocal } from "@/lib/verificador";

const MAX_TURNOS = 6;
const MAX_CARACTERES = 1000;
// 6 mensajes de 1.000 caracteres caben con holgura, aunque vayan escapados.
const MAX_BYTES = 32 * 1024;
// GLM completo, no flash: razona mejor sobre la base oficial.
const MODELO = "glm5.3";

// POST {"modo": "general" | "correo-aqui" | "correo-fuera" | "verificar",
//       "mensajes": [{"role": "user" | "assistant", "content": "…"}],
//       "idioma": "es" | "ca" | "eu" | "gl"}.
// Responde en NDJSON: líneas {"progreso": true} sin contenido y una última
// {"fin": Respuesta} ya validada, o {"error": "…"}. El texto del modelo nunca
// sale sin pasar por validar(): el flujo solo mantiene viva la conexión.
// Las instrucciones dependen solo del modo. No se guarda ni se registra nada
// de lo que escribe el ciudadano: ni base de datos, ni console.*, ni caché.
export async function POST(req: Request) {
  const tipo = req.headers.get("content-type") ?? "";
  if (!/^application\/json(\s*;|$)/i.test(tipo))
    return Response.json(
      { error: "La petición debe ir en JSON." },
      { status: 415 },
    );
  const cuerpo = await leerCuerpo(req);
  if (cuerpo === null)
    return Response.json(
      { error: "El mensaje es demasiado largo." },
      { status: 413 },
    );
  let datos: unknown;
  try {
    datos = JSON.parse(cuerpo);
  } catch {
    datos = null;
  }
  const {
    modo,
    mensajes,
    idioma: pedido,
  } = (datos && typeof datos === "object" ? datos : {}) as Record<
    string,
    unknown
  >;
  const idioma = esIdioma(pedido) ? pedido : "es";
  const t = traductorDe(idioma);
  const validos =
    esModo(modo) &&
    Array.isArray(mensajes) &&
    mensajes.length > 0 &&
    mensajes.length <= MAX_TURNOS &&
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

  const ultima: string = mensajes.at(-1).content;
  // El verificador comprueba cada afirmación por separado: solo le llega la
  // última, sin el historial.
  const historial: Mensaje[] =
    modo === "verificar"
      ? [{ role: "user", content: ultima }]
      : mensajes.map((m: Mensaje) => ({ role: m.role, content: m.content }));

  const codificador = new TextEncoder();
  const flujo = new ReadableStream({
    async start(control) {
      const enviar = (linea: object) =>
        control.enqueue(codificador.encode(JSON.stringify(linea) + "\n"));
      let texto = "";
      let avisado = false;
      try {
        for await (const trozo of completarEnVivo(
          [{ role: "system", content: sistema(modo, idioma) }, ...historial],
          MODELO,
        )) {
          texto += trozo;
          // Solo avisa de que el modelo ya escribe, sin su texto. El
          // verificador no avisa: espera a la respuesta ya resuelta.
          if (!avisado && modo !== "verificar") {
            avisado = true;
            enviar({ progreso: true });
          }
        }
        const validada = validar(leerJson(texto), modo, ultima, t, idioma);
        const fin =
          modo === "verificar" ? validada : conFicha(validada, ultima, t);
        if (fin.verificacion)
          fin.publicadas = await buscarPublicadas(fin.verificacion.afirmacion);
        enviar({ fin });
      } catch {
        // Sin modelo, el verificador aún puede responder con la comparación
        // local, que solo da veredicto ante casi la misma frase de una ficha.
        if (modo === "verificar") enviar({ fin: verificarLocal(ultima, t) });
        else
          enviar({
            error: t("El asistente no responde ahora. Prueba en un momento."),
          });
      }
      control.close();
    },
  });
  return new Response(flujo, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

// Lee el cuerpo como texto sin pasar de MAX_BYTES, aunque falte o mienta la
// cabecera content-length. Devuelve null si se pasa.
async function leerCuerpo(req: Request): Promise<string | null> {
  if (Number(req.headers.get("content-length")) > MAX_BYTES) return null;
  if (!req.body) return "";
  const lector = req.body.getReader();
  const trozos: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      await lector.cancel();
      return null;
    }
    trozos.push(value);
  }
  const todo = new Uint8Array(total);
  let i = 0;
  for (const t of trozos) {
    todo.set(t, i);
    i += t.byteLength;
  }
  return new TextDecoder().decode(todo);
}
