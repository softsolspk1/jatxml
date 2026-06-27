import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    
    // Only Admin or Editorial Manager can delete articles
    if (!session || (role !== 'ADMIN' && role !== 'EDITORIAL_MANAGER')) {
      return NextResponse.json({ error: "Unauthorized. You do not have permission to delete articles." }, { status: 403 });
    }

    const resolvedParams = await params;
    
    // Prisma Cascade delete will automatically clean up Metadata, Authors, References, Figures, etc.
    await db.article.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Delete article error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
