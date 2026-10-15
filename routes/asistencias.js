import { Router } from "express";
import mongoose from "mongoose";
import Asistencia from "../models/Asistencia.js";
import AsignacionDocente from "../models/AsignacionDocente.js";
import Estudiante from "../models/Estudiante.js";
import { crudRouter } from "./crud.js";
import { ErrorHttp } from "../middleware/errores.js";
import { parseFecha } from "../middleware/validarDatos.js";

const ESTADOS = ["presente", "ausente", "tarde", "excusa"];
const r = Router();

// Registrar la asistencia de toda una clase (si ya existe, la actualiza: nunca duplica)
r.post("/", async (req, res, next) => {
  try {
    const { asignacionId, fecha, registros } = req.body || {};
    const f = parseFecha(fecha);
    if (typeof asignacionId !== "string" || !mongoose.isValidObjectId(asignacionId)) throw new ErrorHttp(400, "asignacionId inválido");
    if (!f) throw new ErrorHttp(400, "Fecha inválida, use AAAA-MM-DD");
    if (!Array.isArray(registros) || !registros.length) throw new ErrorHttp(400, "Debe enviar al menos un registro");

    const asig = await AsignacionDocente.findOne({ _id: asignacionId, docente: req.docenteId });
    if (!asig) throw new ErrorHttp(403, "No está autorizada para esa asignación");

    const ids = registros.map((x) => x?.estudianteId);
    if (ids.some((id) => typeof id !== "string" || !mongoose.isValidObjectId(id))) throw new ErrorHttp(400, "estudianteId inválido");
    if (new Set(ids).size !== ids.length) throw new ErrorHttp(400, "Hay estudiantes repetidos en la solicitud");
    if (registros.some((x) => !ESTADOS.includes(x.estado))) throw new ErrorHttp(400, `Estado inválido. Use: ${ESTADOS.join(", ")}`);

    const validos = await Estudiante.countDocuments({ _id: { $in: ids }, docente: req.docenteId, curso: asig.curso });
    if (validos !== ids.length) throw new ErrorHttp(400, "Algún estudiante no pertenece al curso de la asignación");

    await Asistencia.bulkWrite(
      registros.map((x) => ({
        updateOne: {
          filter: { docente: req.docenteId, asignacion: asig._id, estudiante: x.estudianteId, fecha: f },
          update: { $set: { estado: x.estado, observacion: String(x.observacion || "").slice(0, 200) } },
          upsert: true,
        },
      }))
    );
    res.status(201).json({ mensaje: "Asistencia registrada", total: registros.length });
  } catch (e) { next(e); }
});

// GET (fecha, cursoId, asignacionId…), DELETE, etc.
r.use(
  crudRouter(Asistencia, {
    campoFecha: "fecha",
    orden: { fecha: -1 },
    populate: [
      { path: "estudiante", select: "nombre" },
      { path: "asignacion", populate: [{ path: "curso" }, { path: "asignatura" }] },
    ],
  })
);

export default r;