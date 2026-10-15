import { MODULOS } from "./modulos.js";

const err401 = { 401: { description: "Token ausente, inválido o vencido" } };
const seguro = [{ bearerAuth: [] }];
const json = (schema) => ({ required: true, content: { "application/json": { schema } } });
const idParam = { name: "id", in: "path", required: true, schema: { type: "string" } };

const tipoOpenApi = (c) => {
  switch (c.type) {
    case "number": return { type: "number" };
    case "date": return { type: "string", format: "date", example: "2026-10-13" };
    case "checkbox": return { type: "boolean" };
    case "refs": return { type: "array", items: { type: "string" } };
    case "select": return { type: "string", enum: c.options };
    default: return { type: "string" };
  }
};

const schemas = {};
const paths = {};

for (const m of MODULOS) {
  const requeridos = m.campos.filter((c) => c.required).map((c) => c.name);
  schemas[m.clave] = {
    type: "object",
    ...(requeridos.length ? { required: requeridos } : {}),
    properties: Object.fromEntries(m.campos.map((c) => [c.name, tipoOpenApi(c)])),
  };
  const ref = { $ref: `#/components/schemas/${m.clave}` };
  const tags = [m.titulo];

  paths[`/api/${m.endpoint}`] = {
    get: {
      tags, summary: `Listar ${m.titulo.toLowerCase()}`,
      parameters: m.filtros.map((f) => ({ name: f, in: "query", schema: { type: "string" } })),
      responses: { 200: { description: "Lista", content: { "application/json": { schema: { type: "array", items: ref } } } }, ...err401 },
    },
    post: {
      tags, summary: `Crear ${m.singular}`, requestBody: json(ref),
      responses: { 201: { description: "Creado" }, 400: { description: "Datos inválidos" }, 403: { description: "Referencia sin permiso" }, 409: { description: "Duplicado" }, ...err401 },
    },
  };
  paths[`/api/${m.endpoint}/{id}`] = {
    get: { tags, summary: `Consultar ${m.singular}`, parameters: [idParam], responses: { 200: { description: "Registro" }, 404: { description: "No encontrado" }, ...err401 } },
    patch: { tags, summary: `Actualizar ${m.singular}`, parameters: [idParam], requestBody: json(ref), responses: { 200: { description: "Actualizado" }, 400: { description: "Datos inválidos" }, 404: { description: "No encontrado" }, ...err401 } },
    delete: { tags, summary: m.soft ? `Desactivar ${m.singular}` : `Eliminar ${m.singular}`, parameters: [idParam], responses: { 200: { description: "Hecho" }, 404: { description: "No encontrado" }, ...err401 } },
  };
}

const credenciales = {
  type: "object", required: ["correo", "password"],
  properties: { correo: { type: "string", example: "profe@correo.com" }, password: { type: "string", example: "MiClave1234" } },
};

paths["/api/auth/register"] = {
  post: {
    tags: ["Autenticación"], summary: "Crear cuenta de docente", security: [],
    requestBody: json({ type: "object", required: ["nombre", "correo", "password"], properties: { nombre: { type: "string" }, correo: { type: "string" }, password: { type: "string", minLength: 8 } } }),
    responses: { 201: { description: "Cuenta creada y token JWT" }, 400: { description: "Datos inválidos" }, 409: { description: "Correo ya registrado" } },
  },
};
paths["/api/auth/login"] = {
  post: {
    tags: ["Autenticación"], summary: "Iniciar sesión y obtener un JWT", security: [], requestBody: json(credenciales),
    responses: { 200: { description: "Token JWT y datos del docente" }, 401: { description: "Credenciales incorrectas" }, 429: { description: "Demasiados intentos" } },
  },
};
paths["/api/auth/perfil"] = {
  get: { tags: ["Autenticación"], summary: "Consultar perfil", responses: { 200: { description: "Perfil" }, ...err401 } },
  patch: {
    tags: ["Autenticación"], summary: "Actualizar perfil o contraseña",
    requestBody: json({ type: "object", properties: { nombre: { type: "string" }, passwordActual: { type: "string" }, passwordNueva: { type: "string" } } }),
    responses: { 200: { description: "Perfil actualizado" }, ...err401 },
  },
};
paths["/api/estudiantes/{id}/acudientes"] = {
  get: { tags: ["Estudiantes"], summary: "Consultar los acudientes de un estudiante", parameters: [idParam], responses: { 200: { description: "Lista de acudientes" }, 404: { description: "No encontrado" }, ...err401 } },
};
paths["/api/asistencias"] = {
  get: {
    tags: ["Asistencia"], summary: "Consultar asistencia por fecha y curso",
    parameters: ["fecha", "desde", "hasta", "cursoId", "asignacionId", "estudianteId"].map((n) => ({ name: n, in: "query", schema: { type: "string" } })),
    responses: { 200: { description: "Registros de asistencia" }, ...err401 },
  },
  post: {
    tags: ["Asistencia"], summary: "Registrar asistencia de una clase (evita duplicados)",
    requestBody: json({
      type: "object", required: ["asignacionId", "fecha", "registros"],
      properties: {
        asignacionId: { type: "string" }, fecha: { type: "string", format: "date", example: "2026-10-13" },
        registros: { type: "array", items: { type: "object", properties: { estudianteId: { type: "string" }, estado: { type: "string", enum: ["presente", "ausente", "tarde", "excusa"] }, observacion: { type: "string" } } } },
      },
    }),
    responses: { 201: { description: "Registrada" }, 400: { description: "Datos inválidos" }, 403: { description: "Asignación no autorizada" }, ...err401 },
  },
};
paths["/api/asistencias/{id}"] = {
  delete: { tags: ["Asistencia"], summary: "Eliminar un registro de asistencia", parameters: [idParam], responses: { 200: { description: "Eliminado" }, 404: { description: "No encontrado" }, ...err401 } },
};
paths["/api/reportes/{tipo}"] = {
  get: {
    tags: ["Reportes"], summary: "Reporte (asistencia, calificaciones, actividades, planeaciones, incidentes)",
    parameters: [
      { name: "tipo", in: "path", required: true, schema: { type: "string", enum: ["asistencia", "calificaciones", "actividades", "planeaciones", "incidentes"] } },
      ...["asignacionId", "desde", "hasta", "estado"].map((n) => ({ name: n, in: "query", schema: { type: "string" } })),
    ],
    responses: { 200: { description: "Columnas y filas del reporte" }, 404: { description: "Tipo inexistente" }, ...err401 },
  },
};
paths["/api/resumen"] = {
  get: { tags: ["Reportes"], summary: "Contadores para el panel principal", responses: { 200: { description: "Resumen" }, ...err401 } },
};

export default {
  openapi: "3.0.0",
  info: { title: "API AulaOrganizada", version: "1.0.0", description: "API para la gestión de cursos, estudiantes y actividades docentes. Pulsa «Authorize» y pega el token obtenido en /api/auth/login." },
  servers: [{ url: "/", description: "Servidor actual" }],
  components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } }, schemas },
  security: seguro,
  paths,
};