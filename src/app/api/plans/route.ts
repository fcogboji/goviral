import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public API: Returns active plans for the pricing page */
export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
    });

    return NextResponse.json({
      success: true,
      plans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        priceNGN: p.priceNGN,
        priceGBP: p.priceGBP,
        yearlyMonthlyPrice: p.yearlyMonthlyPrice,
        yearlyMonthlyPriceNGN: p.yearlyMonthlyPriceNGN,
        yearlyMonthlyPriceGBP: p.yearlyMonthlyPriceGBP,
        description: p.description,
        features: p.features,
        trialDays: p.trialDays,
      })),
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
