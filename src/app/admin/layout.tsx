import type { Metadata } from "next";
import Link from "next/link";
import "./admin.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Yönetim", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link href="/admin" className="admin-brand">
          Lecalir <span>PASTANESİ · YÖNETİM</span>
        </Link>
        <Link href="/" className="text-link">
          Mağazayı gör ↗
        </Link>
      </header>
      <main id="main-content" className="admin-main">
        {children}
      </main>
    </div>
  );
}
