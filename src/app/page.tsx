import Link from "next/link";
import { Mail, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BotonChat } from "@/components/BotonChat";
import { Chat } from "@/components/Chat";
import { Contador } from "@/components/Contador";
import { CuentaAtras } from "@/components/CuentaAtras";
import { Flotante } from "@/components/Flotante";
import { Fuentes } from "@/components/Fuentes";
import { MapaEspana } from "@/components/MapaEspana";
import { Pagina } from "@/components/Pagina";
import { PlazosAbiertos } from "@/components/PlazosAbiertos";
import {
  fechaLarga,
  fuenteCalendario,
  instanteMadrid,
  plazo,
} from "@/lib/calendario";

// Los plazos se abren y cierran por fecha y hora: se calcula en cada visita,
// para que nunca se sirva una versión guardada de antes de un cierre.
export const dynamic = "force-dynamic";

const piezas = [
  {
    href: "/correo",
    titulo: "Voto por correo, aquí o desde fuera",
    texto: "Elige si vives en España o fuera y pregunta por tu caso: pasos y fechas oficiales.",
    icono: Mail,
  },
  {
    href: "/verificar",
    titulo: "¿Es verdad lo que me han dicho?",
    texto: "Contrasta lo que circula sobre cómo se vota con la fuente oficial.",
    icono: Search,
  },
  {
    href: "/escanos",
    titulo: "Cómo se reparten los escaños",
    texto: "La ley D'Hondt con los resultados oficiales de 2023, provincia a provincia.",
    icono: MapaEspana,
  },
];

const votacion = plazo("votacion");
// El horario también sale del calendario («Jornada de votación, de 9:00 a 20:00»).
const horario = votacion.evento.match(/de \d{1,2}:\d{2} a \d{1,2}:\d{2}/)?.[0];
// Último día para enviar el voto por correo desde España (también ERTA).
const remision = plazo("voto_correo_remision");
const mesaIne = "https://sede.ine.gob.es/ce-mesas/?lang=es_ES";

// Horas de Madrid. La votación abre a la hora del calendario; el voto por
// correo se puede enviar hasta que acaba el último día del plazo, aunque cada
// oficina de Correos tiene su horario.
const [abre, cierra] = horario?.match(/\d{1,2}:\d{2}/g) ?? [];
const abreVotacion = instanteMadrid(votacion.inicio, abre);
const cierraVotacion = instanteMadrid(votacion.inicio, cierra ?? "24:00");
const cierraCorreo = instanteMadrid(remision.fin, "24:00");

export default function Home() {
  // Pasadas las 20:00 del día de la votación ya no hay nada que contar.
  const terminada = Date.now() >= cierraVotacion;

  return (
    <Pagina>
      {/* El héroe con el atardecer de Sol (--brand-gradient): titular, día y
          cuenta atrás. Es la única pieza con el sol de la vista; al bajar, una
          versión compacta en el mismo rojo se queda flotando arriba a la
          derecha. */}
      <Flotante
        flotante={
          !terminada && (
            <Card className="gap-0.5 bg-brand px-4 py-3 text-sm text-white ring-0 shadow-(--shadow-overlay)">
              <p className="flex items-center gap-2.5 font-heading text-xl leading-[1.1] opacity-0 group-data-[visible=true]/flotante:opacity-100 motion-safe:transition-opacity motion-safe:delay-150 motion-safe:duration-500 md:text-2xl">
                <span className="size-3 shrink-0 rounded-full bg-brand-yellow ring-4 ring-brand-yellow/30 motion-safe:animate-[latir_2.4s_var(--ease-brand)_infinite]" />
                {fechaLarga(votacion.inicio)}
              </p>
              <ul className="mt-1 grid gap-0.5 font-mono text-xs opacity-0 group-data-[visible=true]/flotante:opacity-100 motion-safe:transition-opacity motion-safe:delay-300 motion-safe:duration-500">
                <CuentaAtras
                  corto
                  hasta={abreVotacion}
                  antes="VOTAR"
                  despues={cierra ? `Hoy se vota, hasta las ${cierra}.` : "Hoy se vota."}
                  finDespues={cierraVotacion}
                />
                <CuentaAtras corto hasta={cierraCorreo} antes="CORREO" />
              </ul>
            </Card>
          )
        }
      >
        <section
          aria-labelledby="titular"
          className="salida-con-scroll relative overflow-hidden rounded-[28px] px-6 pt-9 pb-24 text-white [background:var(--brand-gradient)] md:-mx-12 md:px-12 md:pt-14 md:pb-32"
        >
          <p className="font-mono text-xs tracking-[0.08em] uppercase">
            Elecciones generales · 29N
          </p>
          <h1
            id="titular"
            className="mt-4 max-w-[14ch] text-[clamp(38px,6vw,68px)] leading-[1.04] tracking-[-0.02em]"
          >
            {terminada
              ? `La votación del ${fechaLarga(votacion.inicio)} ha terminado.`
              : `Todo para votar el ${fechaLarga(votacion.inicio)}.`}
          </h1>
          <p className="mt-5 max-w-[52ch] text-lg">
            Cómo, dónde y hasta cuándo, con la fuente oficial de cada dato. Solo
            cómo se vota: nada de candidaturas, programas ni encuestas.
          </p>
          {horario && !terminada && (
            <p className="mt-6 font-medium">
              {fechaLarga(votacion.inicio)}, {horario}, en tu
              mesa electoral.
            </p>
          )}

          {!terminada && (
            <div className="mt-8 max-w-[520px]">
              <Contador
                hasta={abreVotacion}
                para="para votar"
                despues={cierra ? `Hoy se vota, hasta las ${cierra}.` : "Hoy se vota."}
                finDespues={cierraVotacion}
              />
              {/* Sin hijos cuando ya no queda plazo: entonces no se ve la caja. */}
              <ul className="mt-3 w-fit rounded-xl bg-background px-4 py-2 text-sm text-foreground empty:hidden">
                <CuentaAtras
                  corto
                  hasta={cierraCorreo}
                  antes={`Voto por correo, hasta el ${fechaLarga(remision.fin)}:`}
                />
              </ul>
            </div>
          )}
        </section>
      </Flotante>

      <div className="mt-20 text-lg [&>*+*]:mt-20">
        <section aria-labelledby="que-necesitas">
          <Encabezado numero="01" id="que-necesitas" titulo="¿Qué necesitas?" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {piezas.map(({ href, titulo, texto, icono: Icono }) => (
              <li key={href} className="flex">
                <Link
                  href={href}
                  className="group flex w-full flex-col rounded-xl p-5 ring-1 ring-foreground/10 transition-colors outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Icono aria-hidden="true" className="size-7 text-brand" />
                  <span className="mt-4 block font-medium leading-[1.3] sm:mt-6">{titulo}</span>
                  <span className="mt-2 block text-base text-(--text-secondary)">
                    {texto}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-auto pt-3 transition-transform sm:pt-5 group-hover:translate-x-1 motion-reduce:transition-none"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="pregunta-directa"
          className="rounded-[28px] bg-secondary px-5 py-8 md:-mx-12 md:px-12 md:py-12"
        >
          <Encabezado
            numero="02"
            id="pregunta-directa"
            titulo="O pregúntalo directamente"
          />
          <p className="mt-3 text-(--text-secondary)">
            Responde con las fuentes oficiales de cada dato.
          </p>
          {/* Sobre el gris del bloque, el campo de texto en blanco. */}
          <div className="mt-6 [&_textarea]:bg-background">
            <Chat modo="general" />
          </div>
        </section>
        <BotonChat destino="pregunta-directa" />

        <PlazosAbiertos numero="03" />

        <Card
          render={<section />}
          className="flex-row flex-wrap items-center justify-between gap-x-6 gap-y-4 px-6 py-6 text-base"
        >
          <div className="min-w-0 flex-[1_1_260px]">
            <p className="font-mono text-xs tracking-[0.08em] text-(--text-secondary) uppercase">
              Dónde se hace
            </p>
            <h2 className="mt-2 font-sans text-xl leading-[1.3] font-medium">
              Consulta tu mesa y tu local electoral en el INE
            </h2>
            <p className="mt-1 font-mono text-sm text-(--text-secondary)">
              {new URL(mesaIne).hostname}
            </p>
          </div>
          <a
            href={mesaIne}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "max-md:w-full",
            )}
          >
            Abrir la sede del INE <span aria-hidden="true">↗</span>
          </a>
        </Card>

        <Fuentes
          fuentes={[
            fuenteCalendario,
            {
              nombre: "Real Decreto 806/2026 de convocatoria · BOE",
              url: votacion.fuente,
            },
            {
              nombre: "Horario de votación · Art. 84.1 LOREG",
              url: votacion.fuentesAdicionales[0],
            },
            {
              nombre: "Plazos para los electores · INE",
              url: "https://www.ine.es/dyngs/CEL/index.htm?cid=1702",
            },
            {
              nombre: "Voto accesible · Ministerio del Interior",
              url: "https://infoelectoral.interior.gob.es/es/proceso-electoral/accesibilidad-y-procesos-electorales/",
            },
            { nombre: "Consulta de mesa y local · INE", url: mesaIne },
            {
              nombre: "Envío del voto por correo · Art. 73.3 LOREG",
              url: remision.fuentesAdicionales[0],
            },
          ]}
        />
      </div>
    </Pagina>
  );
}

// Número de sección en rojo (el acento de Sol) y titular en serif.
function Encabezado({
  numero,
  id,
  titulo,
}: {
  numero: string;
  id: string;
  titulo: string;
}) {
  return (
    <>
      <p className="font-mono text-xs tracking-[0.08em] text-brand uppercase">{numero}</p>
      <h2 id={id} className="mt-3 text-[clamp(32px,5vw,48px)] leading-[1.06] tracking-[-0.02em]">
        {titulo}
      </h2>
    </>
  );
}
