import { getDatabase } from "@/lib/server/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export function GET() {
  try {
    // Opening the database also verifies the mounted directory and initializes a new store.
    getDatabase().prepare("SELECT id FROM products LIMIT 1").get();
    return Response.json({ status: "ok" }, { headers });
  } catch (error) {
    console.error("Readiness check failed:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ status: "unavailable" }, { status: 503, headers });
  }
}
