import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;
    
    // Authorization
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const article = await db.article.findUnique({
      where: { id: resolvedParams.id },
      include: { metadata: true }
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (article.status !== "READY_FOR_EXPORT" && article.status !== "VALIDATION_PASSED") {
      return NextResponse.json({ error: "Article is not fully validated and ready for export yet." }, { status: 400 });
    }

    // Update Status to SUBMITTED
    await db.article.update({
      where: { id: resolvedParams.id },
      data: { status: "SUBMITTED" }
    });

    // Log the formal submission action in the history
    await db.articleHistory.create({
      data: {
        articleId: article.id,
        userId: (session.user as any).id,
        metadataSnapshot: JSON.stringify({ 
          action: "Step 7: Formal Submission",
          platforms: ["PubMed Central (PMC)", "SciELO", "Crossref", "DOAJ", "Google Scholar"],
          timestamp: new Date().toISOString()
        })
      }
    });

    // In a real production scenario, here is where we would trigger external API calls to:
    // - Crossref Metadata API
    // - PMC FTP upload
    // - SciELO Submission System

    return NextResponse.json({ success: true, status: "SUBMITTED" });
  } catch (error) {
    console.error("Submission Error:", error);
    return NextResponse.json({ error: "Failed to submit to indexing platforms" }, { status: 500 });
  }
}
