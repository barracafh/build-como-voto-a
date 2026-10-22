"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Deja `children` en su sitio y, cuando se sale por arriba al hacer scroll,
// muestra `flotante` fijo arriba a la derecha. El flotante repite lo que ya
// está en la página, así que se oculta a los lectores de pantalla.
export function Flotante({
  children,
  flotante,
}: {
  children: ReactNode;
  flotante: ReactNode;
}) {
  const sitio = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sitio.current;
    if (!el) return;
    const observador = new IntersectionObserver(([e]) =>
      setVisible(!e.isIntersecting && e.boundingClientRect.top < 0),
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <>
      <div ref={sitio}>{children}</div>
      <div
        aria-hidden="true"
        inert
        data-visible={visible}
        className="pointer-events-none fixed top-3 right-3 z-40 w-max max-w-[calc(100vw-1.5rem)] -translate-y-2 opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 motion-safe:transition-[opacity,translate] motion-safe:duration-300 motion-safe:ease-(--ease-brand)"
      >
        {flotante}
      </div>
    </>
  );
}
