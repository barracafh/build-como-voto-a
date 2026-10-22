"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Color,
  type InstancedMesh,
  NeutralToneMapping,
  Object3D,
  type PerspectiveCamera,
  PMREMGenerator,
  Vector2,
  Vector3,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { VignetteShader } from "three/examples/jsm/shaders/VignetteShader.js";
import { ruta } from "@/config/sitio";
import { CAMARA_3D, ESCANOS_3D, MODELO_HEMICICLO, RADIO_BOLITA } from "@/datos/hemiciclo-3d";
import { CargandoSala } from "./CargandoSala";
import { type Bloques, enBloques } from "./Hemiciclo";

// The chamber from src/hemiciclo.blend, seen from the .blend camera behind the presidency.
// One instanced ball per seat, in the same left-to-right order as ESCANOS, so each block
// is still the contiguous block of the selected community.
const POSICION = new Vector3(...CAMARA_3D.posicion);
const OBJETIVO = new Vector3(...CAMARA_3D.objetivo);
// The balls come in after the chamber, sweeping left to right.
const ENTRADA_PASO = 0.003;
const ENTRADA_DURACION = 0.4;
const ENTRADA_FIN = ESCANOS_3D.length * ENTRADA_PASO + ENTRADA_DURACION;
// ponytail: assumes the .blend camera renders 16:9; narrower canvases widen the vertical
// field of view so the whole hemicycle still fits.
const TAN_HORIZONTAL = Math.tan((CAMARA_3D.fovVertical * Math.PI) / 360) * (16 / 9);

function resolver(token: string) {
  return new Color(getComputedStyle(document.documentElement).getPropertyValue(token).trim());
}

// onProgreso only fires on the first fetch; a cached model renders straight away and calls onCargada.
function Sala({
  onProgreso,
  onCargada,
}: {
  onProgreso: (fraccion: number) => void;
  onCargada: () => void;
}) {
  const { scene } = useLoader(GLTFLoader, ruta(MODELO_HEMICICLO), undefined, (e) => {
    if (e.total) onProgreso(e.loaded / e.total);
  });
  useEffect(onCargada, [onCargada]);
  return <primitive object={scene} />;
}

// Camera pose for a selection: the .blend camera with nothing selected; otherwise above the
// chamber floor, on the line from the hemicycle centre (the origin; seat rows go from radius
// 6 to 16) towards the centroid of the selected seats. Staying inside radius 5 keeps the camera
// off the walls, wherever the community sits; larger communities pull it back to the centre.
function encuadre(bloques: Bloques) {
  const objetivo = new Vector3();
  let n = 0;
  for (const [desde, hasta] of bloques)
    for (let i = desde; i < hasta; i++, n++) objetivo.add(new Vector3(...ESCANOS_3D[i]));
  if (!n) return { posicion: POSICION, objetivo: OBJETIVO };
  objetivo.divideScalar(n);
  const radio = Math.hypot(objetivo.x, objetivo.z) || 1;
  const alejado = Math.min(5, Math.max(0.5, radio - 5 - Math.sqrt(n)));
  const posicion = new Vector3(objetivo.x / radio, 0, objetivo.z / radio).multiplyScalar(alejado);
  posicion.y = objetivo.y + 3;
  return { posicion, objetivo };
}

function Camara({ bloques }: { bloques: Bloques }) {
  const invalidate = useThree((s) => s.invalidate);
  const camara = useThree((s) => s.camera) as PerspectiveCamera;
  const aspecto = useThree((s) => s.size.width / s.size.height);
  const reducido = useMemo(() => matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const mirando = useMemo(() => OBJETIVO.clone(), []);
  const clave = bloques.join(";");
  const destino = useMemo(() => encuadre(bloques), [clave]);

  useLayoutEffect(() => {
    const ajuste = (2 * Math.atan(TAN_HORIZONTAL / aspecto) * 180) / Math.PI;
    camara.fov = Math.min(100, Math.max(CAMARA_3D.fovVertical, ajuste));
    camara.updateProjectionMatrix();
    invalidate();
  }, [camara, aspecto, invalidate]);

  useEffect(() => invalidate(), [destino, invalidate]);

  useFrame(({ invalidate }, dt) => {
    const k = reducido ? 1 : 1 - Math.exp(-dt * 3);
    camara.position.lerp(destino.posicion, k);
    mirando.lerp(destino.objetivo, k);
    camara.lookAt(mirando);
    if (camara.position.distanceTo(destino.posicion) + mirando.distanceTo(destino.objetivo) > 1e-3)
      invalidate();
  });

  return null;
}

function Escanos({ bloques }: { bloques: Bloques }) {
  const malla = useRef<InstancedMesh>(null);
  const reducido = useMemo(() => matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const gris = useMemo(() => resolver("--disabled"), []);
  const rojo = useMemo(() => resolver("--brand"), []);
  const actuales = useMemo(() => ESCANOS_3D.map(() => gris.clone()), [gris]);
  const destinos = ESCANOS_3D.map((_, i) => (enBloques(bloques, i) ? rojo : gris));
  const invalidate = useThree((s) => s.invalidate);

  // frameloop="demand" only draws on request: start the transition on every new selection.
  const clave = bloques.join(";");
  useEffect(() => invalidate(), [clave, invalidate]);

  const reloj = useRef(reducido ? Infinity : 0);

  // Seat i grows from 0 to full size, starting ENTRADA_PASO seconds after seat i - 1.
  const colocar = (m: InstancedMesh) => {
    const o = new Object3D();
    ESCANOS_3D.forEach((p, i) => {
      const t = Math.min(1, Math.max(0, (reloj.current - i * ENTRADA_PASO) / ENTRADA_DURACION));
      o.position.set(...p);
      o.scale.setScalar(1 - (1 - t) ** 3);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => {
    const m = malla.current!;
    colocar(m);
    actuales.forEach((c, i) => m.setColorAt(i, c));
  }, [actuales]);

  useFrame(({ invalidate }, dt) => {
    const k = reducido ? 1 : 1 - Math.exp(-dt * 5);
    let moviendo = reloj.current < ENTRADA_FIN;
    if (moviendo) {
      reloj.current += Math.min(dt, 1 / 30); // demand mode: dt after idle can be huge
      colocar(malla.current!);
    }
    actuales.forEach((c, i) => {
      c.lerp(destinos[i], k);
      malla.current!.setColorAt(i, c);
      moviendo ||= Math.abs(c.r - destinos[i].r) + Math.abs(c.g - destinos[i].g) > 1e-3;
    });
    malla.current!.instanceColor!.needsUpdate = true;
    if (moviendo) invalidate();
  });

  return (
    <instancedMesh ref={malla} args={[undefined, undefined, ESCANOS_3D.length]}>
      <sphereGeometry args={[RADIO_BOLITA, 16, 12]} />
      <meshStandardMaterial roughness={0.35} />
    </instancedMesh>
  );
}

// Image-based lighting: the .glb ships clearcoat and specular materials that look flat
// without something to reflect. RoomEnvironment is a procedural room, built once.
function Ambiente() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    gl.toneMapping = NeutralToneMapping; // ACES shifts the brand red towards orange
    gl.toneMappingExposure = 0.9;
    const pmrem = new PMREMGenerator(gl);
    const entorno = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = entorno;
    scene.environmentIntensity = 0.4;
    return () => {
      scene.environment = null;
      entorno.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

// RenderPass -> ambient occlusion (desktop only, it is the expensive one) -> subtle bloom
// -> tone mapping + sRGB -> vignette -> SMAA (the composer bypasses the canvas MSAA).
// Priority 1 takes over rendering from R3F; with frameloop="demand" it only runs on change.
function PostProcesado() {
  const { gl, scene, camera, size, viewport } = useThree();
  const composer = useMemo(() => {
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));
    if (matchMedia("(min-width: 768px) and (pointer: fine)").matches) {
      const ao = new GTAOPass(scene, camera);
      ao.blendIntensity = 0.8;
      c.addPass(ao);
    }
    c.addPass(new UnrealBloomPass(new Vector2(256, 256), 0.15, 0.3, 1.1));
    c.addPass(new OutputPass());
    const vineta = new ShaderPass(VignetteShader);
    vineta.uniforms.offset.value = 0.9;
    vineta.uniforms.darkness.value = 1.1;
    c.addPass(vineta);
    c.addPass(new SMAAPass());
    return c;
  }, [gl, scene, camera]);

  useEffect(() => () => composer.dispose(), [composer]);
  useLayoutEffect(() => {
    composer.setPixelRatio(viewport.dpr);
    composer.setSize(size.width, size.height);
  }, [composer, size, viewport.dpr]);

  useFrame((_, dt) => composer.render(dt), 1);
  return null;
}

export default function Hemiciclo3D({
  bloques,
  etiqueta,
}: {
  bloques: Bloques;
  etiqueta: string;
}) {
  const [progreso, setProgreso] = useState<number>();
  const [cargada, setCargada] = useState(false);
  return (
    <div className="relative h-full w-full">
      <div role="img" aria-label={etiqueta} className="h-full w-full">
        <Canvas
          frameloop="demand"
          camera={{ position: [...CAMARA_3D.posicion], near: 0.1, far: 200 }}
          dpr={[1, 2]}
        >
          <hemisphereLight args={["#ffffff", "#444444", 0.6]} />
          <directionalLight position={[0, 12, 8]} intensity={1.5} />
          <Ambiente />
          <PostProcesado />
          <Camara bloques={bloques} />
          <Suspense fallback={null}>
            <Sala onProgreso={setProgreso} onCargada={() => setCargada(true)} />
          </Suspense>
          {cargada && <Escanos bloques={bloques} />}
        </Canvas>
      </div>
      {/* After the canvas so it paints on top; outside role="img", which hides its children from assistive tech. */}
      {!cargada && <CargandoSala progreso={progreso} />}
    </div>
  );
}
