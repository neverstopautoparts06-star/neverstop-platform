import "dotenv/config";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma";
import type { VehicleBrand, ProductResults } from "../src/lib/catalog-types";

const base = process.env.CATALOG_TEST_URL ?? "http://localhost:3000";
const tag = "catalog-test-" + Date.now();
async function get(path: string) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  const body = await response.json();
  assert.equal(body.success, true, path);
  return body;
}
async function run() {
  try {
    const initial: { data: VehicleBrand[] } = await get("/api/vehicles");
    const toyota = initial.data.find((brand) => brand.name === "Toyota");
    const vios = toyota?.models.find((model) => model.name === "Vios");
    const ncp150 = vios?.variants.find((variant) => variant.modelCode === "NCP150");
    assert.ok(ncp150, "Seeded Toyota/Vios/NCP150 exists");
    const seeded: ProductResults = await get("/api/products?variantId=" + ncp150.id + "&year=2014");
    assert.ok(seeded.data.some((product) => product.partNumber === "2025-D641-302F"));
    assert.ok(seeded.data.some((product) => product.partNumber === "2025-C315-252R"));
    const part: ProductResults = await get("/api/products?q=%202025-d641-302f%20");
    assert.equal(part.data.length, 1);
    assert.equal(part.data[0].partNumber, "2025-D641-302F");
    const oe = part.data[0].oeNumbers[0];
    assert.ok(oe, "Seeded OE number exists");
    const byOe: ProductResults = await get("/api/products?q=" + encodeURIComponent(oe));
    assert.ok(byOe.data.some((product) => product.id === part.data[0].id));
    assert.equal((await get("/api/products?variantId=" + ncp150.id + "&year=2013")).data.length, 0);
    assert.equal((await get("/api/products?q=no-such-part-" + tag)).data.length, 0);
    for (const invalid of ["year=abc", "page=0", "page=1.5", "year=2014", "q=" + "x".repeat(101)]) {
      assert.equal((await fetch(base + "/api/products?" + invalid)).status, 400);
    }
    const brand = await prisma.vehicleBrand.create({ data: { name: tag, slug: tag, models: { create: { name: tag, slug: tag, variants: { create: { modelCode: tag, yearFrom: 2000, yearTo: 2002 } } } } }, include: { models: { include: { variants: true } } } });
    const model = brand.models[0]; const variant = model.variants[0];
    const location = await prisma.inventoryLocation.create({ data: { code: tag, name: tag, type: "WAREHOUSE" } });
    const product = await prisma.product.create({ data: { partNumber: tag, slug: tag, nameVi: tag, fitments: { create: { vehicleVariantId: variant.id } }, inventory: { create: { locationId: location.id, quantity: 8, reservedQuantity: 3 } } } });
    const search = "/api/products?variantId=" + variant.id;
    assert.equal((await get(search + "&year=2000")).data[0].availableQuantity, 5);
    assert.equal((await get(search + "&year=2002")).data.length, 1);
    assert.equal((await get(search + "&year=2003")).data.length, 0);
    await prisma.inventoryLocation.update({ where: { id: location.id }, data: { isActive: false } });
    assert.equal((await get(search)).data[0].availableQuantity, 0);
    await prisma.product.update({ where: { id: product.id }, data: { status: "INACTIVE" } });
    assert.equal((await get(search)).data.length, 0);
    await prisma.product.update({ where: { id: product.id }, data: { status: "ACTIVE" } });
    await prisma.vehicleVariant.update({ where: { id: variant.id }, data: { isActive: false } });
    assert.equal((await get(search)).data.length, 0);
    let vehicles: { data: VehicleBrand[] } = await get("/api/vehicles");
    assert.equal(vehicles.data.find((row) => row.id === brand.id)?.models[0].variants.length, 0);
    await prisma.vehicleVariant.update({ where: { id: variant.id }, data: { isActive: true } });
    await prisma.vehicleModel.update({ where: { id: model.id }, data: { isActive: false } });
    assert.equal((await get(search)).data.length, 0);
    vehicles = await get("/api/vehicles");
    assert.equal(vehicles.data.find((row) => row.id === brand.id)?.models.length, 0);
    await prisma.vehicleModel.update({ where: { id: model.id }, data: { isActive: true } });
    await prisma.vehicleBrand.update({ where: { id: brand.id }, data: { isActive: false } });
    assert.equal((await get(search)).data.length, 0);
    vehicles = await get("/api/vehicles");
    assert.equal(vehicles.data.some((row) => row.id === brand.id), false);
    console.log("PASS: seeded fitment, part/OE search, empty results, validation, year bounds, inactive hierarchy/products, available stock");
  } finally {
    await prisma.product.deleteMany({ where: { slug: tag } });
    await prisma.vehicleBrand.deleteMany({ where: { slug: tag } });
    await prisma.inventoryLocation.deleteMany({ where: { code: tag } });
    await prisma.$disconnect();
  }
}
run().catch(() => { console.error("Catalog integration checks failed"); process.exitCode = 1; });
