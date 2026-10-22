import { describe, expect, test } from "bun:test";
import { plazos } from "./calendario";
import { citaLiteral, fuentePermitida } from "./conocimiento";
import {
  clasificarLocal,
  fichas,
  leerClasificacion,
  resolver,
  verificarLocal,
  type Clasificacion,
} from "./verificador";

const DOMINIOS_OFICIALES = [
  "https://www.boe.es/",
  "https://infoelectoral.interior.gob.es/",
  "https://www.ine.es/",
  "https://www.juntaelectoralcentral.es/",
  "https://www.correos.es/",
];
const MESES: Record<string, string> = {
  octubre: "10",
  noviembre: "11",
  diciembre: "12",
};
const CALIFICATIVOS = /\b(verdader[oa]|fals[oa]|bulo|engaños[oa])\b/i;

describe("corpus de fichas", () => {
  test("hay entre 30 y 40 fichas con id único", () => {
    expect(fichas.length).toBeGreaterThanOrEqual(30);
    expect(fichas.length).toBeLessThanOrEqual(40);
    expect(new Set(fichas.map((f) => f.id)).size).toBe(fichas.length);
  });

  test.each(fichas.map((f) => [f.id, f] as const))(
    "%s: cita literal, URL oficial y campos completos",
    (_, f) => {
      expect(["COINCIDE", "NO COINCIDE"]).toContain(f.resultado);
      expect(f.afirmacion.trim()).not.toBe("");
      expect(f.variantes.length).toBeGreaterThan(0);
      expect(f.articulo.trim()).not.toBe("");
      expect(f.fuente.trim()).not.toBe("");
      expect(f.fecha_consulta).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(DOMINIOS_OFICIALES.some((d) => f.url.startsWith(d))).toBe(true);
      // Las mismas garantías que se aplican a lo que dice el modelo.
      expect(citaLiteral(f.cita)).toBe(true);
      expect(fuentePermitida(f.url)).toBe(true);
      const textos = [f.afirmacion, ...f.variantes, f.cita, f.matiz ?? ""];
      expect(textos.some((t) => CALIFICATIVOS.test(t))).toBe(false);
    },
  );

  test("cada plazo enlazado existe en el calendario", () => {
    const ids = new Set(plazos.map((p) => p.id));
    for (const f of fichas) if (f.plazo) expect(ids).toContain(f.plazo);
  });

  test("toda fecha que aparece en una ficha cae dentro de un plazo del calendario", () => {
    for (const f of fichas) {
      const texto = [f.afirmacion, ...f.variantes, f.cita, f.matiz ?? ""].join(
        " ",
      );
      for (const [, dia, mes] of texto.matchAll(
        /\b(\d{1,2}) de (octubre|noviembre|diciembre)\b/g,
      )) {
        const iso = `2026-${MESES[mes]}-${dia.padStart(2, "0")}`;
        const dentro = plazos.some((p) => p.inicio <= iso && iso <= p.fin);
        expect({ ficha: f.id, iso, dentro }).toEqual({
          ficha: f.id,
          iso,
          dentro: true,
        });
      }
    }
  });
});

// Batería de 15 casos con el clasificador local (sin llamar a HelmCode):
// 8 de contexto.md 6.3, 3 fuera de alcance y 4 fuera de corpus.
const BATERIA: [string, string, string | null, string][] = [
  // [grupo, texto del usuario, ficha esperada, resultado esperado]
  ["6.3", "Me han dicho que si pido el voto por correo y al final no lo uso, puedo votar en la mesa", "correo-y-mesa", "NO COINCIDE"],
  ["6.3", "¿Es verdad que puedo votar con una fotocopia del DNI?", "dni-fotocopia", "NO COINCIDE"],
  ["6.3", "Me dijeron que el último día para pedir el voto por correo es el 19/11", "correo-plazo-solicitud", "COINCIDE"],
  ["6.3", "Una papeleta tachada o con una anotación es válida", "papeleta-tachada", "NO COINCIDE"],
  ["6.3", "Dicen que es obligatorio votar", "obligatorio-votar", "NO COINCIDE"],
  ["6.3", "Se pueden publicar encuestas el 26/11", "encuestas-26", "NO COINCIDE"],
  ["6.3", "El voto en blanco se reparte entre los partidos más votados", "voto-blanco-reparto", "NO COINCIDE"],
  ["6.3", "Los españoles que viven en el extranjero tienen que pedir el voto", "cera-pedir-voto", "NO COINCIDE"],
  ["fuera de alcance", "El partido A va a ganar las elecciones", null, "fuera_de_alcance"],
  ["fuera de alcance", "La última encuesta da mayoría absoluta a la candidatura B", null, "fuera_de_alcance"],
  ["fuera de alcance", "¿A quién debería votar este año?", null, "fuera_de_alcance"],
  ["fuera de corpus", "Se puede votar por internet", null, "NO VERIFICABLE"],
  ["fuera de corpus", "Con el DNI digital del móvil se puede votar", null, "NO VERIFICABLE"],
  ["fuera de corpus", "Los miembros de mesa cobran 100 euros", null, "NO VERIFICABLE"],
  ["fuera de corpus", "En el colegio electoral hay rampas para sillas de ruedas", null, "NO VERIFICABLE"],
];

describe("batería de 15 casos", () => {
  test("son 15: 8 de 6.3, 3 fuera de alcance y 4 fuera de corpus", () => {
    const grupos = BATERIA.map(([g]) => g);
    expect(grupos.length).toBe(15);
    expect(grupos.filter((g) => g === "6.3").length).toBe(8);
    expect(grupos.filter((g) => g === "fuera de alcance").length).toBe(3);
    expect(grupos.filter((g) => g === "fuera de corpus").length).toBe(4);
  });

  test.each(BATERIA)("[%s] %s", (_, texto, ficha, esperado) => {
    const c = clasificarLocal(texto);
    const r = verificarLocal(texto);
    if (esperado === "fuera_de_alcance") {
      expect(c.tipo).toBe("fuera_de_alcance");
      expect(r.tipo).toBe("fuera_de_alcance");
      expect(r.verificacion).toBeUndefined();
      return;
    }
    expect(c.tipo === "afirmacion" ? c.ficha : "?").toBe(ficha);
    expect(r.verificacion?.resultado).toBe(esperado as never);
    expect(r.fuentes.length).toBeGreaterThan(0);
    if (ficha) {
      const f = fichas.find((x) => x.id === ficha)!;
      // Cita, fuente y matiz salen tal cual de la ficha.
      expect(r.verificacion?.cita).toBe(f.cita);
      expect(r.verificacion?.articulo).toBe(f.articulo);
      expect(r.verificacion?.matiz).toBe(f.matiz);
      expect(r.fuentes).toEqual([{ nombre: f.fuente, url: f.url }]);
    } else {
      expect(r.verificacion?.cita).toBeUndefined();
    }
    expect(CALIFICATIVOS.test(r.respuesta)).toBe(false);
  });
});

describe("guardas sobre la clasificación del modelo", () => {
  const afirmacion = (
    ficha: string | null,
    relacion: "igual" | "contraria" = "igual",
  ): Clasificacion => ({ tipo: "afirmacion", ficha, relacion });

  test("el veredicto sale de la ficha elegida", () => {
    const r = resolver(
      afirmacion("correo-y-mesa"),
      "Si pido el voto por correo también puedo votar en mi colegio",
    );
    expect(r.verificacion?.resultado).toBe("NO COINCIDE");
  });

  test("con relación contraria se invierte el resultado de la ficha", () => {
    const r = resolver(
      afirmacion("obligatorio-votar", "contraria"),
      "Me han dicho que no es obligatorio votar",
    );
    expect(r.verificacion?.resultado).toBe("COINCIDE");
  });

  test("una ficha que no tiene que ver con el texto: no verificable", () => {
    const r = resolver(afirmacion("congreso-350"), "Es obligatorio votar");
    expect(r.verificacion?.resultado).toBe("NO VERIFICABLE");
  });

  test("una cifra distinta de la ficha: no verificable", () => {
    const r = resolver(
      afirmacion("correo-plazo-solicitud", "contraria"),
      "El último día para pedir el voto por correo es el 25 de noviembre",
    );
    expect(r.verificacion?.resultado).toBe("NO VERIFICABLE");
  });

  test("sin modelo: pedir el voto el 25 no es enviarlo el 25", () => {
    expect(
      verificarLocal(
        "El último día para pedir el voto por correo es el 25 de noviembre",
      ).verificacion?.resultado,
    ).toBe("NO VERIFICABLE");
  });

  test("sin modelo, la negación contraria no se adivina: no verificable", () => {
    expect(verificarLocal("No es obligatorio votar").verificacion?.resultado).toBe(
      "NO VERIFICABLE",
    );
  });

  test("ficha inexistente o nula: no verificable", () => {
    expect(
      resolver(afirmacion("inventada"), "Es obligatorio votar").verificacion
        ?.resultado,
    ).toBe("NO VERIFICABLE");
    expect(
      resolver(afirmacion(null), "Es obligatorio votar").verificacion
        ?.resultado,
    ).toBe("NO VERIFICABLE");
  });

  test("fuera de alcance y sin afirmación no llevan veredicto", () => {
    expect(resolver({ tipo: "fuera_de_alcance" }, "x").verificacion).toBe(
      undefined,
    );
    expect(resolver({ tipo: "sin_afirmacion" }, "¿cómo voto?").tipo).toBe(
      "fuera_de_alcance",
    );
  });

  test("la salida del modelo que no encaja no se interpreta", () => {
    expect(leerClasificacion(null)).toBeNull();
    expect(leerClasificacion({ tipo: "veredicto", resultado: "COINCIDE" })).toBe(
      null,
    );
    // Un resultado que escriba el modelo se ignora: no forma parte del contrato.
    expect(
      leerClasificacion({
        tipo: "afirmacion",
        ficha: "obligatorio-votar",
        resultado: "COINCIDE",
      }),
    ).toEqual({
      tipo: "afirmacion",
      afirmacion: undefined,
      ficha: "obligatorio-votar",
      relacion: "igual",
    });
  });
});
