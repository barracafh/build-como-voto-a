import Link from "next/link";
import { Globe, House } from "lucide-react";
import { BotonChat } from "@/components/BotonChat";
import { CalendarioEspana } from "@/components/CalendarioEspana";
import {
  CalendarioExtranjero,
  descargaPapeletas,
} from "@/components/CalendarioExtranjero";
import { Chat } from "@/components/Chat";
import { Encabezado } from "@/components/Encabezado";
import { Fuentes, type Source } from "@/components/Fuentes";
import { Pagina, Titular } from "@/components/Pagina";
import { estado, fuenteCalendario, plazo, rango } from "@/lib/calendario";

const opciones = {
  aqui: {
    titulo: "Vivo en España",
    icono: House,
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
      {
        nombre: "Art. 73 LOREG · BOE",
        url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672#asetentaytres",
      },
    ],
  },
  fuera: {
    titulo: "Vivo fuera de España",
    icono: Globe,
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
      { nombre: "Descarga de papeletas · INE", url: descargaPapeletas },
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
      >
        {opcion && <PlazoClave opcion={opcion} />}
      </Titular>

      {!opcion ? (
        <section aria-labelledby="donde" className="mt-20 text-lg">
          <Encabezado numero="01" id="donde" titulo="¿Dónde vives?" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {(Object.keys(opciones) as Donde[]).map((clave) => {
              const { titulo, texto, icono: Icono } = opciones[clave];
              return (
                <li key={clave} className="flex">
                  <Link
                    href={`/correo?donde=${clave}`}
                    className="group flex w-full flex-col rounded-xl p-5 ring-1 ring-foreground/10 transition-colors outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <Icono aria-hidden="true" className="size-7 text-brand" strokeWidth={1.75} />
                    <span className="mt-4 block font-medium leading-[1.3] sm:mt-6">{titulo}</span>
                    <span className="mt-2 block text-base text-(--text-secondary)">{texto}</span>
                    <span
                      aria-hidden="true"
                      className="mt-auto pt-3 transition-transform group-hover:translate-x-1 motion-reduce:transition-none sm:pt-5"
                    >
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <Elegida opcion={opcion} />
      )}
    </Pagina>
  );
}

// El plazo que más importa para este caso, en ficha blanca dentro del héroe.
function PlazoClave({ opcion }: { opcion: (typeof opciones)[Donde] }) {
  const p = plazo(opcion.plazo);
  const abierto = estado(p) !== "cerrado";

  return (
    <div className="grid gap-3">
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base">
        <span className="font-medium">{opcion.titulo}</span>
        <Link
          href="/correo"
          className="inline-flex min-h-11 items-center rounded-sm underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-white/70"
        >
          Cambiar
        </Link>
      </p>
      <section
        aria-label={abierto ? "Plazo abierto" : "Plazo cerrado"}
        className="max-w-[560px] rounded-2xl bg-background px-5 py-4 text-foreground"
      >
        <p className="font-mono text-xs tracking-[0.08em] text-(--text-secondary) uppercase">
          {abierto ? "Plazo abierto" : "Plazo cerrado"}
        </p>
        <p className="mt-1 text-[clamp(22px,3.5vw,30px)] leading-[1.15] font-medium tracking-[-0.02em]">
          {rango(p)}
        </p>
        <p className="mt-1 text-base text-(--text-secondary)">{p.evento}</p>
      </section>
    </div>
  );
}

function Elegida({ opcion }: { opcion: (typeof opciones)[Donde] }) {
  const fuentes: Source[] = [fuenteCalendario, ...opcion.fuentes];

  return (
    <div className="mt-20 text-lg [&>*+*]:mt-20">
      <section aria-labelledby="fechas">
        <Encabezado numero="01" id="fechas" titulo="Tus fechas, paso a paso" />
        <div className="mt-8">
          {opcion.modo === "correo-aqui" ? (
            <CalendarioEspana />
          ) : (
            <CalendarioExtranjero />
          )}
        </div>
      </section>

      <section
        aria-labelledby="pregunta-caso"
        className="rounded-[28px] bg-secondary px-5 py-8 md:-mx-12 md:px-12 md:py-12"
      >
        <Encabezado numero="02" id="pregunta-caso" titulo="Pregunta por tu caso" />
        <p className="mt-3 text-(--text-secondary)">
          Responde con las fuentes oficiales de cada dato.
        </p>
        <div className="mt-6 [&_textarea]:bg-background">
          <Chat key={opcion.modo} modo={opcion.modo} />
        </div>
      </section>
      <BotonChat destino="pregunta-caso" />

      <Fuentes fuentes={fuentes} />
    </div>
  );
}
