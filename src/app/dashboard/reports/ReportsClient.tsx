'use client';

import { useState, useEffect } from 'react';
import { Download, Trash2, FileText, Activity, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsClient({ initialLogs, stats }: { initialLogs: any[], stats: any }) {
  const [logs, setLogs] = useState(initialLogs);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) setLogs(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this log entry?')) return;
    try {
      const res = await fetch(`/api/logs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLogs(logs.filter((l: any) => l.id !== id));
      } else {
        alert('Failed to delete log');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('System Audit Logs', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Timestamp', 'Action', 'User', 'Status']],
      body: logs.map(log => [
        new Date(log.createdAt).toLocaleString(),
        log.action,
        log.user?.name || 'System',
        log.status
      ])
    });
    doc.save('audit_logs.pdf');
  };

  const exportCSV = () => {
    const headers = ['Timestamp', 'Action', 'User', 'Status', 'Details'];
    const rows = logs.map(log => [
      new Date(log.createdAt).toLocaleString(),
      `"${log.action.replace(/"/g, '""')}"`,
      `"${(log.user?.name || 'System').replace(/"/g, '""')}"`,
      log.status,
      `"${(log.details || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_logs.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)' }}>System Reports & Logs</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Global system health, compliance rates, and audit trails.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportCSV} className="button button-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Excel (CSV)
          </button>
          <button onClick={exportPDF} className="button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} /> PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: '#E0F2FE', borderRadius: '50%' }}>
            <FileText size={24} color="#0284C7" />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-blue)' }}>{stats.totalArticles}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Total Processed</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: '#D1FAE5', borderRadius: '50%' }}>
            <Activity size={24} color="#059669" />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-blue)' }}>{stats.successfulSubmissions}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Successful Submissions</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: '#FEE2E2', borderRadius: '50%' }}>
            <AlertTriangle size={24} color="#DC2626" />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-blue)' }}>{stats.failedValidations}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Validation Failures</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-blue)', marginBottom: '20px' }}>Recent Audit Logs</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>Timestamp</th>
                <th style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>Action</th>
                <th style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>User</th>
                <th style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '20px 0', textAlign: 'center', color: '#666' }}>No logs recorded.</td></tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id}>
                    <td style={{ padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>{new Date(log.createdAt).toLocaleString()}</td>
                    <td style={{ padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>{log.action}</td>
                    <td style={{ padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>{log.user?.name || 'System'}</td>
                    <td style={{ padding: '15px 0', borderBottom: '1px solid #f1f5f9', color: log.status === 'SUCCESS' ? '#059669' : '#DC2626', fontWeight: 600 }}>{log.status}</td>
                    <td style={{ padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <button onClick={() => handleDelete(log.id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
