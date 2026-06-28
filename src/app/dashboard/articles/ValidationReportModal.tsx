"use client";

import { useState } from "react";
import { X, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface ValidationReport {
  errors: string[];
  warnings: string[];
  compliance: {
    jats: boolean;
    pmc: boolean;
    scielo: boolean;
  };
}

export default function ValidationReportModal({ articleId, isOpen, onClose }: { articleId: string, isOpen: boolean, onClose: () => void }) {
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch(`/api/articles/${articleId}/validate`);
      if (!res.ok) throw new Error("Failed to fetch report");
      const data = await res.json();
      setReport(data);
    } catch (e) {
      toast.error("Failed to fetch validation report.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch when opened
  if (isOpen && !report && !loading) {
    fetchReport();
  }

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <X size={24} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--brand-blue)', margin: 0 }}>Validation Report</h2>
          <button onClick={fetchReport} className="button button-outline" style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
             <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Analyzing XML structures...</p>}

        {!loading && report && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              <div style={{ padding: '15px', borderRadius: '8px', border: `1px solid ${report.compliance.jats ? '#34D399' : '#F87171'}`, backgroundColor: report.compliance.jats ? '#ECFDF5' : '#FEF2F2', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {report.compliance.jats ? <CheckCircle color="#059669" /> : <XCircle color="#DC2626" />}
                <div>
                  <div style={{ fontWeight: 600, color: report.compliance.jats ? '#065F46' : '#991B1B' }}>JATS Base Compliance</div>
                  <div style={{ fontSize: '0.85rem', color: report.compliance.jats ? '#047857' : '#B91C1C' }}>{report.compliance.jats ? 'Passed' : 'Failed'}</div>
                </div>
              </div>

              <div style={{ padding: '15px', borderRadius: '8px', border: `1px solid ${report.compliance.pmc ? '#34D399' : '#F87171'}`, backgroundColor: report.compliance.pmc ? '#ECFDF5' : '#FEF2F2', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {report.compliance.pmc ? <CheckCircle color="#059669" /> : <XCircle color="#DC2626" />}
                <div>
                  <div style={{ fontWeight: 600, color: report.compliance.pmc ? '#065F46' : '#991B1B' }}>PubMed Central (PMC)</div>
                  <div style={{ fontSize: '0.85rem', color: report.compliance.pmc ? '#047857' : '#B91C1C' }}>{report.compliance.pmc ? 'Passed' : 'Failed'}</div>
                </div>
              </div>

              <div style={{ padding: '15px', borderRadius: '8px', border: `1px solid ${report.compliance.scielo ? '#34D399' : '#F87171'}`, backgroundColor: report.compliance.scielo ? '#ECFDF5' : '#FEF2F2', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {report.compliance.scielo ? <CheckCircle color="#059669" /> : <XCircle color="#DC2626" />}
                <div>
                  <div style={{ fontWeight: 600, color: report.compliance.scielo ? '#065F46' : '#991B1B' }}>SciELO Network</div>
                  <div style={{ fontSize: '0.85rem', color: report.compliance.scielo ? '#047857' : '#B91C1C' }}>{report.compliance.scielo ? 'Passed' : 'Failed'}</div>
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', borderBottom: '2px solid #FEE2E2', paddingBottom: '10px' }}>
              <XCircle size={20} /> Critical Errors ({report.errors.length})
            </h3>
            {report.errors.length === 0 ? (
              <p style={{ color: '#059669', marginBottom: '30px' }}>No critical errors found.</p>
            ) : (
              <ul style={{ listStyleType: 'none', padding: 0, marginBottom: '30px' }}>
                {report.errors.map((err, i) => (
                  <li key={i} style={{ backgroundColor: '#FEF2F2', padding: '10px 15px', borderRadius: '5px', color: '#991B1B', marginBottom: '10px', fontSize: '0.95rem' }}>
                    {err}
                  </li>
                ))}
              </ul>
            )}

            <h3 style={{ fontSize: '1.2rem', color: '#D97706', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', borderBottom: '2px solid #FEF3C7', paddingBottom: '10px' }}>
              <AlertCircle size={20} /> Warnings ({report.warnings.length})
            </h3>
            {report.warnings.length === 0 ? (
              <p style={{ color: '#059669' }}>No warnings found.</p>
            ) : (
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {report.warnings.map((warn, i) => (
                  <li key={i} style={{ backgroundColor: '#FFFBEB', padding: '10px 15px', borderRadius: '5px', color: '#B45309', marginBottom: '10px', fontSize: '0.95rem' }}>
                    {warn}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
