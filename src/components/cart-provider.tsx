"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { addCartLine, CART_STORAGE_KEY, cartTotal, MAX_QUANTITY, sanitizeCart } from "@/lib/cart";
import type { CartLine, Product } from "@/lib/types";

interface CartContextValue {
  lines: CartLine[];
  products: Product[];
  refresh: () => Promise<Product[]>;
  ready: boolean;
  count: number;
  total: number;
  add: (line: CartLine, productName: string) => void;
  update: (productId: string, variantId: string, quantity: number) => void;
  remove: (productId: string, variantId: string) => void;
}
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  initialProducts,
}: {
  children: React.ReactNode;
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const productsRef = useRef(initialProducts);
  const inflight = useRef<Promise<Product[]> | null>(null);
  const pathname = usePathname();
  const refresh = useCallback((): Promise<Product[]> => {
    if (inflight.current) return inflight.current;
    const request = fetch("/api/catalog", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Fiyatlar güncellenemedi. Lütfen tekrar deneyin.");
        const data = (await response.json()) as { products: Product[] };
        if (!Array.isArray(data.products)) throw new Error("Katalog okunamadı.");
        productsRef.current = data.products;
        setProducts(data.products);
        setLines((current) => sanitizeCart(current, data.products));
        return data.products;
      })
      .finally(() => {
        inflight.current = null;
      });
    inflight.current = request;
    return request;
  }, []);
  useEffect(() => {
    const update = () => {
      void refresh().catch(() => {});
    };
    update();
    window.addEventListener("focus", update);
    return () => window.removeEventListener("focus", update);
  }, [pathname, refresh]);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) setLines(sanitizeCart(JSON.parse(saved), productsRef.current));
    } catch {
      /* A blocked or malformed store must not prevent shopping. */
    }
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key !== CART_STORAGE_KEY && event.key !== null) return;
      try {
        setLines(
          sanitizeCart(event.newValue ? JSON.parse(event.newValue) : [], productsRef.current),
        );
      } catch {
        setLines([]);
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* Keep the current tab usable if storage is unavailable. */
    }
  }, [lines, ready]);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timeout);
  }, [notice]);

  const add = useCallback(
    (line: CartLine, productName: string) => {
      const insert = (catalog: Product[]) => {
        if (
          !catalog.some(
            (p) => p.id === line.productId && p.variants.some((v) => v.id === line.variantId),
          )
        ) {
          setNotice("Bu ürün artık satışta değil.");
          return;
        }
        setLines((current) => addCartLine(current, line, catalog));
        setNotice(`${productName} sepetinize eklendi.`);
      };
      if (productsRef.current.some((p) => p.id === line.productId)) insert(productsRef.current);
      else
        void refresh()
          .then(insert)
          .catch(() => setNotice("Katalog güncellenemedi. Lütfen yeniden deneyin."));
    },
    [refresh],
  );
  const update = useCallback((productId: string, variantId: string, quantity: number) => {
    setLines((current) =>
      current.map((line) =>
        line.productId === productId && line.variantId === variantId
          ? { ...line, quantity: Math.max(1, Math.min(MAX_QUANTITY, Math.floor(quantity))) }
          : line,
      ),
    );
  }, []);
  const remove = useCallback((productId: string, variantId: string) => {
    setLines((current) =>
      current.filter((line) => !(line.productId === productId && line.variantId === variantId)),
    );
    setNotice("Ürün sepetinizden çıkarıldı.");
  }, []);
  const value = useMemo(
    () => ({
      lines,
      products,
      refresh,
      ready,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      total: cartTotal(lines, products),
      add,
      update,
      remove,
    }),
    [lines, products, refresh, ready, add, update, remove],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`toast ${notice ? "toast-visible" : ""}`}
      >
        {notice && (
          <>
            <Check size={18} />
            <span>{notice}</span>
          </>
        )}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside CartProvider");
  return cart;
}
