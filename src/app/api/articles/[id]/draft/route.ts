import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role === 'REVIEWER') {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const resolvedParams = await params;
    const { 
      title, runningTitle, subtitle, abstract, keywords, 
      doi, journalName, volume, issue, pages, publicationDate,
      fundingInfo, grantNumbers, conflictOfInterest, ethicalApproval, acknowledgements, 
      structuredAuthors, structuredReferences 
    } = await req.json();

    // No strict validation for Drafts! Just save whatever we have.

    await db.metadata.update({
      where: { articleId: resolvedParams.id },
      data: { 
        title, runningTitle, subtitle, abstract, keywords, 
        doi, journalName, volume, issue, pages, 
        publicationDate: publicationDate ? new Date(publicationDate) : null,
        fundingInfo, grantNumbers, conflictOfInterest, ethicalApproval, acknowledgements 
      }
    });

    if (structuredAuthors && Array.isArray(structuredAuthors)) {
      await db.author.deleteMany({ where: { articleId: resolvedParams.id } });
      for (const a of structuredAuthors) {
         await db.author.create({
           data: { 
             articleId: resolvedParams.id, name: a.name || '', affiliation: a.affiliation || '',
             email: a.email || '', orcid: a.orcid || '', isCorresponding: !!a.isCorresponding, order: a.order ? parseInt(a.order) : 0
           }
         });
      }
    }

    if (structuredReferences && Array.isArray(structuredReferences)) {
      await db.reference.deleteMany({ where: { articleId: resolvedParams.id } });
      for (const r of structuredReferences) {
         await db.reference.create({
           data: { 
             articleId: resolvedParams.id, rawText: r.rawText || '', doi: r.doi || null, pmid: r.pmid || null, year: r.year || null 
           }
         });
      }
    }

    // Save Article History Snapshot
    await db.articleHistory.create({
      data: {
        articleId: resolvedParams.id,
        userId: (session.user as any)?.id || null,
        metadataSnapshot: JSON.stringify({ title, abstract, authors: structuredAuthors, references: structuredReferences })
      }
    });

    return NextResponse.json({ success: true, message: "Draft saved successfully" });

  } catch (error) {
    console.error("Draft Save error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
