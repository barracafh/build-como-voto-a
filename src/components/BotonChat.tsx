"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useIdioma } from "@/i18n/cliente";

// La sección que contiene el elemento `id` (el titular del chat).
const seccion = (id: string) => {
  const el = document.getElementById(id);
  return el?.closest("section") ?? el;
};

// Botón flotante abajo a la derecha que lleva al chat de la página y deja el
// cursor en su campo de texto. Se oculta mientras el chat o el pie están a la
// vista (en el pie taparía su texto).
export function BotonChat({ destino }: { destino: string }) {
  const { t } = useIdioma();
  const [oculto, setOculto] = useState(true);

  useEffect(() => {
    const el = seccion(destino);
    if (!el) return;
    const vistos = new Map<Element, boolean>();
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) vistos.set(e.target, e.isIntersecting);
        setOculto([...vistos.values()].some(Boolean));
      },
      { threshold: 0.2 },
    );
    observador.observe(el);
    const pie = document.querySelector("footer");
    if (pie) observador.observe(pie);
    return () => observador.disconnect();
  }, [destino]);

  function ir(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = seccion(destino);
    if (!el) return;
    e.preventDefault();
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: quieto ? "auto" : "smooth", block: "start" });
    el.querySelector("textarea")?.focus({ preventScroll: true });
  }

  return (
    <a
      href={`#${destino}`}
      onClick={ir}
      aria-hidden={oculto}
      tabIndex={oculto ? -1 : undefined}
      data-oculto={oculto}
      className="fixed right-4 bottom-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground py-2.5 pr-5 pl-4 text-base font-medium text-background shadow-(--shadow-overlay) outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-[oculto=true]:pointer-events-none data-[oculto=true]:translate-y-2 data-[oculto=true]:opacity-0 motion-safe:transition-[opacity,translate] motion-safe:duration-300 motion-safe:ease-(--ease-brand)"
    >
      <MessageCircle aria-hidden="true" className="size-5" strokeWidth={1.75} />
      {t("Pregunta")}
    </a>
  );
}
