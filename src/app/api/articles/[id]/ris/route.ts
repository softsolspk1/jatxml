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
    if (m.title) ris += `T1  - ${m.title}\n`;
    
    authors.forEach(author => {
      ris += `AU  - ${author.name}\n`;
    });

    if (m.journalName) ris += `JO  - ${m.journalName}\n`;
    if (m.volume) ris += `VL  - ${m.volume}\n`;
    if (m.issue) ris += `IS  - ${m.issue}\n`;
    if (m.pages) {
      const parts = m.pages.split('-');
      if (parts[0]) ris += `SP  - ${parts[0].trim()}\n`;
      if (parts[1]) ris += `EP  - ${parts[1].trim()}\n`;
    }
    if (m.publicationDate) {
      ris += `PY  - ${new Date(m.publicationDate).getFullYear()}\n`;
    }
    if (m.doi) ris += `DO  - ${m.doi}\n`;
    ris += `UR  - ${process.env.NEXT_PUBLIC_APP_URL || ''}/article/${article.id}\n`;
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
