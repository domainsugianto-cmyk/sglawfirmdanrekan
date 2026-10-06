'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './dashboard.module.css';
import { authFetch } from '@/lib/authFetch';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Auth check using Authorization header (works on localhost AND IP access)
    authFetch('/api/auth/check').then(res => res.json()).then(data => {
      if (!data.authenticated) {
        router.push('/admin');
      }
    }).catch(() => router.push('/admin'));
  }, [router]);

  const handleLogout = async () => {
    localStorage.removeItem('admin_token');
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin');
  };

  const navItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Konten Website', path: '/admin/dashboard/content', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { name: 'Kelola Tim', path: '/admin/dashboard/team', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Testimoni', path: '/admin/dashboard/testimonials', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { name: 'Gallery', path: '/admin/dashboard/gallery', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ];

  return (
    <div className={styles.dashboardWrapper}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2>Admin CMS</h2>
          <button className={styles.closeMenuBtn} onClick={() => setIsMobileMenuOpen(false)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`${styles.navLink} ${pathname === item.path ? styles.active : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <button className={styles.mobileMenuBtn} onClick={() => setIsMobileMenuOpen(true)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <div className={styles.headerTitle}>
            Dashboard Control Panel
          </div>
          <Link href="/" target="_blank" className={styles.viewSiteBtn}>
            Lihat Website
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </Link>
        </header>
        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
      
      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div className={styles.overlay} onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
}
