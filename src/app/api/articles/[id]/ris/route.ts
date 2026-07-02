import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

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
    ris += `TI  - ${m.title || ''}\r\n`;
    
    if (authors.length > 0) {
      authors.forEach(author => {
        ris += `AU  - ${author.name}\r\n`;
      });
    } else {
      ris += `AU  - \r\n`;
    }

    const journalName = m.journalName || 'Pakistan Journal of Pharmaceutical Sciences';
    ris += `JO  - ${journalName}\r\n`;
    ris += `JF  - ${journalName}\r\n`;
    ris += `T2  - ${journalName}\r\n`;
    
    ris += `VL  - ${m.volume || ''}\r\n`;
    ris += `IS  - ${m.issue || ''}\r\n`;
    
    let sp = '';
    let ep = '';
    if (m.pages) {
      const parts = m.pages.split(/[-–—]/);
      sp = parts[0] ? parts[0].trim() : '';
      ep = parts[1] ? parts[1].trim() : '';
    }
    if (sp) ris += `SP  - ${sp}\r\n`;
    if (ep) ris += `EP  - ${ep}\r\n`;

    let year = '';
    let dateStr = '';
    if (m.publicationDate) {
      const d = new Date(m.publicationDate);
      year = d.getFullYear().toString();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      dateStr = `${year}/${month}`;
    }
    ris += `PY  - ${year}\r\n`;
    ris += `Y1  - ${year}\r\n`;
    ris += `DA  - ${dateStr}\r\n`;

    if (m.keywords) {
      const kws = m.keywords.split(',').map(k => k.trim()).filter(k => k);
      if (kws.length > 0) {
        kws.forEach(k => {
          ris += `KW  - ${k}\r\n`;
        });
      } else {
        ris += `KW  - \r\n`;
      }
    } else {
      ris += `KW  - \r\n`;
    }

    ris += `DO  - ${m.doi || ''}\r\n`;
    if (m.doi) {
      ris += `UR  - https://doi.org/${m.doi}\r\n`;
    }
    
    ris += `AB  - ${m.abstract || ''}\r\n`;
    
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
