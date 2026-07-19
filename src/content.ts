import { extractAsin } from "./utils/affiliate";
import { STORAGE_KEY, type TrackedProduct, type TrackedProductMap } from "./types";

console.log("🔥 PRICEHAWK CONTENT SCRIPT IS RUNNING 🔥", window.location.href);

/**
 * Looks for the displayed price on an Amazon product page and returns it as a number.
 * This helps the extension read the current price directly from the page.
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

// Reads the product title from the page so the extension can show a clear name for the item.
function readTitleFromPage(): string {
  const el = document.querySelector("#productTitle");
  return el?.textContent?.trim() ?? document.title;
}

// Collects the product info from the current page, saves it, and sends a message if the price dropped.
async function trackCurrentPage(): Promise<void> {
  const asin = extractAsin(location.href);
  const price = readPriceFromPage();

  console.log("[PriceHawk] ASIN:", asin);
  console.log("[PriceHawk] Price:", price);

  if (!asin || price === null) {
    console.warn("[PriceHawk] Could not track page. Missing ASIN or price.");
    return;
  }

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
    currency: "PHP",
    lastCheckedAt: Date.now(),
  };

  products[asin] = updated;
  await chrome.storage.local.set({ [STORAGE_KEY]: products });

  console.log("[PriceHawk] Product saved:", updated);

  if (existing && price < existing.currentPrice) {
    chrome.runtime.sendMessage({ type: "PRICE_DROP", product: updated });
  }
}

// Amazon pages render prices client-side, so give the DOM a moment.
window.setTimeout(trackCurrentPage, 1500);
