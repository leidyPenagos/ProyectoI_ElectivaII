import mongoose from "mongoose";
const { Schema } = mongoose;

const esquema = new Schema(
  {
    docente: { type: Schema.Types.ObjectId, ref: "Docente", required: true, index: true },
    curso: { type: Schema.Types.ObjectId, ref: "Curso", required: [true, "El curso es obligatorio"] },
    asignatura: { type: Schema.Types.ObjectId, ref: "Asignatura", required: [true, "La asignatura es obligatoria"] },
    rol: { type: String, enum: { values: ["titular", "especialista"], message: "Rol inválido" }, required: [true, "El rol es obligatorio"] },
    fechaInicio: { type: Date },
    fechaFin: { type: Date },
  },
  { timestamps: true }
);
esquema.index({ docente: 1, curso: 1, asignatura: 1 }, { unique: true });

export default mongoose.model("AsignacionDocente", esquema);