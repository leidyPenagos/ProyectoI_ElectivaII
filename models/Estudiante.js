import mongoose from "mongoose";
const { Schema } = mongoose;

const esquema = new Schema(
  {
    docente: { type: Schema.Types.ObjectId, ref: "Docente", required: true, index: true },
    curso: { type: Schema.Types.ObjectId, ref: "Curso", required: [true, "El curso es obligatorio"], index: true },
    nombre: { type: String, required: [true, "El nombre es obligatorio"], trim: true, maxlength: 120 },
    fechaNacimiento: { type: Date },
    estado: { type: String, enum: { values: ["activo", "inactivo", "retirado"], message: "Estado inválido" }, default: "activo" },
  },
  { timestamps: true }
);

export default mongoose.model("Estudiante", esquema);