'use client';

import { useState, useEffect } from "react";
import { Save, Server, ShieldCheck, Database } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsClient() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        toast.error("Failed to load settings");
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    const toastId = toast.loading("Saving settings...");
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        toast.success("Settings saved successfully!", { id: toastId });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast.error("Error saving settings", { id: toastId });
    }
  };

  const handleChange = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
      
      {/* API Configurations */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Server size={24} color="var(--brand-blue)" />
          <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-blue)' }}>Integration Endpoints</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>PubMed Central (PMC) FTP Host</label>
            <input type="text" value={settings.pmcFtpHost || ''} onChange={e => handleChange('pmcFtpHost', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>PubMed Central (PMC) FTP User</label>
            <input type="text" value={settings.pmcFtpUser || ''} onChange={e => handleChange('pmcFtpUser', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>PubMed Central (PMC) FTP Password</label>
            <input type="password" value={settings.pmcFtpPassword || ''} onChange={e => handleChange('pmcFtpPassword', e.target.value)} placeholder="••••••••••••••••" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>SciELO API Token</label>
            <input type="password" value={settings.scieloApiToken || ''} onChange={e => handleChange('scieloApiToken', e.target.value)} placeholder="••••••••••••••••" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Crossref Username</label>
            <input type="text" value={settings.crossrefUsername || ''} onChange={e => handleChange('crossrefUsername', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Crossref Password</label>
            <input type="password" value={settings.crossrefPassword || ''} onChange={e => handleChange('crossrefPassword', e.target.value)} placeholder="••••••••••••••••" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>DOAJ API Key</label>
            <input type="password" value={settings.doajApiKey || ''} onChange={e => handleChange('doajApiKey', e.target.value)} placeholder="••••••••••••••••" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Google Scholar Integration Key</label>
            <input type="password" value={settings.googleScholarKey || ''} onChange={e => handleChange('googleScholarKey', e.target.value)} placeholder="••••••••••••••••" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>OpenAIRE Token</label>
            <input type="password" value={settings.openAireToken || ''} onChange={e => handleChange('openAireToken', e.target.value)} placeholder="••••••••••••••••" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Scopus XML Workflows Key</label>
            <input type="password" value={settings.scopusKey || ''} onChange={e => handleChange('scopusKey', e.target.value)} placeholder="••••••••••••••••" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Web of Science Publisher Workflows Key</label>
            <input type="password" value={settings.wosKey || ''} onChange={e => handleChange('wosKey', e.target.value)} placeholder="••••••••••••••••" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
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
            <input type="checkbox" checked={settings.oaiEnabled} onChange={e => handleChange('oaiEnabled', e.target.checked)} />
            Enable OAI-PMH Harvesting Endpoint (/api/oai)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={settings.require2FA} onChange={e => handleChange('require2FA', e.target.checked)} />
            Require 2FA for Administrator Accounts
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={settings.logMetadataChanges} onChange={e => handleChange('logMetadataChanges', e.target.checked)} />
            Log all Editorial Metadata changes
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={settings.allowReviewerSource} onChange={e => handleChange('allowReviewerSource', e.target.checked)} />
            Allow Reviewers to download raw source DOCX
          </label>
          <div style={{ borderTop: '1px solid var(--border-color)', margin: '10px 0' }}></div>
          <h3 style={{ fontSize: '1rem', color: 'var(--brand-blue)', fontWeight: 600 }}>Pipeline Behaviors</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600 }}>
            <input type="checkbox" checked={settings.convertXmlToHtml} onChange={e => handleChange('convertXmlToHtml', e.target.checked)} />
            Convert XML into HTML Version of the Article (For Web Preview)
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
            <input type="number" value={settings.sourceRetentionDays} onChange={e => handleChange('sourceRetentionDays', parseInt(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Generated ZIP Retention (Days)</label>
            <input type="number" value={settings.zipRetentionDays} onChange={e => handleChange('zipRetentionDays', parseInt(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gridColumn: '1 / -1' }}>
        <button onClick={handleSave} className="button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={18} /> Save Configurations
        </button>
      </div>
    </div>
  );
}
