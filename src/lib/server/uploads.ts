import "server-only";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { dataDirectory } from "./database";
export const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;
export async function savePhoto(file: File) {
  if (!file.size || file.size > MAX_UPLOAD_SIZE)
    throw new Error("Fotoğraf en fazla 8 MB olabilir.");
  const bytes = Buffer.from(await file.arrayBuffer());
  let output: Buffer;
  try {
    const image = sharp(bytes, { limitInputPixels: 40_000_000, animated: false });
    const metadata = await image.metadata();
    if (
      !metadata.format ||
      !["jpeg", "png", "webp"].includes(metadata.format) ||
      (metadata.pages || 1) > 1
    )
      throw new Error();
    output = await image
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    throw new Error("Geçerli bir JPEG, PNG veya WebP fotoğrafı yükleyin.");
  }
  const directory = join(dataDirectory(), "uploads");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const filename = `${randomUUID()}.webp`;
  await writeFile(join(directory, filename), output, { flag: "wx", mode: 0o600 });
  return `/media/${filename}`;
}
export async function removePhoto(image: string) {
  await unlink(join(dataDirectory(), "uploads", image.split("/").pop()!)).catch(() => {});
}
