import type { Publicada } from "@/lib/factcheck";

const fecha = (iso?: string) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Europe/Madrid",
      })
    : null;
};

// La calificación es del verificador que la publica, no nuestra.
export function Publicadas({ publicadas }: { publicadas: Publicada[] }) {
  return (
    <aside aria-labelledby="publicadas" className="text-base">
      <h3
        id="publicadas"
        className="text-sm font-medium text-(--text-secondary)"
      >
        Verificaciones publicadas
      </h3>
      <p className="mt-1 text-sm text-(--text-secondary)">
        La calificación es de cada verificador, no de esta herramienta.
      </p>
      <ul className="mt-3 divide-y overflow-hidden rounded-xl ring-1 ring-foreground/10">
        {publicadas.map((p) => (
          <li key={p.url}>
            <a
              href={p.url}
              className="flex min-h-11 items-center justify-between gap-4 px-4 py-3 transition-colors outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
            >
              <span className="min-w-0 [overflow-wrap:anywhere]">
                <span className="block font-medium">{p.titulo}</span>
                <span className="block text-sm text-(--text-secondary)">
                  {p.verificador} califica «{p.afirmacion}» como{" "}
                  <span className="font-mono tracking-[0.06em] uppercase">
                    {p.calificacion}
                  </span>
                  {fecha(p.fecha) && `, el ${fecha(p.fecha)}`}
                </span>
              </span>
              <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
