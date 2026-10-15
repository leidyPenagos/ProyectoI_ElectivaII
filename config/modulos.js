export const DIAS_SEMANA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export const MODULOS = [
  {
    clave: "cursos", endpoint: "cursos", titulo: "Cursos", singular: "curso",
    icono: "bi-collection", soft: true, filtros: [],
    columnas: ["grado", "grupo", "periodoAcademico", "activo"],
    campos: [
      { name: "grado", label: "Grado", type: "text", required: true, placeholder: "4.º" },
      { name: "grupo", label: "Grupo", type: "text", required: true, placeholder: "A" },
      { name: "periodoAcademico", label: "Periodo académico", type: "text", required: true, placeholder: "2026" },
      { name: "activo", label: "Curso activo", type: "checkbox", default: true },
    ],
  },
  {
    clave: "estudiantes", endpoint: "estudiantes", titulo: "Estudiantes", singular: "estudiante",
    icono: "bi-people", soft: true, filtros: ["cursoId", "estado"],
    columnas: ["nombre", "curso", "fechaNacimiento", "estado"],
    campos: [
      { name: "nombre", label: "Nombre completo", type: "text", required: true },
      { name: "curso", label: "Curso", type: "ref", ref: "cursos", required: true },
      { name: "fechaNacimiento", label: "Fecha de nacimiento", type: "date" },
      { name: "estado", label: "Estado", type: "select", options: ["activo", "inactivo", "retirado"], default: "activo" },
    ],
  },
  {
    clave: "acudientes", endpoint: "acudientes", titulo: "Acudientes", singular: "acudiente",
    icono: "bi-person-lines-fill", filtros: ["estudiantes"],
    columnas: ["nombre", "parentesco", "telefono", "estudiantes"],
    campos: [
      { name: "nombre", label: "Nombre completo", type: "text", required: true },
      { name: "parentesco", label: "Parentesco", type: "text", required: true, placeholder: "Madre, padre, abuela…" },
      { name: "telefono", label: "Teléfono", type: "text", required: true },
      { name: "correo", label: "Correo", type: "email" },
      { name: "estudiantes", label: "Estudiantes a cargo", type: "refs", ref: "estudiantes", required: true },
    ],
  },
  {
    clave: "asignaturas", endpoint: "asignaturas", titulo: "Asignaturas", singular: "asignatura",
    icono: "bi-book", filtros: [],
    columnas: ["nombre", "descripcion"],
    campos: [
      { name: "nombre", label: "Nombre", type: "text", required: true, placeholder: "Matemáticas" },
      { name: "descripcion", label: "Descripción", type: "textarea" },
    ],
  },
  {
    clave: "asignaciones", endpoint: "asignaciones", titulo: "Asignaciones", singular: "asignación",
    icono: "bi-diagram-3", filtros: ["cursoId", "asignaturaId", "rol"],
    columnas: ["curso", "asignatura", "rol", "fechaInicio", "fechaFin"],
    campos: [
      { name: "curso", label: "Curso", type: "ref", ref: "cursos", required: true },
      { name: "asignatura", label: "Asignatura", type: "ref", ref: "asignaturas", required: true },
      { name: "rol", label: "Rol", type: "select", options: ["titular", "especialista"], required: true },
      { name: "fechaInicio", label: "Fecha de inicio", type: "date" },
      { name: "fechaFin", label: "Fecha de fin", type: "date" },
    ],
  },
  {
    clave: "horarios", endpoint: "horarios", titulo: "Horarios", singular: "horario",
    icono: "bi-clock", filtros: ["fecha", "asignacionId", "cursoId"],
    columnas: ["asignacion", "diaSemana", "horaInicio", "horaFin"],
    campos: [
      { name: "asignacion", label: "Curso y asignatura", type: "ref", ref: "asignaciones", required: true },
      { name: "diaSemana", label: "Día", type: "select", options: ["lunes", "martes", "miércoles", "jueves", "viernes"], required: true },
      { name: "horaInicio", label: "Hora de inicio", type: "time", required: true },
      { name: "horaFin", label: "Hora de fin", type: "time", required: true },
    ],
  },
  {
    clave: "planeaciones", endpoint: "planeaciones", titulo: "Planeaciones", singular: "planeación",
    icono: "bi-journal-text", filtros: ["fecha", "desde", "hasta", "asignacionId", "cursoId"],
    columnas: ["asignacion", "fechaClase", "tema"],
    campos: [
      { name: "asignacion", label: "Curso y asignatura", type: "ref", ref: "asignaciones", required: true },
      { name: "fechaClase", label: "Fecha de la clase", type: "date", required: true },
      { name: "tema", label: "Tema", type: "text", required: true },
      { name: "objetivo", label: "Objetivo", type: "textarea" },
      { name: "actividades", label: "Actividades previstas", type: "textarea" },
    ],
  },
  {
    clave: "actividades", endpoint: "actividades", titulo: "Actividades", singular: "actividad",
    icono: "bi-pencil-square", filtros: ["fecha", "desde", "hasta", "asignacionId", "cursoId"],
    columnas: ["titulo", "asignacion", "fechaAsignacion", "fechaEntrega"],
    campos: [
      { name: "asignacion", label: "Curso y asignatura", type: "ref", ref: "asignaciones", required: true },
      { name: "titulo", label: "Título", type: "text", required: true },
      { name: "fechaAsignacion", label: "Fecha de asignación", type: "date", required: true },
      { name: "fechaEntrega", label: "Fecha de entrega", type: "date", required: true },
      { name: "descripcion", label: "Descripción", type: "textarea" },
    ],
  },
  {
    clave: "calificaciones", endpoint: "calificaciones", titulo: "Calificaciones", singular: "calificación",
    icono: "bi-award", filtros: ["actividadId", "estudianteId", "asignacionId", "desde", "hasta"],
    columnas: ["actividad", "estudiante", "nota"],
    campos: [
      { name: "actividad", label: "Actividad", type: "ref", ref: "actividades", required: true },
      { name: "estudiante", label: "Estudiante", type: "ref", ref: "estudiantes", required: true },
      { name: "nota", label: "Nota (0 a 5)", type: "number", required: true, min: 0, max: 5, step: 0.1 },
      { name: "observacion", label: "Observación", type: "textarea" },
    ],
  },
  {
    clave: "incidentes", endpoint: "incidentes", titulo: "Incidentes", singular: "incidente",
    icono: "bi-exclamation-triangle", filtros: ["fecha", "desde", "hasta", "estudianteId", "estado"],
    columnas: ["fecha", "estudiante", "descripcion", "estado"],
    campos: [
      { name: "estudiante", label: "Estudiante", type: "ref", ref: "estudiantes", required: true },
      { name: "fecha", label: "Fecha", type: "date", required: true },
      { name: "descripcion", label: "Descripción", type: "textarea", required: true },
      { name: "accionRealizada", label: "Acción realizada", type: "textarea" },
      { name: "estado", label: "Estado", type: "select", options: ["abierto", "en seguimiento", "cerrado"], default: "abierto" },
    ],
  },
  {
    clave: "comunicaciones", endpoint: "comunicaciones", titulo: "Comunicaciones", singular: "comunicación",
    icono: "bi-chat-dots", filtros: ["fecha", "desde", "hasta", "acudienteId", "incidenteId", "estado"],
    columnas: ["fecha", "acudiente", "tipo", "estado"],
    campos: [
      { name: "acudiente", label: "Acudiente", type: "ref", ref: "acudientes", required: true },
      { name: "incidente", label: "Incidente relacionado (opcional)", type: "ref", ref: "incidentes" },
      { name: "fecha", label: "Fecha", type: "date", required: true },
      { name: "tipo", label: "Tipo", type: "select", options: ["llamada", "mensaje", "reunion", "correo"], required: true },
      { name: "descripcion", label: "Descripción", type: "textarea", required: true },
      { name: "estado", label: "Estado", type: "select", options: ["pendiente", "realizada"], default: "pendiente" },
    ],
  },
];