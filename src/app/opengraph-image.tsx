import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

export const alt = "Lecalir Pastanesi — Güzelce, Büyükçekmece. Küçük bir mola, tatlı bir mutluluk.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const photo = await sharp(await readFile(join(process.cwd(), "public/images/hero.webp")))
    .resize(620, 630, { fit: "cover", position: "right" })
    .jpeg({ quality: 85 })
    .toBuffer();

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#F7F1E7", color: "#352519" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "58px 52px", width: 630 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 62, letterSpacing: -3 }}>Lecalir</div>
            <div style={{ marginTop: 6, fontSize: 16, letterSpacing: 7 }}>PASTANESİ</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ width: 60, height: 2, background: "#B89A67", marginBottom: 28 }} />
            <div style={{ fontSize: 49, lineHeight: 1.18, letterSpacing: -2 }}>Küçük bir mola,</div>
            <div style={{ fontSize: 49, lineHeight: 1.18, letterSpacing: -2, color: "#414A2D" }}>tatlı bir mutluluk.</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 18 }}>
            <div style={{ height: 8, width: 8, borderRadius: "50%", background: "#414A2D" }} />
            Güzelce · Büyükçekmece
          </div>
        </div>
        {/* ImageResponse embeds the bytes; the card never fetches third-party images. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={`data:image/jpeg;base64,${photo.toString("base64")}`} width={570} height={630} style={{ objectFit: "cover" }} />
      </div>
    ),
    size,
  );
}
