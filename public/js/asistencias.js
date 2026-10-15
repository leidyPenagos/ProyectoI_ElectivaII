(async function () {
  const { api, esc, etiqueta, hoy, alerta, llenarAsignaciones, mayus } = Aula;
  const selAsig = document.getElementById("asignacion");
  const inFecha = document.getElementById("fecha");
  const cuerpo = document.getElementById("cuerpo");
  const panel = document.getElementById("panelLista");
  const ESTADOS = ["presente", "ausente", "tarde", "excusa"];
  let asigs = [];

  inFecha.value = hoy();
  try {
    asigs = await llenarAsignaciones(selAsig);
  } catch (err) {
    alerta(err.message, "danger");
  }

  async function cargar() {
    const asig = asigs.find((a) => a._id === selAsig.value);
    if (!asig || !inFecha.value) return alerta("Selecciona la asignación y la fecha", "warning");
    try {
      const [estudiantes, previas] = await Promise.all([
        api("/estudiantes?cursoId=" + asig.curso._id + "&estado=activo"),
        api("/asistencias?asignacionId=" + asig._id + "&fecha=" + inFecha.value),
      ]);
      const mapa = new Map(previas.filter((p) => p.estudiante).map((p) => [p.estudiante._id, p]));

      cuerpo.innerHTML = estudiantes.length
        ? estudiantes.map((e, i) => {
            const prev = mapa.get(e._id);
            const actual = prev ? prev.estado : "presente";
            const radios = ESTADOS.map((s) =>
              `<div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="e_${e._id}" id="e_${e._id}_${s}" value="${s}"${s === actual ? " checked" : ""}><label class="form-check-label" for="e_${e._id}_${s}">${mayus(s)}</label></div>`
            ).join("");
            return `<tr data-id="${e._id}"><td>${i + 1}</td><td>${esc(e.nombre)}</td><td class="text-nowrap">${radios}</td><td><input class="form-control form-control-sm" maxlength="200" value="${esc(prev ? prev.observacion : "")}"></td></tr>`;
          }).join("")
        : '<tr><td colspan="4" class="text-center text-muted py-4">Este curso no tiene estudiantes activos.</td></tr>';
      panel.classList.remove("d-none");
    } catch (err) {
      alerta(err.message, "danger");
    }
  }

  async function guardar() {
    const asig = asigs.find((a) => a._id === selAsig.value);
    const filas = [...cuerpo.querySelectorAll("tr[data-id]")];
    if (!asig || !filas.length) return;
    const registros = filas.map((f) => ({
      estudianteId: f.dataset.id,
      estado: f.querySelector("input[type=radio]:checked").value,
      observacion: f.querySelector("input.form-control").value,
    }));
    try {
      await api("/asistencias", { method: "POST", body: { asignacionId: asig._id, fecha: inFecha.value, registros } });
      alerta("Asistencia guardada para " + etiqueta(asig) + " el " + inFecha.value);
    } catch (err) {
      alerta(err.message, "danger");
    }
  }

  document.getElementById("btnCargar").addEventListener("click", cargar);
  document.getElementById("btnGuardar").addEventListener("click", guardar);
  document.getElementById("btnTodosPresentes").addEventListener("click", () => {
    cuerpo.querySelectorAll("input[value=presente]").forEach((r) => (r.checked = true));
  });
})();