export interface ConflictResult {
  ok: boolean;
  message?: string;
}

export function detectDuplicateProducts(items: { product: string }[]): ConflictResult {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.product)) {
      return { ok: false, message: "This product is already added to the order." };
    }
    seen.add(item.product);
  }
  return { ok: true };
}
