import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { convertToHTML } from "@/lib/xml/htmlConverter";
import JSZip from "jszip";

export async function POST(req: NextRequest) {
  try {
    const { articleIds, format } = await req.json();

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json({ error: "No article IDs provided" }, { status: 400 });
    }

    const articles = await db.article.findMany({
      where: { id: { in: articleIds } },
      include: { metadata: true, references: true, figures: true, tables: true, authors: { orderBy: { order: 'asc' } } }
    });

    if (articles.length === 0) {
      return NextResponse.json({ error: "No articles found" }, { status: 404 });
    }

    const zip = new JSZip();

    for (const article of articles) {
      if (!article.metadata) continue;
      
      const safeName = (article.originalFileName || `article_${article.id}`).replace(/[^a-zA-Z0-9.\-_]/g, '_');
      
      if (format === 'html') {
        const htmlContent = convertToHTML(article.metadata, article.authors, article.references, article.figures, article.tables, (article as any).supplementaryFiles || []);
        zip.file(`${safeName}.html`, htmlContent);
      }
      // Add other formats later if needed
    }

    const zipBuffer = await zip.generateAsync({ type: "uint8array" });

    return new NextResponse(zipBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="Bulk_Export_${format?.toUpperCase() || 'FILES'}.zip"`
      }
    });

  } catch (error) {
    console.error("Bulk export error:", error);
    return NextResponse.json({ error: "Failed to generate bulk export package" }, { status: 500 });
  }
}
