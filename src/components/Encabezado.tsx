// Cabecera de sección: número en rojo (el acento de Sol) y titular en serif.
export function Encabezado({
  numero,
  id,
  titulo,
}: {
  numero: string;
  id: string;
  titulo: string;
}) {
  return (
    <>
      <p className="font-mono text-xs tracking-[0.08em] text-brand uppercase">{numero}</p>
      <h2 id={id} className="mt-3 text-[clamp(32px,5vw,48px)] leading-[1.06] tracking-[-0.02em]">
        {titulo}
      </h2>
    </>
  );
}
