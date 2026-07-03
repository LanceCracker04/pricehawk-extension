import { useEffect, useMemo, useState } from "react";
import {
  STORAGE_KEY,
  type TrackedProduct,
  type TrackedProductMap,
} from "../types";
import {
  getAffiliateTag,
  setAffiliateTag,
  withAffiliateTag,
} from "../utils/affiliate";
import "./popup.css";

function formatPrice(price: number, currency: string): string {
  const safeCurrency = currency === "PHP" ? "PHP" : "USD";

  return new Intl.NumberFormat(safeCurrency === "PHP" ? "en-PH" : "en-US", {
    style: "currency",
    currency: safeCurrency,
  }).format(price);
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function cleanAmazonUrl(product: TrackedProduct): string {
  return `https://www.amazon.com/dp/${product.asin}`;
}

export function Popup() {
  const [products, setProducts] = useState<TrackedProductMap>({});
  const [tag, setTag] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY).then((res) => {
      setProducts(res[STORAGE_KEY] ?? {});
    });

    getAffiliateTag().then((savedTag) => {
      if (savedTag) {
        setTag(savedTag);
        setTagInput(savedTag);
      }
    });
  }, []);

  const productList = useMemo(() => {
    return Object.values(products).sort(
      (a, b) => b.lastCheckedAt - a.lastCheckedAt
    );
  }, [products]);

  const saveTag = async () => {
    const trimmedTag = tagInput.trim();

    if (!trimmedTag) {
      setStatus("Enter your Amazon Associates tag first.");
      return;
    }

    await setAffiliateTag(trimmedTag);
    setTag(trimmedTag);
    setStatus("Affiliate tag saved.");
  };

  const clearProducts = async () => {
    await chrome.storage.local.remove(STORAGE_KEY);
    setProducts({});
    setStatus("Tracked products cleared.");
  };

  return (
    <main className="popup">
      <header className="hero">
        <div className="logo">🦅</div>

        <div>
          <p className="eyebrow">Amazon Price Tracker</p>
          <h1>PriceHawk</h1>
          <p className="subtitle">Track products, catch price drops, and open clean Amazon links.</p>
        </div>
      </header>

      <section className="card tag-card">
        <div className="card-header">
          <div>
            <h2>Affiliate tag</h2>
            <p>Add your Amazon Associates tag for popup links.</p>
          </div>

          {tag && <span className="status-pill">Active</span>}
        </div>

        <div className="input-row">
          <input
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            placeholder="yourname-20"
            className="tag-input"
          />

          <button onClick={saveTag} className="primary-button">
            Save
          </button>
        </div>

        {status && <p className="status-text">{status}</p>}

        <p className="disclosure">
          As an Amazon Associate, I may earn from qualifying purchases. This does
          not add extra cost to the buyer.
        </p>
      </section>

      <section className="section-heading">
        <div>
          <h2>Tracked products</h2>
          <p>{productList.length} saved item{productList.length === 1 ? "" : "s"}</p>
        </div>

        {productList.length > 0 && (
          <button onClick={clearProducts} className="ghost-button">
            Clear
          </button>
        )}
      </section>

      {productList.length === 0 ? (
        <section className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>No products yet</h2>
          <p>Visit an Amazon product page and PriceHawk will save it here.</p>
        </section>
      ) : (
        <section className="product-list">
          {productList.map((product) => {
            const cleanUrl = cleanAmazonUrl(product);
            const finalUrl = tag ? withAffiliateTag(cleanUrl, tag) : cleanUrl;

            return (
              <article className="product-card" key={product.asin}>
                <div className="product-meta">
                  <span>{product.asin}</span>
                  <span>{formatDate(product.lastCheckedAt)}</span>
                </div>

                <h3>{product.title}</h3>

                <div className="price-grid">
                  <div>
                    <span className="price-label">Now</span>
                    <strong>
                      {formatPrice(product.currentPrice, product.currency)}
                    </strong>
                  </div>

                  <div>
                    <span className="price-label">Lowest seen</span>
                    <strong>
                      {formatPrice(product.lowestPrice, product.currency)}
                    </strong>
                  </div>
                </div>

                <a
                  className="amazon-link"
                  href={finalUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Amazon
                </a>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}