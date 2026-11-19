"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { database } from "@/lib/db";
import { validatedImage } from "@/lib/media";
import { parseWorkshopTime } from "@/lib/workshop-time";

const text = (max: number) => z.string().trim().min(1).max(max);
const optional = (max: number) => z.string().trim().max(max).nullable().transform((value) => value || null);

function done(): never { redirect("/admin?ok=1"); }
function invalid(): never { redirect("/admin?error=datos"); }

export async function saveWorkshop(data: FormData) {
  await requireAdmin();
  const result = z.object({
    name: text(100), headline: text(140), introduction: text(400), benefitsTitle: text(100),
    benefits: text(1600), address: optional(300), hours: optional(300),
    whatsapp: z.string().trim().regex(/^(56[0-9]{9})?$/).transform((value) => value || null),
  }).safeParse(Object.fromEntries(data));
  if (!result.success) invalid();
  await database().workshop.upsert({
    where: { id: 1 }, create: { id: 1, ...result.data }, update: result.data,
  });
  done();
}

export async function saveService(data: FormData) {
  await requireAdmin();
  const result = z.object({
    id: z.string().trim().max(64),
    name: text(100), description: text(1200),
    price: z.string().regex(/^[0-9]{0,8}$/).transform((value) => value ? Number(value) : null),
  }).safeParse(Object.fromEntries(data));
  if (!result.success) invalid();
  const { id, ...fields } = result.data;
  const db = database();
  if (id) {
    const updated = await db.service.updateMany({ where: { id }, data: fields });
    if (!updated.count) invalid();
  } else {
    await db.service.create({ data: { id: randomUUID(), ...fields } });
  }
  done();
}

export async function deleteService(data: FormData) {
  await requireAdmin();
  const id = String(data.get("id") ?? "");
  if (!id) invalid();
  const db = database();
  await db.$transaction([
    db.service.deleteMany({ where: { id } }),
    db.media.deleteMany({ where: { id: "service-" + id, isPublic: true } }),
  ]);
  done();
}

export async function savePublicImage(data: FormData) {
  await requireAdmin();
  const slot = String(data.get("slot") ?? "");
  const alt = text(160).safeParse(data.get("alt"));
  if (!alt.success) invalid();
  const db = database();
  const isService = slot.startsWith("service-");
  if (!["logo", "hero", "gallery"].includes(slot) && !isService) invalid();

  let bytes: Awaited<ReturnType<typeof validatedImage>>;
  try { bytes = await validatedImage(data.get("image")); }
  catch { redirect("/admin?error=imagen"); }

  const id = slot === "gallery" ? "gallery-" + randomUUID() : slot;
  const image = { bytes, alt: alt.data };
  await db.$transaction(async (tx) => {
    if (isService) {
      const serviceId = slot.slice(8);
      const service = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "Service" WHERE id = ${serviceId} FOR UPDATE`;
      if (!service.length) invalid();
    }
    await tx.media.upsert({
      where: { id, isPublic: true },
      create: { id, isPublic: true, ...image },
      update: image,
    });
  });
  done();
}

export async function deletePublicImage(data: FormData) {
  await requireAdmin();
  const id = String(data.get("id") ?? "");
  await database().media.deleteMany({ where: { id, isPublic: true } });
  done();
}

export async function updateRequest(data: FormData) {
  await requireAdmin();
  const id = String(data.get("id") ?? "");
  const status = z.enum(["ACCEPTED", "REJECTED", "PROPOSED"]).safeParse(data.get("status"));
  if (!status.success) invalid();
  const db = database();
  const request = await db.customerRequest.findUnique({ where: { id } });
  if (!request) invalid();
  let proposedAt: Date | null = null;
  if (status.data === "PROPOSED") {
    if (request.kind !== "BOOKING") invalid();
    proposedAt = await parseWorkshopTime(String(data.get("proposedAt") ?? ""));
    if (!proposedAt) invalid();
  }
  const updated = await db.customerRequest.updateMany({
    where: { id, status: request.status },
    data: { status: status.data, proposedAt },
  });
  if (!updated.count) invalid();
  done();
}

