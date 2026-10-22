import Link from "next/link";
import type { ReactNode } from "react";
import { BadgeCheck } from "lucide-react";
import { Votijo } from "@/components/Votijo";
import { BotonAviso } from "@/components/BotonAviso";
import { SelectorIdioma } from "@/components/SelectorIdioma";
import { getT } from "@/i18n/servidor";
import { marcar } from "@/i18n/traducir";
import { cn } from "@/lib/utils";
import ficha from "../../ficha.json";

const herramientas = [
  ["/", marcar("Inicio")],
  ["/correo", marcar("Voto por correo")],
  ["/verificar", marcar("¿Es verdad lo que me han dicho?")],
  ["/escanos", marcar("Del voto al escaño")],
] as const;

const etiquetaPie = "font-mono text-xs tracking-[0.08em] text-background/70 uppercase";
const enlacePie =
  "inline-flex min-h-11 items-center gap-1 rounded-sm text-background/90 underline-offset-4 outline-none hover:text-background hover:underline focus-visible:ring-3 focus-visible:ring-background/60";

// Cabecera, contenido y pie comunes a todas las pantallas de la herramienta.
export async function Pagina({ children }: { children: ReactNode }) {
  const { t } = await getT();
  return (
    <>
      {/* Una línea a todo el ancho la separa del contenido. Sin sombra: arriba a
          la derecha flota la tarjeta de la votación. */}
      <header className="border-b border-foreground/10">
        <div className="mx-auto flex min-h-20 max-w-(--container-content) flex-wrap items-center justify-between gap-4 px-(--page-gutter) py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-lg text-lg leading-tight font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Votijo className="size-9 shrink-0" />
            {ficha.nombre}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <SelectorIdioma />
            {/* Un dato, no un control: texto con icono, sin aspecto de botón. */}
            <p className="inline-flex items-center gap-1.5 text-sm text-(--text-secondary)">
              <BadgeCheck aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
              {ficha.datos === "reales" ? t("Datos públicos") : t("Datos simulados")}
            </p>
          </div>
        </div>
      </header>

      <main
        id="contenido"
        tabIndex={-1}
        className="mx-auto max-w-[760px] px-(--page-gutter) pt-12 pb-20 outline-none md:pt-20"
      >
        {children}
      </main>

      <footer className="p-2">
        <div className="bg-foreground rounded-[28px] px-(--page-gutter) pt-12 pb-8 text-background md:px-12 md:pt-16">
          <div className="mx-auto grid max-w-(--container-content) gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-3 font-semibold">
                <Votijo className="size-8 shrink-0" />
                {ficha.nombre}
              </div>
              <p className="mt-5 max-w-[16ch] text-[clamp(22px,2.6vw,28px)] font-medium leading-[1.2]">
                {t(ficha.frase)}
              </p>
              <BotonAviso className="mt-8" />
            </div>

            <nav aria-labelledby="pie-herramientas">
              <p id="pie-herramientas" className={etiquetaPie}>
                {t("Herramientas")}
              </p>
              <ul className="mt-4 grid gap-1">
                {herramientas.map(([href, nombre]) => (
                  <li key={href}>
                    <Link href={href} className={enlacePie}>
                      {t(nombre)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p id="pie-fuentes" className={etiquetaPie}>
                {t("Fuentes oficiales")}
              </p>
              <ul aria-labelledby="pie-fuentes" className="mt-4 grid gap-1">
                {ficha.fuentes.map((f) => (
                  <li key={f.url}>
                    <a href={f.url} className={cn(enlacePie, "font-mono text-sm")}>
                      {f.nombre} <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mx-auto mt-12 flex max-w-(--container-content) flex-wrap justify-between gap-x-6 gap-y-2 border-t border-background/15 pt-6 font-mono text-xs tracking-[0.06em] text-background/70 uppercase">
            <p>
              {t("Una pieza del squad")} <span className="normal-case">{ficha.equipo}</span> ·
              Build night
            </p>
            <p>{t("Herramienta experimental. No es un servicio oficial.")}</p>
          </div>
        </div>
      </footer>
    </>
  );
}

// La cabecera de las páginas interiores: como el héroe de la portada, el
// titular junto a un sol de cartel más pequeño. Es la pieza con el sol de la
// vista. `children` va debajo, para el dato que más importa.
export async function Titular({
  etiqueta,
  titulo,
  entradilla,
  children,
}: {
  etiqueta: string;
  titulo: string;
  entradilla: ReactNode;
  children?: ReactNode;
}) {
  const { t } = await getT();
  return (
    <section aria-labelledby="titular">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-2 rounded-sm font-mono text-xs tracking-[0.08em] text-(--text-secondary) uppercase underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span aria-hidden="true">←</span> {t("Inicio")}
      </Link>
      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_160px] md:items-end md:gap-12">
        <Votijo className="h-auto w-20 md:order-last md:w-full motion-safe:animate-[amanecer_1400ms_var(--ease-brand)_both]" />
        <div>
          <p className="font-mono text-xs tracking-[0.08em] text-(--text-secondary) uppercase">
            {etiqueta}
          </p>
          <h1
            id="titular"
            className="mt-3 max-w-[18ch] text-[clamp(34px,5vw,56px)] leading-[1.06] tracking-[-0.02em]"
          >
            {titulo}
          </h1>
          <p className="mt-5 max-w-[56ch] text-lg text-(--text-secondary)">{entradilla}</p>
        </div>
      </div>
      {children && <div className="mt-10 border-t border-foreground/10 pt-8">{children}</div>}
    </section>
  );
}
