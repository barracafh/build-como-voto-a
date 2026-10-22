import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Atardecer } from "@/components/Atardecer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  estado,
  fechaCorta,
  fechaLarga,
  hoy as hoyMadrid,
  plazo,
  rango,
  type Plazo,
} from "@/lib/calendario";
import type { Idioma } from "@/i18n/idiomas";
import { getT } from "@/i18n/servidor";
import { marcar, type T } from "@/i18n/traducir";
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
    pestana: marcar("En España"),
    nombre: marcar("Vives en España"),
    quien: marcar("y votas por correo"),
    href: "/correo?donde=aqui",
    pasos: [
      {
        plazo: plazo("voto_correo_solicitud"),
        corto: marcar("Pides el voto"),
        titulo: marcar("Pide el voto por correo"),
        detalle:
          marcar("En Correos, en persona y con tu DNI, o en su web con DNI electrónico o certificado digital."),
      },
      {
        plazo: plazo("voto_correo_remision"),
        corto: marcar("Envías tu voto"),
        titulo: marcar("Envía tu voto desde Correos"),
        detalle:
          marcar("Por correo certificado y sin franqueo, desde que te llega la documentación."),
      },
    ],
  },
  {
    pestana: marcar("Fuera unos meses"),
    nombre: marcar("Estás fuera unos meses"),
    quien: marcar("pero vives en España"),
    pasos: [
      {
        plazo: plazo("erta_solicitud"),
        corto: marcar("Pides el voto"),
        titulo: marcar("Pide la documentación en el consulado"),
        detalle:
          marcar("En persona, en la oficina consular más cercana. Tienes que estar inscrito en el consulado como no residente. En Correos no se puede pedir."),
      },
      {
        plazo: plazo("erta_remision_voto"),
        corto: marcar("Envías tu voto"),
        titulo: marcar("Envía tu voto a tu mesa en España"),
        detalle: marcar("Por correo certificado, desde que te llega la documentación."),
      },
    ],
  },
  {
    pestana: marcar("Vivo fuera"),
    nombre: marcar("Vives fuera de España"),
    quien: marcar("inscrito en el consulado"),
    href: "/correo?donde=fuera",
    alternativas: true,
    pasos: [
      {
        plazo: plazo("cera_voto_correo"),
        corto: marcar("Por correo"),
        titulo: marcar("Envía tu voto por correo al consulado"),
        detalle:
          marcar("No hace falta pedirlo: la documentación te llega a casa. El envío es gratis. Si lo mandas directo a España, no vale."),
      },
      {
        plazo: plazo("cera_deposito_urna"),
        corto: marcar("En urna"),
        titulo: marcar("O vota en urna en el consulado"),
        detalle: marcar("Con tu pasaporte o DNI españoles."),
      },
    ],
  },
  {
    pestana: marcar("Braille"),
    nombre: marcar("Lees en braille"),
    quien: marcar("y quieres votar sin ayuda"),
    pasos: [
      {
        plazo: plazo("braille_solicitud"),
        corto: marcar("Pides el kit"),
        titulo: marcar("Pide el kit de voto en braille"),
        detalle:
          marcar("Te lo dan en tu mesa el día de la votación. Si lo pides, no puedes votar por correo."),
      },
    ],
  },
];

const votacion = plazo("votacion");
const campana = plazo("campana");

type I18n = { t: T; idioma: Idioma };

// «quedan 28 días», «queda 1 día», «cierra hoy».
const queda = (fin: string, hoy: string, t: T) => {
  const n = cierraEn(fin, hoy);
  return n === 0
    ? t("cierra hoy")
    : n === 1
      ? t("queda 1 día")
      : t("quedan {n} días", { n });
};

const cuando = (p: Plazo, hoy: string, { t, idioma }: I18n) => {
  if (estado(p, hoy) === "proximo")
    return t("Empieza el {fecha}", { fecha: fechaLarga(p.inicio, idioma) });
  const quedan = cierraEn(p.fin, hoy);
  return quedan === 0
    ? t("Cierra hoy")
    : quedan === 1
      ? t("Cierra en 1 día")
      : t("Cierra en {n} días", { n: quedan });
};

// Desde hoy hasta la votación, una pestaña por caso: el gráfico de sus plazos
// y debajo la misma información como lista. El gráfico es decorativo.
// numero: el de la sección en la portada («03»).
export async function PlazosAbiertos({
  hoy = hoyMadrid(),
  numero,
}: {
  hoy?: string;
  numero?: string;
}) {
  const i18n = await getT();
  const { t, idioma } = i18n;
  const vigentes = abiertos(grupos, hoy);
  if (vigentes.length === 0) return null;
  const escala = { desde: hoy, hasta: votacion.fin };

  return (
    <section aria-labelledby="plazos">
      {numero && (
        <p className="font-mono text-xs tracking-[0.08em] text-brand uppercase">{numero}</p>
      )}
      <h2
        id="plazos"
        className={cn(
          "text-[clamp(32px,5vw,48px)] leading-[1.06] tracking-[-0.02em]",
          numero && "mt-3",
        )}
      >
        {t("Plazos que siguen abiertos")}
      </h2>
      <p className="mt-3 text-(--text-secondary)">
        {t("Elige tu caso: cada barra es el tiempo que tienes para hacer ese paso.")}
      </p>

      <Tabs defaultValue={vigentes[0].pestana} className="mt-6 flex-col gap-6">
        <TabsList
          aria-label={t("Tu caso")}
          className="grid h-auto w-full grid-cols-2 sm:grid-cols-4"
        >
          {vigentes.map((g) => (
            <TabsTrigger key={g.pestana} value={g.pestana} className="min-h-11 text-base">
              {t(g.pestana)}
            </TabsTrigger>
          ))}
        </TabsList>

        {vigentes.map((g) => (
          <TabsContent key={g.pestana} value={g.pestana} className="text-lg">
            <h3 className="text-xl leading-[1.3] font-medium">
              {t(g.nombre)}{" "}
              <span className="font-normal text-(--text-secondary)">{t(g.quien)}</span>
            </h3>
            <Grafico grupo={g} escala={escala} hoy={hoy} i18n={i18n} />
            {/* El detalle de cada paso, solo si se pide: el gráfico ya da las fechas. */}
            <details className="group mt-6">
              <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform group-open:rotate-90 motion-reduce:transition-none"
                >
                  ›
                </span>
                {t("Ver los pasos en detalle")}
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
                        {rango(p.plazo, idioma, t)}
                        {estado(p.plazo, hoy) === "abierto" && (
                          <Badge variant="outline">{t("Abierto")}</Badge>
                        )}
                      </p>
                      <p className="mt-1 font-medium">{t(p.titulo)}</p>
                      <p className="mt-1 text-(--text-secondary)">{t(p.detalle)}</p>
                      <p className="mt-1 font-medium">{cuando(p.plazo, hoy, i18n)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </details>
            {g.href && (
              <Link
                href={g.href}
                className="mt-2 inline-block rounded-sm underline underline-offset-4 outline-none hover:text-(--text-secondary) focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {t("Ver tu caso paso a paso")} <span aria-hidden="true">→</span>
              </Link>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

function Grafico({
  grupo,
  escala,
  hoy,
  i18n,
}: {
  grupo: Grupo;
  escala: Escala;
  hoy: string;
  i18n: I18n;
}) {
  const { t, idioma } = i18n;
  const tv = tramo(votacion.inicio, votacion.fin, escala);
  const centroMeta = tv.izquierda + tv.ancho / 2;
  const c = tramo(campana.inicio, campana.fin, escala);

  return (
    <Card aria-hidden="true" className="mt-4 gap-0 px-4 pt-6 pb-5 md:px-6 md:pt-8 md:pb-6">
      <div className="relative mx-3 grid gap-4 pb-4">
        {/* La campaña de fondo y una guía punteada que baja hasta el sol. */}
        <div
          className="absolute inset-y-0 -top-3 rounded-md bg-secondary"
          style={{ left: `${c.izquierda}%`, width: `${c.ancho}%` }}
        />
        <div
          className="absolute -top-3 bottom-0 border-l border-dashed border-foreground/25"
          style={{ left: `${centroMeta}%` }}
        />
        {grupo.pasos.map((p, i) => (
          <Barra
            key={p.plazo.id}
            numero={marca(grupo, i)}
            paso={p}
            escala={escala}
            hoy={hoy}
            orden={i}
            i18n={i18n}
          />
        ))}
      </div>

      <div className="relative">
        <Eje escala={escala} i18n={i18n} />
        <Atardecer
          logo
          className="absolute -top-4 left-3 size-8 -translate-x-1/2 rounded-full ring-4 ring-background motion-safe:animate-[latir_2.4s_var(--ease-brand)_infinite]"
          style={{ marginLeft: `calc((100% - 1.5rem) * ${centroMeta / 100})` }}
        />
      </div>

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-(--text-secondary)">
        <li className="flex items-center gap-2">
          <span className="h-3 w-6 rounded-full bg-foreground" /> {t("Abierto")}
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-6 rounded-full border border-dashed border-foreground/60" />{" "}
          {t("Aún no empieza")}
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-6 rounded-sm bg-secondary ring-1 ring-foreground/10" />{" "}
          {t("Campaña")}
        </li>
        <li className="flex items-center gap-2">
          <Atardecer logo className="size-4" />{" "}
          {t("Votación, {fecha}", { fecha: fechaLarga(votacion.inicio, idioma) })}
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
  i18n: { t, idioma },
}: {
  numero: string;
  paso: Paso;
  escala: Escala;
  hoy: string;
  orden: number;
  i18n: I18n;
}) {
  const e = estado(paso.plazo, hoy);
  // Lo que ya pasó no se dibuja: la escala empieza hoy.
  const tb = tramo(paso.plazo.inicio, paso.plazo.fin, escala);
  // Las barras de la mitad derecha llevan la etiqueta alineada a su final.
  const aLaDerecha = tb.izquierda > 50;

  return (
    <div className="relative h-12">
      <p
        className={cn(
          "absolute top-0 flex items-baseline gap-1.5 text-sm whitespace-nowrap",
          aLaDerecha && "-translate-x-full",
        )}
        style={{ left: `${aLaDerecha ? tb.izquierda + tb.ancho : tb.izquierda}%` }}
      >
        <span className="font-medium text-brand tabular-nums">{numero}</span>
        <span className="font-medium">{t(paso.corto)}</span>
        <span className="text-(--text-secondary) max-sm:hidden">
          ·{" "}
          {e === "abierto"
            ? queda(paso.plazo.fin, hoy, t)
            : t("desde el {fecha}", { fecha: fechaCorta(paso.plazo.inicio, idioma) })}
        </span>
      </p>
      <div className="absolute inset-x-0 bottom-2 h-px bg-border" />
      <div
        className={cn(
          "absolute bottom-0 h-4 origin-left rounded-full motion-safe:animate-[crecer_900ms_var(--ease-brand)_both]",
          e === "abierto" && "bg-foreground",
          e === "proximo" && "border border-dashed border-foreground/60 bg-background",
        )}
        style={{
          left: `${tb.izquierda}%`,
          width: `${tb.ancho}%`,
          animationDelay: `${orden * 100}ms`,
        }}
      />
    </div>
  );
}

function Eje({ escala, i18n: { t, idioma } }: { escala: Escala; i18n: I18n }) {
  return (
    <div className="relative mx-3 h-8 border-t border-foreground/20 font-mono text-xs text-(--text-secondary) uppercase">
      {marcas(escala, idioma).map((m) => (
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
      <span className="absolute top-2 left-0 -translate-x-3 font-medium text-brand">
        {t("Hoy")}
      </span>
    </div>
  );
}
