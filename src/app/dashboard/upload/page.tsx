'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.docx') || droppedFile.name.endsWith('.zip')) {
        setFile(droppedFile);
      } else {
        alert("Only .docx or .zip files are supported.");
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadToR2 = async () => {
    if (!file) return;
    setUploading(true);
    setStatus('idle');
    try {
      // 1. Get Presigned URL
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream' })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      // 2. Upload to Cloudflare R2
      const uploadRes = await fetch(data.url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        }
      });

      if (uploadRes.ok) {
        // 3. Trigger Extraction API
        const extractRes = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: data.key, originalFileName: file.name })
        });
        
        if (extractRes.ok) {
           const { articleId } = await extractRes.json();
           window.location.href = `/dashboard/articles/${articleId}/review`;
        } else {
           setStatus('error');
        }
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)', marginBottom: '10px' }}>Upload Article</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Upload a .docx research article or a .zip package for bulk processing.</p>

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
          cursor: 'pointer'
        }}
        onClick={() => document.getElementById('fileUpload')?.click()}
      >
        <input 
          id="fileUpload" 
          type="file" 
          accept=".docx,.zip" 
          style={{ display: 'none' }} 
          onChange={handleChange}
        />
        <UploadCloud size={48} color={dragActive ? 'var(--brand-green)' : 'var(--text-secondary)'} style={{ margin: '0 auto 20px' }} />
        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--brand-blue)' }}>Drag & Drop your files here</h3>
        <p style={{ color: 'var(--text-secondary)' }}>or click to browse from your computer</p>
      </div>

      {file && (
        <div className="card" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <FileText size={32} color="var(--brand-blue)" />
            <div>
              <p style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>{file.name}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          
          {status === 'success' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-green)', fontWeight: 600 }}>
              <CheckCircle size={20} /> Uploaded
            </div>
          ) : status === 'error' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontWeight: 600 }}>
              <AlertCircle size={20} /> Upload Failed
            </div>
          ) : (
            <button 
              className="button" 
              onClick={(e) => { e.stopPropagation(); uploadToR2(); }}
              disabled={uploading}
              style={{ opacity: uploading ? 0.7 : 1 }}
            >
              {uploading ? 'Uploading...' : 'Process Document'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
