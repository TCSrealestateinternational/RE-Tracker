import type { Deal } from "@/types";

export function calcProjectedCommission(purchasePrice: number, commissionPercent: number): number {
  return Math.round(purchasePrice * commissionPercent / 100);
}

export function ensureProjectedCommission(existing: Deal, patch: Partial<Deal>): Partial<Deal> {
  const priceChanged = "purchasePrice" in patch;
  const pctChanged = "commissionPercent" in patch;
  if (!priceChanged && !pctChanged) return patch;
  if ("projectedCommission" in patch) return patch; // caller already set it (e.g., flat mode)
  const price = patch.purchasePrice ?? existing.purchasePrice;
  const pct = patch.commissionPercent ?? existing.commissionPercent;
  if (pct === 0) return patch; // flat commission — don't recalculate
  return { ...patch, projectedCommission: calcProjectedCommission(price, pct) };
}
