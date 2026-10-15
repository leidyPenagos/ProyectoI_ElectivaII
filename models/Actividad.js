import mongoose from "mongoose";
const { Schema } = mongoose;

const esquema = new Schema(
  {
    docente: { type: Schema.Types.ObjectId, ref: "Docente", required: true, index: true },
    asignacion: { type: Schema.Types.ObjectId, ref: "AsignacionDocente", required: [true, "La asignación es obligatoria"] },
    titulo: { type: String, required: [true, "El título es obligatorio"], trim: true, maxlength: 200 },
    fechaAsignacion: { type: Date, required: [true, "La fecha de asignación es obligatoria"] },
    fechaEntrega: {
      type: Date,
      required: [true, "La fecha de entrega es obligatoria"],
      validate: [function (v) { return !this.fechaAsignacion || v >= this.fechaAsignacion; }, "La entrega no puede ser anterior a la asignación"],
    },
    descripcion: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

export default mongoose.model("Actividad", esquema);