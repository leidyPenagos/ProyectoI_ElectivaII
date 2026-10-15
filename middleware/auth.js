import jwt from "jsonwebtoken";

export function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || "").split(" ");
  if (tipo !== "Bearer" || !token) return res.status(401).json({ error: "Token requerido" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    req.docenteId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o vencido" });
  }
}