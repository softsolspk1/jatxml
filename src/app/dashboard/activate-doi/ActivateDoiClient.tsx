'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Upload, CheckCircle, XCircle } from 'lucide-react';

export default function ActivateDoiClient() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(prev => prev ? prev + '\n' + text : text);
      toast.success("File imported. Click activate to proceed.");
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  const activateDois = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some DOIs to activate");
      return;
    }

    // Split by line breaks or commas, trim whitespace, and filter empty
    const dois = inputText
      .split(/[\n,]+/)
      .map(d => d.trim())
      .filter(d => d);

    if (dois.length === 0) {
      toast.error("No valid DOIs found");
      return;
    }

    setLoading(true);
    const toastId = toast.loading(`Processing and submitting ${dois.length} DOI(s)...`);

    try {
      const res = await fetch('/api/activate-doi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dois })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }
      
      setResults(data.results);
      toast.success("Activation process complete", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to activate DOIs", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>Enter DOIs to Activate (one per line or comma-separated)</label>
          <div>
            <input 
              type="file" 
              accept=".txt,.csv" 
              id="file-upload" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
            />
            <label htmlFor="file-upload" className="button" style={{ backgroundColor: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={16} /> Upload CSV/TXT
            </label>
          </div>
        </div>
        
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="e.g. 10.36283/PJMD13-1/017&#10;10.1126/science.1071285"
          rows={6}
          style={{ 
            width: '100%', 
            padding: '10px', 
            borderRadius: '4px', 
            border: '1px solid var(--border-color)', 
            resize: 'vertical',
            fontFamily: 'monospace'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={activateDois} 
            disabled={loading}
            className="button"
          >
            {loading ? 'Submitting to Crossref...' : 'Activate DOIs'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--brand-blue)' }}>Results</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '15px 10px', color: 'var(--text-secondary)' }}>DOI</th>
                <th style={{ padding: '15px 10px', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '15px 10px', color: 'var(--text-secondary)' }}>Message</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '15px 10px', fontFamily: 'monospace' }}>{result.doi}</td>
                  <td style={{ padding: '15px 10px' }}>
                    {result.success ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--brand-green)', fontWeight: 600 }}>
                        <CheckCircle size={16} /> Deposited
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#EF4444', fontWeight: 600 }}>
                        <XCircle size={16} /> Failed
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '15px 10px', color: result.success ? 'var(--text-primary)' : '#EF4444' }}>
                    {result.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
