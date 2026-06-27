import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    const resetToken = await db.resetToken.findUnique({
      where: { token }
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await db.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword }
    });

    // Delete used token
    await db.resetToken.delete({
      where: { id: resetToken.id }
    });

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("Password confirm error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
