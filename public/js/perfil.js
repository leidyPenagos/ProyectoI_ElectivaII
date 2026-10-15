(async function () {
  const { api, alerta } = Aula;
  const nombre = document.getElementById("nombre");
  const correo = document.getElementById("correo");
  const actual = document.getElementById("passwordActual");
  const nueva = document.getElementById("passwordNueva");

  try {
    const p = await api("/auth/perfil");
    nombre.value = p.nombre;
    correo.value = p.correo;
  } catch (err) {
    alerta(err.message, "danger");
  }

  document.getElementById("formPerfil").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = { nombre: nombre.value };
    if (nueva.value) {
      body.passwordActual = actual.value;
      body.passwordNueva = nueva.value;
    }
    try {
      const p = await api("/auth/perfil", { method: "PATCH", body });
      Aula.guardarSesion(Aula.token(), p);
      document.getElementById("nombreDocente").textContent = p.nombre;
      actual.value = "";
      nueva.value = "";
      alerta("Perfil actualizado");
    } catch (err) {
      alerta(err.message, "danger");
    }
  });
})();