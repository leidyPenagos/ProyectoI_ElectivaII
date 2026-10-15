import mongoose from "mongoose";
const { Schema } = mongoose;

const esquema = new Schema(
  {
    docente: { type: Schema.Types.ObjectId, ref: "Docente", required: true, index: true },
    nombre: { type: String, required: [true, "El nombre del acudiente es obligatorio"], trim: true, maxlength: 120 },
    parentesco: { type: String, required: [true, "El parentesco es obligatorio"], trim: true, maxlength: 50 },
    telefono: { type: String, required: [true, "El teléfono es obligatorio"], trim: true, maxlength: 30 },
    correo: { type: String, trim: true, lowercase: true, maxlength: 120 },
    estudiantes: {
      type: [{ type: Schema.Types.ObjectId, ref: "Estudiante" }],
      validate: [(v) => v.length >= 1, "Debe asociar al menos un estudiante"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Acudiente", esquema);