import { Breadcrumb } from "@/components/breadcrumb";
import { Checkout } from "@/components/checkout";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Sepetim",
  "Lecalir Pastanesi sepetiniz. Ürünlerinizi inceleyin, teslim şeklini seçin ve sipariş talebinizi WhatsApp’tan iletin.",
  "/sepet",
  true,
);

export default function CartPage() {
  return (
    <div className="container cart-page">
      <Breadcrumb items={[{ name: "Sepetim", href: "/sepet" }]} />
      <div className="page-intro">
        <span className="eyebrow">MUTLULUĞA BİR ADIM DAHA</span>
        <h1>
          Sepetinizde <em>tatlı bir şey var.</em>
        </h1>
        <p>Son bir göz atın, gerisini birlikte netleştirelim.</p>
      </div>
      <Checkout />
    </div>
  );
}
