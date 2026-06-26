import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateJATSXML } from "@/lib/xml/jatsGenerator";
import { generatePMCXML, generateSciELOXML } from "@/lib/xml/specializedGenerators";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { title, abstract, keywords } = await req.json();

    // 1. Update the Metadata based on the user's manual review edits
    await db.metadata.update({
      where: { articleId: resolvedParams.id },
      data: { title, abstract, keywords }
    });

    // 2. Fetch full metadata
    const metadata = await db.metadata.findUnique({
      where: { articleId: resolvedParams.id }
    });

    if (!metadata) return NextResponse.json({ error: "Metadata not found" }, { status: 404 });

    // 3. Generate XML Formats
    const jatsXml = generateJATSXML(metadata);
    const pmcXml = generatePMCXML(metadata);
    const scieloXml = generateSciELOXML(metadata);

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
