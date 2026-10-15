import mongoose from "mongoose";
const { Schema } = mongoose;

const esquema = new Schema(
  {
    docente: { type: Schema.Types.ObjectId, ref: "Docente", required: true, index: true },
    asignacion: { type: Schema.Types.ObjectId, ref: "AsignacionDocente", required: [true, "La asignación es obligatoria"] },
    fechaClase: { type: Date, required: [true, "La fecha de la clase es obligatoria"] },
    tema: { type: String, required: [true, "El tema es obligatorio"], trim: true, maxlength: 200 },
    objetivo: { type: String, trim: true, maxlength: 1000 },
    actividades: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

export default mongoose.model("Planeacion", esquema);