import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

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
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Editorial Manager</p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          <Link href="/dashboard" style={{ padding: '15px 20px', borderLeft: '4px solid transparent' }}>Overview</Link>
          <Link href="/dashboard/upload" style={{ padding: '15px 20px', borderLeft: '4px solid var(--brand-green)', backgroundColor: 'var(--brand-blue-light)' }}>Upload Article</Link>
          <Link href="/dashboard/articles" style={{ padding: '15px 20px', borderLeft: '4px solid transparent' }}>All Articles</Link>
          <Link href="/dashboard/settings" style={{ padding: '15px 20px', borderLeft: '4px solid transparent' }}>Settings</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ backgroundColor: 'white', padding: '20px 40px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Welcome, Admin</span>
            <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: 'var(--brand-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>A</div>
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
