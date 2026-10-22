"use client";

import { Check, Minus, Thermometer } from "lucide-react";
import { useIdioma } from "@/i18n/cliente";
import type { Respuesta } from "@/lib/asistente";
import { confianza, NIVELES } from "@/lib/confianza";

// Pie de cada respuesta: el grado de confianza y lo que se ha comprobado. Las
// tres marcas son decorativas: el nivel también va escrito.
export function Termometro({ respuesta }: { respuesta: Respuesta }) {
  const { t } = useIdioma();
  const c = confianza(respuesta);
  if (!c) return null;
  const { etiqueta, marcas } = NIVELES[c.nivel];

  return (
    <aside
      aria-label={t("Grado de confianza")}
      className="rounded-xl px-4 py-3 text-sm ring-1 ring-foreground/10"
    >
      <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Thermometer
          aria-hidden="true"
          className="size-4 shrink-0 text-brand"
        />
        <span className="font-medium">
          {t("Grado de confianza: {nivel}", { nivel: t(etiqueta) })}
        </span>
        <span aria-hidden="true" className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-2 w-6 rounded-full ${i <= marcas ? "bg-brand" : "bg-muted ring-1 ring-foreground/10 ring-inset"}`}
            />
          ))}
        </span>
      </p>
      <p className="mt-1.5 text-(--text-secondary)">{t(c.motivo)}</p>
      <ul className="mt-2 grid gap-1">
        {c.comprobaciones.map(({ texto, vars, ok }) => (
          <li key={texto} className="flex items-start gap-2">
            {ok ? (
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            ) : (
              <Minus
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-(--text-secondary)"
              />
            )}
            <span className={ok ? "" : "text-(--text-secondary)"}>
              <span className="sr-only">{ok ? t("Sí: ") : t("No: ")}</span>
              {t(texto, vars)}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
