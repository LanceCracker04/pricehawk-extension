import { useEffect, useState } from "react";
import { STORAGE_KEY, type TrackedProductMap } from "../types";
import { getAffiliateTag, setAffiliateTag, withAffiliateTag } from "../utils/affiliate";

export function Popup() {
  const [products, setProducts] = useState<TrackedProductMap>({});
  const [tag, setTag] = useState("");
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY).then((res) => {
      setProducts(res[STORAGE_KEY] ?? {});
    });
    getAffiliateTag().then((t) => {
      if (t) setTag(t);
    });
  }, []);

  const saveTag = async () => {
    await setAffiliateTag(tagInput.trim());
    setTag(tagInput.trim());
  };

  const list = Object.values(products).sort((a, b) => b.lastCheckedAt - a.lastCheckedAt);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>🦅 PriceHawk</h2>

      {!tag ? (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: "#555" }}>
            Enter your Amazon Associates tag to enable affiliate links:
          </p>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="yourname-20"
            style={{ width: "70%", padding: 4 }}
          />
          <button onClick={saveTag} style={{ marginLeft: 6 }}>
            Save
          </button>
        </div>
      ) : (
        <p style={{ fontSize: 11, color: "#888" }}>Affiliate tag: {tag}</p>
      )}

      {list.length === 0 && (
        <p style={{ fontSize: 13, color: "#555" }}>
          No products tracked yet. Visit an Amazon product page to start.
        </p>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {list.map((p) => (
          <li
            key={p.asin}
            style={{ borderTop: "1px solid #eee", padding: "8px 0", fontSize: 13 }}
          >
            <div style={{ fontWeight: 600, marginBottom: 2 }}>
              {p.title.slice(0, 60)}
              {p.title.length > 60 ? "…" : ""}
            </div>
            <div>
              Now: <strong>${p.currentPrice.toFixed(2)}</strong> · Lowest seen: $
              {p.lowestPrice.toFixed(2)}
            </div>
            <a
              href={tag ? withAffiliateTag(p.url, tag) : p.url}
              target="_blank"
              rel="noreferrer"
            >
              View on Amazon
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
