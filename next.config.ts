import type { NextConfig } from "next";
import ficha from "./ficha.json";

// build.barraca.house sirve cada herramienta de la Build night 003 en
// /punto-atencion-ciudadana/<equipo>. La app vive en esa ruta en todas partes,
// también en local, para que nada se rompa al juntarla.
const basePath = `/punto-atencion-ciudadana/${ficha.equipo}`;

const config: NextConfig = {
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // El chatbot lee contexto.md en tiempo de ejecución.
  outputFileTracingIncludes: { "/api/chat": ["./contexto.md"] },
};
export default config;
