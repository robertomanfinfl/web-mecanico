import { cache } from "react";
import { database } from "./db";
import { servicios, taller } from "./taller";

const initialWorkshop = {
  id: 1, name: taller.nombre, headline: "Tu auto, en\nbuenas manos.",
  introduction: "Mantención, diagnóstico y reparación.",
  benefitsTitle: "Tu visita, paso a paso",
  benefits: "Cotiza según tu vehículo\nIndica el modelo y describe lo que necesitas revisar.\nCoordina tu visita\nElige un horario de preferencia. El taller revisará tu solicitud.",
  address: null, hours: null, whatsapp: taller.whatsapp ?? null,
};

export const publicContent = cache(async () => {
  if (!process.env.DATABASE_URL) return {
    workshop: initialWorkshop,
    services: servicios.map(({ id, nombre, descripcion }) => ({ id, name: nombre, description: descripcion, price: null })),
    media: [] as { id: string; alt: string }[],
    provisional: true,
  };
  const db = database();
  const [workshop, services, media] = await Promise.all([
    db.workshop.findUnique({ where: { id: 1 } }),
    db.service.findMany({ orderBy: { createdAt: "asc" } }),
    db.media.findMany({ where: { isPublic: true }, select: { id: true, alt: true }, orderBy: { createdAt: "desc" } }),
  ]);
  return { workshop: workshop ?? initialWorkshop, services, media, provisional: !workshop };
});

export function mediaUrl(id: string) {
  return "/api/imagenes/" + encodeURIComponent(id);
}
