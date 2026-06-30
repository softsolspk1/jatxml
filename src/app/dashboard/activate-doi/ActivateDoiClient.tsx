'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Send, CheckCircle, Clock } from 'lucide-react';

interface ActivateDoiClientProps {
  articles: any[];
}

export default function ActivateDoiClient({ articles }: ActivateDoiClientProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const activateDoi = async (articleId: string) => {
    setLoadingId(articleId);
    const toastId = toast.loading('Depositing XML to Crossref...');

    try {
      const res = await fetch('/api/activate-doi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to activate DOI");
      }

      toast.success("Successfully deposited to Crossref!", { id: toastId });
      
      // Optionally show a detailed success message if crossref returns one
      if (data.message) {
        console.log("Crossref Output:", data.crossrefResponse);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred", { id: toastId });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ padding: '15px 10px', color: 'var(--text-secondary)' }}>Title</th>
            <th style={{ padding: '15px 10px', color: 'var(--text-secondary)' }}>DOI</th>
            <th style={{ padding: '15px 10px', color: 'var(--text-secondary)' }}>Status</th>
            <th style={{ padding: '15px 10px', color: 'var(--text-secondary)', textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {articles.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No processed articles found.
              </td>
            </tr>
          ) : (
            articles.map(article => {
              const doi = article.metadata?.doi;
              const hasDoi = !!doi;
              const isSubmitted = article.status === 'SUBMITTED';

              return (
                <tr key={article.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '15px 10px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={article.metadata?.title || article.originalFileName}>
                    <strong>{article.metadata?.title || article.originalFileName}</strong>
                  </td>
                  <td style={{ padding: '15px 10px', fontFamily: 'monospace' }}>
                    {hasDoi ? doi : <span style={{ color: '#EF4444' }}>Not Assigned</span>}
                  </td>
                  <td style={{ padding: '15px 10px' }}>
                    {isSubmitted ? (
                      <span style={{ color: 'var(--brand-green)', display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle size={16}/> Submitted</span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={16}/> Pending</span>
                    )}
                  </td>
                  <td style={{ padding: '15px 10px', textAlign: 'right' }}>
                    <button
                      onClick={() => activateDoi(article.id)}
                      disabled={loadingId === article.id || !hasDoi}
                      className="button button-outline"
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        opacity: (!hasDoi || loadingId === article.id) ? 0.5 : 1, 
                        cursor: (!hasDoi || loadingId === article.id) ? 'not-allowed' : 'pointer' 
                      }}
                      title={!hasDoi ? "Please edit metadata and assign a DOI first" : "Send metadata to Crossref"}
                    >
                      <Send size={16} />
                      {loadingId === article.id ? 'Depositing...' : 'Activate via Crossref'}
                    </button>
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
