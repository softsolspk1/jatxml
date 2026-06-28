'use client';

import { useState, useCallback, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Archive } from 'lucide-react';
import Link from 'next/link';

type UploadFile = {
  id: string;
  file: File;
  status: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
  articleIds?: string[];
  startTime?: number;
};

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [globalUploading, setGlobalUploading] = useState(false);
  
  // History state
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/articles/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.articles || []);
      }
    } catch (e) {
      console.error("Failed to fetch history");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    let interval: any;
    if (globalUploading) {
      interval = setInterval(() => setTick(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [globalUploading]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const addFiles = (newFiles: FileList | File[]) => {
    const validFiles = Array.from(newFiles).filter(
      f => f.name.toLowerCase().endsWith('.docx') || f.name.toLowerCase().endsWith('.zip')
    );
    
    if (validFiles.length !== newFiles.length) {
      alert("Some files were skipped. Only .docx or .zip files are supported.");
    }

    const newUploadFiles: UploadFile[] = validFiles.map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      status: 'idle'
    }));

    setFiles(prev => [...prev, ...newUploadFiles]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const processFile = async (uploadFile: UploadFile) => {
    setFiles(prev => prev.map(f => f.id === uploadFile.id ? { ...f, status: 'uploading', startTime: Date.now() } : f));
    
    try {
      const formData = new FormData();
      formData.append('file', uploadFile.file);

      // Trigger Extraction API (Backend handles R2 upload directly)
      const extractRes = await fetch('/api/articles', {
        method: 'POST',
        body: formData
      });
      
      const extractData = await extractRes.json();
      
      if (extractRes.ok) {
        setFiles(prev => prev.map(f => f.id === uploadFile.id ? { 
          ...f, 
          status: 'success', 
          articleIds: extractData.articleIds || [extractData.articleId],
          message: extractData.isZip ? `Extracted ${extractData.count} documents` : 'Processed successfully'
        } : f));
      } else {
         throw new Error(extractData.error || "Processing failed");
      }
    } catch (error: any) {
      setFiles(prev => prev.map(f => f.id === uploadFile.id ? { ...f, status: 'error', message: error.message } : f));
    }
  };

  const processAll = async () => {
    const idleFiles = files.filter(f => f.status === 'idle' || f.status === 'error');
    if (idleFiles.length === 0) return;
    
    setGlobalUploading(true);
    // Process concurrently
    await Promise.all(idleFiles.map(f => processFile(f)));
    setGlobalUploading(false);
    fetchHistory(); // Refresh history after processing
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)', marginBottom: '10px' }}>Upload Article</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Upload .docx research articles or .zip packages for bulk processing.</p>

      {/* Drag & Drop Zone */}
      <div 
        className="card"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{ 
          border: `2px dashed ${dragActive ? 'var(--brand-green)' : 'var(--border-color)'}`,
          backgroundColor: dragActive ? 'rgba(46, 204, 113, 0.05)' : 'white',
          textAlign: 'center',
          padding: '60px 20px',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          marginBottom: '30px'
        }}
        onClick={() => document.getElementById('fileUpload')?.click()}
      >
        <input 
          id="fileUpload" 
          type="file" 
          accept=".docx,.zip" 
          multiple
          style={{ display: 'none' }} 
          onChange={handleChange}
        />
        <UploadCloud size={48} color={dragActive ? 'var(--brand-green)' : 'var(--text-secondary)'} style={{ margin: '0 auto 20px' }} />
        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--brand-blue)' }}>Drag & Drop files or ZIP packages here</h3>
        <p style={{ color: 'var(--text-secondary)' }}>or click to browse from your computer (Multiple files allowed)</p>
      </div>

      {/* Upload Queue */}
      {files.length > 0 && (
        <div className="card" style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-blue)', fontWeight: 600 }}>Upload Queue</h2>
            <button 
              className="button" 
              onClick={processAll}
              disabled={globalUploading || files.every(f => f.status === 'success')}
              style={{ opacity: (globalUploading || files.every(f => f.status === 'success')) ? 0.7 : 1 }}
            >
              {globalUploading ? 'Processing Queue...' : 'Process All'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {files.map(f => {
              const isZip = f.file.name.toLowerCase().endsWith('.zip');
              return (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                    {isZip ? <Archive size={32} color="#F59E0B" /> : <FileText size={32} color="var(--brand-blue)" />}
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>{f.file.name}</p>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span>{(f.file.size / 1024 / 1024).toFixed(2)} MB</span>
                        {f.message && <span style={{ color: f.status === 'error' ? '#EF4444' : 'var(--brand-green)' }}>&bull; {f.message}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {f.status === 'uploading' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <Loader2 size={20} className="animate-spin" color="var(--brand-blue)" />
                         <span style={{ fontSize: '0.85rem', color: 'var(--brand-blue)', fontWeight: 600 }}>
                           Extracting metadata in process ({Math.floor((Date.now() - (f.startTime || Date.now())) / 1000)}s). It may take longer depend upon size of Article.
                         </span>
                      </div>
                    )}
                    {f.status === 'success' && <CheckCircle size={24} color="var(--brand-green)" />}
                    {f.status === 'error' && <AlertCircle size={24} color="#EF4444" />}
                    
                    {f.status === 'success' && f.articleIds && f.articleIds.length === 1 && (
                      <Link href={`/dashboard/articles/${f.articleIds[0]}/review`} style={{ fontSize: '0.9rem', color: 'var(--brand-blue)', fontWeight: 600 }}>Review</Link>
                    )}
                    {f.status === 'success' && f.articleIds && f.articleIds.length > 1 && (
                      <Link href="/dashboard/articles" style={{ fontSize: '0.9rem', color: 'var(--brand-blue)', fontWeight: 600 }}>View All</Link>
                    )}
                    
                    {f.status !== 'uploading' && f.status !== 'success' && (
                      <button onClick={() => removeFile(f.id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>Remove</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload History */}
      <h2 style={{ fontSize: '1.5rem', color: 'var(--brand-blue)', marginBottom: '15px' }}>Recent Upload History</h2>
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        {loadingHistory ? (
          <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading history...</p>
        ) : history.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No recent uploads found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>File Name</th>
                <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Title</th>
                <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Date</th>
                <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item.id}>
                  <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                    {item.originalFileName}
                  </td>
                  <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                    {item.title || 'Untitled'}
                  </td>
                  <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ 
                      backgroundColor: item.status === 'METADATA_EXTRACTED' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-color)', 
                      color: item.status === 'METADATA_EXTRACTED' ? 'var(--brand-blue)' : 'inherit',
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 
                    }}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                    <Link href={`/dashboard/articles/${item.id}/review`} style={{ color: 'var(--brand-blue)', fontWeight: 600, fontSize: '0.9rem' }}>
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
