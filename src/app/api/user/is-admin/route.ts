import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ isAdmin: false });

    const role = user.publicMetadata.role;

    return NextResponse.json({ isAdmin: role === "admin" });
  } catch (err) {
    console.error("is-admin error", err);
    return NextResponse.json({ isAdmin: false });
  }
}
