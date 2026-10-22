"use client";

import { useId, useState } from "react";
import type { Provincia } from "@/datos/resultados";
import { dhondt } from "@/lib/dhondt";
import { TablaCocientes, TablaResultados, fmt } from "./Tablas";

const POR_DEFECTO = "46"; // València/Valencia

// ponytail: selector oculto por ahora; se muestra la provincia por defecto. Poner a true para reactivarlo.
const MOSTRAR_SELECTOR = false;

export function Escanos({ provincias }: { provincias: readonly Provincia[] }) {
  const id = useId();
  const [codigo, setCodigo] = useState(POR_DEFECTO);
  const p = provincias.find((q) => q.codigo === codigo)!;
  const { resultados, cocientes } = dhondt(p.candidaturas, p.votosValidos, p.escanos);
  const coincide = resultados.every((r, i) => r.escanos === p.candidaturas[i].escanosOficiales);
  const conEscano = resultados.filter((r) => r.escanos > 0);

  return (
    <>
      <section aria-labelledby={`${id}-provincial`} className="[&>*+*]:mt-6">
        <div>
          <h2 id={`${id}-provincial`} className="text-[clamp(28px,4vw,40px)] leading-[1.1]">
            Cómo se repartieron en {p.nombre}
          </h2>
          <p className="mt-3 text-base text-(--text-secondary)">
            Resultados reales: {fmt.format(p.votosValidos)} votos válidos, de ellos{" "}
            {fmt.format(p.votosBlanco)} en blanco. El 3 % son{" "}
            {fmt.format(Math.ceil(p.votosValidos * 0.03))} votos.
          </p>
        </div>
        {MOSTRAR_SELECTOR && (
        <div className="grid gap-2">
          <label htmlFor={`${id}-provincia`} className="text-base font-medium">
            Provincia
          </label>
          <select
            id={`${id}-provincia`}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="h-11 w-full max-w-sm rounded-lg border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {provincias.map((q) => (
              <option key={q.codigo} value={q.codigo}>
                {q.nombre}
              </option>
            ))}
          </select>
        </div>
        )}
        <TablaResultados
          filas={resultados}
          votosValidos={p.votosValidos}
          titulo={`Candidaturas de ${p.nombre} en 2023`}
        />
        {p.escanos > 1 ? (
          <>
            <div>
              <h3 className="text-lg font-medium">Tabla de cocientes</h3>
              <p className="mt-1 text-base text-(--text-secondary)">
                Los votos de cada candidatura que llega al 3 %, divididos entre 1, 2, 3…
                Los {p.escanos} cocientes más altos, en rojo y numerados, son los escaños.
              </p>
            </div>
            <TablaCocientes
              cocientes={cocientes}
              escanos={p.escanos}
              titulo={`Cocientes de ${p.nombre}`}
            />
          </>
        ) : (
          <p className="text-base">
            Con un solo escaño se proclama la candidatura más votada:{" "}
            {conEscano[0]?.nombre}.
          </p>
        )}
        <p className="text-base">
          {coincide
            ? "El cálculo coincide con los escaños oficiales de 2023."
            : "El cálculo no coincide con los escaños oficiales: consulta Infoelectoral."}
        </p>
        <p className="text-sm text-(--text-secondary)">
          Origen de los datos: Ministerio del Interior. Elecciones al Congreso, 23 de julio de
          2023.
        </p>
      </section>
    </>
  );
}
