import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

import AddUserForm from './AddUserForm';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  // Only Admins should see the full settings
  if (!session || (session.user as any).role !== 'ADMIN') {
    return (
      <div>
        <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)', marginBottom: '30px' }}>Settings</h1>
        <div className="card">
          <p style={{ color: 'var(--text-secondary)' }}>You do not have permission to view this page. Administrator access required.</p>
        </div>
      </div>
    );
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)', marginBottom: '30px' }}>Settings & User Management</h1>
      
      <AddUserForm />

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Name</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Last Login</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>{user.name || 'N/A'}</td>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>{user.email}</td>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ backgroundColor: 'var(--bg-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>{user.role}</span>
                </td>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: user.status === 'ACTIVE' ? 'var(--brand-green)' : '#EF4444', fontWeight: 600, fontSize: '0.9rem' }}>{user.status}</span>
                </td>
                <td style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
