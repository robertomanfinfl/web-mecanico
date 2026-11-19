import { currentUser } from "@/lib/auth";
import { database } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = database();
  const media = await db.media.findUnique({ where: { id }, select: { isPublic: true, ownerId: true, requestId: true } });
  if (!media) return new Response(null, { status: 404 });
  const user = media.isPublic ? null : await currentUser();
  if (!media.isPublic && (!user || (user.id !== media.ownerId && !(media.requestId && user.role === "administrador")))) {
    return new Response(null, { status: 404 });
  }

  const image = await db.media.findFirst({
    where: { id, isPublic: media.isPublic, ownerId: media.ownerId },
    select: { bytes: true },
  });
  if (!image) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": "image/webp",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
