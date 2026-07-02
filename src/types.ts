export interface TrackedProduct {
  asin: string; // Amazon product ID, e.g. B0CX23V2ZK
  title: string;
  url: string;
  currentPrice: number;
  lowestPrice: number;
  currency: string;
  lastCheckedAt: number; // epoch ms
}

export type TrackedProductMap = Record<string, TrackedProduct>;

export const STORAGE_KEY = "trackedProducts";
