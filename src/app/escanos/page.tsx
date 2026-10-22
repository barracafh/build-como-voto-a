import { Badge } from "@/components/ui/badge";
import { Fuentes } from "@/components/Fuentes";
import { Pagina, Titular } from "@/components/Pagina";

// Pieza en construcción: ver TAREAS.md.
export default function Page() {
  return (
    <Pagina>
      <Titular
        etiqueta="Elecciones generales · 29N"
        titulo="Cómo se reparten los escaños"
        entradilla="La ley D'Hondt aplicada a cada provincia con los resultados oficiales de 2023."
      />
      <section className="mt-16 text-lg [&>*+*]:mt-8">
        <Badge variant="secondary">En construcción · mapa de votaciones</Badge>
        <Fuentes
          fuentes={[
            {
              nombre: "Infoelectoral · Ministerio del Interior",
              url: "https://infoelectoral.interior.gob.es",
            },
          ]}
        />
      </section>
    </Pagina>
  );
}
