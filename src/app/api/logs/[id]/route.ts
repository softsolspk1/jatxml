import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const resolvedParams = await params;
    
    await db.systemLog.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({ message: "Log entry deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete log entry" }, { status: 500 });
  }
}
