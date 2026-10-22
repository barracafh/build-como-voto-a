import type { Metadata } from "next";
import { Fuentes } from "@/components/Fuentes";
import { Pagina, Titular } from "@/components/Pagina";
import { Escanos } from "@/components/escanos/Escanos";
import { MapaCortes } from "@/components/escanos/MapaCortes";
import { Practica } from "@/components/escanos/Practica";
import { cargarProvincias } from "@/datos/resultados";
import ficha from "../../../ficha.json";

export const metadata: Metadata = { title: `Escaños · ${ficha.nombre}` };

const referencias = [
  [
    "Un punto, un escaño",
    "El Congreso de los Diputados tiene 350 escaños. Todos los puntos son idénticos: cada uno es un diputado.",
  ],
  [
    "Los anillos",
    "Son las filas de asientos. Solo ordenan los 350 puntos en forma de hemiciclo: no tienen significado propio.",
  ],
  [
    "El gris",
    "Todos los escaños empiezan en el mismo gris: no representa partidos, resultados ni previsiones.",
  ],
  [
    "El grupo en rojo",
    "Son los diputados de la comunidad que señales en el mapa. Su posición en el hemiciclo es ilustrativa: no es dónde se sientan.",
  ],
];

const pasos = [
  [
    "Mínimo por provincia",
    "Cada provincia recibe 2 escaños; Ceuta y Melilla, 1 cada una (LOREG, art. 162.2).",
  ],
  [
    "El resto, según población",
    "Los otros 248 escaños se reparten en proporción a la población de derecho de cada provincia (arts. 162.2 y 162.3).",
  ],
  [
    "Dentro de cada provincia",
    "Los escaños se asignan en proporción a los votos de cada candidatura (método de cocientes, conocido como regla D'Hondt). No entran en el reparto las que no lleguen al 3 % de los votos válidos. En Ceuta y Melilla se proclama al candidato más votado (art. 163).",
  ],
];

const fuentes = [
  {
    nombre: "Ley Orgánica 5/1985 (LOREG), arts. 161 a 165 · BOE",
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672",
  },
  {
    nombre: "Real Decreto 806/2026 de convocatoria, anexo · BOE",
    url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742",
  },
  {
    nombre: "Infoelectoral · Ministerio del Interior",
    url: "https://infoelectoral.interior.gob.es",
  },
];

export default function EscanosPage() {
  const provincias = cargarProvincias();
  return (
    <Pagina>
      <Titular
        etiqueta="¿Cómo voto? · Escaños"
        titulo="Cómo se lee el hemiciclo del Congreso"
        entradilla="Cada punto es un escaño. Esta es la gramática de la ilustración y lo que representa cada elemento."
      />
      <div className="mt-16 text-lg [&>*+*]:mt-16">
        <section aria-labelledby="comunidades" className="[&>*+*]:mt-6">
          <h2 id="comunidades" className="text-[clamp(28px,4vw,40px)] leading-[1.1]">
            Diputados y senadores por comunidad
          </h2>
          <MapaCortes />
          <p className="text-base text-(--text-secondary)">
            Escaños que se eligen el 29 de noviembre de 2026. Los diputados salen del anexo
            del Real Decreto 806/2026. Los senadores son los de elección directa (art. 165
            LOREG); cada parlamento autonómico designa además otros, que no se suman aquí.
          </p>
        </section>

        <Escanos provincias={provincias} />

        <section aria-labelledby="referencias">
          <h2
            id="referencias"
            className="font-mono text-xs tracking-[0.06em] text-(--text-secondary) uppercase"
          >
            Referencias
          </h2>
          <dl className="mt-4 grid gap-5">
            {referencias.map(([titulo, texto]) => (
              <div key={titulo}>
                <dt className="font-medium">{titulo}</dt>
                <dd className="mt-1 text-base text-(--text-secondary)">{texto}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="reparto" className="[&>*+*]:mt-8">
          <h2 id="reparto" className="text-[clamp(28px,4vw,40px)] leading-[1.1]">
            Cómo se reparten los 350 escaños
          </h2>
          <ol className="grid gap-5">
            {pasos.map(([titulo, texto], i) => (
              <li
                key={titulo}
                className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-3 md:grid-cols-[32px_minmax(0,1fr)] md:gap-x-4"
              >
                <span className="text-[22px] leading-[1.1] font-light text-brand tabular-nums md:text-[26px]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-medium">{titulo}</h3>
                  <p className="mt-1">{texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <Practica />

        <div className="[&>*+*]:mt-4">
          <Fuentes fuentes={fuentes} />
          <p className="text-sm text-(--text-secondary)">
            Fuente: Ley Orgánica 5/1985 (LOREG), arts. 161 a 163, versión consolidada del
            BOE (texto informativo, sin valor jurídico). Origen de los datos: Ministerio
            del Interior.
          </p>
        </div>
      </div>
    </Pagina>
  );
}
