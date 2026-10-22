import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Chat } from "@/components/Chat";
import { Fuentes, type Source } from "@/components/Fuentes";
import { Pagina, Titular } from "@/components/Pagina";
import { estado, fuenteCalendario, plazo, rango } from "@/lib/calendario";

const opciones = {
  aqui: {
    titulo: "Vivo en España",
    texto: "Aunque el día 29 no estés o vayas a pasar una temporada en el extranjero.",
    modo: "correo-aqui",
    plazo: "voto_correo_solicitud",
    fuentes: [
      {
        nombre: "Voto por correo · Correos",
        url: "https://www.correos.es/es/es/particulares/para-el-ciudadano/voto-por-correo",
      },
      {
        nombre: "Plazos para los electores · INE",
        url: "https://www.ine.es/dyngs/CEL/index.htm?cid=1702",
      },
    ],
  },
  fuera: {
    titulo: "Vivo fuera de España",
    texto: "Estás inscrito en el consulado como residente en el extranjero.",
    modo: "correo-fuera",
    plazo: "cera_voto_correo",
    fuentes: [
      {
        nombre: "Plazos para los electores · INE",
        url: "https://www.ine.es/dyngs/CEL/index.htm?cid=1702",
      },
      {
        nombre: "Art. 75 LOREG · BOE",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672#asetentaycinco",
      },
    ],
  },
} as const;

type Donde = keyof typeof opciones;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ donde?: string }>;
}) {
  const { donde } = await searchParams;
  const opcion = donde && donde in opciones ? opciones[donde as Donde] : null;

  return (
    <Pagina>
      <Titular
        etiqueta="Voto por correo · 29N"
        titulo="Vota por correo, aquí o desde fuera."
        entradilla="Te explicamos los pasos y las fechas de tu caso, con la fuente oficial de cada uno."
      />

      {!opcion ? (
        <section aria-labelledby="donde" className="mt-16 text-lg">
          <h2
            id="donde"
            className="font-sans text-[clamp(30px,5vw,44px)] leading-[1.08] tracking-[-0.03em]"
          >
            ¿Dónde vives?
          </h2>
          <ul className="mt-6 divide-y overflow-hidden rounded-xl ring-1 ring-foreground/10">
            {(Object.keys(opciones) as Donde[]).map((clave) => (
              <li key={clave}>
                <Link
                  href={`/correo?donde=${clave}`}
                  className="flex min-h-11 items-center justify-between gap-4 px-5 py-4 transition-colors outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
                >
                  <span className="min-w-0">
                    <span className="block font-medium">
                      {opciones[clave].titulo}
                    </span>
                    <span className="block text-base text-(--text-secondary)">
                      {opciones[clave].texto}
                    </span>
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <Elegida opcion={opcion} />
      )}
    </Pagina>
  );
}

function Elegida({ opcion }: { opcion: (typeof opciones)[Donde] }) {
  const p = plazo(opcion.plazo);
  const abierto = estado(p) !== "cerrado";
  const fuentes: Source[] = [fuenteCalendario, ...opcion.fuentes];

  return (
    <section className="mt-16 text-lg [&>*+*]:mt-8">
      <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-base">
        <span className="font-medium">{opcion.titulo}</span>
        <Link
          href="/correo"
          className="rounded-sm text-(--text-secondary) underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Cambiar
        </Link>
      </p>

      {/* La tarjeta con el sol: el plazo que más importa para este caso. */}
      <Card
        render={<section />}
        className="gap-2 px-6 py-6 text-base ring-0 [background:radial-gradient(120%_90%_at_100%_0%,#ffd34d_0%,rgba(255,211,77,0)_60%),var(--brand-yellow)]"
      >
        <h2 className="text-sm font-medium">
          {abierto ? "Plazo abierto" : "Plazo cerrado"}
        </h2>
        <p className="font-heading text-[clamp(26px,4vw,36px)] leading-[1.1]">
          {rango(p)}
        </p>
        <p>{p.evento}</p>
      </Card>

      <Fuentes fuentes={fuentes} />

      <Chat key={opcion.modo} modo={opcion.modo} />
    </section>
  );
}
