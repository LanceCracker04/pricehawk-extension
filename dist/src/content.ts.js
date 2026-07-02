import { extractAsin } from "/src/utils/affiliate.ts.js";
import { STORAGE_KEY } from "/src/types.ts.js";
console.log("🔥 PRICEHAWK CONTENT SCRIPT IS RUNNING 🔥", window.location.href);
function readPriceFromPage() {
  const selectors = [
    "span.a-price span.a-offscreen",
    "#priceblock_ourprice",
    "#priceblock_dealprice"
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
function readTitleFromPage() {
  const el = document.querySelector("#productTitle");
  return el?.textContent?.trim() ?? document.title;
}
async function trackCurrentPage() {
  const asin = extractAsin(location.href);
  const price = readPriceFromPage();
  if (!asin || price === null) return;
  const title = readTitleFromPage();
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const products = stored[STORAGE_KEY] ?? {};
  const existing = products[asin];
  const updated = {
    asin,
    title,
    url: location.href.split("?")[0],
    currentPrice: price,
    lowestPrice: existing ? Math.min(existing.lowestPrice, price) : price,
    currency: "USD",
    lastCheckedAt: Date.now()
  };
  products[asin] = updated;
  await chrome.storage.local.set({ [STORAGE_KEY]: products });
  if (existing && price < existing.currentPrice) {
    chrome.runtime.sendMessage({ type: "PRICE_DROP", product: updated });
  }
}
window.setTimeout(trackCurrentPage, 1500);
