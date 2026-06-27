import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateJATSXML } from "@/lib/xml/jatsGenerator";
import { generatePMCXML, generateSciELOXML } from "@/lib/xml/specializedGenerators";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { title, abstract, keywords, doi, journalName, fundingInfo, conflictOfInterest, authorsText } = await req.json();

    // 1. Update the Metadata based on the user's manual review edits
    await db.metadata.update({
      where: { articleId: resolvedParams.id },
      data: { title, abstract, keywords, doi, journalName, fundingInfo, conflictOfInterest }
    });

    // Handle Authors (simple overwrite for now based on text)
    if (authorsText !== undefined) {
      // delete existing authors
      await db.author.deleteMany({ where: { articleId: resolvedParams.id } });
      // split by comma and create
      const authors = authorsText.split(',').map((a: string) => a.trim()).filter(Boolean);
      for (const a of authors) {
         let name = a;
         let affiliation = '';
         if (a.includes('(') && a.includes(')')) {
            name = a.split('(')[0].trim();
            affiliation = a.split('(')[1].replace(')', '').trim();
         }
         await db.author.create({
           data: { articleId: resolvedParams.id, name, affiliation }
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
