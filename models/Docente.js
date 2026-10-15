import mongoose from "mongoose";

const esquema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, "El nombre es obligatorio"], trim: true, maxlength: 100 },
    correo: { type: String, required: [true, "El correo es obligatorio"], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, "Correo inválido"] },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

export default mongoose.model("Docente", esquema);