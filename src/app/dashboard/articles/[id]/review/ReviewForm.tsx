'use client';
import { useState } from 'react';

export default function ReviewForm({ articleId, initialData, initialAuthors, role }: { articleId: string, initialData: any, initialAuthors?: any[], role: string }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [abstract, setAbstract] = useState(initialData?.abstract || '');
  const [keywords, setKeywords] = useState(initialData?.keywords || '');
  const [doi, setDoi] = useState(initialData?.doi || '');
  const [journalName, setJournalName] = useState(initialData?.journalName || '');
  const [fundingInfo, setFundingInfo] = useState(initialData?.fundingInfo || '');
  const [conflictOfInterest, setConflictOfInterest] = useState(initialData?.conflictOfInterest || '');
  
  // Simple representation for authors for now
  const defaultAuthors = initialAuthors && initialAuthors.length > 0 ? initialAuthors.map(a => `${a.name}${a.affiliation ? ` (${a.affiliation})` : ''}`).join(', ') : '';
  const [authorsText, setAuthorsText] = useState(defaultAuthors);

  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');

  const isReadOnly = role === 'REVIEWER';

  const handleGenerate = async () => {
    if (isReadOnly) return;
    setStatus('generating');
    try {
      const res = await fetch(`/api/articles/${articleId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, abstract, keywords, doi, journalName, fundingInfo, conflictOfInterest, authorsText 
        })
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
          readOnly={isReadOnly}
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', minHeight: '60px', fontFamily: 'inherit', backgroundColor: isReadOnly ? '#f3f4f6' : 'white' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Authors & Affiliations</label>
        <textarea 
          value={authorsText} onChange={e => setAuthorsText(e.target.value)}
          placeholder="John Doe (University of X), Jane Smith (University of Y)"
          readOnly={isReadOnly}
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', minHeight: '60px', fontFamily: 'inherit', backgroundColor: isReadOnly ? '#f3f4f6' : 'white' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Abstract</label>
        <textarea 
          value={abstract} onChange={e => setAbstract(e.target.value)}
          readOnly={isReadOnly}
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', minHeight: '120px', fontFamily: 'inherit', backgroundColor: isReadOnly ? '#f3f4f6' : 'white' }}
        />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Keywords</label>
          <input 
            type="text" value={keywords} onChange={e => setKeywords(e.target.value)}
            readOnly={isReadOnly}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit', backgroundColor: isReadOnly ? '#f3f4f6' : 'white' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>DOI</label>
          <input 
            type="text" value={doi} onChange={e => setDoi(e.target.value)}
            readOnly={isReadOnly}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit', backgroundColor: isReadOnly ? '#f3f4f6' : 'white' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Journal Name</label>
          <input 
            type="text" value={journalName} onChange={e => setJournalName(e.target.value)}
            readOnly={isReadOnly}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit', backgroundColor: isReadOnly ? '#f3f4f6' : 'white' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Conflict of Interest</label>
          <input 
            type="text" value={conflictOfInterest} onChange={e => setConflictOfInterest(e.target.value)}
            readOnly={isReadOnly}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit', backgroundColor: isReadOnly ? '#f3f4f6' : 'white' }}
          />
        </div>
      </div>
      
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Funding Information</label>
        <textarea 
          value={fundingInfo} onChange={e => setFundingInfo(e.target.value)}
          readOnly={isReadOnly}
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', minHeight: '60px', fontFamily: 'inherit', backgroundColor: isReadOnly ? '#f3f4f6' : 'white' }}
        />
      </div>
      
      {status === 'error' && <p style={{ color: '#EF4444' }}>Error generating XML. Please try again.</p>}
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        {!isReadOnly && (
          <button 
            type="button" 
            className="button" 
            style={{ opacity: status === 'generating' ? 0.7 : 1, flex: 1 }}
            onClick={handleGenerate}
            disabled={status === 'generating'}
          >
            {status === 'generating' ? 'Generating XML...' : 'Save & Generate XML'}
          </button>
        )}

        {(status === 'success' || isReadOnly) && (
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
