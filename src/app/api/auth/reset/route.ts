import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Return a success response anyway to prevent email enumeration
      return NextResponse.json({ message: "If that email exists, a reset link has been sent." }, { status: 200 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Clear old tokens
    await db.resetToken.deleteMany({
      where: { userId: user.id }
    });

    // Save new token
    await db.resetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    // In a real application, we would send an email here.
    // For this demonstration without an email provider, we return the mock link to the client UI.
    const mockLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login/reset/${token}`;

    return NextResponse.json({ 
      message: "If that email exists, a reset link has been sent.",
      mockLink // ONLY FOR DEMO PURPOSES
    }, { status: 200 });

  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
