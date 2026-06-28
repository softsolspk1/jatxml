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
      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Article Title</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Authors</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Uploaded</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>No articles found matching filters.</td>
              </tr>
            ) : articles.map((article) => (
              <tr key={article.id}>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {article.title || article.originalFileName}
                </td>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                   {article.authors?.length > 0 ? `${article.authors[0].name} et al.` : 'N/A'}
                </td>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ 
                    backgroundColor: article.status === 'READY_FOR_EXPORT' ? '#D1FAE5' : (article.status.includes('FAILED') ? '#FEE2E2' : '#FEF3C7'), 
                    color: article.status === 'READY_FOR_EXPORT' ? '#059669' : (article.status.includes('FAILED') ? '#DC2626' : '#D97706'), 
                    padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 
                  }}>
                    {article.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  {new Date(article.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {(article.status === 'READY_FOR_EXPORT' || article.status === 'SUBMITTED') && role !== 'XML_OPERATOR' ? (
                    <Link href={`/dashboard/articles/${article.id}/export`} style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>Download Center</Link>
                  ) : null}
                  <ValidationReportTrigger articleId={article.id} />
                  <Link href={`/dashboard/articles/${article.id}/review`} style={{ color: 'var(--brand-green)', fontWeight: 600 }}>Review</Link>
                  {canDelete && <DeleteArticleButton articleId={article.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
