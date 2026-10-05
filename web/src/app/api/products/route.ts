import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const PAGE_SIZE = 24;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = (params.get("q") ?? "").trim();
  const axle = params.get("axle") ?? "";
  const variantId = params.get("variantId") ?? "";
  const yearText = params.get("year");
  const pageText = params.get("page") ?? "1";
  const year = yearText === null ? null : Number(yearText);
  const page = Number(pageText);
  if ((axle && !["FRONT", "REAR", "OTHER"].includes(axle)) || q.length > 100 || variantId.length > 100 ||
      !/^\d+$/.test(pageText) || !Number.isSafeInteger(page) || page < 1 || page > 10000 ||
      (yearText !== null && (!/^\d{4}$/.test(yearText) || !year || year < 1900 || year > 2100 || !variantId))) {
    return NextResponse.json({ success: false, error: "Invalid search parameters" }, { status: 400 });
  }
  const activeVariant: Prisma.VehicleVariantWhereInput = {
    isActive: true, vehicleModel: { isActive: true, brand: { isActive: true } },
  };
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(axle ? { axle: axle as "FRONT" | "REAR" | "OTHER" } : {}),
    ...(variantId ? { fitments: { some: { vehicleVariant: {
      ...activeVariant, id: variantId,
      ...(year ? { yearFrom: { lte: year }, OR: [{ yearTo: null }, { yearTo: { gte: year } }] } : {}),
    } } } } : {}),
    ...(q ? { OR: [
      { nameVi: { contains: q, mode: "insensitive" } },
      { fitments: { some: { vehicleVariant: { ...activeVariant, vehicleModel: { isActive: true, brand: { isActive: true }, name: { contains: q, mode: "insensitive" } } } } } },
      { nameEn: { contains: q, mode: "insensitive" } },
      { nameZh: { contains: q, mode: "insensitive" } },
      { partNumber: { contains: q, mode: "insensitive" } },
      { oeNumbers: { some: { oeNumber: { number: { contains: q, mode: "insensitive" } } } } },
      { fitments: { some: { vehicleVariant: { ...activeVariant, modelCode: { contains: q, mode: "insensitive" } } } } },
    ] } : {}),
  };
  try {
    const products = await prisma.product.findMany({
      where, orderBy: [{ partNumber: "asc" }, { id: "asc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE + 1,
      select: {
        id: true, slug: true, partNumber: true, nameVi: true, nameEn: true, nameZh: true, axle: true, side: true,
        oeNumbers: { select: { oeNumber: { select: { number: true } } } },
        inventory: { where: { location: { isActive: true } }, select: { quantity: true, reservedQuantity: true } },
        fitments: { where: { vehicleVariant: activeVariant }, select: { vehicleVariant: {
          select: { modelCode: true, yearFrom: true, yearTo: true, vehicleModel: {
            select: { name: true, brand: { select: { name: true } } },
          } },
        } } },
      },
    });
    const data = products.slice(0, PAGE_SIZE).map((product) => ({
      id: product.id, slug: product.slug, nameEn: product.nameEn, nameZh: product.nameZh, partNumber: product.partNumber, nameVi: product.nameVi, axle: product.axle, side: product.side,
      oeNumbers: product.oeNumbers.map(({ oeNumber }) => oeNumber.number),
      availableQuantity: product.inventory.reduce((sum, row) => sum + Math.max(0, row.quantity - row.reservedQuantity), 0),
      fitments: product.fitments.map(({ vehicleVariant: v }) =>
        [v.vehicleModel.brand.name, v.vehicleModel.name, v.modelCode, String(v.yearFrom) + "–" + (v.yearTo ?? "nay")].filter(Boolean).join(" ")),
    }));
    return NextResponse.json({ success: true, data, page, hasMore: products.length > PAGE_SIZE });
  } catch {
    console.error("GET /api/products: database query failed");
    return NextResponse.json({ success: false, error: "Failed to load products" }, { status: 500 });
  }
}
