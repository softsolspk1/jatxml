'use client';
import { useState } from 'react';
import { UploadCloud, CheckCircle2, Loader2 } from 'lucide-react';

export default function SubmitButton({ articleId, isAlreadySubmitted }: { articleId: string, isAlreadySubmitted: boolean }) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>(isAlreadySubmitted ? 'success' : 'idle');

  const handleSubmit = async () => {
    setStatus('submitting');
    try {
      const res = await fetch(`/api/articles/${articleId}/submit`, { method: 'POST' });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (e) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <button className="button" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: 'var(--brand-green)', border: 'none' }} disabled>
        <CheckCircle2 size={18} /> Officially Submitted
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <button 
        className="button" 
        onClick={handleSubmit}
        disabled={status === 'submitting'}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: '#0F172A', border: 'none' }}
      >
        {status === 'submitting' ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
        {status === 'submitting' ? 'Submitting to Databases...' : 'Submit to Indexing Platforms'}
      </button>
      {status === 'error' && <span style={{ color: '#EF4444', fontSize: '0.9rem', textAlign: 'center' }}>Submission failed. Please try again.</span>}
    </div>
  );
}
