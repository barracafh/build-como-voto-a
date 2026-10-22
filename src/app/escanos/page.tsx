import type { Metadata } from "next";
import { Fuentes } from "@/components/Fuentes";
import { Pagina, Titular } from "@/components/Pagina";
import { MapaCortes } from "@/components/escanos/MapaCortes";
import { Reproductor } from "@/components/escanos/Reproductor";
import { Card } from "@/components/ui/card";
import { FUENTE_CENSO } from "@/datos/censo-29n";
import { PROVINCIA_POR_DEFECTO } from "@/datos/provincia";
import { cargarProvincias } from "@/datos/resultados";
import ficha from "../../../ficha.json";
import { getT } from "@/i18n/servidor";
import { fechaLarga, plazo } from "@/lib/calendario";
import { marcar } from "@/i18n/traducir";

export const metadata: Metadata = { title: `Escaños · ${ficha.nombre}` };

const votacion = plazo("votacion");

// contexto.md §3.3. Solo el efecto mecánico de cada uno en el reparto.
const tiposDeVoto = [
  {
    titulo: marcar("Voto en blanco"),
    que: marcar("Sobre sin papeleta y, en el Senado, papeleta sin ningún candidato marcado (LOREG, art. 96.5). Es un voto válido."),
    efecto: marcar("Cuenta como voto válido en la base del 3 % (arts. 108.4 y 163.1.a). No va a ninguna candidatura ni genera escaño. Eleva el umbral."),
  },
  {
    titulo: marcar("Voto nulo"),
    que: marcar("Sobre o papeleta que no es del modelo oficial, papeleta sin sobre, sobre con papeletas de distintas candidaturas, o papeletas modificadas, tachadas o con añadidos (art. 96.1 a 96.4). Una señal o cruz junto a un candidato que no altere la papeleta ni exprese reproche no lo anula (Instrucción JEC 1/2012)."),
    efecto: marcar("No es voto válido: no cuenta en el 3 % ni en el reparto. Aparece en el acta de escrutinio como «votos nulos» (art. 108.1)."),
  },
  {
    titulo: marcar("Abstención"),
    que: marcar("No votar. Votar no es obligatorio (art. 5)."),
    efecto: marcar("No computa como voto. No altera el reparto: los escaños se asignan solo con los votos válidos emitidos."),
  },
];

const fmt = new Intl.NumberFormat("es-ES");

const fuentes = [
  {
    nombre: marcar("Ley Orgánica 5/1985 (LOREG), arts. 5, 96, 108, 162, 163 y 165 · BOE"),
    url: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672",
  },
  {
    nombre: marcar("Instrucción 1/2012 de la Junta Electoral Central, sobre papeletas con señales · BOE"),
    url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2012-3859",
  },
  {
    nombre: marcar("Real Decreto 806/2026 de convocatoria, anexo · BOE"),
    url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742",
  },
  FUENTE_CENSO,
  {
    nombre: marcar("Infoelectoral · Resultados electorales · Ministerio del Interior"),
    url: "https://infoelectoral.interior.gob.es/es/elecciones-celebradas/resultados-electorales/",
  },
];

export default async function EscanosPage() {
  const { t, idioma } = await getT();
  const p = cargarProvincias().find((q) => q.codigo === PROVINCIA_POR_DEFECTO)!;
  const ejemplo = [
    [marcar("Votos válidos"), p.votosValidos],
    [marcar("De ellos, en blanco"), p.votosBlanco],
    [marcar("3 % con los votos en blanco"), Math.ceil(p.votosValidos * 0.03)],
    [marcar("3 % si no se contaran"), Math.ceil((p.votosValidos - p.votosBlanco) * 0.03)],
  ] as const;
  return (
    <Pagina>
      <Titular
        etiqueta={`${ficha.nombre} · ${t("Escaños")}`}
        titulo={t("Cómo se lee el hemiciclo del Congreso")}
        entradilla={t(
          "Cada punto es un escaño. Pulsa una comunidad para ver sus diputados y a cuántos electores representa cada uno.",
        )}
      />
      <div className="mt-16 text-lg [&>*+*]:mt-16">
        <section aria-labelledby="comunidades" className="[&>*+*]:mt-6">
          <h2 id="comunidades" className="text-[clamp(28px,4vw,40px)] leading-[1.1]">
            {t("Diputados y senadores por comunidad")}
          </h2>
          <MapaCortes />
          <p className="text-base text-(--text-secondary)">
            {t(
              "Escaños que se eligen el {fecha} de {anio}. Los diputados salen del anexo del Real Decreto 806/2026. Los senadores son los de elección directa (art. 165 LOREG); cada parlamento autonómico designa además otros, que no se suman aquí.",
              {
                fecha: fechaLarga(votacion.inicio, idioma),
                anio: votacion.inicio.slice(0, 4),
              },
            )}{" "}
            {t(
              "Los electores son los del censo del INE para estas elecciones, incluidos los residentes en el extranjero, que votan en su provincia.",
            )}
          </p>
        </section>

        <section aria-labelledby="blanco-nulo" className="[&>*+*]:mt-8">
          <h2 id="blanco-nulo" className="text-[clamp(28px,4vw,40px)] leading-[1.1]">
            {t("Voto en blanco, voto nulo y abstención")}
          </h2>
          <Reproductor pistas={[{ id: "blanco", titulo: t("Blanco, nulo y abstención") }]} />
          <div className="grid gap-4 md:grid-cols-3">
            {tiposDeVoto.map(({ titulo, que, efecto }) => (
              <Card key={titulo} className="px-4 text-base md:px-5">
                <h3 className="font-medium">{t(titulo)}</h3>
                <dl className="grid gap-3">
                  <div>
                    <dt className="font-mono text-xs tracking-[0.06em] text-(--text-secondary) uppercase">
                      {t("Qué es")}
                    </dt>
                    <dd className="mt-1">{t(que)}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs tracking-[0.06em] text-(--text-secondary) uppercase">
                      {t("Efecto en el reparto")}
                    </dt>
                    <dd className="mt-1">{t(efecto)}</dd>
                  </div>
                </dl>
              </Card>
            ))}
          </div>
          <div>
            <h3 className="font-medium">
              {t("Cómo mueve el voto en blanco el umbral en {provincia} (2023)", { provincia: p.nombre })}
            </h3>
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-base sm:grid-cols-[auto_minmax(0,1fr)]">
              {ejemplo.map(([etiqueta, valor]) => (
                <div key={etiqueta} className="contents">
                  <dt className="text-(--text-secondary)">{t(etiqueta)}</dt>
                  <dd className="font-mono tabular-nums">{fmt.format(valor)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-base text-(--text-secondary)">
              {t(
                "Resultados oficiales de 2023, sin cambios. Los votos nulos y la abstención no aparecen en el cálculo porque no forman parte de los votos válidos.",
              )}
            </p>
          </div>
        </section>

        <div className="[&>*+*]:mt-4">
          <Fuentes fuentes={fuentes} />
          <p className="text-sm text-(--text-secondary)">
            {t(
              "Fuente: Ley Orgánica 5/1985 (LOREG), versión consolidada del BOE (texto informativo, sin valor jurídico), y censo electoral del INE. Origen de los datos de 2023: Ministerio del Interior.",
            )}
          </p>
        </div>
      </div>
    </Pagina>
  );
}
