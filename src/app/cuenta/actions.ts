"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authentication, requireUser } from "@/lib/auth";
import { database } from "@/lib/db";
import { validatedImage } from "@/lib/media";

export async function signOut() {
  await authentication().api.signOut({ headers: await headers() });
  redirect("/ingresar");
}

export async function updateProfile(data: FormData) {
  const user = await requireUser();
  const name = String(data.get("name") ?? "").trim();
  if (!name || name.length > 100) redirect("/cuenta?error=nombre");
  await database().user.update({ where: { id: user.id }, data: { name } });
  redirect("/cuenta?ok=perfil");
}

export async function updateAvatar(data: FormData) {
  const user = await requireUser();
  let bytes: Awaited<ReturnType<typeof validatedImage>>;
  try {
    bytes = await validatedImage(data.get("image"));
  } catch {
    redirect("/cuenta?error=imagen");
  }
  const id = "avatar-" + user.id;
  await database().media.upsert({
    where: { id },
    create: { id, ownerId: user.id, bytes, alt: "Foto de perfil" },
    update: { bytes },
  });
  redirect("/cuenta?ok=foto");
}

export async function deleteAvatar() {
  const user = await requireUser();
  await database().media.deleteMany({ where: { id: "avatar-" + user.id, ownerId: user.id } });
  redirect("/cuenta?ok=foto");
}
