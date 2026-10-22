import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { BotonAviso } from "@/components/BotonAviso";
import { SelectorIdioma } from "@/components/SelectorIdioma";
import { getT } from "@/i18n/servidor";
import ficha from "../../ficha.json";

// Cabecera, contenido y pie comunes a todas las pantallas de la herramienta.
export async function Pagina({ children }: { children: ReactNode }) {
  const { t } = await getT();
  return (
    <>
      <header className="mx-auto flex min-h-20 max-w-(--container-content) flex-wrap items-center justify-between gap-4 px-(--page-gutter) py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-3 rounded-lg text-lg leading-tight font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand font-mono text-xl text-white"
          >
            {ficha.icono}
          </span>
          {ficha.nombre}
        </Link>
        <div className="flex items-center gap-3">
          <SelectorIdioma />
          <Badge variant="outline">
            {ficha.datos === "reales" ? t("Datos públicos") : t("Datos simulados")}
          </Badge>
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
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[28px] px-(--page-gutter) py-12 [background:radial-gradient(80%_70%_at_50%_-12%,#ffe58f_0%,rgba(255,229,143,0)_70%),linear-gradient(180deg,#ffd34d_0%,var(--brand-yellow)_46%,var(--brand-orange)_100%)] md:px-12">
          <p className="text-[15px]">
            {t("Una pieza del squad")}{" "}
            <span className="font-mono">{ficha.equipo}</span> · Build night
          </p>
          <BotonAviso />
        </div>
      </footer>
    </>
  );
}

// La cabecera de las páginas interiores: una versión compacta del héroe de la
// portada, con el atardecer de Sol. Es la pieza con el sol de la vista.
// `children` va dentro, al pie, para el dato que más importa (en fichas
// blancas, como la cuenta atrás de la portada).
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
    <section
      aria-labelledby="titular"
      className="relative overflow-hidden rounded-[28px] px-6 pt-6 pb-24 text-white [background:var(--brand-gradient)] md:-mx-12 md:px-12 md:pt-8 md:pb-28"
    >
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-2 rounded-sm font-mono text-xs tracking-[0.08em] uppercase underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-white/70"
      >
        <span aria-hidden="true">←</span> {t("Inicio")}
      </Link>
      <p className="mt-6 font-mono text-xs tracking-[0.08em] uppercase">{etiqueta}</p>
      <h1
        id="titular"
        className="mt-3 max-w-[18ch] text-[clamp(34px,5vw,56px)] leading-[1.06] tracking-[-0.02em]"
      >
        {titulo}
      </h1>
      <p className="mt-5 max-w-[56ch] text-lg">{entradilla}</p>
      {children && <div className="mt-8">{children}</div>}
    </section>
  );
}
