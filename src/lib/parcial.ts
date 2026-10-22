// Lee «respuesta» y «pasos» de un JSON que aún se está escribiendo, para
// mostrarlos según llegan. Lo que cuenta es la respuesta final validada.

const escapes: Record<string, string> = {
  n: "\n",
  t: "\t",
  r: "",
  b: "",
  f: "",
};

// Lee una cadena JSON desde la comilla de apertura, aunque esté a medias.
function cadena(texto: string, desde: number): { valor: string; fin: number } {
  let valor = "";
  let i = desde + 1;
  while (i < texto.length) {
    const c = texto[i];
    if (c === '"') return { valor, fin: i + 1 };
    if (c === "\\") {
      const e = texto[i + 1];
      if (e === undefined) break;
      if (e === "u") {
        const hex = texto.slice(i + 2, i + 6);
        if (hex.length < 4) break;
        valor += String.fromCharCode(parseInt(hex, 16));
        i += 6;
        continue;
      }
      valor += escapes[e] ?? e;
      i += 2;
      continue;
    }
    valor += c;
    i++;
  }
  return { valor, fin: -1 };
}

export function leerParcial(texto: string): {
  respuesta: string;
  pasos: string[];
} {
  const r = /"respuesta"\s*:\s*"/.exec(texto);
  const respuesta = r ? cadena(texto, r.index + r[0].length - 1).valor : "";

  const pasos: string[] = [];
  const p = /"pasos"\s*:\s*\[/.exec(texto);
  if (p) {
    let i = p.index + p[0].length;
    for (;;) {
      while (i < texto.length && /[\s,]/.test(texto[i])) i++;
      if (texto[i] !== '"') break;
      const { valor, fin } = cadena(texto, i);
      pasos.push(valor.replace(/^\d+[.)]\s*/, ""));
      if (fin < 0) break;
      i = fin;
    }
  }
  return { respuesta, pasos };
}
