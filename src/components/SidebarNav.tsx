'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarNav() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/upload', label: 'Upload Article' },
    { href: '/dashboard/articles', label: 'All Articles' },
    { href: '/dashboard/settings', label: 'Settings' },
  ];

  return (
    <nav style={{ display: 'flex', flexDirection: 'column' }}>
      {links.map(link => {
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
