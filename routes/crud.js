import { Router } from "express";
import mongoose from "mongoose";
import AsignacionDocente from "../models/AsignacionDocente.js";
import { ErrorHttp } from "../middleware/errores.js";
import { parseFecha } from "../middleware/validarDatos.js";

const { isValidObjectId } = mongoose;

async function verificarReferencias(Modelo, datos, docente) {
  for (const [campo, tipo] of Object.entries(Modelo.schema.paths)) {
    if (campo === "docente" || datos[campo] == null) continue;
    const ref = tipo.options?.ref || tipo.options?.type?.[0]?.ref || tipo.caster?.options?.ref;
    if (!ref) continue;
    const ids = [].concat(datos[campo]);
    if (!ids.every((id) => typeof id === "string" && isValidObjectId(id))) {
      throw new ErrorHttp(400, `Identificador inválido en "${campo}"`);
    }
    const unicos = [...new Set(ids)];
    const total = await mongoose.model(ref).countDocuments({ _id: { $in: unicos }, docente });
    if (total !== unicos.length) throw new ErrorHttp(403, `Referencia inexistente o sin permiso en "${campo}"`);
  }
}

export function crudRouter(Modelo, opciones = {}) {
  const { populate = [], soft = null, campoFecha = null, orden = { createdAt: -1 }, antesDeListar = null, validar = null, inmutables = [] } = opciones;
  const router = Router();
  const poblar = (consulta) => populate.reduce((q, p) => q.populate(p), consulta);

  // LISTAR (con filtros por query string)
  router.get("/", async (req, res, next) => {
    try {
      const filtro = { docente: req.docenteId };
      const { desde, hasta, fecha, cursoId, asignaturaId } = req.query;

      for (const [clave, valor] of Object.entries(req.query)) {
        if (typeof valor !== "string" || ["desde", "hasta", "fecha"].includes(clave)) continue;
        const campo = clave.endsWith("Id") ? clave.slice(0, -2) : clave;
        if (campo === "docente" || !Modelo.schema.path(campo)) continue;
        filtro[campo] = valor;
      }

      // Recursos ligados a una asignación se pueden filtrar por curso o asignatura
      if (Modelo.schema.path("asignacion") && !filtro.asignacion && (cursoId || asignaturaId)) {
        const f = { docente: req.docenteId };
        if (cursoId) f.curso = String(cursoId);
        if (asignaturaId) f.asignatura = String(asignaturaId);
        filtro.asignacion = { $in: await AsignacionDocente.find(f).distinct("_id") };
      }

      if (campoFecha && Modelo.schema.path(campoFecha)) {
        const d = desde ? parseFecha(desde) : null;
        const h = hasta ? parseFecha(hasta) : null;
        const f = fecha ? parseFecha(fecha) : null;
        if ((desde && !d) || (hasta && !h) || (fecha && !f)) throw new ErrorHttp(400, "Fecha inválida, use el formato AAAA-MM-DD");
        if (f) filtro[campoFecha] = f;
        else if (d || h) filtro[campoFecha] = { ...(d && { $gte: d }), ...(h && { $lte: h }) };
      }

      if (antesDeListar) await antesDeListar(req, filtro);
      res.json(await poblar(Modelo.find(filtro).sort(orden).limit(1000)));
    } catch (e) { next(e); }
  });

  // CONSULTAR UNO
  router.get("/:id", async (req, res, next) => {
    try {
      const doc = await poblar(Modelo.findOne({ _id: req.params.id, docente: req.docenteId }));
      if (!doc) throw new ErrorHttp(404, "Registro no encontrado");
      res.json(doc);
    } catch (e) { next(e); }
  });

  // CREAR
  router.post("/", async (req, res, next) => {
    try {
      const datos = { ...req.body, docente: req.docenteId };
      delete datos._id;
      await verificarReferencias(Modelo, datos, req.docenteId);
      if (validar) await validar(datos, req);
      const doc = await Modelo.create(datos);
      res.status(201).json(await poblar(Modelo.findById(doc._id)));
    } catch (e) { next(e); }
  });

  // ACTUALIZAR
  const actualizar = async (req, res, next) => {
    try {
      const datos = { ...req.body };
      ["_id", "docente", "createdAt", "updatedAt", ...inmutables].forEach((c) => delete datos[c]);
      await verificarReferencias(Modelo, datos, req.docenteId);
      const doc = await poblar(
        Modelo.findOneAndUpdate({ _id: req.params.id, docente: req.docenteId }, { $set: datos }, { new: true, runValidators: true })
      );
      if (!doc) throw new ErrorHttp(404, "Registro no encontrado");
      res.json(doc);
    } catch (e) { next(e); }
  };
  router.patch("/:id", actualizar);
  router.put("/:id", actualizar);

  // ELIMINAR (o desactivar si el recurso es "soft")
  router.delete("/:id", async (req, res, next) => {
    try {
      const filtro = { _id: req.params.id, docente: req.docenteId };
      const doc = soft
        ? await Modelo.findOneAndUpdate(filtro, { $set: soft }, { new: true })
        : await Modelo.findOneAndDelete(filtro);
      if (!doc) throw new ErrorHttp(404, "Registro no encontrado");
      res.json({ mensaje: soft ? "Registro desactivado" : "Registro eliminado" });
    } catch (e) { next(e); }
  });

  return router;
}