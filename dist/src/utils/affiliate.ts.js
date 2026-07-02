export async function getAffiliateTag() {
  const result = await chrome.storage.sync.get("affiliateTag");
  return result.affiliateTag ?? null;
}
export async function setAffiliateTag(tag) {
  await chrome.storage.sync.set({ affiliateTag: tag });
}
export function withAffiliateTag(url, tag) {
  try {
    const u = new URL(url);
    u.searchParams.set("tag", tag);
    return u.toString();
  } catch {
    return url;
  }
}
export function extractAsin(url) {
  const match = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  return match ? match[1] : null;
}
