(async function () {
  const { api, esc, etiqueta, fecha, mayus, alerta } = Aula;
  const cfg = JSON.parse(document.getElementById("pagina").dataset.modulo);

  const cuerpo = document.getElementById("cuerpo");
  const campos = document.getElementById("camposForm");
  const errorForm = document.getElementById("errorForm");
  const modal = new bootstrap.Modal(document.getElementById("modalForm"));
  const cols = cfg.columnas.map((n) => cfg.campos.find((c) => c.name === n));
  const opciones = {};
  let registros = [];
  let editando = null;

  const idDe = (v) => (v && typeof v === "object" ? v._id : v);

  document.getElementById("encabezado").innerHTML =
    "<tr>" + cols.map((c) => `<th>${esc(c.label)}</th>`).join("") + '<th class="text-end">Acciones</th></tr>';

  function celda(c, v) {
    if (v == null || v === "") return "—";
    switch (c.type) {
      case "ref": return esc(etiqueta(v));
      case "refs": return esc(v.map(etiqueta).join(", ")) || "—";
      case "date": return esc(fecha(v));
      case "checkbox": return v ? '<span class="badge text-bg-success">Sí</span>' : '<span class="badge text-bg-secondary">No</span>';
      case "select": return esc(mayus(v));
      default: return esc(String(v).slice(0, 70));
    }
  }

  function pintar() {
    cuerpo.innerHTML = registros.length
      ? registros.map((r) => `<tr>${cols.map((c) => `<td>${celda(c, r[c.name])}</td>`).join("")}
          <td class="text-end text-nowrap">
            <button class="btn btn-sm btn-outline-primary" data-editar="${r._id}" title="Editar"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" data-borrar="${r._id}" title="${cfg.soft ? "Desactivar" : "Eliminar"}"><i class="bi ${cfg.soft ? "bi-slash-circle" : "bi-trash"}"></i></button>
          </td></tr>`).join("")
      : `<tr><td colspan="${cols.length + 1}" class="text-center text-muted py-4">No hay registros todavía.</td></tr>`;
  }

  async function cargar() {
    registros = await api("/" + cfg.endpoint);
    pintar();
  }

  function crearCampo(c, valor) {
    const id = "f_" + c.name;
    const req = c.required ? " required" : "";
    let input;

    if (c.type === "checkbox") {
      return `<div class="col-12"><div class="form-check form-switch"><input class="form-check-input" type="checkbox" id="${id}"${valor ? " checked" : ""}><label class="form-check-label" for="${id}">${esc(c.label)}</label></div></div>`;
    }
    if (c.type === "textarea") {
      input = `<textarea class="form-control" id="${id}" rows="3"${req}>${esc(valor ?? "")}</textarea>`;
    } else if (c.type === "select") {
      input = `<select class="form-select" id="${id}"${req}>${c.required ? '<option value="">Seleccione…</option>' : '<option value=""></option>'}${c.options.map((o) => `<option value="${esc(o)}"${o === valor ? " selected" : ""}>${esc(mayus(o))}</option>`).join("")}</select>`;
    } else if (c.type === "ref") {
      input = `<select class="form-select" id="${id}"${req}><option value="">Seleccione…</option>${opciones[c.ref].map((o) => `<option value="${o._id}"${o._id === valor ? " selected" : ""}>${esc(etiqueta(o))}</option>`).join("")}</select>`;
    } else if (c.type === "refs") {
      input = `<select class="form-select" id="${id}" multiple size="5"${req}>${opciones[c.ref].map((o) => `<option value="${o._id}"${(valor || []).includes(o._id) ? " selected" : ""}>${esc(etiqueta(o))}</option>`).join("")}</select><div class="form-text">Mantén Ctrl (⌘ en Mac) para elegir varios.</div>`;
    } else {
      const num = c.type === "number"
        ? ` step="${c.step || 1}"${c.min !== undefined ? ` min="${c.min}"` : ""}${c.max !== undefined ? ` max="${c.max}"` : ""}`
        : "";
      input = `<input class="form-control" id="${id}" type="${c.type}"${num} value="${esc(valor ?? "")}" placeholder="${esc(c.placeholder || "")}"${req}>`;
    }
    return `<div class="${c.type === "textarea" ? "col-12" : "col-md-6"}"><label class="form-label" for="${id}">${esc(c.label)}${c.required ? " *" : ""}</label>${input}</div>`;
  }

  function abrir(reg) {
    editando = reg;
    errorForm.classList.add("d-none");
    document.getElementById("tituloModal").textContent = (reg ? "Editar " : "Nuevo ") + cfg.singular;
    campos.innerHTML = cfg.campos.map((c) => {
      let v = reg ? reg[c.name] : c.default;
      if (c.type === "ref") v = idDe(v);
      else if (c.type === "refs") v = (v || []).map(idDe);
      else if (c.type === "date") v = fecha(v);
      return crearCampo(c, v);
    }).join("");
    modal.show();
  }

  function recoger() {
    const datos = {};
    for (const c of cfg.campos) {
      const el = document.getElementById("f_" + c.name);
      let v;
      if (c.type === "checkbox") v = el.checked;
      else if (c.type === "refs") v = [...el.selectedOptions].map((o) => o.value);
      else if (c.type === "number") v = el.value === "" ? "" : Number(el.value);
      else v = el.value.trim();

      const vacio = v === "" || (Array.isArray(v) && !v.length);
      if (vacio) {
        if (editando) {
          if (c.type === "refs") datos[c.name] = [];
          else if (c.type === "text" || c.type === "textarea" || c.type === "email") datos[c.name] = "";
          else if (c.type !== "select") datos[c.name] = null;
        }
        continue;
      }
      datos[c.name] = v;
    }
    return datos;
  }

  document.getElementById("formulario").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api("/" + cfg.endpoint + (editando ? "/" + editando._id : ""), {
        method: editando ? "PATCH" : "POST",
        body: recoger(),
      });
      modal.hide();
      alerta("Guardado correctamente");
      await cargar();
    } catch (err) {
      errorForm.textContent = err.message;
      errorForm.classList.remove("d-none");
    }
  });

  cuerpo.addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.editar) abrir(registros.find((r) => r._id === b.dataset.editar));
    if (b.dataset.borrar && confirm(cfg.soft ? "¿Desactivar este registro?" : "¿Eliminar este registro? Esta acción no se puede deshacer.")) {
      try {
        await api("/" + cfg.endpoint + "/" + b.dataset.borrar, { method: "DELETE" });
        alerta("Operación realizada");
        await cargar();
      } catch (err) {
        alerta(err.message, "danger");
      }
    }
  });

  document.getElementById("btnNuevo").addEventListener("click", () => abrir(null));

  try {
    for (const c of cfg.campos) {
      if ((c.type === "ref" || c.type === "refs") && !opciones[c.ref]) opciones[c.ref] = await api("/" + c.ref);
    }
    await cargar();
  } catch (err) {
    alerta(err.message, "danger");
  }
})();