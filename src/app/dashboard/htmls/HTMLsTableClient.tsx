'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';

export default function HTMLsTableClient({ initialArticles }: { initialArticles: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.length === initialArticles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(initialArticles.map(a => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const downloadSelected = async () => {
    if (selectedIds.length === 0) return;
    setIsDownloading(true);
    try {
      const response = await fetch('/api/articles/bulk-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleIds: selectedIds, format: 'html' })
      });
      
      if (!response.ok) throw new Error("Failed to download");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Selected_HTMLs.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(error);
      alert('Failed to download selected HTMLs');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-blue)' }}>Available HTMLs</h2>
        {selectedIds.length > 0 && (
          <button 
            onClick={downloadSelected} 
            disabled={isDownloading}
            className="button" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={18} /> {isDownloading ? 'Downloading...' : `Download Selected (${selectedIds.length})`}
          </button>
        )}
      </div>

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '15px 20px', width: '50px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === initialArticles.length && initialArticles.length > 0}
                  onChange={toggleSelectAll}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Article Title</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Uploaded</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {initialArticles.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>No articles available.</td>
              </tr>
            ) : initialArticles.map((article) => (
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
                  <span style={{ 
                    backgroundColor: '#D1FAE5', 
                    color: '#059669', 
                    padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 
                  }}>
                    {article.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  {new Date(article.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                  <a href={`/api/articles/${article.id}/export?format=html`} download className="button button-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 10px', fontSize: '0.9rem' }}>
                    <Download size={16} /> Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
