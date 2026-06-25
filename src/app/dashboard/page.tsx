import Link from 'next/link';

export default function DashboardOverview() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)', marginBottom: '30px' }}>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--brand-blue)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Articles</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--brand-blue)', marginTop: '10px' }}>124</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending Review</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F59E0B', marginTop: '10px' }}>12</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--brand-green)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>XML Generated</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--brand-green)', marginTop: '10px' }}>108</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #EF4444' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Validation Failures</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#EF4444', marginTop: '10px' }}>4</p>
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
            <tr>
              <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>Genomic sequencing in early childhood...</td>
              <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Oct 24, 2026</td>
              <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Under Review</span>
              </td>
              <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <Link href="#" style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>Review Metadata</Link>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>Machine learning approaches to climate...</td>
              <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Oct 23, 2026</td>
              <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ backgroundColor: '#D1FAE5', color: '#059669', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Ready for Export</span>
              </td>
              <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <Link href="#" style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>Download ZIP</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
