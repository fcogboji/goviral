
// /app/api/notifications/route.ts
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  const user = await currentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { user: { clerkId: user.id } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notifications);
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { message, type = "in-app" } = body;

  const notification = await prisma.notification.create({
    data: {
      user: { connect: { clerkId: user.id } },
      message,
      type,
    },
  });

  return NextResponse.json(notification);
}

export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { id } = body;

  const updated = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  return NextResponse.json(updated);
}