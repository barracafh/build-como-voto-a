import { LineaTiempo } from "@/components/LineaTiempo";
import { fechaLarga, hoy as hoyMadrid, plazo } from "@/lib/calendario";

const documentacion = plazo("voto_correo_envio_documentacion");
const votacion = plazo("votacion");
// El horario también sale del calendario («Jornada de votación, de 9:00 a 20:00»).
const horario = votacion.evento.match(/de \d{1,2}:\d{2} a \d{1,2}:\d{2}/)?.[0];

// Quien reside en España: voto por correo si estará en España (contexto.md
// §2.2) o voto ERTA si estará en el extranjero (§2.4). Fechas de
// calendario_29N_2026.json.
export function CalendarioEspana({ hoy = hoyMadrid() }: { hoy?: string }) {
  return (
    <LineaTiempo
      hoy={hoy}
      origen={{ plazo: plazo("convocatoria_boe"), nombre: "Convocatoria" }}
      meta={{ plazo: votacion, nombre: "Votación" }}
      bandas={[
        { plazo: plazo("campana"), nombre: "Campaña", estilo: "relleno" },
        { plazo: plazo("jornada_reflexion"), nombre: "Reflexión", estilo: "linea" },
      ]}
      tramos={[
        {
          eleccion: "¿Dónde estarás durante las elecciones?",
          caminos: [
            {
              letra: "A",
              nombre: "En España",
              pasos: [
                {
                  plazo: plazo("voto_correo_solicitud"),
                  corto: "Pides el voto",
                  titulo: "Pide el voto por correo",
                  detalle:
                    "En cualquier oficina de Correos, en persona y con tu DNI, o en la web de Correos con DNI electrónico o certificado digital.",
                },
                {
                  plazo: documentacion,
                  corto: "Recibes los sobres",
                  titulo: "Te llega la documentación a casa",
                  detalle:
                    "Papeletas, sobres y certificado, por correo certificado. Firmas tú el recibo con tu DNI; si no estás, lo recoges en Correos.",
                },
                {
                  plazo: plazo("voto_correo_remision"),
                  corto: "Envías tu voto",
                  titulo: "Envía tu voto desde Correos",
                  detalle: (
                    <>
                      Por correo certificado y sin franqueo, desde que recibes la
                      documentación. El INE da como inicio el{" "}
                      {fechaLarga(documentacion.inicio)}.
                    </>
                  ),
                },
              ],
            },
            {
              letra: "B",
              nombre: "En el extranjero (ERTA)",
              pasos: [
                {
                  plazo: plazo("erta_solicitud"),
                  corto: "Pides la documentación",
                  titulo: "Pide la documentación en el consulado",
                  detalle:
                    "En persona, en la oficina consular más cercana. Antes tienes que estar inscrito en el Registro de Matrícula Consular como no residente. No sirve pedir el voto en Correos.",
                },
                {
                  plazo: plazo("erta_envio_documentacion"),
                  corto: "Recibes los sobres",
                  titulo: "Te llega la documentación al extranjero",
                  detalle:
                    "Por correo certificado, a tu dirección en el extranjero. Si hay recursos contra las candidaturas, puede llegar más tarde.",
                },
                {
                  plazo: plazo("erta_remision_voto"),
                  corto: "Envías tu voto",
                  titulo: "Envía tu voto a tu mesa en España",
                  detalle:
                    "Por correo certificado, desde que recibes la documentación.",
                },
              ],
            },
          ],
        },
        {
          plazo: votacion,
          corto: "Votación",
          titulo: "Tu voto llega a la mesa",
          detalle: horario
            ? `Los votos por correo se entregan en las mesas durante la votación, ${horario}. Lo que llegue después no se cuenta.`
            : "Los votos por correo se entregan en las mesas durante la votación. Lo que llegue después no se cuenta.",
        },
      ]}
    />
  );
}
