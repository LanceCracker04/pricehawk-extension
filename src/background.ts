import type { TrackedProduct } from "./types";

// Fires when content.ts detects a price drop on a page the user visits.
chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "PRICE_DROP") {
    const product = message.product as TrackedProduct;
    chrome.notifications.create(`price-drop-${product.asin}`, {
      type: "basic",
      iconUrl: "public/icons/icon128.png",
      title: "Price drop! 📉",
      message: `${product.title} is now $${product.currentPrice.toFixed(2)}`,
      priority: 1,
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("PriceHawk installed. Browse an Amazon product page to start tracking.");
});
