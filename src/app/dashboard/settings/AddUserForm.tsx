'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddUserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('XML_OPERATOR');
  const [password, setPassword] = useState('Welcome@123'); // Default password
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create user');
      }

      setStatus('success');
      setName('');
      setEmail('');
      setRole('XML_OPERATOR');
      router.refresh(); // Refresh the page to show the new user in the table
      
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '30px' }}>
      <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-blue)', marginBottom: '15px' }}>Add New User</h2>
      
      {status === 'success' && <div style={{ padding: '10px', backgroundColor: '#D1FAE5', color: '#059669', marginBottom: '15px', borderRadius: '4px' }}>User created successfully! Default password is: Welcome@123</div>}
      {status === 'error' && <div style={{ padding: '10px', backgroundColor: '#FEE2E2', color: '#DC2626', marginBottom: '15px', borderRadius: '4px' }}>{errorMsg}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 600 }}>Name</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 600 }}>Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 600 }}>Role</label>
          <select required value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'white' }}>
            <option value="XML_OPERATOR">XML Operator</option>
            <option value="EDITORIAL_MANAGER">Editorial Manager</option>
            <option value="REVIEWER">Reviewer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <button type="submit" className="button" disabled={status === 'loading'} style={{ padding: '10px 20px', opacity: status === 'loading' ? 0.7 : 1 }}>
          {status === 'loading' ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}
