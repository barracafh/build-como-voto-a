// Verificaciones ya publicadas por verificadores profesionales (Google Fact
// Check Tools, contexto.md 6.6). La calificación es suya: se muestra atribuida
// y enlazada, nunca como veredicto nuestro. Solo desde el servidor.
export type Publicada = {
  afirmacion: string;
  verificador: string;
  calificacion: string;
  titulo: string;
  url: string;
  fecha?: string;
};

// Neutralidad: fuera lo que hable de partidos, candidaturas o encuestas.
const POLITICA =
  /\b(partid\w*|candidat\w*|encuesta\w*|sondeo\w*|psoe|pp|vox|sumar|podemos|junts|erc|bildu|pnv|bng|compromís|compromis|s[aá]nchez|feij[oó]o|abascal|d[ií]az|puigdemont|ayuso|gobierno|ministr\w*)\b/i;

export async function buscarPublicadas(
  afirmacion: string,
): Promise<Publicada[]> {
  const clave = process.env.FACTCHECK_API_KEY;
  if (!clave || !afirmacion.trim()) return [];
  const url = new URL(
    "https://factchecktools.googleapis.com/v1alpha1/claims:search",
  );
  url.search = new URLSearchParams({
    query: afirmacion.slice(0, 300),
    languageCode: "es",
    pageSize: "10",
    key: clave,
  }).toString();
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const publicadas: Publicada[] = [];
    for (const c of data.claims ?? []) {
      const r = c.claimReview?.[0];
      if (
        typeof c.text !== "string" ||
        typeof r?.url !== "string" ||
        !r.url.startsWith("https://") ||
        !r.publisher?.name ||
        !r.textualRating ||
        POLITICA.test(`${c.text} ${r.title ?? ""}`)
      )
        continue;
      publicadas.push({
        afirmacion: c.text,
        verificador: r.publisher.name,
        calificacion: r.textualRating,
        titulo: r.title ?? c.text,
        url: r.url,
        fecha: r.reviewDate,
      });
      if (publicadas.length === 3) break;
    }
    return publicadas;
  } catch {
    return [];
  }
}
