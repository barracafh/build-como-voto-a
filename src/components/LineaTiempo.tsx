import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { estado, fechaLarga, rango, type Plazo } from "@/lib/calendario";
import {
  cierraEn,
  filas,
  marcas,
  posicion,
  tramo,
  type Escala,
  type Fila,
  type Tramo,
} from "@/lib/linea-tiempo";

// corto: etiqueta de la barra en el gráfico; titulo y detalle, el paso en la
// lista. hito: un día suelto dentro del carril (p. ej. papeletas descargables).
export type Paso = {
  plazo: Plazo;
  corto: string;
  titulo: string;
  detalle: ReactNode;
  hito?: { fecha: string; nombre: string };
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

const sol =
  "absolute size-6 -translate-x-1/2 rounded-full bg-brand-yellow ring-4 ring-background motion-safe:animate-[latir_2.4s_var(--ease-brand)_infinite]";

// Un gráfico de carriles, del origen a la meta, y debajo los mismos pasos como
// lista numerada. El gráfico es decorativo: todo su contenido está en la lista.
export function LineaTiempo({
  origen,
  meta,
  tramos,
  bandas = [],
  hoy,
}: {
  origen: Hito; // la convocatoria: primer día del eje
  meta: Hito; // la votación: último día del eje, dibujado como el sol
  tramos: readonly Tramo<Paso>[];
  bandas?: readonly Banda[];
  hoy: string;
}) {
  const escala = { desde: origen.plazo.inicio, hasta: meta.plazo.fin };
  const lista = filas(tramos);

  return (
    <div className="[&>*+*]:mt-10">
      <Grafico
        escala={escala}
        origen={origen}
        meta={meta}
        filas={lista}
        bandas={bandas}
        hoy={hoy}
      />
      <ol className="grid gap-6">
        {lista.map((f) =>
          f.tipo === "paso" ? (
            <PasoTexto key={f.paso.plazo.id} numero={f.numero} paso={f.paso} hoy={hoy} />
          ) : (
            <li key={f.letra} className={cn(!f.eleccion && "mt-4")}>
              {f.eleccion && <p className="font-medium">{f.eleccion}</p>}
              <h3 className="mt-1 font-mono text-sm tracking-[0.06em] uppercase">
                <span className="text-brand">{f.letra}</span> · {f.nombre}
              </h3>
            </li>
          ),
        )}
      </ol>
    </div>
  );
}

function Grafico({
  escala,
  origen,
  meta,
  filas,
  bandas,
  hoy,
}: {
  escala: Escala;
  origen: Hito;
  meta: Hito;
  filas: readonly Fila<Paso>[];
  bandas: readonly Banda[];
  hoy: string;
}) {
  const verHoy = hoy >= escala.desde && hoy <= escala.hasta;
  const t = tramo(meta.plazo.inicio, meta.plazo.fin, escala);
  const centroMeta = t.izquierda + t.ancho / 2;
  const metaEsPaso = filas.some(
    (f) => f.tipo === "paso" && f.paso.plazo.id === meta.plazo.id,
  );
  const hitos = filas.flatMap((f) =>
    f.tipo === "paso" && f.paso.hito ? [f.paso.hito] : [],
  );

  return (
    <Card aria-hidden="true" className="gap-0 px-4 py-5 md:px-6 md:py-6">
      {/* Margen lateral para que el sol y las etiquetas del borde no se corten. */}
      <div className="relative mx-3 pt-7">
        <div className="absolute inset-0">
          {bandas.map((b) => {
            const tb = tramo(b.plazo.inicio, b.plazo.fin, escala);
            return (
              <div
                key={b.plazo.id}
                className={cn("absolute inset-y-0 rounded-md", estiloBanda[b.estilo])}
                style={{ left: `${tb.izquierda}%`, width: `${tb.ancho}%` }}
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
          {filas.map((f, i) =>
            f.tipo === "paso" ? (
              <Barra
                key={f.paso.plazo.id}
                orden={i}
                numero={f.numero}
                paso={f.paso}
                escala={escala}
                hoy={hoy}
                esMeta={f.paso.plazo.id === meta.plazo.id}
                centroMeta={centroMeta}
              />
            ) : (
              <p
                key={f.letra}
                className="font-mono text-xs tracking-[0.06em] text-(--text-secondary) uppercase"
              >
                <span className="text-brand">{f.letra}</span> · {f.nombre}
              </p>
            ),
          )}
          {/* Si la votación no es un paso, el sol tiene su propia fila. */}
          {!metaEsPaso && (
            <div className="relative h-6">
              <span className={cn(sol, "top-0")} style={{ left: `${centroMeta}%` }} />
            </div>
          )}
        </div>
      </div>

      <Eje escala={escala} />

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-(--text-secondary)">
        <li className="flex items-center gap-2">
          <span className="h-3 w-6 rounded-full bg-brand" /> Abierto
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-6 rounded-full border border-dashed border-foreground/60" />{" "}
          Aún no empieza
        </li>
        <li>
          {origen.nombre}, {fechaLarga(origen.plazo.inicio)}
        </li>
        {verHoy && (
          <li className="flex items-center gap-2">
            <span className="h-4 w-px bg-brand" />
            Hoy, {fechaLarga(hoy)}
          </li>
        )}
        {hitos.map((h) => (
          <li key={h.fecha + h.nombre} className="flex items-center gap-2">
            <span className="size-2.5 rotate-45 bg-foreground" />
            {h.nombre}, {fechaLarga(h.fecha)}
          </li>
        ))}
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
  orden,
  numero,
  paso,
  escala,
  hoy,
  esMeta,
  centroMeta,
}: {
  orden: number;
  numero: string;
  paso: Paso;
  escala: Escala;
  hoy: string;
  esMeta: boolean;
  centroMeta: number;
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
  const h = paso.hito && tramo(paso.hito.fecha, paso.hito.fecha, escala);
  const centroHito = h ? h.izquierda + h.ancho / 2 : 0;

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
          className={cn(sol, "bottom-1.5 translate-y-1/2")}
          style={{ left: `${centroMeta}%` }}
        />
      ) : (
        <div
          className={cn(
            "absolute bottom-0 h-3 origin-left overflow-hidden rounded-full motion-safe:animate-[crecer_900ms_var(--ease-brand)_both]",
            e === "cerrado" && "bg-(--disabled)",
            e === "abierto" && "bg-brand",
            e === "proximo" && "border border-dashed border-foreground/60 bg-background",
          )}
          style={{
            left: `${t.izquierda}%`,
            width: `${t.ancho}%`,
            animationDelay: `${orden * 60}ms`,
          }}
        >
          {pasado > 0 && (
            <div className="h-full bg-background/70" style={{ width: `${pasado}%` }} />
          )}
        </div>
      )}
      {paso.hito && (
        <span
          className="absolute bottom-0.5 size-2.5 -translate-x-1/2 rotate-45 bg-foreground ring-2 ring-background"
          style={{ left: `${centroHito}%` }}
        />
      )}
    </div>
  );
}

function PasoTexto({
  numero,
  paso,
  hoy,
}: {
  numero: string;
  paso: Paso;
  hoy: string;
}) {
  const e = estado(paso.plazo, hoy);
  const quedan = cierraEn(paso.plazo.fin, hoy);

  return (
    <li className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-3 md:grid-cols-[40px_minmax(0,1fr)] md:gap-x-4">
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
