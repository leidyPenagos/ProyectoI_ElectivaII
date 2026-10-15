import mongoose from "mongoose";

export async function conectarDB(uri) {
  console.log("URI:", uri);

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);

  console.log("✔ Conectado a MongoDB");
}