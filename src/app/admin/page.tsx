import Link from "next/link";
import { isAdmin } from "@/lib/server/auth";
import { readProducts } from "@/lib/server/database";
import { LoginForm, ProductManager } from "./ui";
import { logoutAction } from "./actions";
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ eklendi?: string }>;
}) {
  if (!(await isAdmin())) return <LoginForm />;
  const added = (await searchParams).eklendi === "1";
  return (
    <>
      <div className="admin-title">
        <div>
          <span className="eyebrow">MENÜNÜZÜ YÖNETİN</span>
          <h1>Ürünler & fiyatlar</h1>
          <p>Fiyatları güncelleyin, tatlılarınızın sırasını belirleyin.</p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/yeni" className="button button-green">
            + Yeni ürün
          </Link>
          <form action={logoutAction}>
            <button className="button button-outline">Çıkış yap</button>
          </form>
        </div>
      </div>
      {added && (
        <p role="status" className="admin-success">
          Ürün eklendi. Menüde görüntülenebilir.
        </p>
      )}
      <ProductManager products={readProducts()} />
    </>
  );
}
