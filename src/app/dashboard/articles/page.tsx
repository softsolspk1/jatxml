import { db } from "@/lib/db";
import Link from "next/link";
import DeleteArticleButton from "./DeleteArticleButton";
import ValidationReportTrigger from "./ValidationReportTrigger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ArticleFilters from "./ArticleFilters";
import ArticleExportButtons from "./ArticleExportButtons";
import { Prisma } from "@prisma/client";

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ q?: string, status?: string, startDate?: string, endDate?: string, journal?: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const canDelete = role === 'ADMIN' || role === 'EDITORIAL_MANAGER';

  const params = await searchParams;
  
  // Build dynamic where clause based on filters
  const whereClause: Prisma.ArticleWhereInput = {};
  
  if (params.q) {
    whereClause.OR = [
      { title: { contains: params.q, mode: 'insensitive' } },
      { originalFileName: { contains: params.q, mode: 'insensitive' } },
      { authors: { some: { name: { contains: params.q, mode: 'insensitive' } } } },
      { metadata: { doi: { contains: params.q, mode: 'insensitive' } } }
    ];
  }

  if (params.status) {
    whereClause.status = params.status;
  }

  if (params.journal) {
    whereClause.metadata = {
      ...whereClause.metadata as Prisma.MetadataWhereInput,
      journalName: { contains: params.journal, mode: 'insensitive' }
    };
  }

  if (params.startDate || params.endDate) {
    whereClause.createdAt = {};
    if (params.startDate) {
      whereClause.createdAt.gte = new Date(params.startDate);
    }
    if (params.endDate) {
      const endOfDay = new Date(params.endDate);
      endOfDay.setDate(endOfDay.getDate() + 1);
      whereClause.createdAt.lt = endOfDay;
    }
  }

  const articles = await db.article.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: { metadata: true, authors: true }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)' }}>Article Tracking</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <ArticleExportButtons articles={articles} />
          {(role === 'ADMIN' || role === 'EDITORIAL_MANAGER') && (
            <Link href="/dashboard/upload" className="button">Upload New Article</Link>
          )}
        </div>
      </div>

      <ArticleFilters />

      {/* Articles Table */}
      <ArticlesTableClient articles={articles} role={role} canDelete={canDelete} />
    </div>
  );
}
