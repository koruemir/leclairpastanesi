import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/server/auth";
import { NewProductForm } from "../ui";
export default async function NewProductPage() {
  if (!(await isAdmin())) redirect("/admin");
  return (
    <>
      <Link href="/admin" className="text-link">
        ← Ürünlere dön
      </Link>
      <div className="admin-title">
        <div>
          <span className="eyebrow">MENÜYE BİR TATLI DAHA</span>
          <h1>Yeni ürün</h1>
          <p>Ürününüzü fotoğrafı ve satış seçenekleriyle ekleyin.</p>
        </div>
      </div>
      <NewProductForm />
    </>
  );
}
