import { Router } from "express";
import { autenticar } from "../middleware/auth.js";
import { ErrorHttp } from "../middleware/errores.js";
import { parseFecha } from "../middleware/validarDatos.js";
import { DIAS_SEMANA } from "../config/modulos.js";
import { crudRouter } from "./crud.js";
import authRouter from "./auth.js";
import asistenciasRouter from "./asistencias.js";
import reportesRouter from "./reportes.js";

import Curso from "../models/Curso.js";
import Estudiante from "../models/Estudiante.js";
import Acudiente from "../models/Acudiente.js";
import Asignatura from "../models/Asignatura.js";
import AsignacionDocente from "../models/AsignacionDocente.js";
import Horario from "../models/Horario.js";
import Planeacion from "../models/Planeacion.js";
import Actividad from "../models/Actividad.js";
import Calificacion from "../models/Calificacion.js";
import Incidente from "../models/Incidente.js";
import Comunicacion from "../models/Comunicacion.js";

const POP_ASIG = { path: "asignacion", populate: [{ path: "curso" }, { path: "asignatura" }] };
const r = Router();

r.use("/auth", authRouter);
r.use(autenticar); // 🔒 todo lo siguiente requiere token

r.get("/resumen", async (req, res, next) => {
  try {
    const docente = req.docenteId;
    const hoy = new Date(new Date().toISOString().slice(0, 10));
    const [cursos, estudiantes, asignaciones, actividadesPendientes, incidentesAbiertos] = await Promise.all([
      Curso.countDocuments({ docente, activo: true }),
      Estudiante.countDocuments({ docente, estado: "activo" }),
      AsignacionDocente.countDocuments({ docente }),
      Actividad.countDocuments({ docente, fechaEntrega: { $gte: hoy } }),
      Incidente.countDocuments({ docente, estado: { $ne: "cerrado" } }),
    ]);
    res.json({ cursos, estudiantes, asignaciones, actividadesPendientes, incidentesAbiertos });
  } catch (e) { next(e); }
});

r.use("/cursos", crudRouter(Curso, { soft: { activo: false }, orden: { grado: 1, grupo: 1 } }));

// Estudiantes + sus acudientes
const estudiantes = Router();
estudiantes.get("/:id/acudientes", async (req, res, next) => {
  try {
    const est = await Estudiante.findOne({ _id: req.params.id, docente: req.docenteId }).select("_id");
    if (!est) throw new ErrorHttp(404, "Estudiante no encontrado");
    res.json(await Acudiente.find({ docente: req.docenteId, estudiantes: est._id }));
  } catch (e) { next(e); }
});
estudiantes.use(crudRouter(Estudiante, { populate: ["curso"], soft: { estado: "inactivo" }, orden: { nombre: 1 } }));
r.use("/estudiantes", estudiantes);

r.use("/acudientes", crudRouter(Acudiente, { populate: [{ path: "estudiantes", select: "nombre" }], orden: { nombre: 1 } }));
r.use("/asignaturas", crudRouter(Asignatura, { orden: { nombre: 1 } }));
r.use("/asignaciones", crudRouter(AsignacionDocente, { populate: ["curso", "asignatura"] }));

r.use(
  "/horarios",
  crudRouter(Horario, {
    populate: [POP_ASIG],
    orden: { horaInicio: 1 },
    // GET /api/horarios?fecha=2026-10-13 → clases de ese día de la semana
    antesDeListar: async (req, filtro) => {
      if (!req.query.fecha) return;
      const f = parseFecha(req.query.fecha);
      if (!f) throw new ErrorHttp(400, "Fecha inválida, use AAAA-MM-DD");
      filtro.diaSemana = DIAS_SEMANA[f.getUTCDay()];
    },
  })
);

r.use("/asistencias", asistenciasRouter);
r.use("/planeaciones", crudRouter(Planeacion, { populate: [POP_ASIG], campoFecha: "fechaClase", orden: { fechaClase: -1 } }));
r.use("/actividades", crudRouter(Actividad, { populate: [POP_ASIG], campoFecha: "fechaAsignacion", orden: { fechaAsignacion: -1 } }));

r.use(
  "/calificaciones",
  crudRouter(Calificacion, {
    populate: [{ path: "actividad", select: "titulo" }, { path: "estudiante", select: "nombre" }],
    inmutables: ["actividad", "estudiante"],
    // El estudiante debe pertenecer al curso de la actividad
    validar: async (d) => {
      if (!d.actividad || !d.estudiante) return;
      const act = await Actividad.findById(d.actividad).select("asignacion");
      const asig = await AsignacionDocente.findById(act.asignacion).select("curso");
      const ok = await Estudiante.exists({ _id: d.estudiante, curso: asig.curso });
      if (!ok) throw new ErrorHttp(400, "El estudiante no pertenece al curso de la actividad");
    },
    // GET /api/calificaciones?asignacionId=...&desde=...&hasta=...
    antesDeListar: async (req, filtro) => {
      if (!req.query.asignacionId) return;
      const f = { docente: req.docenteId, asignacion: String(req.query.asignacionId) };
      const d = parseFecha(req.query.desde);
      const h = parseFecha(req.query.hasta);
      if (d || h) f.fechaAsignacion = { ...(d && { $gte: d }), ...(h && { $lte: h }) };
      filtro.actividad = { $in: await Actividad.find(f).distinct("_id") };
    },
  })
);

r.use("/incidentes", crudRouter(Incidente, { populate: [{ path: "estudiante", select: "nombre" }], campoFecha: "fecha", orden: { fecha: -1 } }));
r.use(
  "/comunicaciones",
  crudRouter(Comunicacion, {
    populate: [{ path: "acudiente", select: "nombre" }, { path: "incidente", select: "fecha descripcion" }],
    campoFecha: "fecha",
    orden: { fecha: -1 },
  })
);

r.use("/reportes", reportesRouter);

export default r;