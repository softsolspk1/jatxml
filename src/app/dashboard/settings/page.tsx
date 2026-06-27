import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

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
      
      <div className="card" style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-blue)', marginBottom: '15px' }}>Add New User</h2>
        <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 600 }}>Name</label>
            <input type="text" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 600 }}>Email</label>
            <input type="email" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 600 }}>Role</label>
            <select required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'white' }}>
              <option value="XML_OPERATOR">XML Operator</option>
              <option value="EDITORIAL_MANAGER">Editorial Manager</option>
              <option value="REVIEWER">Reviewer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" className="button" style={{ padding: '10px 20px' }}>Create User</button>
        </form>
      </div>

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
