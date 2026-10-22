import { LineaTiempo } from "@/components/LineaTiempo";
import { getT } from "@/i18n/servidor";
import { fechaLarga, hoy as hoyMadrid, plazo } from "@/lib/calendario";

const documentacion = plazo("voto_correo_envio_documentacion");
const votacion = plazo("votacion");
// El horario también sale del calendario («Jornada de votación, de 9:00 a 20:00»).
const horario = votacion.evento.match(/de \d{1,2}:\d{2} a \d{1,2}:\d{2}/)?.[0];
const [abre, cierra] = horario?.match(/\d{1,2}:\d{2}/g) ?? [];

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
              pasos: [
                {
                  plazo: plazo("erta_solicitud"),
                  corto: t("Pides la documentación"),
                  titulo: t("Pide la documentación en el consulado"),
                  detalle:
                    t("En persona, en la oficina consular más cercana. Antes tienes que estar inscrito en el Registro de Matrícula Consular como no residente. No sirve pedir el voto en Correos."),
                },
                {
                  plazo: plazo("erta_envio_documentacion"),
                  corto: t("Recibes los sobres"),
                  titulo: t("Te llega la documentación al extranjero"),
                  detalle:
                    t("Por correo certificado, a tu dirección en el extranjero. Si hay recursos contra las candidaturas, puede llegar más tarde."),
                },
                {
                  plazo: plazo("erta_remision_voto"),
                  corto: t("Envías tu voto"),
                  titulo: t("Envía tu voto a tu mesa en España"),
                  detalle:
                    t("Por correo certificado, desde que recibes la documentación."),
                },
              ],
            },
          ],
        },
        {
          plazo: votacion,
          corto: t("Votación"),
          titulo: t("Tu voto llega a la mesa"),
          detalle: horario
            ? t(
                "Los votos por correo se entregan en las mesas durante la votación, {horario}. Lo que llegue después no se cuenta.",
                { horario: t("de {abre} a {cierra}", { abre, cierra }) },
              )
            : t(
                "Los votos por correo se entregan en las mesas durante la votación. Lo que llegue después no se cuenta.",
              ),
        },
      ]}
    />
  );
}
