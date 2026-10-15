import { Router } from "express";
import { MODULOS } from "../config/modulos.js";

const r = Router();

r.use((req, res, next) => {
  res.locals.modulos = MODULOS;
  res.locals.publico = false;
  res.locals.scripts = [];
  res.locals.activo = "";
  res.locals.titulo = "AulaOrganizada";
  next();
});

r.get("/", (req, res) => res.redirect("/login"));
r.get("/login", (req, res) => res.render("login", { titulo: "Ingresar", publico: true, scripts: ["login.js"] }));
r.get("/dashboard", (req, res) => res.render("dashboard", { titulo: "Panel", activo: "dashboard", scripts: ["dashboard.js"] }));
r.get("/asistencias", (req, res) => res.render("asistencias", { titulo: "Asistencia", activo: "asistencias", scripts: ["asistencias.js"] }));
r.get("/reportes", (req, res) => res.render("reportes", { titulo: "Agenda y reportes", activo: "reportes", scripts: ["reportes.js"] }));
r.get("/perfil", (req, res) => res.render("perfil", { titulo: "Mi perfil", activo: "perfil", scripts: ["perfil.js"] }));

r.get("/modulo/:clave", (req, res, next) => {
  const m = MODULOS.find((x) => x.clave === req.params.clave);
  if (!m) return next();
  res.render("modulo", { titulo: m.titulo, activo: m.clave, modulo: m, scripts: ["modulo.js"] });
});

export default r;
