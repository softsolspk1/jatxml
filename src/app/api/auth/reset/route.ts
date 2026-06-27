import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

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
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login/reset/${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'softsols.pk',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'jatxml@softsols.pk',
        pass: process.env.SMTP_PASS || '??S@ftS@ls123',
      },
    });

    const mailOptions = {
      from: `"JATS XML Portal" <${process.env.SMTP_USER || 'jatxml@softsols.pk'}>`,
      to: email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Please click the following link to set a new password: ${resetLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>You recently requested to reset your password for your JATS XML Portal account.</p>
          <p>Click the button below to set a new password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #2563eb; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reset Password</a>
          <p style="margin-top: 20px; font-size: 0.9rem; color: #6b7280;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      message: "If that email exists, a reset link has been sent."
    }, { status: 200 });

  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
