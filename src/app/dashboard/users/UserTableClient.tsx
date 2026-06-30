'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserTableClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const router = useRouter();

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map(u => u.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const startEdit = (user: any) => {
    setEditingId(user.id);
    setEditForm({ name: user.name || '', email: user.email, role: user.role, status: user.status });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(u => u.id === id ? { ...u, ...data.user } : u));
        setEditingId(null);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
      {selectedIds.length > 0 && (
        <div style={{ padding: '15px 20px', backgroundColor: 'var(--brand-blue-light)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>{selectedIds.length} users selected</span>
          {/* Add bulk actions here if needed in the future */}
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
          <tr>
            <th style={{ padding: '15px 20px', width: '50px' }}>
              <input 
                type="checkbox" 
                checked={selectedIds.length === users.length && users.length > 0}
                onChange={toggleSelectAll}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </th>
            <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Name</th>
            <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</th>
            <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</th>
            <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
            <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Last Login</th>
            <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(user.id)}
                  onChange={() => toggleSelect(user.id)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </td>
              <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                {editingId === user.id ? 
                  <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{ width: '100%', padding: '5px' }} /> 
                  : (user.name || 'N/A')}
              </td>
              <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                {editingId === user.id ? 
                  <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} style={{ width: '100%', padding: '5px' }} /> 
                  : user.email}
              </td>
              <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                {editingId === user.id ? 
                  <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} style={{ padding: '5px' }}>
                    <option value="XML_OPERATOR">XML Operator</option>
                    <option value="EDITORIAL_MANAGER">Editorial Manager</option>
                    <option value="REVIEWER">Reviewer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  : <span style={{ backgroundColor: 'var(--bg-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>{user.role}</span>}
              </td>
              <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                {editingId === user.id ? 
                  <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} style={{ padding: '5px' }}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                  : <span style={{ color: user.status === 'ACTIVE' ? 'var(--brand-green)' : '#EF4444', fontWeight: 600, fontSize: '0.9rem' }}>{user.status}</span>}
              </td>
              <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
              </td>
              <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                {editingId === user.id ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => saveEdit(user.id)} style={{ color: 'var(--brand-green)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save</button>
                    <button onClick={cancelEdit} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => startEdit(user)} style={{ color: 'var(--brand-blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                    <button onClick={() => handleDelete(user.id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
