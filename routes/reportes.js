import { Router } from "express";
import Asistencia from "../models/Asistencia.js";
import Calificacion from "../models/Calificacion.js";
import Actividad from "../models/Actividad.js";
import Planeacion from "../models/Planeacion.js";
import Incidente from "../models/Incidente.js";
import { ErrorHttp } from "../middleware/errores.js";
import { parseFecha } from "../middleware/validarDatos.js";

const r = Router();
const POP_ASIG = { path: "asignacion", populate: [{ path: "curso" }, { path: "asignatura" }] };

const fmt = (d) => (d ? d.toISOString().slice(0, 10) : "");
const etiquetaAsig = (a) =>
  `${a?.asignatura?.nombre ?? "—"} · ${a?.curso ? `${a.curso.grado} ${a.curso.grupo}` : "—"}`;

function rango(q) {
  const d = q.desde ? parseFecha(q.desde) : null;
  const h = q.hasta ? parseFecha(q.hasta) : null;
  if ((q.desde && !d) || (q.hasta && !h)) throw new ErrorHttp(400, "Fecha inválida, use AAAA-MM-DD");
  return d || h ? { ...(d && { $gte: d }), ...(h && { $lte: h }) } : null;
}

function base(req) {
  const f = { docente: req.docenteId };
  if (req.query.asignacionId) f.asignacion = String(req.query.asignacionId);
  return f;
}

const reportes = {
  async asistencia(req) {
    const f = base(req);
    const g = rango(req.query);
    if (g) f.fecha = g;
    const regs = await Asistencia.find(f).populate("estudiante", "nombre");
    const por = new Map();
    for (const a of regs) {
      if (!a.estudiante) continue;
      const k = String(a.estudiante._id);
      if (!por.has(k)) por.set(k, { nombre: a.estudiante.nombre, presente: 0, ausente: 0, tarde: 0, excusa: 0, total: 0 });
      const x = por.get(k);
      x[a.estado]++;
      x.total++;
    }
    const filas = [...por.values()]
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .map((x) => [x.nombre, x.presente, x.ausente, x.tarde, x.excusa, x.total, Math.round((100 * (x.presente + x.tarde)) / x.total) + "%"]);
    return { columnas: ["Estudiante", "Presente", "Ausente", "Tarde", "Excusa", "Total", "% asistencia"], filas };
  },

  async calificaciones(req) {
    const fa = base(req);
    const g = rango(req.query);
    if (g) fa.fechaAsignacion = g;
    const ids = await Actividad.find(fa).distinct("_id");
    const notas = await Calificacion.find({ docente: req.docenteId, actividad: { $in: ids } }).populate("estudiante", "nombre");
    const por = new Map();
    for (const c of notas) {
      if (!c.estudiante) continue;
      const k = String(c.estudiante._id);
      if (!por.has(k)) por.set(k, { nombre: c.estudiante.nombre, notas: [] });
      por.get(k).notas.push(c.nota);
    }
    const filas = [...por.values()]
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .map((x) => [x.nombre, x.notas.length, (x.notas.reduce((s, n) => s + n, 0) / x.notas.length).toFixed(2), Math.min(...x.notas), Math.max(...x.notas)]);
    return { columnas: ["Estudiante", "Notas registradas", "Promedio", "Mínima", "Máxima"], filas };
  },

  async actividades(req) {
    const f = base(req);
    const g = rango(req.query);
    if (g) f.fechaAsignacion = g;
    const acts = await Actividad.find(f).sort({ fechaAsignacion: -1 }).populate(POP_ASIG);
    const resumen = await Calificacion.aggregate([
      { $match: { actividad: { $in: acts.map((a) => a._id) } } },
      { $group: { _id: "$actividad", n: { $sum: 1 }, prom: { $avg: "$nota" } } },
    ]);
    const m = new Map(resumen.map((x) => [String(x._id), x]));
    const filas = acts.map((a) => {
      const x = m.get(String(a._id));
      return [a.titulo, etiquetaAsig(a.asignacion), fmt(a.fechaAsignacion), fmt(a.fechaEntrega), x ? x.n : 0, x ? x.prom.toFixed(2) : "—"];
    });
    return { columnas: ["Actividad", "Curso y asignatura", "Asignada", "Entrega", "Calificadas", "Promedio"], filas };
  },

  async planeaciones(req) {
    const f = base(req);
    const g = rango(req.query);
    if (g) f.fechaClase = g;
    const lista = await Planeacion.find(f).sort({ fechaClase: -1 }).populate(POP_ASIG);
    return {
      columnas: ["Fecha", "Curso y asignatura", "Tema", "Objetivo"],
      filas: lista.map((p) => [fmt(p.fechaClase), etiquetaAsig(p.asignacion), p.tema, p.objetivo || "—"]),
    };
  },

  async incidentes(req) {
    const f = { docente: req.docenteId };
    const g = rango(req.query);
    if (g) f.fecha = g;
    if (req.query.estado) f.estado = String(req.query.estado);
    const lista = await Incidente.find(f).sort({ fecha: -1 }).populate("estudiante", "nombre");
    return {
      columnas: ["Fecha", "Estudiante", "Descripción", "Acción realizada", "Estado"],
      filas: lista.map((i) => [fmt(i.fecha), i.estudiante?.nombre ?? "—", i.descripcion, i.accionRealizada || "—", i.estado]),
    };
  },
};

r.get("/:tipo", async (req, res, next) => {
  try {
    if (!Object.hasOwn(reportes, req.params.tipo)) throw new ErrorHttp(404, "Tipo de reporte inexistente");
    res.json(await reportes[req.params.tipo](req));
  } catch (e) { next(e); }
});

export default r;