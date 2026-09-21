"use client";
import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { categories } from "@/data/categories";
import type { Product } from "@/lib/types";
import {
  createProductAction,
  loginAction,
  orderAction,
  pricesAction,
  type ActionResult,
} from "./actions";
function Status({ state }: { state: ActionResult }) {
  return (
    <div aria-live="polite" className={state.error ? "admin-error" : "admin-success"}>
      {state.error || state.success}
    </div>
  );
}
export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <section className="admin-login admin-card">
      <span className="eyebrow">LECALİR YÖNETİM</span>
      <h1>Hoş geldiniz.</h1>
      <p>Menünüzü düzenlemek için yönetici şifrenizi girin.</p>
      <form action={action}>
        <label className="admin-field">
          Yönetici şifresi
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            maxLength={1024}
          />
        </label>
        <Status state={state} />
        <button className="button button-green button-wide" disabled={pending}>
          {pending ? "Kontrol ediliyor…" : "Giriş Yap"}
        </button>
      </form>
    </section>
  );
}
function PriceForm({ product }: { product: Product }) {
  const [state, action, pending] = useActionState(pricesAction, {});
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      product.variants.map((v) => [v.id, (v.price / 100).toFixed(2).replace(".", ",")]),
    ),
  );
  return (
    <form action={action} className="admin-prices">
      <input type="hidden" name="id" value={product.id} />
      <div className="admin-price-fields">
        {product.variants.map((v) => (
          <label className="admin-field" key={v.id}>
            {v.label} · TL
            <input
              aria-label={`${product.name} ${v.label} fiyatı`}
              name={`price:${v.id}`}
              value={values[v.id]}
              onChange={(event) =>
                setValues((current) => ({ ...current, [v.id]: event.target.value }))
              }
              inputMode="decimal"
              required
              maxLength={10}
            />
          </label>
        ))}
      </div>
      <button disabled={pending} className="button button-outline">
        {pending ? "Kaydediliyor…" : "Kaydet"}
      </button>
      <Status state={state} />
    </form>
  );
}
export function ProductManager({ products }: { products: Product[] }) {
  const [items, setItems] = useState(products);
  const [dirty, setDirty] = useState(false);
  const [state, setState] = useState<ActionResult>({});
  const [pending, startTransition] = useTransition();
  function move(index: number, delta: number) {
    setItems((current) => {
      const next = [...current];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      return next;
    });
    setDirty(true);
    setState({});
  }
  return (
    <>
      <div className="admin-order">
        <div>
          <strong>{items.length} ürün</strong>
          <p>Oklarla sıralayın. Değişiklikler kaydettiğinizde mağazaya yansır.</p>
        </div>
        <button
          className="button button-green"
          disabled={!dirty || pending}
          onClick={() =>
            startTransition(async () => {
              try {
                const result = await orderAction(items.map((p) => p.id));
                setState(result);
                if (result.success) setDirty(false);
              } catch {
                setState({ error: "Bağlantı kurulamadı. Tekrar deneyin." });
              }
            })
          }
        >
          {pending ? "Kaydediliyor…" : "Sıralamayı Kaydet"}
        </button>
      </div>
      <Status state={state} />
      <div className="admin-list">
        {items.map((product, index) => (
          <article className="admin-card admin-product" key={product.id}>
            <div className="admin-product-heading">
              <Image src={product.image} alt={product.imageAlt} width={76} height={76} />
              <div>
                <span className="admin-category">
                  {categories.find((c) => c.slug === product.category)?.name}
                </span>
                <h2>{product.name}</h2>
                <a
                  className="text-link"
                  href={`/urun/${product.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ürünü gör ↗
                </a>
              </div>
              <div className="admin-sort">
                <button
                  type="button"
                  disabled={index === 0 || pending}
                  onClick={() => move(index, -1)}
                  aria-label={`${product.name} yukarı taşı`}
                >
                  <ArrowUp size={18} />
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1 || pending}
                  onClick={() => move(index, 1)}
                  aria-label={`${product.name} aşağı taşı`}
                >
                  <ArrowDown size={18} />
                </button>
              </div>
            </div>
            <PriceForm product={product} />
          </article>
        ))}
      </div>
    </>
  );
}
export function NewProductForm() {
  const [state, action, pending] = useActionState(createProductAction, {});
  const [, submitTransition] = useTransition();
  const [options, setOptions] = useState([0]);
  const [nextId, setNextId] = useState(1);
  const [fileError, setFileError] = useState("");
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        submitTransition(() => action(data));
      }}
      className="admin-card admin-new"
    >
      <fieldset disabled={pending}>
        <div className="admin-form-grid">
          <label className="admin-field">
            Ürün adı
            <input name="name" required maxLength={100} />
          </label>
          <label className="admin-field">
            Kategori
            <select name="category" required>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="admin-field">
          Kısa açıklama
          <input name="subtitle" required maxLength={160} />
        </label>
        <label className="admin-field">
          Detay açıklaması
          <textarea name="description" required maxLength={2000} rows={4} />
        </label>
        <label className="admin-field">
          Ürün fotoğrafı
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file && file.size > 8 * 1024 * 1024) {
                event.target.value = "";
                setFileError("Fotoğraf en fazla 8 MB olabilir.");
              } else setFileError("");
            }}
          />
          <span className="field-hint">
            JPEG, PNG veya WebP · En fazla 8 MB. Fotoğraf otomatik küçültülür.
          </span>
        </label>
        {fileError && (
          <p role="alert" className="admin-error">
            {fileError}
          </p>
        )}
        <div className="admin-variant-heading">
          <h2>Satış seçenekleri</h2>
          <button
            type="button"
            className="button button-outline"
            disabled={options.length >= 10}
            onClick={() => {
              setOptions([...options, nextId]);
              setNextId(nextId + 1);
            }}
          >
            <Plus size={16} />
            Seçenek ekle
          </button>
        </div>
        {options.map((id, index) => (
          <div className="admin-variant" key={id}>
            <label className="admin-field">
              Seçenek {index + 1}
              <input
                name="variantLabel"
                placeholder="Örn. Adet veya 6 kişilik"
                required
                maxLength={60}
              />
            </label>
            <label className="admin-field">
              Fiyat · TL
              <input
                name="variantPrice"
                inputMode="decimal"
                placeholder="95,50"
                required
                maxLength={10}
              />
            </label>
            <button
              type="button"
              className="admin-icon-button"
              aria-label={`Seçenek ${index + 1} kaldır`}
              disabled={options.length === 1}
              onClick={() => setOptions(options.filter((value) => value !== id))}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <label className="admin-checkbox">
          <input type="checkbox" name="featured" />
          Ana sayfada göster
        </label>
        <p className="field-hint">
          Ürün menünün sonuna eklenir. Sırasını ürün listesinden değiştirebilirsiniz.
        </p>
        <Status state={state} />
        <button className="button button-green" disabled={pending}>
          {pending ? "Ürün ekleniyor…" : "Ürünü Ekle"}
        </button>
      </fieldset>
    </form>
  );
}
