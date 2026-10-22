import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { estado, fechaLarga, rango, type Plazo } from "@/lib/calendario";
import {
  cierraEn,
  marcas,
  posicion,
  tramo,
  type Escala,
} from "@/lib/linea-tiempo";

// corto: etiqueta de la barra en el gráfico; titulo y detalle, el paso en la lista.
export type Paso = {
  plazo: Plazo;
  corto: string;
  titulo: string;
  detalle: ReactNode;
};
export type Hito = { plazo: Plazo; nombre: string };
// «relleno» para periodos largos (campaña), «linea» para días sueltos (reflexión).
export type Banda = Hito & { estilo: "relleno" | "linea" };

const corta = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const fechaCorta = (iso: string) =>
  corta.format(new Date(`${iso}T00:00:00Z`)).replace(".", "");

const estiloBanda = {
  relleno: "bg-secondary",
  linea: "border-x border-dashed border-foreground/30",
};

// Un gráfico de carriles, del origen a la meta, y debajo los mismos pasos como
// lista numerada. El gráfico es decorativo: todo su contenido está en la lista.
export function LineaTiempo({
  origen,
  meta,
  pasos,
  bandas = [],
  hoy,
}: {
  origen: Hito; // la convocatoria: primer día del eje
  meta: Hito; // la votación: último día del eje, dibujado como el sol
  pasos: readonly Paso[];
  bandas?: readonly Banda[];
  hoy: string;
}) {
  const escala = { desde: origen.plazo.inicio, hasta: meta.plazo.fin };

  return (
    <div className="[&>*+*]:mt-10">
      <Grafico
        escala={escala}
        origen={origen}
        meta={meta}
        pasos={pasos}
        bandas={bandas}
        hoy={hoy}
      />
      <ol className="grid gap-6">
        {pasos.map((paso, i) => (
          <PasoTexto key={paso.plazo.id} numero={i + 1} paso={paso} hoy={hoy} />
        ))}
      </ol>
    </div>
  );
}

function Grafico({
  escala,
  origen,
  meta,
  pasos,
  bandas,
  hoy,
}: {
  escala: Escala;
  origen: Hito;
  meta: Hito;
  pasos: readonly Paso[];
  bandas: readonly Banda[];
  hoy: string;
}) {
  const verHoy = hoy >= escala.desde && hoy <= escala.hasta;

  return (
    <Card aria-hidden="true" className="gap-0 px-4 py-5 md:px-6 md:py-6">
      {/* Margen lateral para que el sol y las etiquetas del borde no se corten. */}
      <div className="relative mx-3 pt-7">
        <div className="absolute inset-0">
          {bandas.map((b) => {
            const t = tramo(b.plazo.inicio, b.plazo.fin, escala);
            return (
              <div
                key={b.plazo.id}
                className={cn("absolute inset-y-0 rounded-md", estiloBanda[b.estilo])}
                style={{ left: `${t.izquierda}%`, width: `${t.ancho}%` }}
              />
            );
          })}
          {verHoy && (
            <div
              className="absolute inset-y-0 w-px bg-brand"
              style={{ left: `${posicion(hoy, escala)}%` }}
            >
              <span className="absolute top-0 left-1.5 font-mono text-xs tracking-[0.06em] text-brand uppercase">
                Hoy
              </span>
            </div>
          )}
        </div>

        <div className="relative grid gap-3 pb-3">
          {pasos.map((paso, i) => (
            <Barra
              key={paso.plazo.id}
              numero={i + 1}
              paso={paso}
              escala={escala}
              hoy={hoy}
              esMeta={paso.plazo.id === meta.plazo.id}
            />
          ))}
        </div>
      </div>

      <Eje escala={escala} />

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-(--text-secondary)">
        <li>
          {origen.nombre}, {fechaLarga(origen.plazo.inicio)}
        </li>
        {verHoy && (
          <li className="flex items-center gap-2">
            <span className="h-4 w-px bg-brand" />
            Hoy, {fechaLarga(hoy)}
          </li>
        )}
        {bandas.map((b) => (
          <li key={b.plazo.id} className="flex items-center gap-2">
            <span className={cn("h-4 w-3 rounded-sm", estiloBanda[b.estilo])} />
            {b.nombre}, {rango(b.plazo)}
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-brand-yellow" />
          {meta.nombre}, {fechaLarga(meta.plazo.inicio)}
        </li>
      </ul>
    </Card>
  );
}

function Barra({
  numero,
  paso,
  escala,
  hoy,
  esMeta,
}: {
  numero: number;
  paso: Paso;
  escala: Escala;
  hoy: string;
  esMeta: boolean;
}) {
  const e = estado(paso.plazo, hoy);
  const t = tramo(paso.plazo.inicio, paso.plazo.fin, escala);
  // Las barras de la mitad derecha llevan la etiqueta alineada a su final.
  const aLaDerecha = t.izquierda > 50;
  // En un plazo abierto, lo que ya ha pasado se ve más tenue.
  const pasado =
    e === "abierto"
      ? (tramo(paso.plazo.inicio, hoy, escala).ancho / t.ancho) * 100
      : 0;

  return (
    <div className="relative h-11">
      <p
        className={cn(
          "absolute top-0 flex items-baseline gap-1.5 text-sm whitespace-nowrap",
          aLaDerecha && "-translate-x-full",
        )}
        style={{ left: `${aLaDerecha ? t.izquierda + t.ancho : t.izquierda}%` }}
      >
        <span className="font-medium text-brand tabular-nums">{numero}</span>
        {paso.corto}
      </p>
      <div className="absolute inset-x-0 bottom-1.5 h-px bg-border" />
      {esMeta ? (
        <span
          className="absolute bottom-1.5 size-6 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-yellow ring-4 ring-background motion-safe:animate-[latir_2.4s_var(--ease-brand)_infinite]"
          style={{ left: `${t.izquierda + t.ancho / 2}%` }}
        />
      ) : (
        <div
          className={cn(
            "absolute bottom-0 h-3 origin-left overflow-hidden rounded-full motion-safe:animate-[crecer_900ms_var(--ease-brand)_both]",
            e === "cerrado" && "bg-(--disabled)",
            e === "abierto" && "bg-foreground",
            e === "proximo" && "bg-background ring-1 ring-foreground ring-inset",
          )}
          style={{
            left: `${t.izquierda}%`,
            width: `${t.ancho}%`,
            animationDelay: `${numero * 120}ms`,
          }}
        >
          {pasado > 0 && (
            <div className="h-full bg-background/70" style={{ width: `${pasado}%` }} />
          )}
        </div>
      )}
    </div>
  );
}

function PasoTexto({
  numero,
  paso,
  hoy,
}: {
  numero: number;
  paso: Paso;
  hoy: string;
}) {
  const e = estado(paso.plazo, hoy);
  const quedan = cierraEn(paso.plazo.fin, hoy);

  return (
    <li className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-3 md:grid-cols-[32px_minmax(0,1fr)] md:gap-x-4">
      <span className="text-[22px] leading-[1.1] font-light text-brand tabular-nums md:text-[26px]">
        {numero}
      </span>
      <div>
        <p className="flex flex-wrap items-center gap-2 font-mono text-sm text-(--text-secondary) uppercase">
          {rango(paso.plazo)}
          {e === "abierto" && <Badge variant="outline">Abierto</Badge>}
          {e === "cerrado" && <Badge variant="secondary">Cerrado</Badge>}
        </p>
        <h3 className="mt-1 text-lg leading-[1.35] font-medium">{paso.titulo}</h3>
        <div className="mt-1 text-(--text-secondary)">{paso.detalle}</div>
        {e === "abierto" && (
          <p className="mt-1 font-medium">
            {quedan === 0
              ? "Cierra hoy"
              : `Cierra en ${quedan} ${quedan === 1 ? "día" : "días"}`}
          </p>
        )}
      </div>
    </li>
  );
}

function Eje({ escala }: { escala: Escala }) {
  return (
    <div className="relative mx-3 h-8 border-t border-foreground/20 font-mono text-xs text-(--text-secondary) uppercase">
      {marcas(escala).map((m) => (
        <span
          key={m.iso}
          className="absolute top-0 -translate-x-1/2 text-center"
          style={{ left: `${m.izquierda}%` }}
        >
          <span className="mx-auto block h-1.5 w-px bg-foreground/30" />
          <span className={cn("block pt-0.5", m.mes ? "text-foreground" : "max-sm:hidden")}>
            {m.mes ?? m.dia}
          </span>
        </span>
      ))}
      <span className="absolute top-2 left-0 -translate-x-3">
        {fechaCorta(escala.desde)}
      </span>
      <span className="absolute top-2 right-0 translate-x-3 text-foreground">
        {fechaCorta(escala.hasta)}
      </span>
    </div>
  );
}
