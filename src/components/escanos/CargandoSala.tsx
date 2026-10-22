"use client";

import { Atardecer } from "@/components/Atardecer";
import { useIdioma } from "@/i18n/cliente";

// Shown over the dark 3D scene while the component or the chamber model is still loading.
export function CargandoSala({ progreso }: { progreso?: number }) {
  const { t } = useIdioma();
  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-primary-foreground"
    >
      <Atardecer logo className="size-12 motion-safe:animate-pulse" />
      <p className="text-base">
        {t("Cargando el hemiciclo…")}
        {progreso !== undefined && (
          <span className="ml-2 font-mono">{Math.round(progreso * 100)}%</span>
        )}
      </p>
    </div>
  );
}
