'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function NewPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMsg('Passwords do not match');
      return;
    }

    setStatus('loading');
    
    try {
      const res = await fetch('/api/auth/reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resolvedParams.token, password })
      });
      
      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        const data = await res.json();
        setStatus('error');
        setErrorMsg(data.error || 'Failed to reset password');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error occurred');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--brand-blue)', marginBottom: '10px', textAlign: 'center' }}>Set New Password</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '30px' }}>Enter your new password below.</p>
        
        {status === 'success' ? (
          <div>
            <div style={{ padding: '15px', backgroundColor: '#D1FAE5', color: '#059669', borderRadius: '4px', textAlign: 'center', marginBottom: '20px' }}>
              Password updated successfully! Redirecting to login...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {status === 'error' && <p style={{ color: '#EF4444', textAlign: 'center' }}>{errorMsg}</p>}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>New Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Confirm Password</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
              />
            </div>
            <button type="submit" className="button" style={{ marginTop: '10px', padding: '12px', opacity: status === 'loading' ? 0.7 : 1 }} disabled={status === 'loading'}>
              {status === 'loading' ? 'Saving...' : 'Save New Password'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <Link href="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cancel</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
