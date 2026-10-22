"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Color, type InstancedMesh, Object3D, type PerspectiveCamera, Vector3 } from "three";
import { ESCANOS } from "@/datos/hemiciclo";
import { type Bloques, enBloques } from "./Hemiciclo";

// Same 350 seats as Hemiciclo.tsx, in 3D: SVG (cx, cy) maps to (x, z) around
// the sun at (643, 610), and each seat rises with its distance to the sun.
const SOL_X = 643;
const SOL_Y = 610;
const ESCALA = 1 / 100;
const SUBIDA = 1; // height gained per world unit of radius
const RADIO_MIN = 2;

const POSICIONES = ESCANOS.map(([cx, cy]) => {
  const x = (cx - SOL_X) * ESCALA;
  const z = (cy - SOL_Y) * ESCALA;
  return new Vector3(x, (Math.hypot(x, z) - RADIO_MIN) * SUBIDA, z);
});
const CENTRO = POSICIONES.reduce((s, p) => s.add(p), new Vector3()).divideScalar(
  POSICIONES.length,
);
// Static camera on the sun's axis, pulled back and up, looking at the congress centre.
// Its horizontal field of view is fixed so the whole congress fits any canvas shape.
const CAMARA: [number, number, number] = [0, 1.6, 4.2];
const TAN_HORIZONTAL = Math.tan(Math.PI / 6) * (12 / 5) * 0.85;

function resolver(token: string) {
  return new Color(getComputedStyle(document.documentElement).getPropertyValue(token).trim());
}

function Escanos({ bloques }: { bloques: Bloques }) {
  const malla = useRef<InstancedMesh>(null);
  const reducido = useMemo(() => matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const gris = useMemo(() => resolver("--disabled"), []); // light, so the reds stand out on dark
  const rojo = useMemo(() => resolver("--brand"), []);
  const actuales = useMemo(() => ESCANOS.map(() => gris.clone()), [gris]);
  const destinos = ESCANOS.map((_, i) => (enBloques(bloques, i) ? rojo : gris));
  const invalidate = useThree((s) => s.invalidate);
  const camara = useThree((s) => s.camera) as PerspectiveCamera;
  const aspecto = useThree((s) => s.size.width / s.size.height);

  useLayoutEffect(() => {
    camara.fov = Math.min(100, (2 * Math.atan(TAN_HORIZONTAL / aspecto) * 180) / Math.PI);
    camara.lookAt(CENTRO);
    camara.updateProjectionMatrix();
    invalidate();
  }, [camara, aspecto, invalidate]);

  // frameloop="demand" only draws on request: start the transition on every new selection.
  const clave = bloques.join(";");
  useEffect(() => invalidate(), [clave, invalidate]);

  useLayoutEffect(() => {
    const m = malla.current!;
    const o = new Object3D();
    POSICIONES.forEach((p, i) => {
      o.position.copy(p);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, actuales[i]);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [actuales]);

  useFrame(({ invalidate }, dt) => {
    const k = reducido ? 1 : 1 - Math.exp(-dt * 5);
    let moviendo = false;
    actuales.forEach((c, i) => {
      c.lerp(destinos[i], k);
      malla.current!.setColorAt(i, c);
      moviendo ||= Math.abs(c.r - destinos[i].r) + Math.abs(c.g - destinos[i].g) > 1e-3;
    });
    malla.current!.instanceColor!.needsUpdate = true;
    if (moviendo) invalidate();
  });

  return (
    <instancedMesh ref={malla} args={[undefined, undefined, ESCANOS.length]}>
      <sphereGeometry args={[0.1, 16, 12]} />
      <meshLambertMaterial />
    </instancedMesh>
  );
}

export default function Hemiciclo3D({
  bloques,
  etiqueta,
}: {
  bloques: Bloques;
  etiqueta: string;
}) {
  return (
    <div role="img" aria-label={etiqueta} className="h-full w-full">
      <Canvas frameloop="demand" camera={{ position: CAMARA }} dpr={[1, 2]}>
        <ambientLight intensity={2} />
        <directionalLight position={[0, 6, 4]} intensity={1.5} />
        <Escanos bloques={bloques} />
      </Canvas>
    </div>
  );
}
