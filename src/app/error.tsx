"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="not-found container">
      <span className="eyebrow">KÜÇÜK BİR AKSAKLIK</span>
      <h1>Bir daha deneyelim.</h1>
      <p>
        Bu sayfa şu anda görüntülenemedi. Yeniden deneyerek kaldığınız yerden devam edebilirsiniz.
      </p>
      <button className="button button-green" onClick={reset}>
        Yeniden Dene
      </button>
    </div>
  );
}
