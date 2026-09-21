import type { BusinessConfig } from "@/lib/types";

function validOrigin(value: string | undefined): string {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.origin : "";
  } catch {
    return "";
  }
}

export const business: BusinessConfig = {
  name: "Lecalir Pastanesi",
  location: "Güzelce, Büyükçekmece",
  city: "İstanbul",
  district: "Büyükçekmece",
  neighborhood: "Güzelce",
  address: "",
  postalCode: "",
  phone: "",
  whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "",
  hours: [],
  mapsUrl:
    "https://www.google.com/maps/place/Ekleristan+G%C3%BCzelce/@41.0047232,28.5121116,17z/data=!3m1!4b1!4m6!3m5!1s0x14b55f12a7b4729f:0x730fa26de63c0e28!8m2!3d41.0047192!4d28.5146919!16s%2Fg%2F11xpb0fhxc",
  siteUrl: validOrigin(process.env.NEXT_PUBLIC_SITE_URL),
  verified: false,
  liveRequested: process.env.NEXT_PUBLIC_SITE_LIVE === "true",
};
