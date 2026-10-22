import { buttonVariants } from "@/components/ui/button";
import { site } from "@/config/sitio";
import { getT } from "@/i18n/servidor";
import { cn } from "@/lib/utils";

// className: solo composición (p. ej. sobre fondo oscuro, en blanco).
export async function BotonAviso({ className }: { className?: string }) {
  const { t } = await getT();
  return (
    <a
      href={site.feedbackUrl}
      className={cn(buttonVariants({ variant: "sunset", size: "lg" }), className)}
    >
      {t("¿Algo está mal? Avísanos")}
    </a>
  );
}
