import type { CartItem, Product } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PricedCartItem = Pick<CartItem, "quantity" | "unitPrice" | "taxRate">;

export function calculateLineTotals(quantity: number, unitPrice: number, taxRate: number) {
  const lineSubtotal = quantity * unitPrice;
  const lineTax = Math.round(lineSubtotal * (taxRate / 100));
  return {
    lineSubtotal,
    lineTax,
    lineTotal: lineSubtotal + lineTax
  };
}

export function calculateCartTotals(items: PricedCartItem[], discountTotal = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxTotal = items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.unitPrice * (item.taxRate / 100)),
    0
  );
  return {
    subtotal,
    taxTotal,
    discountTotal,
    grandTotal: Math.max(0, subtotal + taxTotal - discountTotal)
  };
}

export async function recalculateCart(cartId: string) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: true }
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const totals = calculateCartTotals(cart.items, cart.discountTotal);

  return prisma.cart.update({
    where: { id: cartId },
    data: {
      ...totals,
      lastActivityAt: new Date()
    },
    include: {
      items: {
        include: { product: true },
        orderBy: { scannedAt: "desc" }
      }
    }
  });
}

export function productToCartLine(product: Pick<Product, "price" | "taxRate">, quantity: number) {
  const totals = calculateLineTotals(quantity, product.price, product.taxRate);
  return {
    quantity,
    unitPrice: product.price,
    taxRate: product.taxRate,
    ...totals
  };
}
