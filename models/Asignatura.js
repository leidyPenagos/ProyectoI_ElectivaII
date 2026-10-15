import mongoose from "mongoose";
const { Schema } = mongoose;

const esquema = new Schema(
  {
    docente: { type: Schema.Types.ObjectId, ref: "Docente", required: true, index: true },
    nombre: { type: String, required: [true, "El nombre de la asignatura es obligatorio"], trim: true, maxlength: 80 },
    descripcion: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);
esquema.index({ docente: 1, nombre: 1 }, { unique: true });

export default mongoose.model("Asignatura", esquema);