import { getProducts } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json({ products: getProducts() }, { headers: { "Cache-Control": "no-store" } });
}
