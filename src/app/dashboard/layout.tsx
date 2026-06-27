import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import SidebarNav from '@/components/SidebarNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: 'var(--brand-blue)', color: 'var(--brand-white)', padding: '20px 0' }}>
        <div style={{ padding: '0 20px', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>JATS XML Portal</h2>
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{((session?.user as any)?.role || 'REVIEWER').replace('_', ' ')}</p>
        </div>
          <SidebarNav role={(session?.user as any)?.role || 'REVIEWER'} />
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ backgroundColor: 'white', padding: '20px 40px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome, {session?.user?.name || 'User'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--brand-green)', fontWeight: 600 }}>{(session?.user as any)?.role?.replace('_', ' ')}</div>
            </div>
            <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: 'var(--brand-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <Link href="/api/auth/signout" style={{ marginLeft: '20px', fontSize: '0.9rem', color: '#EF4444', fontWeight: 600 }}>Logout</Link>
          </div>
        </header>
        <main style={{ padding: '40px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
