'use client';
import { useState } from 'react';
import { Trash2, Plus, CheckCircle, Save, AlertCircle, Clock } from 'lucide-react';

export default function ReviewForm({ articleId, initialData, initialAuthors, initialReferences, history, role }: { articleId: string, initialData: any, initialAuthors?: any[], initialReferences?: any[], history?: any[], role: string }) {
  const isReadOnly = role === 'REVIEWER';

  // State: Article Details
  const [title, setTitle] = useState(initialData?.title || '');
  const [runningTitle, setRunningTitle] = useState(initialData?.runningTitle || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [abstract, setAbstract] = useState(initialData?.abstract || '');
  const [keywords, setKeywords] = useState(initialData?.keywords || '');

  // State: Publication Details
  const [journalName, setJournalName] = useState(initialData?.journalName || '');
  const [volume, setVolume] = useState(initialData?.volume || '');
  const [issue, setIssue] = useState(initialData?.issue || '');
  const [pages, setPages] = useState(initialData?.pages || '');
  const [doi, setDoi] = useState(initialData?.doi || '');
  const [publicationDate, setPublicationDate] = useState(initialData?.publicationDate ? new Date(initialData.publicationDate).toISOString().split('T')[0] : '');

  // State: Additional Metadata
  const [fundingInfo, setFundingInfo] = useState(initialData?.fundingInfo || '');
  const [grantNumbers, setGrantNumbers] = useState(initialData?.grantNumbers || '');
  const [conflictOfInterest, setConflictOfInterest] = useState(initialData?.conflictOfInterest || '');
  const [ethicalApproval, setEthicalApproval] = useState(initialData?.ethicalApproval || '');
  const [acknowledgements, setAcknowledgements] = useState(initialData?.acknowledgements || '');
  
  // State: Authors
  const [authors, setAuthors] = useState<any[]>(initialAuthors || []);

  // State: References
  const [references, setReferences] = useState<any[]>(initialReferences || []);

  const [status, setStatus] = useState<'idle' | 'generating' | 'saving' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState('article'); // article, authors, publication, additional, references, history
  const [validationError, setValidationError] = useState('');

  const handleAddAuthor = () => {
    if (isReadOnly) return;
    setAuthors([...authors, { name: '', affiliation: '', email: '', orcid: '', isCorresponding: false, order: authors.length + 1 }]);
  };

  const updateAuthor = (index: number, field: string, value: any) => {
    if (isReadOnly) return;
    const newAuthors = [...authors];
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
  };

  const removeAuthor = (index: number) => {
    if (isReadOnly) return;
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const updateReference = (index: number, field: string, value: any) => {
    if (isReadOnly) return;
    const newRefs = [...references];
    newRefs[index][field] = value;
    setReferences(newRefs);
  };

  const getPayload = () => ({
    title, runningTitle, subtitle, abstract, keywords, 
    doi, journalName, volume, issue, pages, publicationDate: publicationDate ? new Date(publicationDate).toISOString() : null,
    fundingInfo, grantNumbers, conflictOfInterest, ethicalApproval, acknowledgements, 
    structuredAuthors: authors,
    structuredReferences: references
  });

  const handleSaveDraft = async () => {
    if (isReadOnly) return;
    setStatus('saving');
    setValidationError('');
    try {
      const res = await fetch(`/api/articles/${articleId}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getPayload())
      });
      if (res.ok) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch (e) {
      setStatus('error');
    }
  };

  const handleGenerate = async () => {
    if (isReadOnly) return;
    setValidationError('');
    
    // Strict Validation
    if (!title.trim()) { setValidationError('Article Title is mandatory for XML generation.'); return; }
    if (!abstract.trim()) { setValidationError('Abstract is mandatory for XML generation.'); return; }
    if (authors.length === 0 || !authors[0].name.trim()) { setValidationError('At least one Author Name is mandatory for XML generation.'); return; }

    setStatus('generating');
    try {
      const res = await fetch(`/api/articles/${articleId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getPayload())
      });
      if (res.ok) {
        setStatus('success');
      } else {
        const data = await res.json();
        setValidationError(data.error || 'Generation failed');
        setStatus('error');
      }
    } catch (e) {
      setStatus('error');
    }
  };

  const handleDownload = () => {
    window.location.href = `/api/articles/${articleId}/export`;
  };

  const tabStyle = (tabId: string) => ({
    padding: '10px 15px', cursor: 'pointer', borderBottom: activeTab === tabId ? '3px solid var(--brand-blue)' : '3px solid transparent',
    color: activeTab === tabId ? 'var(--brand-blue)' : 'var(--text-secondary)', fontWeight: activeTab === tabId ? 600 : 400,
    whiteSpace: 'nowrap' as const
  });

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit', backgroundColor: isReadOnly ? '#f3f4f6' : 'white' };

  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '5px', overflowX: 'auto', paddingBottom: '2px' }}>
        <div style={tabStyle('article')} onClick={() => setActiveTab('article')}>Article Details</div>
        <div style={tabStyle('authors')} onClick={() => setActiveTab('authors')}>Authors</div>
        <div style={tabStyle('references')} onClick={() => setActiveTab('references')}>References</div>
        <div style={tabStyle('publication')} onClick={() => setActiveTab('publication')}>Publication</div>
        <div style={tabStyle('additional')} onClick={() => setActiveTab('additional')}>Additional</div>
        <div style={tabStyle('history')} onClick={() => setActiveTab('history')}>Version History</div>
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '400px' }}>
        
        {/* ARTICLE DETAILS */}
        {activeTab === 'article' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Article Title <span style={{color: 'red'}}>*</span></label>
              <textarea value={title} onChange={e => setTitle(e.target.value)} readOnly={isReadOnly} style={{ ...inputStyle, minHeight: '60px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Running Title</label>
                <input type="text" value={runningTitle} onChange={e => setRunningTitle(e.target.value)} readOnly={isReadOnly} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Subtitle</label>
                <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} readOnly={isReadOnly} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Abstract <span style={{color: 'red'}}>*</span></label>
              <textarea value={abstract} onChange={e => setAbstract(e.target.value)} readOnly={isReadOnly} style={{ ...inputStyle, minHeight: '120px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Keywords</label>
              <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} readOnly={isReadOnly} style={inputStyle} placeholder="Comma separated keywords" />
            </div>
          </div>
        )}

        {/* AUTHORS */}
        {activeTab === 'authors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {authors.map((author, index) => (
              <div key={index} style={{ padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', position: 'relative' }}>
                {!isReadOnly && (
                  <button type="button" onClick={() => removeAuthor(index)} style={{ position: 'absolute', top: '15px', right: '15px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px', paddingRight: '30px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Name <span style={{color: 'red'}}>*</span></label>
                    <input type="text" value={author.name} onChange={e => updateAuthor(index, 'name', e.target.value)} readOnly={isReadOnly} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Affiliation</label>
                    <input type="text" value={author.affiliation || ''} onChange={e => updateAuthor(index, 'affiliation', e.target.value)} readOnly={isReadOnly} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Email</label>
                    <input type="email" value={author.email || ''} onChange={e => updateAuthor(index, 'email', e.target.value)} readOnly={isReadOnly} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>ORCID</label>
                    <input type="text" value={author.orcid || ''} onChange={e => updateAuthor(index, 'orcid', e.target.value)} readOnly={isReadOnly} style={inputStyle} placeholder="0000-0000-0000-0000" />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={author.isCorresponding} onChange={e => updateAuthor(index, 'isCorresponding', e.target.checked)} disabled={isReadOnly} />
                    Corresponding Author
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                    Order: <input type="number" value={author.order} onChange={e => updateAuthor(index, 'order', parseInt(e.target.value) || 0)} readOnly={isReadOnly} style={{ width: '60px', padding: '4px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                  </label>
                </div>
              </div>
            ))}
            {!isReadOnly && (
              <button type="button" onClick={handleAddAuthor} className="button button-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Plus size={18} /> Add Author
              </button>
            )}
          </div>
        )}

        {/* REFERENCES */}
        {activeTab === 'references' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {references.length === 0 ? <p style={{color: 'var(--text-secondary)'}}>No references found.</p> : null}
            {references.map((ref, index) => (
              <div key={index} style={{ padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', position: 'relative' }}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 600 }}>Raw Citation Text</label>
                  <textarea value={ref.rawText} onChange={e => updateReference(index, 'rawText', e.target.value)} readOnly={isReadOnly} style={{ ...inputStyle, minHeight: '60px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>DOI</label>
                    <input type="text" value={ref.doi || ''} onChange={e => updateReference(index, 'doi', e.target.value)} readOnly={isReadOnly} style={{...inputStyle, padding: '6px'}} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>PubMed ID (PMID)</label>
                    <input type="text" value={ref.pmid || ''} onChange={e => updateReference(index, 'pmid', e.target.value)} readOnly={isReadOnly} style={{...inputStyle, padding: '6px'}} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Year</label>
                    <input type="text" value={ref.year || ''} onChange={e => updateReference(index, 'year', e.target.value)} readOnly={isReadOnly} style={{...inputStyle, padding: '6px'}} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PUBLICATION DETAILS */}
        {activeTab === 'publication' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div><label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Journal Name</label><input type="text" value={journalName} onChange={e => setJournalName(e.target.value)} readOnly={isReadOnly} style={inputStyle} /></div>
            <div><label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>DOI</label><input type="text" value={doi} onChange={e => setDoi(e.target.value)} readOnly={isReadOnly} style={inputStyle} /></div>
            <div><label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Volume</label><input type="text" value={volume} onChange={e => setVolume(e.target.value)} readOnly={isReadOnly} style={inputStyle} /></div>
            <div><label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Issue</label><input type="text" value={issue} onChange={e => setIssue(e.target.value)} readOnly={isReadOnly} style={inputStyle} /></div>
            <div><label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Pages</label><input type="text" value={pages} onChange={e => setPages(e.target.value)} readOnly={isReadOnly} style={inputStyle} /></div>
            <div><label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Publication Date</label><input type="date" value={publicationDate} onChange={e => setPublicationDate(e.target.value)} readOnly={isReadOnly} style={inputStyle} /></div>
          </div>
        )}

        {/* ADDITIONAL METADATA */}
        {activeTab === 'additional' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div><label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Grant Numbers</label><input type="text" value={grantNumbers} onChange={e => setGrantNumbers(e.target.value)} readOnly={isReadOnly} style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Conflict of Interest</label><input type="text" value={conflictOfInterest} onChange={e => setConflictOfInterest(e.target.value)} readOnly={isReadOnly} style={inputStyle} /></div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Funding Information</label>
              <textarea value={fundingInfo} onChange={e => setFundingInfo(e.target.value)} readOnly={isReadOnly} style={{ ...inputStyle, minHeight: '60px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Ethical Approval</label>
              <textarea value={ethicalApproval} onChange={e => setEthicalApproval(e.target.value)} readOnly={isReadOnly} style={{ ...inputStyle, minHeight: '60px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Acknowledgements</label>
              <textarea value={acknowledgements} onChange={e => setAcknowledgements(e.target.value)} readOnly={isReadOnly} style={{ ...inputStyle, minHeight: '60px' }} />
            </div>
          </div>
        )}

        {/* VERSION HISTORY */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', color: 'var(--brand-blue)' }}>Edit History</h3>
            {!history || history.length === 0 ? (
              <p style={{color: 'var(--text-secondary)'}}>No history recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {history.map((record: any, idx: number) => (
                  <div key={idx} style={{ padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#f9fafb' }}>
                    <div style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8', padding: '10px', borderRadius: '50%' }}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: '2px' }}>Saved on {new Date(record.createdAt).toLocaleString()}</p>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>By {record.user?.name || 'Unknown User'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
      
      {validationError && (
        <div style={{ padding: '10px', backgroundColor: '#FEE2E2', border: '1px solid #F87171', borderRadius: '6px', color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {validationError}
        </div>
      )}
      {status === 'error' && !validationError && <p style={{ color: '#EF4444', fontWeight: 600 }}>An error occurred. Please try again.</p>}
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
        {!isReadOnly && (
          <>
            <button type="button" className="button button-outline" style={{ opacity: status === 'saving' ? 0.7 : 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleSaveDraft} disabled={status === 'saving' || status === 'generating'}>
              <Save size={18} /> {status === 'saving' ? 'Saving...' : 'Save Draft'}
            </button>
            <button type="button" className="button" style={{ opacity: status === 'generating' ? 0.7 : 1, flex: 1 }} onClick={handleGenerate} disabled={status === 'saving' || status === 'generating'}>
              {status === 'generating' ? 'Saving & Generating XML...' : 'Validate & Generate XML'}
            </button>
          </>
        )}

        {(status === 'success' || isReadOnly) && (
          <button type="button" className="button" style={{ flex: 1, backgroundColor: 'white', color: 'var(--brand-green)', borderColor: 'var(--brand-green)', border: '1px solid' }} onClick={handleDownload}>
            <CheckCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }}/> Download XML Package
          </button>
        )}
      </div>
    </form>
  );
}
