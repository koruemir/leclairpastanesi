export function parsePrice(value: unknown): number {
  if (typeof value !== "string" || !/^\d{1,7}([.,]\d{1,2})?$/.test(value.trim()))
    throw new Error("Fiyatı 95 veya 95,50 biçiminde girin.");
  const [whole, fraction = ""] = value.trim().replace(",", ".").split(".");
  const price = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (price > 100_000_000) throw new Error("Fiyat en fazla 1.000.000 TL olabilir.");
  return price;
}
export function slugify(value: string) {
  return (
    value
      .toLocaleLowerCase("tr-TR")
      .replace(/ı/g, "i")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 90) || "urun"
  );
}
export function requiredText(data: FormData, key: string, label: string, max: number) {
  const value = data.get(key);
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    throw new Error(`${label} zorunludur; en fazla ${max} karakter olabilir.`);
  return value.trim();
}
