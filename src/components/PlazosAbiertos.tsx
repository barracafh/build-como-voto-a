import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  estado,
  fechaLarga,
  hoy as hoyMadrid,
  plazo,
  rango,
  type Plazo,
} from "@/lib/calendario";
import { cierraEn, marcas, tramo, type Escala } from "@/lib/linea-tiempo";
import { abiertos } from "@/lib/plazos-abiertos";

// corto: etiqueta de la barra; titulo y detalle, el paso en la lista.
type Paso = { plazo: Plazo; corto: string; titulo: string; detalle: string };
// pestana: nombre corto en la pestaña. alternativas: los pasos son opciones
// (se hace uno u otro) y van con letra.
type Grupo = {
  pestana: string;
  nombre: string;
  quien: string;
  href?: string;
  alternativas?: boolean;
  pasos: Paso[];
};

const marca = (g: Grupo, i: number) =>
  g.alternativas ? String.fromCharCode(65 + i) : String(i + 1);

// Solo plazos que hace quien vota, agrupados por su caso. Pasos de contexto.md
// §2.2 a §2.5; fechas de calendario_29N_2026.json.
const grupos: Grupo[] = [
  {
    pestana: "En España",
    nombre: "Vives en España",
    quien: "y votas por correo",
    href: "/correo?donde=aqui",
    pasos: [
      {
        plazo: plazo("voto_correo_solicitud"),
        corto: "Pides el voto",
        titulo: "Pide el voto por correo",
        detalle:
          "En Correos, en persona y con tu DNI, o en su web con DNI electrónico o certificado digital.",
      },
      {
        plazo: plazo("voto_correo_remision"),
        corto: "Envías tu voto",
        titulo: "Envía tu voto desde Correos",
        detalle:
          "Por correo certificado y sin franqueo, desde que te llega la documentación.",
      },
    ],
  },
  {
    pestana: "Fuera unos meses",
    nombre: "Estás fuera unos meses",
    quien: "pero vives en España",
    pasos: [
      {
        plazo: plazo("erta_solicitud"),
        corto: "Pides el voto",
        titulo: "Pide la documentación en el consulado",
        detalle:
          "En persona, en la oficina consular más cercana. Tienes que estar inscrito en el consulado como no residente. En Correos no se puede pedir.",
      },
      {
        plazo: plazo("erta_remision_voto"),
        corto: "Envías tu voto",
        titulo: "Envía tu voto a tu mesa en España",
        detalle: "Por correo certificado, desde que te llega la documentación.",
      },
    ],
  },
  {
    pestana: "Vivo fuera",
    nombre: "Vives fuera de España",
    quien: "inscrito en el consulado",
    href: "/correo?donde=fuera",
    alternativas: true,
    pasos: [
      {
        plazo: plazo("cera_voto_correo"),
        corto: "Por correo",
        titulo: "Envía tu voto por correo al consulado",
        detalle:
          "No hace falta pedirlo: la documentación te llega a casa. El envío es gratis. Si lo mandas directo a España, no vale.",
      },
      {
        plazo: plazo("cera_deposito_urna"),
        corto: "En urna",
        titulo: "O vota en urna en el consulado",
        detalle: "Con tu pasaporte o DNI españoles.",
      },
    ],
  },
  {
    pestana: "Braille",
    nombre: "Lees en braille",
    quien: "y quieres votar sin ayuda",
    pasos: [
      {
        plazo: plazo("braille_solicitud"),
        corto: "Pides el kit",
        titulo: "Pide el kit de voto en braille",
        detalle:
          "Te lo dan en tu mesa el día de la votación. Si lo pides, no puedes votar por correo.",
      },
    ],
  },
];

const votacion = plazo("votacion");

const corta = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const fechaCorta = (iso: string) =>
  corta.format(new Date(`${iso}T00:00:00Z`)).replace(".", "");

const cuando = (p: Plazo, hoy: string) => {
  if (estado(p, hoy) === "proximo") return `Empieza el ${fechaLarga(p.inicio)}`;
  const quedan = cierraEn(p.fin, hoy);
  return quedan === 0
    ? "Cierra hoy"
    : `Cierra en ${quedan} ${quedan === 1 ? "día" : "días"}`;
};

// Desde hoy hasta la votación, una pestaña por caso: el gráfico de sus plazos
// y debajo la misma información como lista. El gráfico es decorativo.
export function PlazosAbiertos({ hoy = hoyMadrid() }: { hoy?: string }) {
  const vigentes = abiertos(grupos, hoy);
  if (vigentes.length === 0) return null;
  const escala = { desde: hoy, hasta: votacion.fin };

  return (
    <div>
      <h2
        id="plazos"
        className="font-sans text-[clamp(30px,5vw,44px)] leading-[1.08] tracking-[-0.03em]"
      >
        Plazos que siguen abiertos
      </h2>
      <p className="mt-3 text-(--text-secondary)">
        Elige tu caso: cada barra es el tiempo que tienes para hacer ese paso.
      </p>

      <Tabs defaultValue={vigentes[0].pestana} className="mt-6 flex-col gap-6">
        <TabsList
          aria-label="Tu caso"
          className="grid h-auto w-full grid-cols-2 sm:grid-cols-4"
        >
          {vigentes.map((g) => (
            <TabsTrigger key={g.pestana} value={g.pestana} className="min-h-11 text-base">
              {g.pestana}
            </TabsTrigger>
          ))}
        </TabsList>

        {vigentes.map((g) => (
          <TabsContent key={g.pestana} value={g.pestana} className="text-lg">
            <h3 className="text-xl leading-[1.3] font-medium">
              {g.nombre}{" "}
              <span className="font-normal text-(--text-secondary)">{g.quien}</span>
            </h3>
            <Grafico grupo={g} escala={escala} hoy={hoy} />
            {/* El detalle de cada paso, solo si se pide: el gráfico ya da las fechas. */}
            <details className="group mt-6">
              <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform group-open:rotate-90 motion-reduce:transition-none"
                >
                  ›
                </span>
                Ver los pasos en detalle
              </summary>
              <ol className="mt-4 grid gap-5">
                {g.pasos.map((p, i) => (
                  <li
                    key={p.plazo.id}
                    className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-3 md:grid-cols-[32px_minmax(0,1fr)] md:gap-x-4"
                  >
                    <span className="text-[22px] leading-[1.1] font-light text-brand tabular-nums md:text-[26px]">
                      {marca(g, i)}
                    </span>
                    <div>
                      <p className="flex flex-wrap items-center gap-2 font-mono text-sm text-(--text-secondary) uppercase">
                        {rango(p.plazo)}
                        {estado(p.plazo, hoy) === "abierto" && (
                          <Badge variant="outline">Abierto</Badge>
                        )}
                      </p>
                      <p className="mt-1 font-medium">{p.titulo}</p>
                      <p className="mt-1 text-(--text-secondary)">{p.detalle}</p>
                      <p className="mt-1 font-medium">{cuando(p.plazo, hoy)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </details>
            {g.href && (
              <Link
                href={g.href}
                className="mt-2 inline-block rounded-sm underline underline-offset-4 outline-none hover:text-(--text-secondary) focus-visible:ring-3 focus-visible:ring-ring/50 md:ml-12"
              >
                Ver tu caso paso a paso <span aria-hidden="true">→</span>
              </Link>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function Grafico({
  grupo,
  escala,
  hoy,
}: {
  grupo: Grupo;
  escala: Escala;
  hoy: string;
}) {
  const t = tramo(votacion.inicio, votacion.fin, escala);
  const centroMeta = t.izquierda + t.ancho / 2;

  return (
    <Card aria-hidden="true" className="mt-4 gap-0 px-4 py-5 md:px-6 md:py-6">
      <div className="relative mx-3 grid gap-3 pb-3">
        {grupo.pasos.map((p, i) => (
          <Barra
            key={p.plazo.id}
            numero={marca(grupo, i)}
            paso={p}
            escala={escala}
            hoy={hoy}
            orden={i}
          />
        ))}
      </div>

      <div className="relative">
        <Eje escala={escala} />
        <span
          className="absolute -top-3 left-3 size-6 -translate-x-1/2 rounded-full bg-brand-yellow ring-4 ring-background motion-safe:animate-[latir_2.4s_var(--ease-brand)_infinite]"
          style={{ marginLeft: `calc((100% - 1.5rem) * ${centroMeta / 100})` }}
        />
      </div>

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-(--text-secondary)">
        <li className="flex items-center gap-2">
          <span className="h-3 w-6 rounded-full bg-foreground" /> Abierto
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-6 rounded-full ring-1 ring-foreground ring-inset" />{" "}
          Aún no empieza
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-brand-yellow" /> Votación,{" "}
          {fechaLarga(votacion.inicio)}
        </li>
      </ul>
    </Card>
  );
}

function Barra({
  numero,
  paso,
  escala,
  hoy,
  orden,
}: {
  numero: string;
  paso: Paso;
  escala: Escala;
  hoy: string;
  orden: number;
}) {
  const e = estado(paso.plazo, hoy);
  // Lo que ya pasó no se dibuja: la escala empieza hoy.
  const t = tramo(paso.plazo.inicio, paso.plazo.fin, escala);
  // Las barras de la mitad derecha llevan la etiqueta alineada a su final.
  const aLaDerecha = t.izquierda > 50;

  return (
    <div className="relative h-11">
      <p
        className={cn(
          "absolute top-0 flex items-baseline gap-1.5 text-sm whitespace-nowrap",
          aLaDerecha && "-translate-x-full",
        )}
        style={{ left: `${aLaDerecha ? t.izquierda + t.ancho : t.izquierda}%` }}
      >
        <span className="font-medium text-brand tabular-nums">{numero}</span>
        {paso.corto}
        <span className="text-(--text-secondary) max-sm:hidden">
          · hasta el {fechaCorta(paso.plazo.fin)}
        </span>
      </p>
      <div className="absolute inset-x-0 bottom-1.5 h-px bg-border" />
      <div
        className={cn(
          "absolute bottom-0 h-3 origin-left rounded-full motion-safe:animate-[crecer_900ms_var(--ease-brand)_both]",
          e === "abierto" && "bg-foreground",
          e === "proximo" && "bg-background ring-1 ring-foreground ring-inset",
        )}
        style={{
          left: `${t.izquierda}%`,
          width: `${t.ancho}%`,
          animationDelay: `${orden * 100}ms`,
        }}
      />
    </div>
  );
}

function Eje({ escala }: { escala: Escala }) {
  return (
    <div className="relative mx-3 h-8 border-t border-foreground/20 font-mono text-xs text-(--text-secondary) uppercase">
      {marcas(escala).map((m) => (
        <span
          key={m.iso}
          className="absolute top-0 -translate-x-1/2 text-center"
          style={{ left: `${m.izquierda}%` }}
        >
          <span className="mx-auto block h-1.5 w-px bg-foreground/30" />
          <span className={cn("block pt-0.5", m.mes ? "text-foreground" : "max-sm:hidden")}>
            {m.mes ?? m.dia}
          </span>
        </span>
      ))}
      <span className="absolute top-2 left-0 -translate-x-3 text-foreground">Hoy</span>
    </div>
  );
}
