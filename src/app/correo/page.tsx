import type { ReactNode } from "react";
import Link from "next/link";
import { Globe, House, Luggage, type LucideIcon } from "lucide-react";
import { BotonChat } from "@/components/BotonChat";
import { CalendarioErta } from "@/components/CalendarioErta";
import { CalendarioEspana } from "@/components/CalendarioEspana";
import {
  CalendarioExtranjero,
  descargaPapeletas,
} from "@/components/CalendarioExtranjero";
import { Chat } from "@/components/Chat";
import { Encabezado } from "@/components/Encabezado";
import { Fuentes, type Source } from "@/components/Fuentes";
import { Pagina, Titular } from "@/components/Pagina";
import { getT } from "@/i18n/servidor";
import { marcar } from "@/i18n/traducir";
import {
  estado,
  fechaLarga,
  fuenteCalendario,
  hoy as hoyMadrid,
  nombreFuente,
  plazo,
  rango,
} from "@/lib/calendario";
import { cierraEn } from "@/lib/linea-tiempo";
import { urgente } from "@/lib/plazos-abiertos";

const correos =
  "https://www.correos.es/es/es/particulares/para-el-ciudadano/voto-por-correo";
const mesaIne = "https://sede.ine.gob.es/ce-mesas/?lang=es_ES";
const estadoVotoIne = "https://sede.ine.gob.es/ce-votoxcorreo/?lang=es_ES";
const plazosIne = "https://www.ine.es/dyngs/CEL/index.htm?cid=1702";
const eleccionesJec =
  "https://www.juntaelectoralcentral.es/cs/jec/eleccionesEnCurso/Elecciones_generales_2026";

// «Dónde se hace»: el sitio, qué haces allí y, si lo hay, el enlace oficial.
// Si el texto lleva {fechas}, se rellena con el rango del plazo `fechas`.
type Lugar = { sitio: string; texto: string; fechas?: string; enlace?: Source };

const opciones = {
  aqui: {
    titulo: marcar("Vivo en España"),
    icono: House,
    texto: marcar("Y el día 29 no estarás en tu localidad, pero sí en España."),
    modo: "correo-aqui",
    calendario: CalendarioEspana,
    plazos: [
      "voto_correo_solicitud",
      "voto_correo_envio_documentacion",
      "voto_correo_remision",
      "votacion",
    ],
    donde: [
      {
        sitio: marcar("Cualquier oficina de Correos"),
        texto: marcar(
          "Pides el voto en persona con tu DNI, recoges la documentación si no estabas en casa y envías tu voto por correo certificado, sin franqueo. La solicitud también se hace en la web de Correos con DNI electrónico o certificado digital.",
        ),
        enlace: { nombre: marcar("Voto por correo · Correos"), url: correos },
      },
      {
        sitio: marcar("Sede del INE"),
        texto: marcar(
          "Consultas en qué estado está tu voto por correo, con tu DNI o pasaporte y tu fecha de nacimiento.",
        ),
        enlace: { nombre: marcar("Estado del voto por correo · INE"), url: estadoVotoIne },
      },
      {
        sitio: marcar("Consulta de mesa del INE"),
        texto: marcar(
          "Tu mesa y tu colegio. Si te aceptan el voto por correo, ya no puedes votar en la mesa.",
        ),
        enlace: { nombre: marcar("Consulta de mesa · INE"), url: mesaIne },
      },
    ],
    fuentes: [
      { nombre: marcar("Voto por correo · Correos"), url: correos },
      {
        nombre: marcar("Plazos para los electores · INE"),
        url: "https://www.ine.es/dyngs/CEL/index.htm?cid=1702",
      },
      {
        nombre: marcar("Art. 73 LOREG · BOE"),
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672#asetentaytres",
      },
    ],
  },
  fuera: {
    titulo: marcar("Vivo fuera de España"),
    icono: Globe,
    texto: marcar("Estás inscrito en el consulado como residente en el extranjero."),
    modo: "correo-fuera",
    calendario: CalendarioExtranjero,
    // Las papeletas descargables no son un plazo que cierre (siguen en la web
    // después del 7/11) y la votación en España no es un paso CERA.
    plazos: [
      "cera_envio_documentacion",
      "cera_envio_papeletas",
      "cera_voto_correo",
      "cera_deposito_urna",
    ],
    donde: [
      {
        sitio: marcar("Tu consulado o un centro habilitado"),
        texto: marcar(
          "Votas en urna {fechas}, con tu pasaporte o DNI españoles, o un certificado de nacionalidad o de inscripción consular. Si votas por correo, el sobre va a tu consulado.",
        ),
        fechas: "cera_deposito_urna",
        enlace: {
          nombre: marcar("Elecciones generales 2026 · Junta Electoral Central"),
          url: eleccionesJec,
        },
      },
      {
        sitio: marcar("El correo postal del país donde vives"),
        texto: marcar(
          "Envías tú el sobre a tu consulado, certificado si se puede y sin coste. Nunca directamente a la Junta Electoral en España: ese voto es nulo.",
        ),
      },
      {
        sitio: marcar("Web del INE"),
        texto: marcar("Descargas el juego completo de papeletas si no te llegan a tiempo."),
        enlace: { nombre: marcar("Descarga de papeletas · INE"), url: descargaPapeletas },
      },
    ],
    fuentes: [
      {
        nombre: marcar("Plazos para los electores · INE"),
        url: "https://www.ine.es/dyngs/CEL/index.htm?cid=1702",
      },
      {
        nombre: marcar("Art. 75 LOREG · BOE"),
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672#asetentaycinco",
      },
      { nombre: marcar("Descarga de papeletas · INE"), url: descargaPapeletas },
    ],
  },
  erta: {
    titulo: marcar("Vivo en España y estaré en el extranjero"),
    icono: Luggage,
    texto: marcar("Pasarás una temporada fuera durante las elecciones (ERTA)."),
    // El modo de correo-aqui ya cubre el voto ERTA (src/lib/asistente.ts).
    modo: "correo-aqui",
    calendario: CalendarioErta,
    plazos: [
      "erta_solicitud",
      "erta_envio_documentacion",
      "erta_remision_voto",
      "votacion",
    ],
    donde: [
      {
        sitio: marcar("La oficina consular más cercana"),
        texto: marcar(
          "Pides la documentación en persona. Antes tienes que estar inscrito en el Registro de Matrícula Consular como no residente. No sirve pedir el voto en Correos.",
        ),
        enlace: { nombre: marcar("Plazos para los electores · INE"), url: plazosIne },
      },
      {
        sitio: marcar("El correo del país donde estés"),
        texto: marcar("Envías tu voto por correo certificado a tu mesa en España."),
      },
      {
        sitio: marcar("Consulta de mesa del INE"),
        texto: marcar("La mesa en España a la que va tu voto."),
        enlace: { nombre: marcar("Consulta de mesa · INE"), url: mesaIne },
      },
    ],
    fuentes: [
      { nombre: marcar("Plazos para los electores · INE"), url: plazosIne },
      {
        nombre: marcar("Art. 74 LOREG · BOE"),
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672#asetentaycuatro",
      },
    ],
  },
} satisfies Record<
  string,
  {
    titulo: string;
    icono: LucideIcon;
    texto: string;
    modo: "correo-aqui" | "correo-fuera";
    calendario: (props: { hoy?: string }) => Promise<ReactNode>;
    plazos: string[];
    donde: Lugar[];
    fuentes: Source[];
  }
>;

type Donde = keyof typeof opciones;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ donde?: string }>;
}) {
  const { donde } = await searchParams;
  const opcion = donde && donde in opciones ? opciones[donde as Donde] : null;
  const { t } = await getT();

  return (
    <Pagina>
      <Titular
        etiqueta={t("Voto por correo · 29N")}
        titulo={t("Vota por correo, aquí o desde fuera.")}
        entradilla={t(
          "Te explicamos los pasos y las fechas de tu caso, con la fuente oficial de cada uno.",
        )}
      >
        {opcion && <PlazoClave opcion={opcion} />}
      </Titular>

      {!opcion ? (
        <section aria-labelledby="donde" className="mt-20 text-lg">
          <Encabezado numero="01" id="donde" titulo={t("¿Dónde vives?")} />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(opciones) as Donde[]).map((clave) => {
              const { titulo, texto, icono: Icono } = opciones[clave];
              return (
                <li key={clave} className="flex">
                  <Link
                    href={`/correo?donde=${clave}`}
                    className="group flex w-full flex-col rounded-xl p-5 ring-1 ring-foreground/10 transition-colors outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <Icono aria-hidden="true" className="size-7 text-brand" strokeWidth={1.75} />
                    <span className="mt-4 block font-medium leading-[1.3] sm:mt-6">{t(titulo)}</span>
                    <span className="mt-2 block text-base text-(--text-secondary)">{t(texto)}</span>
                    <span
                      aria-hidden="true"
                      className="mt-auto pt-3 transition-transform group-hover:translate-x-1 motion-reduce:transition-none sm:pt-5"
                    >
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <Elegida opcion={opcion} />
      )}
    </Pagina>
  );
}

// El plazo que más apremia en este caso, en ficha blanca dentro del héroe: el
// abierto que antes cierra o, si no hay ninguno abierto, el próximo.
async function PlazoClave({ opcion }: { opcion: (typeof opciones)[Donde] }) {
  const { t, idioma } = await getT();
  const hoy = hoyMadrid();
  const p = urgente(opcion.plazos.map(plazo), hoy);
  const abierto = p !== null && estado(p, hoy) === "abierto";
  const etiqueta = !p
    ? t("Plazos cerrados")
    : abierto
      ? t("Plazo abierto más urgente")
      : t("Próximo plazo");
  const n = p ? cierraEn(abierto ? p.fin : p.inicio, hoy) : 0;
  const cuenta = !p
    ? null
    : !abierto
      ? t("Empieza el {fecha}", { fecha: fechaLarga(p.inicio, idioma) })
      : n === 0
        ? t("Cierra hoy")
        : n === 1
          ? t("Cierra en 1 día")
          : t("Cierra en {n} días", { n });

  return (
    <div className="grid gap-3">
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base">
        <span className="font-medium">{t(opcion.titulo)}</span>
        <Link
          href="/correo"
          className="inline-flex min-h-11 items-center rounded-sm underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {t("Cambiar")}
        </Link>
      </p>
      <section
        aria-label={etiqueta}
        className="max-w-[560px] rounded-2xl bg-secondary px-5 py-4 text-foreground"
      >
        <p className="font-mono text-xs tracking-[0.08em] text-(--text-secondary) uppercase">
          {etiqueta}
        </p>
        {p ? (
          <>
            <p className="mt-1 text-[clamp(22px,3.5vw,30px)] leading-[1.15] font-medium tracking-[-0.02em]">
              {rango(p, idioma, t)}
            </p>
            <p className="mt-1 text-base text-(--text-secondary)">{t(p.evento)}</p>
            <p className="mt-1 text-base font-medium">{cuenta}</p>
            <p className="mt-1 text-sm text-(--text-secondary)">
              {t("Fuente:")}{" "}
              <a
                href={p.fuente}
                className="rounded-sm underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {t(nombreFuente(p.fuente))}
              </a>
            </p>
          </>
        ) : (
          <p className="mt-1 text-base text-(--text-secondary)">
            {t("Ya han cerrado todos los plazos de este caso.")}
          </p>
        )}
      </section>
    </div>
  );
}

async function Elegida({ opcion }: { opcion: (typeof opciones)[Donde] }) {
  const { t, idioma } = await getT();
  const hoy = hoyMadrid();
  const fuentes: Source[] = [fuenteCalendario, ...opcion.fuentes];
  const Calendario = opcion.calendario;
  const donde: readonly Lugar[] = opcion.donde;

  return (
    <div className="mt-20 text-lg [&>*+*]:mt-20">
      <section aria-labelledby="fechas">
        <Encabezado numero="01" id="fechas" titulo={t("Tus fechas, paso a paso")} />
        <div className="mt-8">
          <Calendario hoy={hoy} />
        </div>
      </section>

      <section aria-labelledby="donde-se-hace">
        <Encabezado numero="02" id="donde-se-hace" titulo={t("Dónde se hace")} />
        <ul className="mt-8 grid gap-6">
          {donde.map((l) => (
            <li key={l.sitio}>
              <h3 className="font-medium">{t(l.sitio)}</h3>
              <p className="mt-1 text-(--text-secondary)">
                {t(l.texto, {
                  fechas: l.fechas ? rango(plazo(l.fechas), idioma, t) : undefined,
                })}
              </p>
              {l.enlace && (
                <a
                  href={l.enlace.url}
                  className="mt-1 inline-block rounded-sm underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [overflow-wrap:anywhere]"
                >
                  {t(l.enlace.nombre)}
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="pregunta-caso"
        className="rounded-[28px] bg-secondary px-5 py-8 md:-mx-12 md:px-12 md:py-12"
      >
        <Encabezado numero="03" id="pregunta-caso" titulo={t("Pregunta por tu caso")} />
        <p className="mt-3 text-(--text-secondary)">
          {t("Responde con las fuentes oficiales de cada dato.")}
        </p>
        <div className="mt-6 [&_textarea]:bg-background">
          <Chat key={opcion.modo} modo={opcion.modo} />
        </div>
      </section>
      <BotonChat destino="pregunta-caso" />

      <Fuentes fuentes={fuentes} />
    </div>
  );
}
