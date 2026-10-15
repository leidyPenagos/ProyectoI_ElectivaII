(async function () {
  const { api, esc, etiqueta, hoy, alerta } = Aula;
  try {
    const resumen = await api("/resumen");
    for (const [clave, valor] of Object.entries(resumen)) {
      const el = document.getElementById("dato-" + clave);
      if (el) el.textContent = valor;
    }
    const horarios = await api("/horarios?fecha=" + hoy());
    document.getElementById("horarioHoy").innerHTML = horarios.length
      ? horarios.map((h) => `<li class="list-group-item d-flex justify-content-between"><span>${esc(etiqueta(h.asignacion))}</span><span class="text-muted">${esc(h.horaInicio)} – ${esc(h.horaFin)}</span></li>`).join("")
      : '<li class="list-group-item text-muted">No hay clases programadas para hoy.</li>';
  } catch (err) {
    alerta(err.message, "danger");
  }
})();