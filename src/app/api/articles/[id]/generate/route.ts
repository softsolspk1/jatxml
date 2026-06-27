import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateJATSXML } from "@/lib/xml/jatsGenerator";
import { generatePMCXML, generateSciELOXML } from "@/lib/xml/specializedGenerators";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role === 'REVIEWER') {
      return NextResponse.json({ error: "Unauthorized. You do not have permission to generate XML." }, { status: 403 });
    }

    const resolvedParams = await params;
    const { 
      title, runningTitle, subtitle, abstract, keywords, 
      doi, journalName, volume, issue, pages, publicationDate,
      fundingInfo, grantNumbers, conflictOfInterest, ethicalApproval, acknowledgements, 
      structuredAuthors 
    } = await req.json();

    // 1. Update the Metadata based on the user's manual review edits
    await db.metadata.update({
      where: { articleId: resolvedParams.id },
      data: { 
        title, runningTitle, subtitle, abstract, keywords, 
        doi, journalName, volume, issue, pages, 
        publicationDate: publicationDate ? new Date(publicationDate) : null,
        fundingInfo, grantNumbers, conflictOfInterest, ethicalApproval, acknowledgements 
      }
    });

    // Handle Structured Authors array
    if (structuredAuthors && Array.isArray(structuredAuthors)) {
      // delete existing authors
      await db.author.deleteMany({ where: { articleId: resolvedParams.id } });
      // recreate them based on the UI array
      for (const a of structuredAuthors) {
         await db.author.create({
           data: { 
             articleId: resolvedParams.id, 
             name: a.name || '', 
             affiliation: a.affiliation || '',
             email: a.email || '',
             orcid: a.orcid || '',
             isCorresponding: !!a.isCorresponding,
             order: a.order ? parseInt(a.order) : 0
           }
         });
      }
    }

    // 2. Fetch full article with metadata, authors, references
    const article = await db.article.findUnique({
      where: { id: resolvedParams.id },
      include: { metadata: true, authors: true, references: true, figures: true, tables: true }
    });

    if (!article || !article.metadata) return NextResponse.json({ error: "Metadata not found" }, { status: 404 });

    // 3. Generate XML Formats
    const jatsXml = generateJATSXML(article);
    const pmcXml = generatePMCXML(article);
    const scieloXml = generateSciELOXML(article);

    // 4. Save Generated XML to DB (assuming we expand schema to save these, or just update status)
    await db.article.update({
      where: { id: resolvedParams.id },
      data: { status: "XML_GENERATED" }
    });

    // Return the generated XML for the client to preview or download
    return NextResponse.json({ jats: jatsXml, pmc: pmcXml, scielo: scieloXml });

  } catch (error) {
    console.error("XML Generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
