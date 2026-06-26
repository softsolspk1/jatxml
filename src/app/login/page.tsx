'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    
    if (res?.error) {
      setError('Invalid credentials');
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--brand-blue)', marginBottom: '10px', textAlign: 'center' }}>Portal Login</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '30px' }}>Sign in to manage JATS XML conversions.</p>
        
        {error && <p style={{ color: '#EF4444', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
            />
          </div>
          <button type="submit" className="button" style={{ marginTop: '10px', padding: '12px' }}>Sign In</button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          &copy; 2026 Softsols Pakistan. All Rights Reserved.
        </div>
      </div>
    </div>
  );
}
