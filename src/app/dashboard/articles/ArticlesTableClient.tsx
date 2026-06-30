'use client';

import { useState } from 'react';
import Link from 'next/link';
import DeleteArticleButton from "./DeleteArticleButton";
import ValidationReportTrigger from "./ValidationReportTrigger";

export default function ArticlesTableClient({ articles, role, canDelete }: { articles: any[], role: string, canDelete: boolean }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === articles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(articles.map(a => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
      {selectedIds.length > 0 && (
        <div style={{ padding: '15px 20px', backgroundColor: 'var(--brand-blue-light)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>{selectedIds.length} articles selected</span>
          {/* Add bulk actions here if needed in the future */}
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
          <tr>
            <th style={{ padding: '15px 20px', width: '50px' }}>
              <input 
                type="checkbox" 
                checked={selectedIds.length === articles.length && articles.length > 0}
                onChange={toggleSelectAll}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </th>
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
              <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>No articles found matching filters.</td>
            </tr>
          ) : articles.map((article) => (
            <tr key={article.id}>
              <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(article.id)}
                  onChange={() => toggleSelect(article.id)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </td>
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
  );
}
