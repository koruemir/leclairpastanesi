import { CartProvider } from "@/components/cart-provider";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getProducts } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider initialProducts={getProducts()}>
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </CartProvider>
  );
}
