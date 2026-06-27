import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Save, Server, ShieldCheck, Database } from "lucide-react";

export default async function SystemSettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)' }}>System Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure global platform behaviors and API endpoints.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* API Configurations */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Server size={24} color="var(--brand-blue)" />
            <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-blue)' }}>Integration Endpoints</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Crossref Deposit API Key</label>
              <input type="password" placeholder="••••••••••••••••" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>SciELO API Token</label>
              <input type="password" placeholder="••••••••••••••••" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>PubMed Central FTP Host</label>
              <input type="text" defaultValue="ftp.ncbi.nlm.nih.gov" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <ShieldCheck size={24} color="var(--brand-green)" />
            <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-blue)' }}>Security & Access Control</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              Require 2FA for Administrator Accounts
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              Log all Editorial Metadata changes
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" />
              Allow Reviewers to download raw source DOCX
            </label>
          </div>
        </div>
        
        {/* Storage */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Database size={24} color="#F59E0B" />
            <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-blue)' }}>Data Retention & Storage</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
            Configure how long source files and generated ZIP packages are retained on the server before automatic deletion.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Source DOCX Retention (Days)</label>
              <input type="number" defaultValue={30} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Generated ZIP Retention (Days)</label>
              <input type="number" defaultValue={90} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>
          </div>
        </div>

      </div>

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={18} /> Save Configurations
        </button>
      </div>
    </div>
  );
}
