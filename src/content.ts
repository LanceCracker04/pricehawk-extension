import { extractAsin } from "./utils/affiliate";
import { STORAGE_KEY, type TrackedProduct, type TrackedProductMap } from "./types";

console.log("🔥 PRICEHAWK CONTENT SCRIPT IS RUNNING 🔥", window.location.href);

/**
 * Runs on every Amazon product page. Reads the current price straight out
 * of the DOM (no API needed) and saves/updates it in chrome.storage.
 * The popup reads from the same storage to render the tracked list.
 */
function readPriceFromPage(): number | null {
  const selectors = [
    "span.a-price span.a-offscreen",
    "#priceblock_ourprice",
    "#priceblock_dealprice",
  ];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el?.textContent) {
      const cleaned = el.textContent.replace(/[^0-9.]/g, "");
      const price = parseFloat(cleaned);
      if (!Number.isNaN(price)) return price;
    }
  }
  return null;
}

function readTitleFromPage(): string {
  const el = document.querySelector("#productTitle");
  return el?.textContent?.trim() ?? document.title;
}

async function trackCurrentPage(): Promise<void> {
  const asin = extractAsin(location.href);
  const price = readPriceFromPage();
  if (!asin || price === null) return;

  const title = readTitleFromPage();
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const products: TrackedProductMap = stored[STORAGE_KEY] ?? {};

  const existing = products[asin];
  const updated: TrackedProduct = {
    asin,
    title,
    url: location.href.split("?")[0],
    currentPrice: price,
    lowestPrice: existing ? Math.min(existing.lowestPrice, price) : price,
    currency: "USD",
    lastCheckedAt: Date.now(),
  };

  products[asin] = updated;
  await chrome.storage.local.set({ [STORAGE_KEY]: products });

  if (existing && price < existing.currentPrice) {
    chrome.runtime.sendMessage({ type: "PRICE_DROP", product: updated });
  }
}

// Amazon pages render prices client-side, so give the DOM a moment.
window.setTimeout(trackCurrentPage, 1500);
