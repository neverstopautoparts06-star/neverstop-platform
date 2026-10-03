import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await prisma.vehicleBrand.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true, name: true,
        models: {
          where: { isActive: true }, orderBy: { name: "asc" },
          select: {
            id: true, name: true,
            variants: {
              where: { isActive: true }, orderBy: [{ yearFrom: "asc" }, { id: "asc" }],
              select: { id: true, modelCode: true, yearFrom: true, yearTo: true, displayName: true },
            },
          },
        },
      },
    });
    return NextResponse.json({ success: true, data });
  } catch {
    console.error("GET /api/vehicles: database query failed");
    return NextResponse.json({ success: false, error: "Failed to load vehicle data" }, { status: 500 });
  }
}
