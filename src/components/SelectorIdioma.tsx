"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, Languages } from "lucide-react";
import { useIdioma } from "@/i18n/cliente";
import { COOKIE, IDIOMAS, NOMBRES, esIdioma } from "@/i18n/idiomas";

// Guarda la lengua en una cookie y vuelve a pedir la página al servidor.
export function SelectorIdioma() {
  const { idioma, t } = useIdioma();
  const router = useRouter();

  return (
    <label className="relative inline-flex items-center text-sm">
      <span className="sr-only">{t("Idioma")}</span>
      <select
        value={idioma}
        onChange={(e) => {
          const nuevo = e.target.value;
          if (!esIdioma(nuevo)) return;
          document.cookie = `${COOKIE}=${nuevo}; path=/; max-age=31536000; samesite=lax`;
          router.refresh();
        }}
        className="h-9 cursor-pointer appearance-none rounded-full border border-input bg-background pr-8 pl-3 text-sm sm:pl-8 font-medium outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {IDIOMAS.map((i) => (
          <option key={i} value={i} lang={i}>
            {NOMBRES[i]}
          </option>
        ))}
      </select>
      {/* Iconos encima del select nativo, que sigue siendo el control. */}
      <Languages
        aria-hidden="true"
        className="pointer-events-none absolute left-3 size-4 text-(--text-secondary) max-sm:hidden"
      />
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 size-4 text-(--text-secondary)"
      />
    </label>
  );
}
