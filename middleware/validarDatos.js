export function requerirTexto(...campos) {
  return (req, res, next) => {
    const malos = campos.filter((c) => typeof req.body?.[c] !== "string" || !req.body[c].trim());
    if (malos.length) return res.status(400).json({ error: `Campos obligatorios (texto): ${malos.join(", ")}` });
    next();
  };
}

// Acepta solo AAAA-MM-DD. Devuelve Date (UTC) o null.
export function parseFecha(valor) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const f = new Date(valor);
  return isNaN(f) ? null : f;
}