import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Activity, AlertTriangle, FileText, Download } from "lucide-react";
import { db } from "@/lib/db";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch some aggregate data for placeholders
  const totalArticles = await db.article.count();
  const successfulSubmissions = await db.article.count({ where: { status: 'SUBMITTED' } });
  const failedValidations = await db.article.count({ where: { status: 'VALIDATION_FAILED' } });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)' }}>System Reports & Logs</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Global system health, compliance rates, and audit trails.</p>
        </div>
        <button className="button button-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={18} /> Export Full Audit Log
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: '#E0F2FE', borderRadius: '50%' }}>
            <FileText size={24} color="#0284C7" />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-blue)' }}>{totalArticles}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Total Processed</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: '#D1FAE5', borderRadius: '50%' }}>
            <Activity size={24} color="#059669" />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-blue)' }}>{successfulSubmissions}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Successful Submissions</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: '#FEE2E2', borderRadius: '50%' }}>
            <AlertTriangle size={24} color="#DC2626" />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-blue)' }}>{failedValidations}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Validation Failures</div>
          </div>
        </div>
      </div>

      {/* Placeholder Log Table */}
      <div className="card">
        <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-blue)', marginBottom: '20px' }}>Recent Audit Logs</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>Timestamp</th>
              <th style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>Action</th>
              <th style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>User</th>
              <th style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>2026-06-27 14:32:01</td>
              <td style={{ padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>SciELO XML Generation Triggered</td>
              <td style={{ padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>Admin User</td>
              <td style={{ padding: '15px 0', borderBottom: '1px solid #f1f5f9', color: '#059669', fontWeight: 600 }}>SUCCESS</td>
            </tr>
            <tr>
              <td style={{ padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>2026-06-27 13:15:44</td>
              <td style={{ padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>System Settings Updated (Retention Policy)</td>
              <td style={{ padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>Admin User</td>
              <td style={{ padding: '15px 0', borderBottom: '1px solid #f1f5f9', color: '#059669', fontWeight: 600 }}>SUCCESS</td>
            </tr>
            <tr>
              <td style={{ padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>2026-06-27 11:05:12</td>
              <td style={{ padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>PMC Validation Engine Run</td>
              <td style={{ padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>Editorial Manager</td>
              <td style={{ padding: '15px 0', borderBottom: '1px solid #f1f5f9', color: '#DC2626', fontWeight: 600 }}>FAILED</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
