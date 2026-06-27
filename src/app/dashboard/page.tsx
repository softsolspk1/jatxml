import Link from 'next/link';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);

  const totalArticles = await db.article.count();
  const pendingReview = await db.article.count({ where: { status: 'METADATA_EXTRACTED' } });
  const xmlGenerated = await db.article.count({ where: { status: 'XML_GENERATED' } });
  // Validation failures might need a dedicated status or check
  const validationFailures = await db.article.count({ where: { status: 'VALIDATION_FAILED' } });

  const recentUploads = await db.article.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'UPLOADED': return { bg: '#E0F2FE', text: '#0284C7', label: 'Uploaded' };
      case 'METADATA_EXTRACTED': return { bg: '#FEF3C7', text: '#D97706', label: 'Under Review' };
      case 'READY_FOR_EXPORT': return { bg: '#D1FAE5', text: '#059669', label: 'Ready for Export' };
      case 'XML_GENERATED': return { bg: '#D1FAE5', text: '#059669', label: 'XML Generated' };
      case 'VALIDATION_FAILED': return { bg: '#FEE2E2', text: '#DC2626', label: 'Validation Failed' };
      default: return { bg: '#F3F4F6', text: '#4B5563', label: status };
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)', marginBottom: '30px' }}>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--brand-blue)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Articles</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--brand-blue)', marginTop: '10px' }}>{totalArticles}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending Review</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F59E0B', marginTop: '10px' }}>{pendingReview}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--brand-green)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>XML Generated</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--brand-green)', marginTop: '10px' }}>{xmlGenerated}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #EF4444' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Validation Failures</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#EF4444', marginTop: '10px' }}>{validationFailures}</p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', color: 'var(--brand-blue)', marginBottom: '20px' }}>Recent Uploads</h2>
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Article Title</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Date Uploaded</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentUploads.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '15px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No articles uploaded yet.</td>
              </tr>
            ) : (
              recentUploads.map((article) => {
                const style = getStatusStyle(article.status);
                return (
                  <tr key={article.id}>
                    <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {article.title || article.originalFileName}
                    </td>
                    <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      {new Date(article.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ backgroundColor: style.bg, color: style.text, padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {style.label}
                      </span>
                    </td>
                    <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                      <Link href={`/dashboard/articles/${article.id}/review`} style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>
                        {article.status === 'METADATA_EXTRACTED' ? 'Review Metadata' : 'View Details'}
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
