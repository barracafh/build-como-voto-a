"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Deja `children` en su sitio y, cuando se sale por arriba al hacer scroll,
// muestra `flotante` fijo arriba a la derecha: crece desde la esquina. Dentro,
// `group-data-[visible=true]/flotante:` sirve para escalonar su contenido. El
// flotante repite lo que ya está en la página, así que se oculta a los
// lectores de pantalla.
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
    // Aparece cuando queda menos de un tercio a la vista por arriba, para que
    // el relevo se solape con la salida del héroe.
    const observador = new IntersectionObserver(
      ([e]) => setVisible(e.intersectionRatio < 0.35 && e.boundingClientRect.top < 0),
      { threshold: [0, 0.35, 1] },
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
        className="group/flotante pointer-events-none fixed top-3 right-3 z-40 w-max max-w-[calc(100vw-1.5rem)] origin-top-right -translate-y-3 scale-75 opacity-0 blur-sm data-[visible=true]:translate-y-0 data-[visible=true]:scale-100 data-[visible=true]:opacity-100 data-[visible=true]:blur-none motion-safe:transition-[opacity,translate,scale,filter] motion-safe:duration-500 motion-safe:ease-(--ease-brand)"
      >
        {flotante}
      </div>
    </>
  );
}
