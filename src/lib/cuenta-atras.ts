export type Partes = { dias: number; horas: number; minutos: number; segundos: number };

// Milisegundos que faltan, en días, horas, minutos y segundos enteros.
export function partes(ms: number): Partes {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    dias: Math.floor(s / 86_400),
    horas: Math.floor(s / 3600) % 24,
    minutos: Math.floor(s / 60) % 60,
    segundos: s % 60,
  };
}
