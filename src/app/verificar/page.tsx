import { Badge } from "@/components/ui/badge";
import { Fuentes } from "@/components/Fuentes";
import { Pagina, Titular } from "@/components/Pagina";

// Pieza en construcción: ver TAREAS.md.
export default function Page() {
  return (
    <Pagina>
      <Titular
        etiqueta="Elecciones generales · 29N"
        titulo="¿Es verdad lo que me han dicho?"
        entradilla="Contrasta lo que te han contado sobre cómo se vota con la fuente oficial."
      />
      <section className="mt-16 text-lg [&>*+*]:mt-8">
        <Badge variant="secondary">En construcción</Badge>
        <Fuentes
          fuentes={[
            {
              nombre: "LOREG · BOE consolidado",
              url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672",
            },
          ]}
        />
      </section>
    </Pagina>
  );
}
