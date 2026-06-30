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

    let ris = `TY  - JOUR\n`;
    if (m.title) ris += `TI  - ${m.title}\n`;
    
    authors.forEach(author => {
      const parts = author.name.split(' ');
      const surname = parts.length > 1 ? parts.pop() : author.name;
      const givenNames = parts.length > 0 ? parts.join(' ') : '';
      if (givenNames) {
        ris += `AU  - ${surname}, ${givenNames}\n`;
      } else {
        ris += `AU  - ${surname}\n`;
      }
    });

    if (m.abstract) ris += `AB  - ${m.abstract}\n`;
    
    if (m.keywords) {
      const kws = m.keywords.split(',').map(k => k.trim()).filter(k => k);
      kws.forEach(k => {
        ris += `KW  - ${k}\n`;
      });
    }

    if (m.doi) ris += `DO  - ${m.doi}\n`;
    
    // Attempt standard abbreviation for PJPS if applicable
    const journalName = m.journalName || 'Pakistan Journal of Pharmaceutical Sciences';
    if (journalName.includes('Pakistan Journal of Pharmaceutical Sciences')) {
      ris += `JO  - Pak. J. Pharm. Sci.\n`;
    } else {
      ris += `JO  - ${journalName}\n`;
    }
    ris += `JF  - ${journalName}\n`;
    
    if (m.volume) ris += `VL  - ${m.volume}\n`;
    if (m.issue) ris += `IS  - ${m.issue}\n`;
    if (m.publicationDate) {
      ris += `PY  - ${new Date(m.publicationDate).getFullYear()}\n`;
    }
    if (m.pages) {
      const parts = m.pages.split('-');
      if (parts[0]) ris += `SP  - ${parts[0].trim()}\n`;
      if (parts[1]) ris += `EP  - ${parts[1].trim()}\n`;
    }
    ris += `ER  - \n`;

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
