import { LineaTiempo, type Paso } from "@/components/LineaTiempo";
import { getT } from "@/i18n/servidor";
import type { T } from "@/i18n/traducir";
import { hoy as hoyMadrid, plazo } from "@/lib/calendario";

const votacion = plazo("votacion");
// El horario también sale del calendario («Jornada de votación, de 9:00 a 20:00»).
const horario = votacion.evento.match(/de \d{1,2}:\d{2} a \d{1,2}:\d{2}/)?.[0];
const [abre, cierra] = horario?.match(/\d{1,2}:\d{2}/g) ?? [];

// Residentes en España que estarán en el extranjero (ERTA): contexto.md §2.4.
// También es el camino B de CalendarioEspana.
export function pasosErta(t: T): Paso[] {
  return [
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
  ];
}

// Último paso de quien vota por correo desde España o como ERTA.
export function pasoVotacion(t: T): Paso {
  return {
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
  };
}

export async function CalendarioErta({
  hoy = hoyMadrid(),
}: {
  hoy?: string;
}) {
  const { t } = await getT();
  return (
    <LineaTiempo
      hoy={hoy}
      origen={{ plazo: plazo("convocatoria_boe"), nombre: t("Convocatoria") }}
      meta={{ plazo: votacion, nombre: t("Votación") }}
      bandas={[
        { plazo: plazo("campana"), nombre: t("Campaña"), estilo: "relleno" },
        { plazo: plazo("jornada_reflexion"), nombre: t("Reflexión"), estilo: "linea" },
      ]}
      tramos={[...pasosErta(t), pasoVotacion(t)]}
    />
  );
}
