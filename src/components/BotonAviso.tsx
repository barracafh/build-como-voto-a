import { buttonVariants } from "@/components/ui/button";
import { site } from "@/config/sitio";
import { getT } from "@/i18n/servidor";

export async function BotonAviso() {
  const { t } = await getT();
  return (
    <a
      href={site.feedbackUrl}
      className={buttonVariants({ variant: "sunset", size: "lg" })}
    >
      {t("¿Algo está mal? Avísanos")}
    </a>
  );
}
