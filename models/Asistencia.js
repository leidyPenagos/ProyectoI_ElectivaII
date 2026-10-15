import mongoose from "mongoose";
const { Schema } = mongoose;

const esquema = new Schema(
  {
    docente: { type: Schema.Types.ObjectId, ref: "Docente", required: true, index: true },
    asignacion: { type: Schema.Types.ObjectId, ref: "AsignacionDocente", required: true },
    estudiante: { type: Schema.Types.ObjectId, ref: "Estudiante", required: true },
    fecha: { type: Date, required: [true, "La fecha es obligatoria"] },
    estado: { type: String, enum: { values: ["presente", "ausente", "tarde", "excusa"], message: "Estado de asistencia inválido" }, required: true },
    observacion: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { timestamps: true }
);
// Integridad: una sola asistencia por estudiante, asignación y fecha
esquema.index({ asignacion: 1, estudiante: 1, fecha: 1 }, { unique: true });

export default mongoose.model("Asistencia", esquema);
