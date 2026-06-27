'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarNav({ role }: { role: string }) {
  const pathname = usePathname();

  const allLinks = [
    { href: '/dashboard', label: 'Overview', roles: ['ADMIN', 'EDITORIAL_MANAGER', 'XML_OPERATOR', 'REVIEWER'] },
    { href: '/dashboard/upload', label: 'Upload Article', roles: ['ADMIN', 'EDITORIAL_MANAGER'] },
    { href: '/dashboard/articles', label: 'All Articles', roles: ['ADMIN', 'EDITORIAL_MANAGER', 'XML_OPERATOR', 'REVIEWER'] },
    { href: '/dashboard/users', label: 'Manage Users', roles: ['ADMIN'] },
    { href: '/dashboard/settings', label: 'System Settings', roles: ['ADMIN'] },
    { href: '/dashboard/templates', label: 'XML Templates', roles: ['ADMIN'] },
    { href: '/dashboard/reports', label: 'Reports & Logs', roles: ['ADMIN'] },
  ];

  const visibleLinks = allLinks.filter(link => link.roles.includes(role));

  return (
    <nav style={{ display: 'flex', flexDirection: 'column' }}>
      {visibleLinks.map(link => {
        const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
        return (
          <Link 
            key={link.href}
            href={link.href} 
            style={{ 
              padding: '15px 20px', 
              borderLeft: `4px solid ${isActive ? 'var(--brand-green)' : 'transparent'}`,
              backgroundColor: isActive ? 'var(--brand-blue-light)' : 'transparent',
              color: 'var(--brand-white)',
              textDecoration: 'none'
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
