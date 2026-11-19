const servicio = document.querySelector('select[name="servicio"]');
const preferencia = new URLSearchParams(window.location.search).get("servicio");

if (servicio && Array.from(servicio.options).some((opcion) => opcion.value === preferencia)) {
  servicio.value = preferencia;
}

const fotos = document.querySelector('input[name="fotos"]');
if (fotos) {
  const estado = document.createElement("p");
  estado.setAttribute("role", "status");
  fotos.closest("label").after(estado);

  fotos.addEventListener("change", () => {
    const seleccion = Array.from(fotos.files);
    const tipos = ["image/jpeg", "image/png", "image/webp"];
    const invalida = seleccion.some((foto) => !tipos.includes(foto.type) || foto.size > 5 * 1024 * 1024);

    if (invalida || seleccion.length > 4) {
      fotos.value = "";
      fotos.setAttribute("aria-invalid", "true");
      estado.textContent = "Selecciona hasta 4 fotos JPG, PNG o WebP de máximo 5 MB cada una.";
      return;
    }

    fotos.removeAttribute("aria-invalid");
    estado.textContent = seleccion.length ? "Fotos seleccionadas · " + seleccion.map((foto) => foto.name).join(", ") : "";
  });
}
