import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chat } from "@/components/Chat";
import { CuentaAtras } from "@/components/CuentaAtras";
import { Flotante } from "@/components/Flotante";
import { Fuentes } from "@/components/Fuentes";
import { Pagina, Titular } from "@/components/Pagina";
import { PlazosAbiertos } from "@/components/PlazosAbiertos";
import {
  fechaLarga,
  fuenteCalendario,
  instanteMadrid,
  plazo,
} from "@/lib/calendario";

// Los plazos se abren y cierran por fecha: se recalcula cada hora.
export const revalidate = 3600;

const piezas = [
  {
    href: "/correo",
    titulo: "Voto por correo, aquí o desde fuera",
    texto: "Elige si vives en España o fuera y pregunta por tu caso: pasos y fechas oficiales.",
  },
  {
    href: "/verificar",
    titulo: "¿Es verdad lo que me han dicho?",
    texto: "Contrasta lo que circula sobre cómo se vota con la fuente oficial.",
  },
  {
    href: "/escanos",
    titulo: "Cómo se reparten los escaños",
    texto: "La ley D'Hondt con los resultados oficiales de 2023, provincia a provincia.",
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
  return (
    <Pagina>
      <Titular
        etiqueta="Elecciones generales · 29N"
        titulo="Todo para votar el 29 de noviembre."
        entradilla="Cómo, dónde y hasta cuándo, con la fuente oficial de cada dato. Solo cómo se vota: nada de candidaturas, programas ni encuestas."
      />

      <section
        aria-labelledby="votacion"
        className="mt-16 text-lg [&>*+*]:mt-8"
      >
        {/* La tarjeta con el sol: el dato que más importa. Al bajar, una versión
            compacta se queda flotando arriba a la derecha. */}
        <Flotante
          flotante={
            <Card className="gap-0.5 px-4 py-3 text-sm ring-0 shadow-(--shadow-overlay) [background:radial-gradient(120%_90%_at_100%_0%,#ffd34d_0%,rgba(255,211,77,0)_60%),var(--brand-yellow)]">
              <p className="font-heading text-xl leading-[1.1] md:text-2xl">
                {fechaLarga(votacion.inicio)}
              </p>
              <ul className="mt-1 grid gap-0.5">
                <CuentaAtras
                  corto
                  hasta={abreVotacion}
                  antes="Votar:"
                  despues={cierra ? `Hoy se vota, hasta las ${cierra}.` : "Hoy se vota."}
                  finDespues={cierraVotacion}
                />
                <CuentaAtras corto hasta={cierraCorreo} antes="Correo:" />
              </ul>
            </Card>
          }
        >
          <Card
            render={<section />}
            className="gap-2 px-6 py-6 text-base ring-0 [background:radial-gradient(120%_90%_at_100%_0%,#ffd34d_0%,rgba(255,211,77,0)_60%),var(--brand-yellow)]"
          >
            <h2 id="votacion" className="text-sm font-medium">
              Día de la votación
            </h2>
            <p className="font-heading text-[clamp(30px,5vw,44px)] leading-[1.08]">
              {fechaLarga(votacion.inicio)}
            </p>
            {horario && <p>Horario {horario}, en tu mesa electoral.</p>}
            <ul className="mt-2 grid gap-1 text-sm tabular-nums">
              <CuentaAtras
                hasta={abreVotacion}
                antes="Para votar faltan"
                despues={cierra ? `Hoy se vota, hasta las ${cierra}.` : "Hoy se vota."}
                finDespues={cierraVotacion}
              />
              <CuentaAtras
                hasta={cierraCorreo}
                antes={`Para enviar el voto por correo (hasta el ${fechaLarga(remision.fin)}, en horario de Correos) faltan`}
              />
            </ul>
          </Card>
        </Flotante>

        <div>
          <h2
            id="que-necesitas"
            className="font-sans text-[clamp(30px,5vw,44px)] leading-[1.08] tracking-[-0.03em]"
          >
            ¿Qué necesitas?
          </h2>
          <ul
            aria-labelledby="que-necesitas"
            className="mt-6 divide-y overflow-hidden rounded-xl ring-1 ring-foreground/10"
          >
            {piezas.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="flex min-h-11 items-center justify-between gap-4 px-5 py-4 transition-colors outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
                >
                  <span className="min-w-0">
                    <span className="block font-medium">{p.titulo}</span>
                    <span className="block text-base text-(--text-secondary)">
                      {p.texto}
                    </span>
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2
            id="pregunta-directa"
            className="font-sans text-[clamp(30px,5vw,44px)] leading-[1.08] tracking-[-0.03em]"
          >
            O pregúntalo directamente
          </h2>
          <p className="mt-2 text-base text-(--text-secondary)">
            Responde con las fuentes oficiales de cada dato.
          </p>
          <div className="mt-6">
            <Chat modo="general" />
          </div>
        </div>

        <PlazosAbiertos />

        <Card
          render={<section />}
          className="flex-row flex-wrap items-center justify-between gap-x-6 gap-y-4 px-6 py-6 text-base"
        >
          <div className="min-w-0 flex-[1_1_260px]">
            <p className="text-sm text-(--text-secondary)">Dónde se hace</p>
            <h3 className="mt-1 text-lg leading-[1.35] font-medium">
              Consulta tu mesa y tu local electoral en el INE
            </h3>
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
      </section>
    </Pagina>
  );
}
