export class ErrorHttp extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

export function noEncontrado(req, res, next) {
  next(new ErrorHttp(404, "Ruta no encontrada"));
}

export function manejarErrores(err, req, res, next) {
  if (res.headersSent) return next(err);
  let status = err.status || 500;
  let mensaje = err.message;

  if (err.name === "ValidationError") {
    status = 400;
    mensaje = Object.values(err.errors).map((e) => e.message).join(". ");
  } else if (err.name === "CastError") {
    status = 400;
    mensaje = `Valor inválido en "${err.path}"`;
  } else if (err.code === 11000) {
    status = 409;
    mensaje = "Ya existe un registro con esos datos (duplicado)";
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    mensaje = "JSON inválido";
  }

  if (status >= 500) {
    console.error(err);
    mensaje = "Error interno del servidor";
  }

  if (req.originalUrl.startsWith("/api")) return res.status(status).json({ error: mensaje });

  res.status(status).render("error", { titulo: "Error", publico: true, scripts: [], activo: "", modulos: [], estado: status, mensaje });
}