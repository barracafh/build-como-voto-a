import { Badge } from "@/components/ui/badge";
import { Fuentes } from "@/components/Fuentes";
import { Pagina, Titular } from "@/components/Pagina";

// Pieza en construcción: ver TAREAS.md.
export default function Page() {
  return (
    <Pagina>
      <Titular
        etiqueta="Elecciones generales · 29N"
        titulo="Voto por correo, aquí y fuera"
        entradilla="Pasos y fechas para votar por correo si vives en España, si vives en el extranjero o si estarás fuera ese día."
      />
      <section className="mt-16 text-lg [&>*+*]:mt-8">
        <Badge variant="secondary">En construcción</Badge>
        <Fuentes
          fuentes={[
            {
              nombre: "Correos · Voto por correo",
              url: "https://www.correos.es/es/es/particulares/para-el-ciudadano/voto-por-correo",
            },
          ]}
        />
      </section>
    </Pagina>
  );
}
