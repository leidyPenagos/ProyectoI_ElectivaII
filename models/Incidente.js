import mongoose from "mongoose";
const { Schema } = mongoose;

const esquema = new Schema(
  {
    docente: { type: Schema.Types.ObjectId, ref: "Docente", required: true, index: true },
    estudiante: { type: Schema.Types.ObjectId, ref: "Estudiante", required: [true, "El estudiante es obligatorio"] },
    fecha: { type: Date, required: [true, "La fecha es obligatoria"] },
    descripcion: { type: String, required: [true, "La descripción es obligatoria"], trim: true, maxlength: 2000 },
    accionRealizada: { type: String, trim: true, maxlength: 2000 },
    estado: { type: String, enum: { values: ["abierto", "en seguimiento", "cerrado"], message: "Estado inválido" }, default: "abierto" },
  },
  { timestamps: true }
);

export default mongoose.model("Incidente", esquema);