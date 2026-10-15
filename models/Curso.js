import mongoose from "mongoose";
const { Schema } = mongoose;

const esquema = new Schema(
  {
    docente: { type: Schema.Types.ObjectId, ref: "Docente", required: true, index: true },
    grado: { type: String, required: [true, "El grado es obligatorio"], trim: true, maxlength: 20 },
    grupo: { type: String, required: [true, "El grupo es obligatorio"], trim: true, maxlength: 20 },
    periodoAcademico: { type: String, required: [true, "El periodo académico es obligatorio"], trim: true, maxlength: 20 },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);
esquema.index({ docente: 1, grado: 1, grupo: 1, periodoAcademico: 1 }, { unique: true });

export default mongoose.model("Curso", esquema);