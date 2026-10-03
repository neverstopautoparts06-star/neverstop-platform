import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // 1. Product category
  const shockAbsorberCategory = await prisma.productCategory.upsert({
    where: {
      slug: "shock-absorber",
    },
    update: {},
    create: {
      nameVi: "Giảm xóc ô tô",
      nameEn: "Shock Absorber",
      nameZh: "汽车减震器",
      slug: "shock-absorber",
    },
  });

  // 2. Vehicle brand
  const toyota = await prisma.vehicleBrand.upsert({
    where: {
      slug: "toyota",
    },
    update: {},
    create: {
      name: "Toyota",
      slug: "toyota",
    },
  });

  // 3. Vehicle model
  const vios = await prisma.vehicleModel.upsert({
    where: {
      brandId_slug: {
        brandId: toyota.id,
        slug: "vios",
      },
    },
    update: {},
    create: {
      brandId: toyota.id,
      name: "Vios",
      slug: "vios",
    },
  });

  // 4. Vehicle variant
  let ncp150 = await prisma.vehicleVariant.findFirst({
    where: {
      vehicleModelId: vios.id,
      modelCode: "NCP150",
      yearFrom: 2014,
    },
  });

  if (!ncp150) {
    ncp150 = await prisma.vehicleVariant.create({
      data: {
        vehicleModelId: vios.id,
        modelCode: "NCP150",
        yearFrom: 2014,
        displayName: "Toyota Vios NCP150 / 2014-",
      },
    });
  }

  // 5. Front shock absorber
  const frontProduct = await prisma.product.upsert({
    where: {
      partNumber: "2025-D641-302F",
    },
    update: {},
    create: {
      partNumber: "2025-D641-302F",
      slug: "2025-d641-302f",
      nameVi: "Giảm xóc trước Toyota Vios NCP150",
      nameEn: "Front Shock Absorber Toyota Vios NCP150",
      nameZh: "Toyota Vios NCP150 前减震器",
      categoryId: shockAbsorberCategory.id,
      axle: "FRONT",
      side: "BOTH",
    },
  });

  // 6. Rear shock absorber
  const rearProduct = await prisma.product.upsert({
    where: {
      partNumber: "2025-C315-252R",
    },
    update: {},
    create: {
      partNumber: "2025-C315-252R",
      slug: "2025-c315-252r",
      nameVi: "Giảm xóc sau Toyota Vios NCP150",
      nameEn: "Rear Shock Absorber Toyota Vios NCP150",
      nameZh: "Toyota Vios NCP150 后减震器",
      categoryId: shockAbsorberCategory.id,
      axle: "REAR",
      side: "BOTH",
    },
  });

  // 7. OE numbers
  const oeFront = await prisma.oeNumber.upsert({
    where: {
      number: "K3330017",
    },
    update: {},
    create: {
      number: "K3330017",
    },
  });

  const oeRear = await prisma.oeNumber.upsert({
    where: {
      number: "48530-0D520",
    },
    update: {},
    create: {
      number: "48530-0D520",
    },
  });

  // 8. Link OE numbers to products
  await prisma.productOeNumber.upsert({
    where: {
      productId_oeNumberId: {
        productId: frontProduct.id,
        oeNumberId: oeFront.id,
      },
    },
    update: {},
    create: {
      productId: frontProduct.id,
      oeNumberId: oeFront.id,
    },
  });

  await prisma.productOeNumber.upsert({
    where: {
      productId_oeNumberId: {
        productId: rearProduct.id,
        oeNumberId: oeRear.id,
      },
    },
    update: {},
    create: {
      productId: rearProduct.id,
      oeNumberId: oeRear.id,
    },
  });

  // 9. Vehicle fitment
  await prisma.productFitment.upsert({
    where: {
      productId_vehicleVariantId: {
        productId: frontProduct.id,
        vehicleVariantId: ncp150.id,
      },
    },
    update: {},
    create: {
      productId: frontProduct.id,
      vehicleVariantId: ncp150.id,
    },
  });

  await prisma.productFitment.upsert({
    where: {
      productId_vehicleVariantId: {
        productId: rearProduct.id,
        vehicleVariantId: ncp150.id,
      },
    },
    update: {},
    create: {
      productId: rearProduct.id,
      vehicleVariantId: ncp150.id,
    },
  });

  // 10. Inventory locations
  const store = await prisma.inventoryLocation.upsert({
    where: {
      code: "STORE-HANOI",
    },
    update: {},
    create: {
      code: "STORE-HANOI",
      name: "Hanoi Store",
      type: "STORE",
    },
  });

  const warehouse = await prisma.inventoryLocation.upsert({
    where: {
      code: "WAREHOUSE-HANOI",
    },
    update: {},
    create: {
      code: "WAREHOUSE-HANOI",
      name: "Hanoi Warehouse",
      type: "WAREHOUSE",
    },
  });

  // 11. Inventory balances
  // Use 0 until real stock data is imported.
  for (const product of [frontProduct, rearProduct]) {
    for (const location of [store, warehouse]) {
      await prisma.inventoryBalance.upsert({
        where: {
          productId_locationId: {
            productId: product.id,
            locationId: location.id,
          },
        },
        update: {},
        create: {
          productId: product.id,
          locationId: location.id,
          quantity: 0,
          reservedQuantity: 0,
        },
      });
    }
  }

  console.log("✅ NEVERSTOP seed completed");
  console.log("Toyota → Vios → NCP150 / 2014-");
  console.log("2025-D641-302F");
  console.log("2025-C315-252R");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });