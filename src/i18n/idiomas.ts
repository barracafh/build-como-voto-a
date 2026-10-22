// Castellano y las lenguas cooficiales. Catalán y valenciano comparten versión:
// oficialmente son la misma lengua.
export const IDIOMAS = ["es", "ca", "eu", "gl"] as const;
export type Idioma = (typeof IDIOMAS)[number];

export const NOMBRES: Record<Idioma, string> = {
  es: "Castellano",
  ca: "Català / Valencià",
  eu: "Euskara",
  gl: "Galego",
};

// Para Intl (fechas y números) y para <html lang>.
export const LOCALES: Record<Idioma, string> = {
  es: "es-ES",
  ca: "ca-ES",
  eu: "eu-ES",
  gl: "gl-ES",
};

export const COOKIE = "idioma";

export const esIdioma = (v: unknown): v is Idioma =>
  IDIOMAS.includes(v as Idioma);
