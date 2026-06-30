'use client';

import React from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CitationsTableClient({ articles }: { articles: any[] }) {
  const handleDownload = async (id: string, fileName: string) => {
    try {
      toast.loading("Generating RIS...", { id: 'ris-' + id });
      const res = await fetch(`/api/articles/${id}/ris`);
      if (!res.ok) throw new Error("Failed to generate RIS");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.replace('.docx', '') + '.ris';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Downloaded successfully", { id: 'ris-' + id });
    } catch (e) {
      console.error(e);
      toast.error("Error downloading RIS", { id: 'ris-' + id });
    }
  };

  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ padding: '15px 10px', color: 'var(--text-secondary)' }}>Article Title</th>
            <th style={{ padding: '15px 10px', color: 'var(--text-secondary)' }}>File Name</th>
            <th style={{ padding: '15px 10px', color: 'var(--text-secondary)' }}>Authors</th>
            <th style={{ padding: '15px 10px', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article: any) => (
            <tr key={article.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '15px 10px', fontWeight: 500, color: 'var(--brand-blue)' }}>
                {article.title || 'Untitled'}
              </td>
              <td style={{ padding: '15px 10px', color: 'var(--text-secondary)' }}>
                {article.originalFileName}
              </td>
              <td style={{ padding: '15px 10px', color: 'var(--text-secondary)' }}>
                {article.authors?.map((a: any) => a.name).join(', ') || 'N/A'}
              </td>
              <td style={{ padding: '15px 10px', textAlign: 'right' }}>
                <button 
                  onClick={() => handleDownload(article.id, article.originalFileName)}
                  className="button" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  <Download size={14} /> Download RIS
                </button>
              </td>
            </tr>
          ))}
          {articles.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No articles found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
