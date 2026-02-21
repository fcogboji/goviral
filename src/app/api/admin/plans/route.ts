import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/access-control";
import { validateRequest, planCreateSchema } from "@/lib/validations";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await requireAdmin(user.id);

    const plans = await prisma.plan.findMany({
      orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
      include: {
        _count: {
          select: { subscriptions: true, payments: true },
        },
      },
    });

    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await requireAdmin(user.id);

    const body = await req.json();
    const validation = validateRequest(planCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    const {
      name,
      price,
      priceNGN,
      priceGBP,
      yearlyMonthlyPrice,
      yearlyMonthlyPriceNGN,
      yearlyMonthlyPriceGBP,
      description,
      features,
      maxPosts,
      maxPlatforms,
      maxWhatsAppMessages,
      trialDays,
      sortOrder,
      isActive,
    } = validation.data;

    const existing = await prisma.plan.findUnique({
      where: { name: name.trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Plan "${name}" already exists` },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.create({
      data: {
        name: name.trim(),
        price,
        priceNGN: priceNGN ?? null,
        priceGBP: priceGBP ?? null,
        yearlyMonthlyPrice: yearlyMonthlyPrice ?? null,
        yearlyMonthlyPriceNGN: yearlyMonthlyPriceNGN ?? null,
        yearlyMonthlyPriceGBP: yearlyMonthlyPriceGBP ?? null,
        description: description ?? null,
        features,
        maxPosts,
        maxPlatforms,
        maxWhatsAppMessages,
        trialDays: trialDays ?? 7,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
