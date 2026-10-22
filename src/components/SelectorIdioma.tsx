"use client";

import { useRouter } from "next/navigation";
import { useIdioma } from "@/i18n/cliente";
import { COOKIE, IDIOMAS, NOMBRES, esIdioma } from "@/i18n/idiomas";

// Guarda la lengua en una cookie y vuelve a pedir la página al servidor.
export function SelectorIdioma() {
  const { idioma, t } = useIdioma();
  const router = useRouter();

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="sr-only">{t("Idioma")}</span>
      <select
        value={idioma}
        onChange={(e) => {
          const nuevo = e.target.value;
          if (!esIdioma(nuevo)) return;
          document.cookie = `${COOKIE}=${nuevo}; path=/; max-age=31536000; samesite=lax`;
          router.refresh();
        }}
        className="h-9 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {IDIOMAS.map((i) => (
          <option key={i} value={i} lang={i}>
            {NOMBRES[i]}
          </option>
        ))}
      </select>
    </label>
  );
}
