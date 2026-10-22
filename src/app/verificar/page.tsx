import { Chat } from "@/components/Chat";
import { Encabezado } from "@/components/Encabezado";
import { Fuentes } from "@/components/Fuentes";
import { Pagina, Titular } from "@/components/Pagina";
import { fuenteCalendario } from "@/lib/calendario";

// Los tres resultados posibles, con el mismo nombre que da el verificador.
const resultados = [
  {
    resultado: "COINCIDE",
    texto: "La fuente oficial dice lo mismo. Te enseñamos la cita literal que lo sostiene.",
  },
  {
    resultado: "NO COINCIDE",
    texto: "La fuente oficial dice otra cosa. Te enseñamos la cita literal que lo contradice.",
  },
  {
    resultado: "NO VERIFICABLE",
    texto: "No hay una cita oficial que lo confirme ni lo contradiga, así que no damos veredicto.",
  },
];

export default function Page() {
  return (
    <Pagina>
      <Titular
        etiqueta="Fact check · 29N"
        titulo="¿Es verdad lo que me han dicho?"
        entradilla="Escribe lo que has oído o leído sobre cómo se vota y lo contrastamos con la fuente oficial: coincide, no coincide o no se puede verificar. Nada de partidos, candidaturas, programas ni encuestas."
      />

      <div className="mt-20 text-lg [&>*+*]:mt-20">
        <section
          aria-labelledby="que-has-oido"
          className="rounded-[28px] bg-secondary px-5 py-8 md:-mx-12 md:px-12 md:py-12"
        >
          <Encabezado numero="01" id="que-has-oido" titulo="Cuéntanos qué has oído" />
          <p className="mt-3 text-(--text-secondary)">
            Solo comprobamos cómo se vota: plazos, documentos, mesas y voto por correo.
          </p>
          <div className="mt-6 [&_textarea]:bg-background">
            <Chat modo="verificar" />
          </div>
        </section>

        <section aria-labelledby="que-puede-salir">
          <Encabezado numero="02" id="que-puede-salir" titulo="Qué puede salir" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {resultados.map(({ resultado, texto }) => (
              <li key={resultado} className="rounded-xl p-5 ring-1 ring-foreground/10">
                <p className="w-fit rounded-full px-3 py-1 font-mono text-xs tracking-[0.06em] ring-1 ring-foreground/20">
                  {resultado}
                </p>
                <p className="mt-4 text-base text-(--text-secondary)">{texto}</p>
              </li>
            ))}
          </ul>
        </section>

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
      </div>
    </Pagina>
  );
}
