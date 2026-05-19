-- CreateTable
CREATE TABLE "ProductOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductOptionChoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "optionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "extraPrice" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProductOptionChoice_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "ProductOption" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
