import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
       return NextResponse.json({ error: "User ID not found in session" }, { status: 401 });
    }

    // Fetch the 10 most recent uploads by this user
    const articles = await db.article.findMany({
      where: { uploaderId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        originalFileName: true,
        status: true,
        createdAt: true
      }
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
