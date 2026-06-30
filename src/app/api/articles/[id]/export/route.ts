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
    const format = req.nextUrl.searchParams.get('format') || 'zip';
    const resolvedParams = await params;
    const article = await db.article.findUnique({
      where: { id: resolvedParams.id },
      include: { metadata: true, references: true, figures: true, tables: true, authors: { orderBy: { order: 'asc' } } }
    });

    if (!article || !article.metadata) {
      return NextResponse.json({ error: "Article or Metadata not found" }, { status: 404 });
    }

    // 1. Generate core XMLs & HTML
    const jatsXml = generateJATSXML(article);
    const pmcXml = generatePMCXML(article);
    const scieloXml = generateSciELOXML(article);
    const crossrefXml = generateCrossrefXML(article.metadata, article.references);
    const htmlContent = convertToHTML(article.metadata, article.authors, article.references, article.figures, article.tables, (article as any).supplementaryFiles || []);

    // 2. Validation Checks
    const validation = validateXMLStructure(pmcXml);
    const isOverallValid = validation.compliance.pmc && validation.compliance.scielo && validation.compliance.jats;
    await db.article.update({
      where: { id: resolvedParams.id },
      data: { status: isOverallValid ? "READY_FOR_EXPORT" : "VALIDATION_FAILED" }
    });

    const report = `JATS XML Platform - Validation Report\n=====================================\n\nJATS Compliance: ${validation.compliance.jats ? 'PASSED' : 'FAILED'}\nPMC Compliance: ${validation.compliance.pmc ? 'PASSED' : 'FAILED'}\nSciELO Compliance: ${validation.compliance.scielo ? 'PASSED' : 'FAILED'}\n\nErrors:\n${validation.errors.length > 0 ? validation.errors.join('\n') : 'None.'}\n\nWarnings:\n${validation.warnings.length > 0 ? validation.warnings.join('\n') : 'None.'}`;

    // 3. Package generation based on requested format
    
    // FORMAT: Raw XML
    if (format === 'xml') {
      const safeName = (article.originalFileName || 'article').replace(/[^a-zA-Z0-9.\-_]/g, '_');
      return new NextResponse(jatsXml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml',
          'Content-Disposition': `attachment; filename="JATS_${safeName}.xml"`
        }
      });
    }

    // FORMAT: Raw HTML
    if (format === 'html') {
      const safeName = (article.originalFileName || 'article').replace(/[^a-zA-Z0-9.\-_]/g, '_');
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${safeName}.html"`
        }
      });
    }

    const zip = new JSZip();

    // Helper to package figures
    const addFiguresToZip = () => {
      if (article.figures && article.figures.length > 0) {
        const imgFolder = zip.folder("images");
        article.figures.forEach((fig, idx) => {
          if (fig.base64Data) {
            // Strip data:image/... prefix
            const base64Content = fig.base64Data.replace(/^data:image\/[^;]+;base64,/, "");
            imgFolder?.file(`figure_${idx + 1}.png`, base64Content, { base64: true });
          }
        });
      }
    };

    // FORMAT: Complete ZIP
    if (format === 'zip') {
      zip.file("jats.xml", jatsXml);
      zip.file("pmc.xml", pmcXml);
      zip.file("scielo.xml", scieloXml);
      zip.file("crossref.xml", crossrefXml);
      zip.file("article.html", htmlContent);
      zip.file("validation_report.txt", report);
      addFiguresToZip();
    }
    // FORMAT: PMC Package
    else if (format === 'pmc') {
      zip.file("pmc.xml", pmcXml);
      zip.file("pmc_validation_report.txt", report);
      addFiguresToZip();
    }
    // FORMAT: SciELO Package
    else if (format === 'scielo') {
      zip.file("scielo.xml", scieloXml);
      zip.file("scielo_validation_report.txt", report);
      addFiguresToZip();
    }
    else {
      return NextResponse.json({ error: "Invalid format requested" }, { status: 400 });
    }

    const zipBuffer = await zip.generateAsync({ type: "uint8array" });
    const safeNameZip = (article.originalFileName || 'article').replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = format === 'zip' ? `JATS_COMPLETE_${safeNameZip}.zip` :
                     format === 'pmc' ? `PMC_${safeNameZip}.zip` :
                     `SCIELO_${safeNameZip}.zip`;

    return new NextResponse(zipBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export ZIP package" }, { status: 500 });
  }
}
