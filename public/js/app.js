(function () {
  const TOKEN = "aula_token";
  const USUARIO = "aula_docente";

  const Aula = {
    token: () => sessionStorage.getItem(TOKEN),
    docente() {
      try { return JSON.parse(sessionStorage.getItem(USUARIO)); } catch { return null; }
    },
    guardarSesion(token, docente) {
      sessionStorage.setItem(TOKEN, token);
      sessionStorage.setItem(USUARIO, JSON.stringify(docente));
    },
    salir() {
      sessionStorage.clear();
      location.href = "/login";
    },

    async api(ruta, { method = "GET", body } = {}) {
      const headers = { "Content-Type": "application/json" };
      if (Aula.token()) headers.Authorization = "Bearer " + Aula.token();
      const res = await fetch("/api" + ruta, { method, headers, body: body ? JSON.stringify(body) : undefined });
      const datos = await res.json().catch(() => null);
      if (res.status === 401 && !document.body.dataset.publico) Aula.salir();
      if (!res.ok) throw new Error((datos && datos.error) || "Error " + res.status);
      return datos;
    },

    esc(s) {
      return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    },
    fecha: (v) => (v ? new Date(v).toISOString().slice(0, 10) : ""),
    hoy() {
      const d = new Date();
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    },
    mayus: (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : ""),

    // Texto legible para cualquier documento que venga de la API
    etiqueta(o) {
      if (o == null) return "—";
      if (typeof o !== "object") return String(o);
      if (o.asignatura && o.curso) return `${Aula.etiqueta(o.asignatura)} · ${Aula.etiqueta(o.curso)}`;
      if (o.grado !== undefined) return `${o.grado} ${o.grupo}`;
      if (o.nombre) return o.nombre;
      if (o.titulo) return o.titulo;
      if (o.fecha && o.descripcion) return `${Aula.fecha(o.fecha)} · ${o.descripcion.slice(0, 40)}`;
      return o._id || "—";
    },

    alerta(mensaje, tipo = "success") {
      const cont = document.getElementById("alertas");
      const div = document.createElement("div");
      div.className = `toast align-items-center text-bg-${tipo} border-0`;
      div.setAttribute("role", "alert");
      div.innerHTML = `<div class="d-flex"><div class="toast-body">${Aula.esc(mensaje)}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button></div>`;
      cont.appendChild(div);
      new bootstrap.Toast(div, { delay: 4000 }).show();
      div.addEventListener("hidden.bs.toast", () => div.remove());
    },

    async llenarAsignaciones(select) {
      const asigs = await Aula.api("/asignaciones");
      select.innerHTML = asigs.length
        ? asigs.map((a) => `<option value="${a._id}">${Aula.esc(Aula.etiqueta(a))}</option>`).join("")
        : '<option value="">Primero crea una asignación</option>';
      return asigs;
    },
  };

  window.Aula = Aula;

  if (!document.body.dataset.publico && !Aula.token()) {
    location.href = "/login";
    return;
  }
  const nombre = document.getElementById("nombreDocente");
  if (nombre && Aula.docente()) nombre.textContent = Aula.docente().nombre;
  const salir = document.getElementById("btnSalir");
  if (salir) salir.addEventListener("click", Aula.salir);
})();