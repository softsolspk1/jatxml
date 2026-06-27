'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ResetRequestPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--brand-blue)', marginBottom: '10px', textAlign: 'center' }}>Reset Password</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '30px' }}>Enter your email to receive a password reset link.</p>
        
        {status === 'success' ? (
          <div>
            <div style={{ padding: '15px', backgroundColor: '#D1FAE5', color: '#059669', borderRadius: '4px', textAlign: 'center', marginBottom: '20px' }}>
              Reset request received! If your email exists in our system, you will receive a reset link shortly.
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link href="/login" style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>Back to Login</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {status === 'error' && <p style={{ color: '#EF4444', textAlign: 'center' }}>Failed to request reset. Ensure email is correct.</p>}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
              />
            </div>
            <button type="submit" className="button" style={{ marginTop: '10px', padding: '12px', opacity: status === 'loading' ? 0.7 : 1 }} disabled={status === 'loading'}>
              {status === 'loading' ? 'Requesting...' : 'Send Reset Link'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <Link href="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
