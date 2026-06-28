import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generatePMCXML } from "@/lib/xml/specializedGenerators";
import { validateXMLStructure } from "@/lib/xml/validator";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const article = await db.article.findUnique({
      where: { id: resolvedParams.id },
      include: { metadata: true, references: true, figures: true, tables: true, authors: { orderBy: { order: 'asc' } } }
    });

    if (!article || !article.metadata) {
      return NextResponse.json({ error: "Article or Metadata not found" }, { status: 404 });
    }

    const pmcXml = generatePMCXML(article);
    const validation = validateXMLStructure(pmcXml);

    return NextResponse.json(validation);

  } catch (error) {
    console.error("Validation API error:", error);
    return NextResponse.json({ error: "Failed to run validation" }, { status: 500 });
  }
}
