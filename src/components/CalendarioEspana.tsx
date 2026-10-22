import { pasosErta, pasoVotacion } from "@/components/CalendarioErta";
import { LineaTiempo } from "@/components/LineaTiempo";
import { getT } from "@/i18n/servidor";
import { fechaLarga, hoy as hoyMadrid, plazo } from "@/lib/calendario";

const documentacion = plazo("voto_correo_envio_documentacion");
const votacion = plazo("votacion");

// Quien reside en España: voto por correo si estará en España (contexto.md
// §2.2) o voto ERTA si estará en el extranjero (§2.4). Fechas de
// calendario_29N_2026.json.
export async function CalendarioEspana({
  hoy = hoyMadrid(),
}: {
  hoy?: string;
}) {
  const { t, idioma } = await getT();
  return (
    <LineaTiempo
      hoy={hoy}
      origen={{ plazo: plazo("convocatoria_boe"), nombre: t("Convocatoria") }}
      meta={{ plazo: votacion, nombre: t("Votación") }}
      bandas={[
        { plazo: plazo("campana"), nombre: t("Campaña"), estilo: "relleno" },
        { plazo: plazo("jornada_reflexion"), nombre: t("Reflexión"), estilo: "linea" },
      ]}
      tramos={[
        {
          eleccion: t("¿Dónde estarás durante las elecciones?"),
          caminos: [
            {
              letra: "A",
              nombre: t("En España"),
              pasos: [
                {
                  plazo: plazo("voto_correo_solicitud"),
                  corto: t("Pides el voto"),
                  titulo: t("Pide el voto por correo"),
                  detalle:
                    t("En cualquier oficina de Correos, en persona y con tu DNI, o en la web de Correos con DNI electrónico o certificado digital."),
                },
                {
                  plazo: documentacion,
                  corto: t("Recibes los sobres"),
                  titulo: t("Te llega la documentación a casa"),
                  detalle:
                    t("Papeletas, sobres y certificado, por correo certificado. Firmas tú el recibo con tu DNI; si no estás, lo recoges en Correos."),
                },
                {
                  plazo: plazo("voto_correo_remision"),
                  corto: t("Envías tu voto"),
                  titulo: t("Envía tu voto desde Correos"),
                  detalle: t(
                    "Por correo certificado y sin franqueo, desde que recibes la documentación. El INE da como inicio el {fecha}.",
                    { fecha: fechaLarga(documentacion.inicio, idioma) },
                  ),
                },
              ],
            },
            {
              letra: "B",
              nombre: t("En el extranjero (ERTA)"),
              pasos: pasosErta(t),
            },
          ],
        },
        pasoVotacion(t),
      ]}
    />
  );
}
