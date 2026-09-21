import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Diamond } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="not-found container">
      <Diamond />
      <span className="eyebrow">404 · SAYFA BULUNAMADI</span>
      <h1>Bu tatlı vitrinde yok.</h1>
      <p>Aradığınız sayfa taşınmış olabilir. Menümüzde sizi bekleyen lezzetleri keşfedin.</p>
      <Link href="/menu" className="button button-green">
        <ArrowLeft size={18} />
        Menüye Dön
      </Link>
    </div>
  );
}
