/**
 * Appends your Amazon Associates tracking tag to a product URL.
 *
 * Get your tag after approval at https://affiliate-program.amazon.com
 * It looks like "yourname-20". Store it in chrome.storage so you never
 * hard-code it into a published bundle.
 */
export async function getAffiliateTag(): Promise<string | null> {
  const result = await chrome.storage.sync.get("affiliateTag");
  return result.affiliateTag ?? null;
}

export async function setAffiliateTag(tag: string): Promise<void> {
  await chrome.storage.sync.set({ affiliateTag: tag });
}

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
export function extractAsin(url: string): string | null {
  const match = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  return match ? match[1] : null;
}
