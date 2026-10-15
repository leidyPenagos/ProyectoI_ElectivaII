import mongoose from "mongoose";
const { Schema } = mongoose;

const hora = { type: String, required: true, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida (use HH:MM)"] };

const esquema = new Schema(
  {
    docente: { type: Schema.Types.ObjectId, ref: "Docente", required: true, index: true },
    asignacion: { type: Schema.Types.ObjectId, ref: "AsignacionDocente", required: [true, "La asignación es obligatoria"] },
    diaSemana: { type: String, enum: { values: ["lunes", "martes", "miércoles", "jueves", "viernes"], message: "Día inválido" }, required: [true, "El día es obligatorio"] },
    horaInicio: hora,
    horaFin: {
      ...hora,
      validate: [function (v) { return !this.horaInicio || v > this.horaInicio; }, "La hora de fin debe ser posterior a la de inicio"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Horario", esquema);