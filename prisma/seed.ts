import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const store = await prisma.store.upsert({
    where: { code: "BLR-DEMO-01" },
    update: {},
    create: {
      name: "FreshMart Self Checkout",
      code: "BLR-DEMO-01",
      address: "Demo Retail Street",
      city: "Bengaluru",
      latitude: 12.9716,
      longitude: 77.5946
    }
  });

  const products = [
    {
      name: "Organic Bananas",
      barcode: "8901000000011",
      sku: "FRUIT-BANANA-ORG",
      category: "Produce",
      price: 8900,
      taxRate: 0,
      stock: 120,
      imageUrl: "/product-images/bananas.jpg",
      modelUrl: "/models/banana.glb",
      modelFormat: "glb"
    },
    {
      name: "Whole Wheat Bread",
      barcode: "8901000000028",
      sku: "BAKERY-BREAD-WW",
      category: "Bakery",
      price: 6500,
      taxRate: 5,
      stock: 80,
      imageUrl: "/product-images/bread.jpg",
      modelUrl: "/models/bread.glb",
      modelFormat: "glb"
    },
    {
      name: "Cold Brew Coffee",
      barcode: "8901000000035",
      sku: "DRINK-COFFEE-CB",
      category: "Beverages",
      price: 14900,
      taxRate: 18,
      stock: 60,
      imageUrl: "/product-images/coffee.jpg",
      modelUrl: "/models/can.glb",
      modelFormat: "glb"
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        storeId_barcode: {
          storeId: store.id,
          barcode: product.barcode
        }
      },
      update: product,
      create: {
        ...product,
        storeId: store.id
      }
    });
  }

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off demo checkout carts above INR 250",
      discountPercent: 10,
      minCartAmount: 25000
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
