"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { database } from "@/lib/db";
import { validatedImage } from "@/lib/media";
import { parseWorkshopTime } from "@/lib/workshop-time";

const schema = z.object({
  servicio: z.string().min(1).max(64),
  marca: z.string().trim().min(1).max(60),
  modelo: z.string().trim().min(1).max(60),
  anio: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  patente: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{4,12}$/),
  telefono: z.string().trim().regex(/^\+?[0-9 ()-]{8,24}$/),
});

async function createRequest(kind: "QUOTE" | "BOOKING", data: FormData) {
  const user = await requireUser();
  const path = kind === "QUOTE" ? "/cotizacion" : "/reservas";
  const db = database();
  const parsed = schema.safeParse(Object.fromEntries(data));
  if (!parsed.success) redirect(path + "?error=datos");
  const fields = parsed.data;
  const service = await db.service.findUnique({ where: { id: fields.servicio } });
  if (!service) redirect(path + "?error=datos");

  const details = kind === "QUOTE" ? String(data.get("detalle") ?? "").trim() : null;
  if (kind === "QUOTE" && (!details || details.length > 2000)) redirect(path + "?error=datos");
  const preferredAt = kind === "BOOKING"
    ? await parseWorkshopTime(String(data.get("fecha") ?? "") + "T" + String(data.get("hora") ?? ""))
    : null;
  if (kind === "BOOKING" && !preferredAt) redirect(path + "?error=datos");

  const files = kind === "QUOTE" ? data.getAll("fotos").filter((file) => !(file instanceof File && file.size === 0)) : [];
  if (files.length > 4) redirect(path + "?error=imagenes");

  const recentWhere = { userId: user.id, createdAt: { gte: new Date(Date.now() - 3600_000) } };
  if (await db.customerRequest.count({ where: recentWhere }) >= 5) redirect(path + "?error=limite");

  const photos: { id: string; bytes: Awaited<ReturnType<typeof validatedImage>>; alt: string; ownerId: string }[] = [];
  try {
    for (const file of files) photos.push({
      id: "quote-" + randomUUID(), bytes: await validatedImage(file), alt: "Foto de cotización", ownerId: user.id,
    });
  } catch {
    redirect(path + "?error=imagenes");
  }
  const created = await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${user.id} FOR UPDATE`;
    if (await tx.customerRequest.count({ where: recentWhere }) >= 5) return false;
    await tx.customerRequest.create({
      data: {
        kind, userId: user.id, serviceName: service.name, make: fields.marca, model: fields.modelo,
        year: fields.anio, plate: fields.patente, phone: fields.telefono, details, preferredAt, photos: { create: photos },
      },
    });
    return true;
  });
  if (!created) redirect(path + "?error=limite");
  redirect("/cuenta?ok=solicitud");
}

export async function submitQuote(data: FormData) { await createRequest("QUOTE", data); }
export async function submitBooking(data: FormData) { await createRequest("BOOKING", data); }
