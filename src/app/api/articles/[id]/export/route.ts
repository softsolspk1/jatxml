import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateJATSXML } from "@/lib/xml/jatsGenerator";
import { generatePMCXML, generateSciELOXML } from "@/lib/xml/specializedGenerators";
import { generateCrossrefXML } from "@/lib/xml/crossrefGenerator";
import { convertToHTML } from "@/lib/xml/htmlConverter";
import { validateXMLStructure } from "@/lib/xml/validator";
import JSZip from "jszip";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const article = await db.article.findUnique({
      where: { id: resolvedParams.id },
      include: { metadata: true, references: true, figures: true, tables: true }
    });

    if (!article || !article.metadata) {
      return NextResponse.json({ error: "Article or Metadata not found" }, { status: 404 });
    }

    // 1. Generate XMLs & HTML
    const jatsXml = generateJATSXML(article.metadata);
    const pmcXml = generatePMCXML(article.metadata);
    const scieloXml = generateSciELOXML(article.metadata);
    const crossrefXml = generateCrossrefXML(article.metadata, article.references);
    const htmlContent = convertToHTML(article.metadata, article.references, article.figures);

    // 2. Validate against PMC guidelines
    const validation = validateXMLStructure(pmcXml);
    
    // Save validation status
    await db.article.update({
      where: { id: resolvedParams.id },
      data: { status: validation.isValid ? "READY_FOR_EXPORT" : "VALIDATION_FAILED" }
    });

    // 3. Package into ZIP
    const zip = new JSZip();
    zip.file("jats.xml", jatsXml);
    zip.file("pmc.xml", pmcXml);
    zip.file("scielo.xml", scieloXml);
    zip.file("crossref.xml", crossrefXml);
    zip.file("article.html", htmlContent);
    
    // Create a validation report
    const report = `JATS XML Platform - Validation Report\n=====================================\n\nStatus: ${validation.isValid ? 'PASSED' : 'FAILED'}\n\nErrors/Warnings:\n${validation.errors.length > 0 ? validation.errors.join('\n') : 'None. Structurally perfect.'}`;
    zip.file("validation_report.txt", report);

    const zipBuffer = await zip.generateAsync({ type: "uint8array" });

    return new NextResponse(zipBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="JATS_${article.originalFileName}.zip"`
      }
    });

  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export ZIP package" }, { status: 500 });
  }
}
