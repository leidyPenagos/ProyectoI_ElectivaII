(function () {
  if (Aula.token()) { location.href = "/dashboard"; return; }
  const mensaje = document.getElementById("mensaje");

  async function enviar(ruta, cuerpo) {
    mensaje.classList.add("d-none");
    try {
      const r = await Aula.api(ruta, { method: "POST", body: cuerpo });
      Aula.guardarSesion(r.token, r.docente);
      location.href = "/dashboard";
    } catch (err) {
      mensaje.textContent = err.message;
      mensaje.classList.remove("d-none");
    }
  }

  document.getElementById("formLogin").addEventListener("submit", (e) => {
    e.preventDefault();
    enviar("/auth/login", {
      correo: document.getElementById("loginCorreo").value,
      password: document.getElementById("loginPassword").value,
    });
  });

  document.getElementById("formRegistro").addEventListener("submit", (e) => {
    e.preventDefault();
    enviar("/auth/register", {
      nombre: document.getElementById("regNombre").value,
      correo: document.getElementById("regCorreo").value,
      password: document.getElementById("regPassword").value,
    });
  });
})();