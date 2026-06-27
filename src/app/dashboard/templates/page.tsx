import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Code, FileCode2, Edit3, Trash2 } from "lucide-react";

export default async function XMLTemplatesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const templates = [
    { id: 1, name: 'JATS 1.3 Core', type: 'Journal Publishing', lastUpdated: '2026-06-25', status: 'Active' },
    { id: 2, name: 'SciELO PS Validator Template', type: 'Specialized', lastUpdated: '2026-06-26', status: 'Active' },
    { id: 3, name: 'PMC Submission Header', type: 'Metadata Mapping', lastUpdated: '2026-06-20', status: 'Active' },
    { id: 4, name: 'Crossref Deposit Schema', type: 'Specialized', lastUpdated: '2026-06-15', status: 'Inactive' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)' }}>XML Templates</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage standard DTD mappings and output schemas.</p>
        </div>
        <button className="button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={18} /> Create New Template
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Template Name</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Type</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Last Updated</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((tpl) => (
              <tr key={tpl.id}>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileCode2 size={18} color="var(--brand-blue)" />
                    <span style={{ fontWeight: 600 }}>{tpl.name}</span>
                  </div>
                </td>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  {tpl.type}
                </td>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ 
                    backgroundColor: tpl.status === 'Active' ? '#D1FAE5' : '#F3F4F6', 
                    color: tpl.status === 'Active' ? '#059669' : '#6B7280', 
                    padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 
                  }}>
                    {tpl.status}
                  </span>
                </td>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {tpl.lastUpdated}
                </td>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-blue)' }}>
                      <Edit3 size={18} />
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
