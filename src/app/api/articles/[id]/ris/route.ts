import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;

  try {
    const article = await db.article.findUnique({
      where: { id: resolvedParams.id },
      include: {
        metadata: true,
        authors: { orderBy: { order: 'asc' } }
      }
    });

    if (!article || !article.metadata) {
      return NextResponse.json({ error: "Article or metadata not found" }, { status: 404 });
    }

    const m = article.metadata;
    const authors = article.authors || [];

    let ris = `TY  - JOUR\r\n`;
    if (m.title) ris += `TI  - ${m.title}\r\n`;
    
    authors.forEach(author => {
      ris += `AU  - ${author.name}\r\n`;
    });

    const journalName = m.journalName || 'Pakistan Journal of Pharmaceutical Sciences';
    ris += `JO  - ${journalName}\r\n`;
    
    if (m.volume) ris += `VL  - ${m.volume}\r\n`;
    if (m.issue) ris += `IS  - ${m.issue}\r\n`;
    
    if (m.pages) {
      const parts = m.pages.split('-');
      if (parts[0]) ris += `SP  - ${parts[0].trim()}\r\n`;
      if (parts[1]) ris += `EP  - ${parts[1].trim()}\r\n`;
    }

    if (m.publicationDate) {
      const d = new Date(m.publicationDate);
      ris += `PY  - ${d.getFullYear()}\r\n`;
      const month = String(d.getMonth() + 1).padStart(2, '0');
      ris += `DA  - ${d.getFullYear()}/${month}\r\n`;
    }

    if (m.keywords) {
      const kws = m.keywords.split(',').map(k => k.trim()).filter(k => k);
      kws.forEach(k => {
        ris += `KW  - ${k}\r\n`;
      });
    }

    if (m.doi) ris += `DO  - ${m.doi}\r\n`;
    
    if (m.abstract) ris += `AB  - ${m.abstract}\r\n`;
    
    ris += `ER  -\r\n`;

    return new NextResponse(ris, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-research-info-systems',
        'Content-Disposition': `attachment; filename="citation_${article.id}.ris"`,
      },
    });
  } catch (error: any) {
    console.error("RIS Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate RIS" }, { status: 500 });
  }
}
