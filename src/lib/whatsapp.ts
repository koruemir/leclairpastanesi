import { money } from "@/lib/cart";
import type { CheckoutDetails, ResolvedCartLine } from "@/lib/types";

export function validateCheckout(
  details: CheckoutDetails,
): Partial<Record<keyof CheckoutDetails, string>> {
  const errors: Partial<Record<keyof CheckoutDetails, string>> = {};
  if (!details.name.trim()) errors.name = "Lütfen adınızı ve soyadınızı yazın.";
  if (details.name.length > 100) errors.name = "Ad soyad en fazla 100 karakter olabilir.";
  if (details.fulfillment === "delivery") {
    if (!details.neighborhood.trim()) errors.neighborhood = "Lütfen teslimat mahallesini yazın.";
    if (!details.address.trim()) errors.address = "Lütfen sokak, bina ve daire bilgilerini yazın.";
    if (details.neighborhood.length > 120)
      errors.neighborhood = "Mahalle en fazla 120 karakter olabilir.";
    if (details.address.length > 500) errors.address = "Adres en fazla 500 karakter olabilir.";
  }
  if (details.note.length > 500) errors.note = "Not en fazla 500 karakter olabilir.";
  return errors;
}

export function buildOrderMessage(lines: ResolvedCartLine[], details: CheckoutDetails): string {
  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const content = [
    "Merhaba Lecalir Pastanesi, sipariş talebimi iletmek istiyorum.",
    ...(lines.some((line) => line.product.isDemo)
      ? ["ÖRNEK SİPARİŞ — ürünler ve fiyatlar demo içeriğidir."]
      : []),
    "",
    `Ad soyad: ${details.name.trim()}`,
    "",
    "ÜRÜNLER",
    ...lines.map(
      (line, index) =>
        `${index + 1}. ${line.product.name} — ${line.variant.label}\n   ${line.quantity} adet × ${money(line.variant.price)} = ${money(line.subtotal)}`,
    ),
    "",
    `Ürün toplamı: ${money(total)}`,
    "",
    `Teslim şekli: ${details.fulfillment === "delivery" ? "Paket servis" : "Mağazadan teslim alma"}`,
    ...(details.fulfillment === "delivery"
      ? [
          `Mahalle: ${details.neighborhood.trim()}`,
          `Adres: ${details.address.trim()}`,
          "Teslimat uygunluğu ve ücretini öğrenmek istiyorum.",
        ]
      : []),
    ...(details.note.trim() ? ["", `Sipariş notu: ${details.note.trim()}`] : []),
    "",
    "Ürün uygunluğu ve teslim zamanını teyit edebilir misiniz?",
  ];
  return content.join("\n");
}

export function whatsappUrl(phone: string, message: string): string | null {
  // Only explicit international digits are accepted; never guess a recipient.
  if (!/^[1-9]\d{7,14}$/.test(phone)) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
