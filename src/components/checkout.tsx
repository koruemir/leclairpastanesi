"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Eye,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
} from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { QuantitySelector } from "@/components/quantity-selector";
import { WhatsAppIcon } from "@/components/icons";
import { business } from "@/lib/business";
import { money, resolveCart } from "@/lib/cart";
import { buildOrderMessage, validateCheckout, whatsappUrl } from "@/lib/whatsapp";
import type { CheckoutDetails } from "@/lib/types";

const initialDetails: CheckoutDetails = {
  name: "",
  fulfillment: "delivery",
  neighborhood: "",
  address: "",
  note: "",
};

export function Checkout() {
  const { lines, products, refresh, ready, total, count, update, remove } = useCart();
  const [details, setDetails] = useState<CheckoutDetails>(initialDetails);
  const [attempted, setAttempted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [refreshError, setRefreshError] = useState("");
  const [busy, setBusy] = useState(false);
  const reviewedMessage = useRef("");
  const resolved = resolveCart(lines, products);
  const errors = attempted ? validateCheckout(details) : {};
  const message = buildOrderMessage(resolved, details);
  const link = whatsappUrl(business.whatsappPhone, message);
  const validPreview = showPreview && Object.keys(validateCheckout(details)).length === 0;

  function change<K extends keyof CheckoutDetails>(key: K, value: CheckoutDetails[K]) {
    setDetails((current) => ({ ...current, [key]: value }));
    setCopyStatus("");
  }

  async function preview(event: React.FormEvent) {
    event.preventDefault();
    setAttempted(true);
    const currentErrors = validateCheckout(details);
    const firstError = Object.keys(currentErrors)[0];
    if (firstError) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstError}"]`)?.focus();
      return;
    }
    setBusy(true);
    try {
      const current = await refresh();
      reviewedMessage.current = buildOrderMessage(resolveCart(lines, current), details);
      setRefreshError("");
    } catch {
      setRefreshError("Güncel fiyatlar alınamadı. Bağlantınızı kontrol edip tekrar deneyin.");
      return;
    } finally {
      setBusy(false);
    }
    setShowPreview(true);
    requestAnimationFrame(() => {
      previewRef.current?.focus({ preventScroll: true });
      previewRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "nearest",
      });
    });
  }

  async function currentMessage() {
    setBusy(true);
    try {
      const current = await refresh();
      const fresh = buildOrderMessage(resolveCart(lines, current), details);
      if (fresh !== reviewedMessage.current) {
        reviewedMessage.current = fresh;
        setCopyStatus("");
        setRefreshError(
          "Sipariş bilgileri güncellendi. Yeni toplamı ve mesajı inceleyip tekrar deneyin.",
        );
        return null;
      }
      setRefreshError("");
      return fresh;
    } catch {
      setRefreshError("Güncel fiyatlar alınamadı. Bağlantınızı kontrol edip tekrar deneyin.");
      return null;
    } finally {
      setBusy(false);
    }
  }
  async function copyMessage() {
    const fresh = await currentMessage();
    if (!fresh) return;
    try {
      await navigator.clipboard.writeText(fresh);
      setCopyStatus("Mesaj kopyalandı.");
    } catch {
      messageRef.current?.focus();
      messageRef.current?.select();
      setCopyStatus(
        "Otomatik kopyalanamadı. Seçili mesajı kopyalama menüsünden kopyalayabilirsiniz.",
      );
    }
  }
  async function sendMessage() {
    const fresh = await currentMessage();
    if (!fresh) return;
    const url = whatsappUrl(business.whatsappPhone, fresh);
    if (url) window.location.assign(url);
  }

  if (!ready)
    return (
      <div className="cart-loading" role="status">
        Tatlı kutunuz hazırlanıyor…
      </div>
    );
  if (!resolved.length)
    return (
      <section className="empty-cart">
        <span className="empty-cart-icon">
          <ShoppingBag size={39} strokeWidth={1.1} />
        </span>
        <h2>Tatlı kutunuz sizi bekliyor.</h2>
        <p>
          Bir dilim mutlulukla başlayalım.
          <br />
          Menüden sevdiklerinizi seçip sepetinize ekleyin.
        </p>
        <Link href="/menu" className="button button-green">
          Tatlıları Keşfet <ArrowUpRight size={18} />
        </Link>
      </section>
    );

  return (
    <div className="cart-layout">
      <div className="cart-main">
        <div className="cart-section-title">
          <h2>Tatlı kutunuz</h2>
          <span>{count} ürün</span>
        </div>
        <div className="cart-lines">
          {resolved.map((line) => (
            <article className="cart-line" key={`${line.productId}:${line.variantId}`}>
              <Link className="cart-line-image" href={`/urun/${line.product.slug}`}>
                <Image src={line.product.image} alt={line.product.imageAlt} fill sizes="100px" />
              </Link>
              <div className="cart-line-info">
                <Link href={`/urun/${line.product.slug}`}>
                  <h3>{line.product.name}</h3>
                </Link>
                <p>
                  {line.variant.label} <span>·</span> {money(line.variant.price)}
                </p>
                <QuantitySelector
                  quantity={line.quantity}
                  label={`${line.product.name} ${line.variant.label}`}
                  onChange={(quantity) => update(line.productId, line.variantId, quantity)}
                />
              </div>
              <div className="cart-line-end">
                <strong>{money(line.subtotal)}</strong>
                <button
                  type="button"
                  className="remove-button"
                  aria-label={`${line.product.name} ${line.variant.label} sepetten çıkar`}
                  onClick={() => remove(line.productId, line.variantId)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
        <Link href="/menu" className="text-link continue-shopping">
          Bir tatlı daha ekle <ArrowRight size={17} />
        </Link>
        <div className="cart-help">
          <WhatsAppIcon width={25} height={25} />
          <div>
            <strong>Her şey bir mesajla başlar.</strong>
            <p>
              Talebinizi gönderdikten sonra ürün uygunluğu, teslim zamanı ve paket servis ücretini
              mağazamızla netleştirebilirsiniz.
            </p>
          </div>
        </div>
        <p className="sample-note">Bu sepetteki ürün ve fiyatlar örnektir.</p>
      </div>
      <aside className="checkout-panel" aria-label="Teslimat ve sipariş özeti">
        <div className="cart-summary">
          <span>Ürün toplamı</span>
          <strong data-testid="cart-total">{money(total)}</strong>
        </div>
        <p className="delivery-price-note">
          Paket servis ücreti dahil değildir; WhatsApp’ta netleşir.
        </p>
        <form ref={formRef} onSubmit={preview} noValidate>
          <fieldset className="fulfillment-fieldset">
            <legend>Nasıl teslim almak istersiniz?</legend>
            <div className="fulfillment-options">
              <label
                className={`fulfillment-option ${details.fulfillment === "delivery" ? "checked" : ""}`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  value="delivery"
                  checked={details.fulfillment === "delivery"}
                  onChange={() => change("fulfillment", "delivery")}
                  className="visually-hidden"
                />
                <Truck size={22} strokeWidth={1.4} />
                <span>Paket servis</span>
                <span className="variant-dot" />
              </label>
              <label
                className={`fulfillment-option ${details.fulfillment === "pickup" ? "checked" : ""}`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  value="pickup"
                  checked={details.fulfillment === "pickup"}
                  onChange={() => change("fulfillment", "pickup")}
                  className="visually-hidden"
                />
                <Store size={22} strokeWidth={1.4} />
                <span>Mağazadan alım</span>
                <span className="variant-dot" />
              </label>
            </div>
          </fieldset>
          <div className="form-field">
            <label htmlFor="customer-name">
              Ad soyad <span aria-hidden="true">*</span>
            </label>
            <input
              id="customer-name"
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              value={details.name}
              onChange={(event) => change("name", event.target.value)}
              placeholder="Adınız ve soyadınız"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <span id="name-error" className="field-error">
                {errors.name}
              </span>
            )}
          </div>
          {details.fulfillment === "delivery" ? (
            <>
              <div className="form-field">
                <label htmlFor="neighborhood">
                  Mahalle <span aria-hidden="true">*</span>
                </label>
                <input
                  id="neighborhood"
                  name="neighborhood"
                  autoComplete="address-level3"
                  required
                  maxLength={120}
                  value={details.neighborhood}
                  onChange={(event) => change("neighborhood", event.target.value)}
                  placeholder="Örn. Güzelce Mahallesi"
                  aria-invalid={Boolean(errors.neighborhood)}
                  aria-describedby={errors.neighborhood ? "neighborhood-error" : undefined}
                />
                {errors.neighborhood && (
                  <span id="neighborhood-error" className="field-error">
                    {errors.neighborhood}
                  </span>
                )}
              </div>
              <div className="form-field">
                <label htmlFor="address">
                  Açık adres <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  required
                  rows={3}
                  maxLength={500}
                  value={details.address}
                  onChange={(event) => change("address", event.target.value)}
                  placeholder="Sokak, bina no, daire no ve adres tarifi"
                  aria-invalid={Boolean(errors.address)}
                  aria-describedby={errors.address ? "address-error" : "address-hint"}
                />
                {errors.address ? (
                  <span id="address-error" className="field-error">
                    {errors.address}
                  </span>
                ) : (
                  <span id="address-hint" className="field-hint">
                    Bölgenize teslimat uygunluğunu WhatsApp’ta teyit edeceğiz.
                  </span>
                )}
              </div>
            </>
          ) : (
            <p className="pickup-notice">
              <Store size={18} />
              Siparişinizi Güzelce, Büyükçekmece’deki mağazamızdan alabilirsiniz. Teslim zamanı
              WhatsApp’ta netleşir.
            </p>
          )}
          <div className="form-field">
            <label htmlFor="note">
              Sipariş notu <span className="optional">İsteğe bağlı</span>
            </label>
            <textarea
              id="note"
              name="note"
              rows={2}
              maxLength={500}
              value={details.note}
              onChange={(event) => change("note", event.target.value)}
              placeholder="Eklemek istediğiniz bir şey var mı?"
              aria-invalid={Boolean(errors.note)}
              aria-describedby={errors.note ? "note-error" : undefined}
            />
            {errors.note && (
              <span id="note-error" className="field-error">
                {errors.note}
              </span>
            )}
          </div>
          <p className="form-privacy">
            Bilgileriniz yalnızca hazırlanan sipariş mesajına eklenir; bu sitede kalıcı olarak
            saklanmaz.
          </p>
          <button type="submit" disabled={busy} className="button button-green button-wide">
            <Eye size={18} />
            {validPreview ? "Mesaj Önizlemesine Git" : "Sipariş Mesajını Önizle"}
            <ArrowRight size={17} />
          </button>
        </form>
        {refreshError && (
          <p role="alert" className="field-error">
            {refreshError}
          </p>
        )}
        {validPreview && (
          <section
            className="message-preview"
            aria-labelledby="preview-title"
            tabIndex={-1}
            ref={previewRef}
          >
            <div className="preview-heading">
              <WhatsAppIcon width={24} height={24} />
              <h2 id="preview-title">Mesajınız hazır.</h2>
            </div>
            <p>Göndermeden önce son bir göz atın.</p>
            <textarea
              aria-label="WhatsApp sipariş mesajı"
              readOnly
              value={message}
              ref={messageRef}
              rows={12}
            />
            <button
              type="button"
              className="button button-outline button-wide"
              disabled={busy}
              onClick={copyMessage}
            >
              {copyStatus === "Mesaj kopyalandı." ? <Check size={17} /> : <Copy size={17} />}Mesajı
              Kopyala
            </button>
            <p role="status" aria-live="polite" className="copy-status">
              {copyStatus}
            </p>
            {link ? (
              <button
                type="button"
                className="button button-green button-wide"
                disabled={busy}
                onClick={sendMessage}
              >
                <WhatsAppIcon width={23} height={23} />
                WhatsApp’tan Sipariş Ver
                <ArrowUpRight size={17} />
              </button>
            ) : (
              <>
                <button type="button" disabled className="button button-green button-wide">
                  <WhatsAppIcon width={23} height={23} />
                  WhatsApp’tan Sipariş Ver
                </button>
                <p className="field-hint whatsapp-placeholder">
                  Sipariş hattı henüz eklenmedi. Şimdilik mesajınızı önizleyebilir ve
                  kopyalayabilirsiniz.
                </p>
              </>
            )}
            <p className="handoff-note">
              Mesajı WhatsApp’ta göndererek sipariş talebinizi iletebilirsiniz. Sipariş ayrıntıları
              mağaza tarafından teyit edilir.
            </p>
          </section>
        )}
      </aside>
    </div>
  );
}
