import type { CartItem, Product } from "@prisma/client";

type ItemWithProduct = CartItem & { product: Product };

const pairings: Record<string, string[]> = {
  Produce: ["Reusable produce bags", "Greek yogurt", "Granola"],
  Bakery: ["Peanut butter", "Fruit jam", "Cheese slices"],
  Beverages: ["Ice cubes", "Travel tumbler", "Protein snack"]
};

export function getMockRecommendations(items: ItemWithProduct[]) {
  const categories = new Set(items.map((item) => item.product.category).filter(Boolean));
  const suggestions = Array.from(categories).flatMap((category) => pairings[category ?? ""] ?? []);

  return Array.from(new Set(suggestions)).slice(0, 6).map((name, index) => ({
    id: `suggestion-${index}`,
    name,
    reason: "Pairs well with items already in this cart"
  }));
}
