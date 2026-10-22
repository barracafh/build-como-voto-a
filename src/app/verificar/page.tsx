import { Chat } from "@/components/Chat";
import { Fuentes } from "@/components/Fuentes";
import { Pagina, Titular } from "@/components/Pagina";
import { fuenteCalendario } from "@/lib/calendario";

export default function Page() {
  return (
    <Pagina>
      <Titular
        etiqueta="Fact check · 29N"
        titulo="¿Es verdad lo que me han dicho?"
        entradilla="Escribe lo que has oído o leído sobre cómo se vota y lo contrastamos con la fuente oficial: coincide, no coincide o no se puede verificar. Nada de partidos, candidaturas, programas ni encuestas."
      />
      <section className="mt-16 text-lg [&>*+*]:mt-12">
        <Chat modo="verificar" />
        <Fuentes
          fuentes={[
            {
              nombre: "LOREG · BOE consolidado",
              url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672",
            },
            fuenteCalendario,
            {
              nombre: "Preguntas frecuentes sobre la votación · Interior",
              url: "https://infoelectoral.interior.gob.es/es/proceso-electoral/preguntas-frecuentes/desarrollo-de-la-votacion/",
            },
          ]}
        />
      </section>
    </Pagina>
  );
}
