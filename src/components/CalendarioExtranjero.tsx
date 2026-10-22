import { LineaTiempo } from "@/components/LineaTiempo";
import { getT } from "@/i18n/servidor";
import { fechaLarga, hoy as hoyMadrid, plazo } from "@/lib/calendario";

export const descargaPapeletas =
  "https://www.ine.es/descarga_candidaturas_elecciones";

// El 7/11 es el límite para publicarlas, no el cierre de la descarga.
const descargables = plazo("cera_papeletas_descargables");

// Quien reside en el extranjero (CERA): contexto.md §2.3. Fechas de
// calendario_29N_2026.json. La votación del 29/11 no es un paso suyo: solo
// cierra el eje.
export async function CalendarioExtranjero({
  hoy = hoyMadrid(),
}: {
  hoy?: string;
}) {
  const { t, idioma } = await getT();
  return (
    <LineaTiempo
      hoy={hoy}
      origen={{ plazo: plazo("convocatoria_boe"), nombre: t("Convocatoria") }}
      meta={{ plazo: plazo("votacion"), nombre: t("Votación en España") }}
      bandas={[
        { plazo: plazo("campana"), nombre: t("Campaña"), estilo: "relleno" },
      ]}
      tramos={[
        {
          plazo: plazo("cera_envio_documentacion"),
          corto: t("Recibes los sobres"),
          titulo: t("Te llega la documentación, sin pedirla"),
          detalle:
            t("A la dirección con la que estás inscrito en el consulado: certificados de inscripción, sobres e instrucciones."),
        },
        {
          plazo: plazo("cera_envio_papeletas"),
          corto: t("Recibes las papeletas"),
          titulo: t("Te llegan las papeletas"),
          hito: {
            fecha: descargables.fin,
            nombre: t("Papeletas descargables, como tarde"),
          },
          detalle: (
            <>
              {t("Si hay recursos contra las candidaturas, llegan más tarde. También puedes")}{" "}
              <a
                href={descargaPapeletas}
                className="rounded-sm text-foreground underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {t("descargarlas en la web del INE")}
              </a>
              {t(": se publican como tarde el {fecha} y siguen disponibles después.", {
                fecha: fechaLarga(descargables.fin, idioma),
              })}
            </>
          ),
        },
        {
          eleccion: t("Elige cómo votar"),
          caminos: [
            {
              letra: "A",
              nombre: t("Por correo"),
              pasos: [
                {
                  plazo: plazo("cera_voto_correo"),
                  corto: t("Envías tu voto"),
                  titulo: t("Envía tu voto por correo a tu consulado"),
                  detalle:
                    t("Tú en persona, por correo postal (certificado si se puede) y sin coste. Nunca directamente a la Junta Electoral en España: ese voto es nulo."),
                },
              ],
            },
            {
              letra: "B",
              nombre: t("En el consulado"),
              pasos: [
                {
                  plazo: plazo("cera_deposito_urna"),
                  corto: t("Votas en urna"),
                  titulo: t("Vota en la urna de tu consulado"),
                  detalle:
                    t("En tu consulado o en los lugares habilitados, con tu pasaporte o DNI españoles, o un certificado de nacionalidad o de inscripción consular."),
                },
              ],
            },
          ],
        },
      ]}
    />
  );
}
