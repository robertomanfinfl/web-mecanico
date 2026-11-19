export const taller = {
  nombre: "Taller Umbral",
  whatsapp: process.env.WORKSHOP_WHATSAPP,
};

export const servicios = [
  { id: "mantencion", nombre: "Mantención preventiva", descripcion: "Aceite, filtros y revisión general." },
  { id: "diagnostico", nombre: "Diagnóstico", descripcion: "Revisión de fallas, ruidos y testigos del tablero." },
  { id: "frenos", nombre: "Frenos", descripcion: "Revisión de discos, pastillas y funcionamiento." },
] as const;
