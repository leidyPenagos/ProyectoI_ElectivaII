import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import Docente from "../models/Docente.js";
import { autenticar } from "../middleware/auth.js";
import { requerirTexto } from "../middleware/validarDatos.js";
import { ErrorHttp } from "../middleware/errores.js";

const r = Router();

const limitar = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta de nuevo en 15 minutos." },
});

const emitirToken = (d) =>
  jwt.sign({ sub: String(d._id) }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1h", algorithm: "HS256" });
const publico = (d) => ({ id: d._id, nombre: d.nombre, correo: d.correo });

r.post("/register", limitar, requerirTexto("nombre", "correo", "password"), async (req, res, next) => {
  try {
    const { nombre, correo, password } = req.body;
    if (password.length < 8) throw new ErrorHttp(400, "La contraseña debe tener al menos 8 caracteres");
    const d = await Docente.create({ nombre, correo, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: emitirToken(d), docente: publico(d) });
  } catch (e) { next(e); }
});

r.post("/login", limitar, requerirTexto("correo", "password"), async (req, res, next) => {
  try {
    const d = await Docente.findOne({ correo: req.body.correo.toLowerCase().trim() }).select("+passwordHash");
    const ok = d && (await bcrypt.compare(req.body.password, d.passwordHash));
    if (!ok) return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    res.json({ token: emitirToken(d), docente: publico(d) });
  } catch (e) { next(e); }
});

r.get("/perfil", autenticar, async (req, res, next) => {
  try {
    const d = await Docente.findById(req.docenteId);
    if (!d) throw new ErrorHttp(404, "Docente no encontrado");
    res.json(publico(d));
  } catch (e) { next(e); }
});

r.patch("/perfil", autenticar, async (req, res, next) => {
  try {
    const d = await Docente.findById(req.docenteId).select("+passwordHash");
    if (!d) throw new ErrorHttp(404, "Docente no encontrado");
    const { nombre, passwordActual, passwordNueva } = req.body || {};

    if (nombre !== undefined) {
      if (typeof nombre !== "string" || !nombre.trim()) throw new ErrorHttp(400, "Nombre inválido");
      d.nombre = nombre;
    }
    if (passwordNueva) {
      if (typeof passwordNueva !== "string" || passwordNueva.length < 8) throw new ErrorHttp(400, "La nueva contraseña debe tener al menos 8 caracteres");
      if (typeof passwordActual !== "string" || !(await bcrypt.compare(passwordActual, d.passwordHash))) {
        throw new ErrorHttp(403, "La contraseña actual no es correcta");
      }
      d.passwordHash = await bcrypt.hash(passwordNueva, 12);
    }
    await d.save();
    res.json(publico(d));
  } catch (e) { next(e); }
});

export default r;