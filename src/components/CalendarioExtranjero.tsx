import { LineaTiempo } from "@/components/LineaTiempo";
import { fechaLarga, hoy as hoyMadrid, plazo } from "@/lib/calendario";

export const descargaPapeletas =
  "https://www.ine.es/descarga_candidaturas_elecciones";

// El 7/11 es el límite para publicarlas, no el cierre de la descarga.
const descargables = plazo("cera_papeletas_descargables");

// Quien reside en el extranjero (CERA): contexto.md §2.3. Fechas de
// calendario_29N_2026.json. La votación del 29/11 no es un paso suyo: solo
// cierra el eje.
export function CalendarioExtranjero({ hoy = hoyMadrid() }: { hoy?: string }) {
  return (
    <LineaTiempo
      hoy={hoy}
      origen={{ plazo: plazo("convocatoria_boe"), nombre: "Convocatoria" }}
      meta={{ plazo: plazo("votacion"), nombre: "Votación en España" }}
      bandas={[
        { plazo: plazo("campana"), nombre: "Campaña", estilo: "relleno" },
      ]}
      tramos={[
        {
          plazo: plazo("cera_envio_documentacion"),
          corto: "Recibes los sobres",
          titulo: "Te llega la documentación, sin pedirla",
          detalle:
            "A la dirección con la que estás inscrito en el consulado: certificados de inscripción, sobres e instrucciones.",
        },
        {
          plazo: plazo("cera_envio_papeletas"),
          corto: "Recibes las papeletas",
          titulo: "Te llegan las papeletas",
          hito: {
            fecha: descargables.fin,
            nombre: "Papeletas descargables, como tarde",
          },
          detalle: (
            <>
              Si hay recursos contra las candidaturas, llegan más tarde. También
              puedes{" "}
              <a
                href={descargaPapeletas}
                className="rounded-sm text-foreground underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                descargarlas en la web del INE
              </a>
              : se publican como tarde el {fechaLarga(descargables.fin)} y
              siguen disponibles después.
            </>
          ),
        },
        {
          eleccion: "Elige cómo votar",
          caminos: [
            {
              letra: "A",
              nombre: "Por correo",
              pasos: [
                {
                  plazo: plazo("cera_voto_correo"),
                  corto: "Envías tu voto",
                  titulo: "Envía tu voto por correo a tu consulado",
                  detalle:
                    "Tú en persona, por correo postal (certificado si se puede) y sin coste. Nunca directamente a la Junta Electoral en España: ese voto es nulo.",
                },
              ],
            },
            {
              letra: "B",
              nombre: "En el consulado",
              pasos: [
                {
                  plazo: plazo("cera_deposito_urna"),
                  corto: "Votas en urna",
                  titulo: "Vota en la urna de tu consulado",
                  detalle:
                    "En tu consulado o en los lugares habilitados, con tu pasaporte o DNI españoles, o un certificado de nacionalidad o de inscripción consular.",
                },
              ],
            },
          ],
        },
      ]}
    />
  );
}
