import type { Cart, CartItem, Product } from "@prisma/client";

export type CartWithItems = Cart & {
  items: Array<CartItem & { product: Product }>;
};
