import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/access-control";
import { validateRequest, planUpdateSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subscriptions: true, payments: true },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Error fetching plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await req.json();
    const validation = validateRequest(planUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    const existing = await prisma.plan.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (validation.data.name && validation.data.name !== existing.name) {
      const nameTaken = await prisma.plan.findUnique({
        where: { name: validation.data.name.trim() },
      });
      if (nameTaken) {
        return NextResponse.json(
          { error: `Plan "${validation.data.name}" already exists` },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    const allowed = [
      "name",
      "price",
      "priceNGN",
      "priceGBP",
      "yearlyMonthlyPrice",
      "yearlyMonthlyPriceNGN",
      "yearlyMonthlyPriceGBP",
      "description",
      "features",
      "maxPosts",
      "maxPlatforms",
      "maxWhatsAppMessages",
      "trialDays",
      "sortOrder",
      "isActive",
    ];
    for (const key of allowed) {
      const val = (validation.data as Record<string, unknown>)[key];
      if (val !== undefined) {
        updateData[key] = val;
      }
    }
    if (updateData.name) {
      updateData.name = (updateData.name as string).trim();
    }

    const plan = await prisma.plan.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan._count.subscriptions > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete plan with ${plan._count.subscriptions} active subscription(s). Deactivate it instead.`,
        },
        { status: 400 }
      );
    }

    await prisma.plan.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting plan:", error);
    return NextResponse.json(
      { error: "Failed to delete plan" },
      { status: 500 }
    );
  }
}
