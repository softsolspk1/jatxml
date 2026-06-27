'use client';

import { useState } from 'react';
import { Code, FileCode2, Edit3, Trash2, X, Save } from "lucide-react";

type Template = {
  id: number;
  name: string;
  type: string;
  lastUpdated: string;
  status: string;
};

const initialTemplates: Template[] = [
  { id: 1, name: 'JATS 1.3 Core', type: 'Journal Publishing', lastUpdated: '2026-06-25', status: 'Active' },
  { id: 2, name: 'SciELO PS Validator Template', type: 'Specialized', lastUpdated: '2026-06-26', status: 'Active' },
  { id: 3, name: 'PMC Submission Header', type: 'Metadata Mapping', lastUpdated: '2026-06-20', status: 'Active' },
  { id: 4, name: 'Crossref Deposit Schema', type: 'Specialized', lastUpdated: '2026-06-15', status: 'Inactive' }
];

export default function TemplatesClient() {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const handleEdit = (tpl: Template) => {
    setEditingTemplate({ ...tpl });
  };

  const handleSave = () => {
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...editingTemplate, lastUpdated: new Date().toISOString().split('T')[0] } : t));
      setEditingTemplate(null);
    }
  };

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
                    <button onClick={() => handleEdit(tpl)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-blue)' }}>
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

      {editingTemplate && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', padding: '30px', position: 'relative' }}>
            <button onClick={() => setEditingTemplate(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-blue)', marginBottom: '20px' }}>Edit Template</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Template Name</label>
                <input type="text" value={editingTemplate.name} onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Type</label>
                <input type="text" value={editingTemplate.type} onChange={e => setEditingTemplate({...editingTemplate, type: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Status</label>
                <select value={editingTemplate.status} onChange={e => setEditingTemplate({...editingTemplate, status: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button className="button" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
