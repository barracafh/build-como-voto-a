import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Fuentes } from "@/components/Fuentes";
import { Pagina, Titular } from "@/components/Pagina";
import {
  estado,
  fechaLarga,
  fuenteCalendario,
  plazo,
  rango,
} from "@/lib/calendario";

// Los plazos se abren y cierran por fecha: se recalcula cada hora.
export const revalidate = 3600;

const piezas = [
  {
    href: "/correo",
    titulo: "Votar por correo, aquí o desde fuera",
    texto: "Si vives en España y no estarás, si vives en el extranjero o si estarás fuera unos días.",
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

// Solo plazos que afectan a quien vota; nada de candidaturas ni sondeos.
const plazosElector = [
  "erta_solicitud",
  "braille_solicitud",
  "voto_correo_solicitud",
  "cera_voto_correo",
  "voto_correo_remision",
  "erta_remision_voto",
  "cera_deposito_urna",
].map(plazo);

const votacion = plazo("votacion");
const mesaIne = "https://sede.ine.gob.es/ce-mesas/?lang=es_ES";

export default function Home() {
  const vigentes = plazosElector
    .filter((p) => estado(p) !== "cerrado")
    .sort((a, b) => a.fin.localeCompare(b.fin));

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
        {/* La tarjeta con el sol: el dato que más importa. */}
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
          <p>De 9:00 a 20:00, en tu mesa electoral.</p>
        </Card>

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

        {vigentes.length > 0 && (
          <div>
            <h2
              id="plazos"
              className="font-sans text-[clamp(30px,5vw,44px)] leading-[1.08] tracking-[-0.03em]"
            >
              Plazos que siguen abiertos
            </h2>
            <ol aria-labelledby="plazos" className="mt-6 grid gap-5">
              {vigentes.map((p, i) => (
                <li
                  key={p.id}
                  className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-3 md:grid-cols-[32px_minmax(0,1fr)] md:gap-x-4"
                >
                  <span className="text-[22px] leading-[1.1] font-light text-brand tabular-nums md:text-[26px]">
                    {i + 1}
                  </span>
                  <div>
                    <p className="flex flex-wrap items-center gap-2 font-mono text-sm text-(--text-secondary) uppercase">
                      {rango(p)}
                      {estado(p) === "abierto" && (
                        <Badge variant="outline">Abierto</Badge>
                      )}
                    </p>
                    <p className="mt-1">{p.evento}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

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
              buttonVariants({ variant: "sunset", size: "lg" }),
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
            { nombre: "Consulta de mesa y local · INE", url: mesaIne },
          ]}
        />
      </section>
    </Pagina>
  );
}
