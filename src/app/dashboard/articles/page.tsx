import { db } from "@/lib/db";
import Link from "next/link";
import { Search, Filter } from "lucide-react";

export default async function ArticlesPage() {
  const articles = await db.article.findMany({
    orderBy: { createdAt: 'desc' },
    include: { metadata: true, authors: true }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)' }}>All Articles</h1>
        <Link href="/dashboard/upload" className="button">Upload New Article</Link>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '15px', top: '12px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search by Title, Author, or DOI..." 
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
          />
        </div>
        
        <select style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'white' }}>
          <option value="">Status: All</option>
          <option value="UPLOADED">Uploaded</option>
          <option value="METADATA_EXTRACTED">Metadata Extracted</option>
          <option value="XML_GENERATED">XML Generated</option>
          <option value="READY_FOR_EXPORT">Ready for Export</option>
        </select>

        <select style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'white' }}>
          <option value="">Journal: All</option>
          {/* This would be dynamic in a real app */}
        </select>

        <input type="date" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'white' }} />
        
        <button className="button button-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} /> Apply Filters
        </button>
      </div>

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
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>No articles found. Upload one to get started.</td>
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
                    backgroundColor: article.status === 'READY_FOR_EXPORT' ? '#D1FAE5' : '#FEF3C7', 
                    color: article.status === 'READY_FOR_EXPORT' ? '#059669' : '#D97706', 
                    padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 
                  }}>
                    {article.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  {new Date(article.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                  {article.status === 'READY_FOR_EXPORT' ? (
                    <Link href={`/api/articles/${article.id}/export`} style={{ color: 'var(--brand-blue)', fontWeight: 600, marginRight: '15px' }}>Download</Link>
                  ) : null}
                  <Link href={`/dashboard/articles/${article.id}/review`} style={{ color: 'var(--brand-green)', fontWeight: 600 }}>Review</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
