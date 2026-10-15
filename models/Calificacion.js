import mongoose from "mongoose";
const { Schema } = mongoose;

const esquema = new Schema(
  {
    docente: { type: Schema.Types.ObjectId, ref: "Docente", required: true, index: true },
    actividad: { type: Schema.Types.ObjectId, ref: "Actividad", required: [true, "La actividad es obligatoria"] },
    estudiante: { type: Schema.Types.ObjectId, ref: "Estudiante", required: [true, "El estudiante es obligatorio"] },
    nota: { type: Number, required: [true, "La nota es obligatoria"], min: [0, "La nota mínima es 0"], max: [5, "La nota máxima es 5"] },
    observacion: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);
esquema.index({ actividad: 1, estudiante: 1 }, { unique: true });

export default mongoose.model("Calificacion", esquema);