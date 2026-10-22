import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { BotonAviso } from "@/components/BotonAviso";
import ficha from "../../ficha.json";

// Cabecera, contenido y pie comunes a todas las pantallas de la herramienta.
export function Pagina({ children }: { children: ReactNode }) {
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
        <Badge variant="outline">
          {ficha.datos === "reales" ? "Datos públicos" : "Datos simulados"}
        </Badge>
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
            Una pieza del squad{" "}
            <span className="font-mono">{ficha.equipo}</span> · Build night
          </p>
          <BotonAviso />
        </div>
      </footer>
    </>
  );
}

export function Titular({
  etiqueta,
  titulo,
  entradilla,
}: {
  etiqueta: string;
  titulo: string;
  entradilla: ReactNode;
}) {
  return (
    <>
      <p className="font-mono text-xs tracking-[0.06em] text-(--text-secondary) uppercase">
        {etiqueta}
      </p>
      <h1 className="mt-4 text-[clamp(36px,4.5vw,60px)] leading-[1.1] tracking-[-0.02em]">
        {titulo}
      </h1>
      <p className="mt-6 text-lg text-(--text-secondary)">{entradilla}</p>
    </>
  );
}
