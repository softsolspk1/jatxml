'use client';
import { useState } from 'react';

export default function ReviewForm({ articleId, initialData }: { articleId: string, initialData: any }) {
  const [title, setTitle] = useState(initialData.title || '');
  const [abstract, setAbstract] = useState(initialData.abstract || '');
  const [keywords, setKeywords] = useState(initialData.keywords || '');
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');

  const handleGenerate = async () => {
    setStatus('generating');
    try {
      const res = await fetch(`/api/articles/${articleId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, abstract, keywords })
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (e) {
      setStatus('error');
    }
  };

  const handleDownload = () => {
    window.location.href = `/api/articles/${articleId}/export`;
  };

  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Article Title</label>
        <textarea 
          value={title} onChange={e => setTitle(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', minHeight: '80px', fontFamily: 'inherit' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Abstract</label>
        <textarea 
          value={abstract} onChange={e => setAbstract(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', minHeight: '150px', fontFamily: 'inherit' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Keywords</label>
        <input 
          type="text"
          value={keywords} onChange={e => setKeywords(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
        />
      </div>
      
      {status === 'error' && <p style={{ color: '#EF4444' }}>Error generating XML. Please try again.</p>}
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button 
          type="button" 
          className="button" 
          style={{ opacity: status === 'generating' ? 0.7 : 1, flex: 1 }}
          onClick={handleGenerate}
          disabled={status === 'generating'}
        >
          {status === 'generating' ? 'Generating XML...' : 'Save & Generate XML'}
        </button>

        {status === 'success' && (
          <button 
            type="button" 
            className="button button-outline" 
            style={{ flex: 1, backgroundColor: 'white' }}
            onClick={handleDownload}
          >
            Download ZIP Package
          </button>
        )}
      </div>
    </form>
  );
}
