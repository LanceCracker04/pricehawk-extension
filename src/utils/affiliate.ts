/**
 * Appends your Amazon Associates tracking tag to a product URL.
 *
 * Get your tag after approval at https://affiliate-program.amazon.com
 * It looks like "yourname-20". Store it in chrome.storage so you never
 * hard-code it into a published bundle.
 */
// Loads the saved affiliate tag from browser storage so links can use it later.
export async function getAffiliateTag(): Promise<string | null> {
  const result = await chrome.storage.sync.get("affiliateTag");
  return result.affiliateTag ?? null;
}

// Stores the affiliate tag in browser storage for future use.
export async function setAffiliateTag(tag: string): Promise<void> {
  await chrome.storage.sync.set({ affiliateTag: tag });
}

// Adds or updates the affiliate tag in a URL so Amazon can track the referral.
export function withAffiliateTag(url: string, tag: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("tag", tag);
    return u.toString();
  } catch {
    return url;
  }
}

/** Extracts the ASIN (product id) from a standard Amazon product URL. */
// Pulls the ASIN product ID out of an Amazon product URL.
export function extractAsin(url: string): string | null {
  const match = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  return match ? match[1] : null;
}
