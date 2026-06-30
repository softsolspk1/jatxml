import Link from 'next/link';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import DashboardTableClient from './DashboardTableClient';

export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);

  const totalArticles = await db.article.count();
  const pendingReview = await db.article.count({ where: { status: { in: ['UPLOADED', 'METADATA_EXTRACTED', 'UNDER_REVIEW'] } } });
  const xmlGenerated = await db.article.count({ where: { status: { in: ['XML_GENERATED', 'READY_FOR_EXPORT'] } } });
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
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending Processing</h3>
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
      <DashboardTableClient recentUploads={recentUploads} />
    </div>
  );
}
