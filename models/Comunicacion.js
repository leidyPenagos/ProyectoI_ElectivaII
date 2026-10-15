import mongoose from "mongoose";
const { Schema } = mongoose;

const esquema = new Schema(
  {
    docente: { type: Schema.Types.ObjectId, ref: "Docente", required: true, index: true },
    acudiente: { type: Schema.Types.ObjectId, ref: "Acudiente", required: [true, "El acudiente es obligatorio"] },
    incidente: { type: Schema.Types.ObjectId, ref: "Incidente" },
    fecha: { type: Date, required: [true, "La fecha es obligatoria"] },
    tipo: { type: String, enum: { values: ["llamada", "mensaje", "reunion", "correo"], message: "Tipo inválido" }, required: [true, "El tipo es obligatorio"] },
    descripcion: { type: String, required: [true, "La descripción es obligatoria"], trim: true, maxlength: 2000 },
    estado: { type: String, enum: { values: ["pendiente", "realizada"], message: "Estado inválido" }, default: "pendiente" },
  },
  { timestamps: true }
);

export default mongoose.model("Comunicacion", esquema);
