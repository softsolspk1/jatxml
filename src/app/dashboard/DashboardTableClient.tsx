'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DashboardTableClient({ recentUploads }: { recentUploads: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === recentUploads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(recentUploads.map(a => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

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
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
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
                checked={selectedIds.length === recentUploads.length && recentUploads.length > 0}
                onChange={toggleSelectAll}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </th>
            <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Article Title</th>
            <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Date Uploaded</th>
            <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
            <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {recentUploads.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '15px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No articles uploaded yet.</td>
            </tr>
          ) : (
            recentUploads.map((article) => {
              const style = getStatusStyle(article.status);
              return (
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
  );
}
