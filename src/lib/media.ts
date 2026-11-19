import sharp from "sharp";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function validatedImage(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size < 1 || file.size > MAX_IMAGE_SIZE) {
    throw new Error("Selecciona una imagen de hasta 5 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const decoder = sharp(buffer, { limitInputPixels: 20_000_000, failOn: "warning" });
    const { format } = await decoder.metadata();
    if (!format || !["jpeg", "png", "webp"].includes(format)) throw new Error("Formato");
    return new Uint8Array(await decoder.rotate().resize(1800, 1800, { fit: "inside", withoutEnlargement: true }).webp({ quality: 83 }).toBuffer());
  } catch {
    throw new Error("El archivo debe ser una imagen JPG, PNG o WebP válida.");
  }
}
