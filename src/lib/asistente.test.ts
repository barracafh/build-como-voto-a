import { describe, expect, test } from "bun:test";
import { conFicha, validar, type Respuesta } from "./asistente";
import { fechaCorta, fechaLarga, plazo, plazos, rango } from "./calendario";
import { confianza } from "./confianza";
import { fechasEnTexto } from "./fechas-texto";

const delModelo: Respuesta = {
  tipo: "pregunta",
  respuesta: "texto del modelo",
  pasos: [],
  fuentes: [{ nombre: "BOE", url: "https://www.boe.es/" }],
};

describe("conFicha", () => {
  test("una pregunta que encaja con una ficha se responde con la ficha", () => {
    const r = conFicha(delModelo, "¿Cuántos diputados tiene el Congreso?");
    expect(r.verificacion).toMatchObject({
      afirmacion: "El Congreso tiene 350 diputados",
      resultado: "COINCIDE",
    });
    expect(r.verificacion?.cita).toBeTruthy();
    expect(confianza(r)?.nivel).toBe("alta");
  });

  test("también cuando la ficha no coincide", () => {
    const r = conFicha(delModelo, "¿Puedo votar con una fotocopia del DNI?");
    expect(r.verificacion?.resultado).toBe("NO COINCIDE");
    expect(r.respuesta).toContain("no coincide");
  });

  test("si no encaja con ninguna, se queda la respuesta del asistente", () => {
    for (const q of [
      "Vivo en València y el día 29 no estoy, ¿cómo voto?",
      "¿Tengo horas libres en el trabajo para ir a votar?",
    ])
      expect(conFicha(delModelo, q)).toBe(delModelo);
  });

  test("fuera de alcance no se toca", () => {
    const fuera = { ...delModelo, tipo: "fuera_de_alcance" as const };
    expect(conFicha(fuera, "¿Es obligatorio votar?")).toBe(fuera);
  });
});

// Las fechas se leen del calendario, nunca se escriben a mano.
const votacion = plazo("votacion");
const solicitud = plazo("voto_correo_solicitud");
const fuente = { nombre: "Calendario", url: solicitud.fuente };

// Un día de noviembre de 2026 que no es inicio ni fin de ningún plazo ni sale
// en ninguna nota del calendario.
const citadas = new Set(
  plazos.flatMap((p) => [
    p.inicio,
    p.fin,
    ...fechasEnTexto(`${p.evento} ${p.nota ?? ""}`).map((f) => `2026-${f}`),
  ]),
);
const inventada = Array.from(
  { length: 30 },
  (_, i) => `2026-11-${String(i + 1).padStart(2, "0")}`,
).find((d) => !citadas.has(d))!;

// Un día 1 de algún mes de 2026 que tampoco está en el calendario.
const primero = Array.from(
  { length: 12 },
  (_, i) => `2026-${String(i + 1).padStart(2, "0")}-01`,
).find((d) => !citadas.has(d))!;

// «29 de noviembre» → «29» y «noviembre».
const partes = (iso: string, idioma: "es" | "ca" | "gl" = "es") => {
  const [dia, ...resto] = fechaLarga(iso, idioma).split(" ");
  return { dia, mes: resto.join(" ").replace(/^(de |d’)/, "") };
};

const respuesta = (pasos: unknown[], texto = "Así se pide el voto por correo.") =>
  validar(
    { tipo: "pregunta", respuesta: texto, pasos, fuentes: [fuente] },
    "correo-aqui",
    "¿cómo voto por correo?",
  );

describe("validar: fechas de los pasos", () => {
  test("un id válido muestra la fecha del calendario", () => {
    const r = respuesta([
      { texto: "1. Pide el voto en Correos.", plazo: solicitud.id },
      { texto: "Lleva tu DNI.", plazo: null },
    ]);
    expect(r.sinConfirmar).toBeUndefined();
    expect(r.pasos).toEqual([
      `Pide el voto en Correos (${rango(solicitud)})`,
      "Lleva tu DNI.",
    ]);
  });

  test("la fecha sale en la lengua de la página", () => {
    const r = validar(
      {
        tipo: "pregunta",
        respuesta: "Així es vota.",
        pasos: [{ texto: "Vota a la mesa", plazo: votacion.id }],
        fuentes: [fuente],
      },
      "general",
      "",
      undefined,
      "ca",
    );
    expect(r.pasos).toEqual([`Vota a la mesa (${fechaLarga(votacion.inicio, "ca")})`]);
  });

  test("un id que no existe descarta el paso", () => {
    const r = respuesta([
      { texto: "Pide el voto.", plazo: "plazo_que_no_existe" },
      { texto: "Vota.", plazo: votacion.id },
    ]);
    expect(r.pasos).toEqual([`Vota (${rango(votacion)})`]);
  });

  test("una fecha inventada en un paso: «no puedo confirmarlo»", () => {
    const r = respuesta([
      { texto: `Pide el voto antes del ${fechaLarga(inventada)}.`, plazo: null },
    ]);
    expect(r.sinConfirmar).toBe(true);
    expect(r.pasos).toEqual([]);
  });

  test("una fecha inventada en la respuesta: «no puedo confirmarlo»", () => {
    for (const texto of [
      `Tienes hasta el ${fechaLarga(inventada)}.`,
      `Tienes hasta el ${fechaLarga(inventada, "gl")}.`,
      `Epea: ${fechaLarga(inventada, "eu")}.`,
      `Tienes hasta el ${inventada.slice(8)}/${inventada.slice(5, 7)}.`,
      `Plazo: ${inventada}.`,
    ])
      expect(respuesta([], texto).sinConfirmar).toBe(true);
  });

  test("meses abreviados, ordinales y mes + día: «no puedo confirmarlo»", () => {
    const { dia, mes } = partes(inventada);
    const ca = partes(primero, "ca");
    for (const texto of [
      `Tienes hasta el ${fechaCorta(inventada)} para pedirlo.`,
      `Tienes hasta el ${fechaCorta(inventada)}. para pedirlo.`,
      `Fins al ${fechaCorta(inventada, "ca")}.`,
      `Ata o ${fechaCorta(inventada, "gl")}.`,
      `Epea: ${fechaCorta(inventada, "eu")}.`,
      `Tienes hasta el ${dia}º de ${mes}.`,
      `Tienes hasta el ${dia}.º de ${mes}.`,
      `Fins a l’${ca.dia}r de ${ca.mes}.`,
      `Tienes hasta ${mes} ${dia}.`,
    ])
      expect(respuesta([], texto).sinConfirmar).toBe(true);
  });

  test("un paso sin plazo con fecha abreviada inventada: «no puedo confirmarlo»", () => {
    const r = respuesta([
      { texto: `Envíalo el ${fechaCorta(inventada)}`, plazo: null },
    ]);
    expect(r.sinConfirmar).toBe(true);
    expect(r.pasos).toEqual([]);
  });

  test("«des de» en catalán no es diciembre", () => {
    const r = respuesta([], "Pots enviar-lo fins al dia 7 des de qualsevol oficina.");
    expect(r.sinConfirmar).toBeUndefined();
  });

  test("con formato antiguo, una fecha del calendario en el paso lo descarta", () => {
    const r = respuesta([
      `Vota el ${fechaLarga(votacion.inicio)}.`,
      "Lleva tu DNI.",
    ]);
    expect(r.sinConfirmar).toBeUndefined();
    expect(r.pasos).toEqual(["Lleva tu DNI."]);
  });

  test("una fecha del calendario en la respuesta se admite", () => {
    const r = respuesta([], `Se vota el ${fechaLarga(votacion.inicio)}.`);
    expect(r.sinConfirmar).toBeUndefined();
  });

  test("plazos relativos y horas no son fechas", () => {
    const r = respuesta(
      [{ texto: "Envíalo hasta 3 días antes, de 9:00 a 14:00.", plazo: null }],
      "Te quedan 10 días y el 3 % de los votos no cuenta.",
    );
    expect(r.sinConfirmar).toBeUndefined();
    expect(r.pasos).toHaveLength(1);
  });
});

describe("fechasEnTexto", () => {
  const md = (iso: string) => iso.slice(5);

  test("lee las fechas tal como las escribe rango() en cada lengua", () => {
    for (const p of plazos)
      for (const idioma of ["es", "ca", "gl"] as const)
        expect(fechasEnTexto(rango(p, idioma))).toEqual(
          p.inicio === p.fin ? [md(p.inicio)] : [md(p.inicio), md(p.fin)],
        );
  });

  test("lee las fechas tal como las escribe fechaCorta() en cada lengua", () => {
    for (const p of plazos)
      for (const idioma of ["es", "ca", "gl", "eu"] as const)
        expect(fechasEnTexto(fechaCorta(p.fin, idioma))).toEqual([md(p.fin)]);
  });

  test("euskera, con declinación y rango", () => {
    const largo = fechaLarga(solicitud.fin, "eu");
    expect(fechasEnTexto(largo)).toEqual([md(solicitud.fin)]);
    const [mes, dia] = largo.split(" ");
    expect(fechasEnTexto(`${mes} 4tik ${dia}ra`)).toEqual([
      `${md(solicitud.fin).slice(0, 3)}04`,
      md(solicitud.fin),
    ]);
  });

  test("con año, la fecha completa", () => {
    expect(fechasEnTexto(`${fechaLarga(votacion.inicio)} de 2026`)).toEqual([
      votacion.inicio,
    ]);
  });
});
