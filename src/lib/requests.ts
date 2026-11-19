export const statusLabel = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
  PROPOSED: "Horario propuesto",
} as const;

export function requestError(code?: string) {
  switch (code) {
    case "datos": return "Revisa el servicio, los datos del vehículo y el teléfono. Para reservas, elige una fecha y hora futuras.";
    case "imagenes": return "Adjunta hasta cuatro imágenes JPG, PNG o WebP válidas de hasta 5 MB cada una.";
    case "limite": return "Alcanzaste el límite de solicitudes. Intenta más tarde.";
  }
}
