(async function () {
  const { api, esc, alerta, llenarAsignaciones } = Aula;
  const tipo = document.getElementById("tipo");
  const asig = document.getElementById("asignacion");
  const desde = document.getElementById("desde");
  const hasta = document.getElementById("hasta");
  const grupoAsig = document.getElementById("grupoAsignacion");
  const titulo = document.getElementById("tituloResultado");
  const encabezado = document.getElementById("encabezado");
  const cuerpo = document.getElementById("cuerpo");
  let datos = null;

  const SIN_DATOS = {
    asistencia: "No hay asistencia registrada con esos filtros. Regístrala en el menú «Asistencia».",
    planeaciones: "No hay planeaciones con esos filtros. Créalas en el menú «Planeaciones».",
    actividades: "No hay actividades con esos filtros. Créalas en el menú «Actividades».",
    calificaciones: "No hay calificaciones con esos filtros. Primero crea actividades y luego registra las notas en «Calificaciones».",
    incidentes: "No hay incidentes con esos filtros. Regístralos en el menú «Incidentes».",
  };

  function mensajeTabla(texto, clase = "text-muted") {
    encabezado.innerHTML = "";
    cuerpo.innerHTML = `<tr><td class="${clase} p-4">${esc(texto)}</td></tr>`;
  }

  // Cargar las asignaciones; la opción «Todas» siempre queda disponible
  try {
    await llenarAsignaciones(asig);
    [...asig.options].forEach((o) => { if (!o.value) o.remove(); }); // quita el aviso "Primero crea una asignación"
  } catch (err) {
    asig.innerHTML = "";
    alerta("No se pudieron cargar las asignaciones: " + err.message, "danger");
  }
  asig.insertAdjacentHTML("afterbegin", '<option value="">Todas</option>');
  asig.value = "";

  async function consultar() {
    grupoAsig.classList.toggle("d-none", tipo.value === "incidentes");

    if (desde.value && hasta.value && desde.value > hasta.value) {
      return mensajeTabla("La fecha «Desde» no puede ser posterior a «Hasta».", "text-danger");
    }

    const q = new URLSearchParams();
    if (asig.value && tipo.value !== "incidentes") q.set("asignacionId", asig.value);
    if (desde.value) q.set("desde", desde.value);
    if (hasta.value) q.set("hasta", hasta.value);

    mensajeTabla("Consultando…");
    try {
      datos = await api("/reportes/" + tipo.value + (q.toString() ? "?" + q : ""));
      titulo.textContent = tipo.options[tipo.selectedIndex].text;

      if (!datos.filas.length) return mensajeTabla(SIN_DATOS[tipo.value]);

      encabezado.innerHTML = "<tr>" + datos.columnas.map((c) => `<th>${esc(c)}</th>`).join("") + "</tr>";
      cuerpo.innerHTML = datos.filas
        .map((f) => "<tr>" + f.map((c) => `<td>${esc(c)}</td>`).join("") + "</tr>")
        .join("");
    } catch (err) {
      datos = null;
      mensajeTabla("Error: " + err.message, "text-danger");
    }
  }

  function exportarCsv() {
    if (!datos || !datos.filas.length) return alerta("Primero realiza una consulta con resultados", "warning");
    const celda = (c) => {
      let s = String(c);
      if (/^[=+\-@]/.test(s)) s = "'" + s; // evita fórmulas al abrir en Excel
      return '"' + s.replace(/"/g, '""') + '"';
    };
    const texto = [datos.columnas, ...datos.filas].map((f) => f.map(celda).join(",")).join("\n");
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(new Blob(["\ufeff" + texto], { type: "text/csv;charset=utf-8" }));
    enlace.download = "reporte_" + tipo.value + ".csv";
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  }

  [tipo, asig, desde, hasta].forEach((el) => el.addEventListener("change", consultar));
  document.getElementById("btnConsultar").addEventListener("click", consultar);
  document.getElementById("btnImprimir").addEventListener("click", () => window.print());
  document.getElementById("btnCsv").addEventListener("click", exportarCsv);

  consultar(); // muestra resultados apenas se abre la página
})();