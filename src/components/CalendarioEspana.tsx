import { LineaTiempo } from "@/components/LineaTiempo";
import { fechaLarga, hoy as hoyMadrid, plazo } from "@/lib/calendario";

const documentacion = plazo("voto_correo_envio_documentacion");
const votacion = plazo("votacion");
// El horario también sale del calendario («Jornada de votación, de 9:00 a 20:00»).
const horario = votacion.evento.match(/de \d{1,2}:\d{2} a \d{1,2}:\d{2}/)?.[0];

// Voto por correo de quien reside en España: pasos de contexto.md §2.2 y fechas
// de calendario_29N_2026.json.
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
      pasos={[
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
        {
          plazo: votacion,
          corto: "Votación",
          titulo: "Correos lleva tu voto a la mesa",
          detalle: horario
            ? `Lo entrega en tu mesa durante la votación, ${horario}. Lo que llegue después no se cuenta.`
            : "Lo entrega en tu mesa durante la votación. Lo que llegue después no se cuenta.",
        },
      ]}
    />
  );
}
