import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import { conectarDB } from "./config/db.js";
import apiRouter from "./routes/index.js";
import vistasRouter from "./routes/vistas.js";
import { noEncontrado, manejarErrores } from "./middleware/errores.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { PORT = 3000, MONGODB_URI, JWT_SECRET } = process.env;

if (!MONGODB_URI || !JWT_SECRET) {
  console.error("Falta MONGODB_URI o JWT_SECRET en el archivo .env");
  process.exit(1);
}

const app = express();
app.disable("x-powered-by");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Swagger va antes de helmet para que su interfaz no choque con la política CSP
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "https://cdn.jsdelivr.net"],
        "style-src": ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        "font-src": ["'self'", "https://cdn.jsdelivr.net", "data:"],
        "img-src": ["'self'", "data:"],
        "connect-src": ["'self'"],
        "upgrade-insecure-requests": null, // actívalo en producción con HTTPS
      },
    },
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", apiRouter);
app.use("/", vistasRouter);

app.use(noEncontrado);
app.use(manejarErrores);

try {
  await conectarDB(MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`✔ App:     http://localhost:${PORT}`);
    console.log(`✔ Swagger: http://localhost:${PORT}/api-docs`);
  });
} catch (err) {
  console.error("No se pudo conectar a MongoDB:");
  console.error(err);
  process.exit(1);
}