CREATE TABLE "Store" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "address" TEXT,
  "city" TEXT,
  "country" TEXT DEFAULT 'India',
  "latitude" REAL,
  "longitude" REAL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "storeId" TEXT,
  "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
  "name" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "rewardsId" TEXT,
  "otpCode" TEXT,
  "otpExpires" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "User_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Product" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "storeId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "barcode" TEXT NOT NULL,
  "sku" TEXT,
  "description" TEXT,
  "category" TEXT,
  "price" INTEGER NOT NULL,
  "taxRate" REAL NOT NULL DEFAULT 0,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "imageUrl" TEXT,
  "modelUrl" TEXT,
  "modelFormat" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Cart" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "storeId" TEXT NOT NULL,
  "userId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "subtotal" INTEGER NOT NULL DEFAULT 0,
  "taxTotal" INTEGER NOT NULL DEFAULT 0,
  "discountTotal" INTEGER NOT NULL DEFAULT 0,
  "grandTotal" INTEGER NOT NULL DEFAULT 0,
  "couponCode" TEXT,
  "lockedAt" DATETIME,
  "paidAt" DATETIME,
  "abandonedAt" DATETIME,
  "sessionToken" TEXT NOT NULL,
  "deviceLabel" TEXT,
  "lastActivityAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Cart_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "CartItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "cartId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unitPrice" INTEGER NOT NULL,
  "taxRate" REAL NOT NULL DEFAULT 0,
  "lineSubtotal" INTEGER NOT NULL,
  "lineTax" INTEGER NOT NULL,
  "lineTotal" INTEGER NOT NULL,
  "scannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Transaction" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "cartId" TEXT NOT NULL,
  "userId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "paymentMethod" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "taxAmount" INTEGER NOT NULL,
  "discountAmount" INTEGER NOT NULL DEFAULT 0,
  "providerRef" TEXT,
  "receiptNumber" TEXT NOT NULL,
  "receiptPdfUrl" TEXT,
  "exitQrPayload" TEXT,
  "paidAt" DATETIME,
  "failedReason" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Transaction_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "CartAlert" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "cartId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "isResolved" BOOLEAN NOT NULL DEFAULT false,
  "resolvedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CartAlert_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Coupon" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "description" TEXT,
  "discountPercent" REAL,
  "discountAmount" INTEGER,
  "minCartAmount" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "startsAt" DATETIME,
  "expiresAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "Store_code_key" ON "Store"("code");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_rewardsId_key" ON "User"("rewardsId");
CREATE UNIQUE INDEX "Product_storeId_barcode_key" ON "Product"("storeId", "barcode");
CREATE INDEX "Product_barcode_idx" ON "Product"("barcode");
CREATE INDEX "Product_storeId_idx" ON "Product"("storeId");
CREATE UNIQUE INDEX "Cart_sessionToken_key" ON "Cart"("sessionToken");
CREATE INDEX "Cart_storeId_idx" ON "Cart"("storeId");
CREATE INDEX "Cart_status_idx" ON "Cart"("status");
CREATE INDEX "Cart_lastActivityAt_idx" ON "Cart"("lastActivityAt");
CREATE UNIQUE INDEX "CartItem_cartId_productId_key" ON "CartItem"("cartId", "productId");
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");
CREATE INDEX "CartItem_productId_idx" ON "CartItem"("productId");
CREATE UNIQUE INDEX "Transaction_cartId_key" ON "Transaction"("cartId");
CREATE UNIQUE INDEX "Transaction_receiptNumber_key" ON "Transaction"("receiptNumber");
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");
CREATE INDEX "Transaction_paymentMethod_idx" ON "Transaction"("paymentMethod");
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");
CREATE INDEX "CartAlert_cartId_idx" ON "CartAlert"("cartId");
CREATE INDEX "CartAlert_type_idx" ON "CartAlert"("type");
CREATE INDEX "CartAlert_isResolved_idx" ON "CartAlert"("isResolved");
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
