'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';

export default function DashboardOverview() {
  const [stats, setStats] = useState({ team: 0, testimonials: 0, gallery: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [teamRes, testiRes, galleryRes] = await Promise.all([
          fetch('/api/admin/team'),
          fetch('/api/admin/testimonials'),
          fetch('/api/admin/gallery'),
        ]);
        const [team, testi, gallery] = await Promise.all([
          teamRes.json(),
          testiRes.json(),
          galleryRes.json(),
        ]);
        setStats({
          team: Array.isArray(team) ? team.length : 0,
          testimonials: Array.isArray(testi) ? testi.length : 0,
          gallery: Array.isArray(gallery) ? gallery.length : 0,
        });
      } catch (err) {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Dashboard</h1>
          <p className={styles.pageSubtitle}>Selamat datang di Admin CMS — kelola semua konten website Anda dari sini.</p>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.2) 100%)', color: '#2563eb' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <div className={styles.statValue}>{loading ? '—' : stats.team}</div>
          <div className={styles.statLabel}>Tim Advokat</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.2) 100%)', color: '#d97706' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          </div>
          <div className={styles.statValue}>{loading ? '—' : stats.testimonials}</div>
          <div className={styles.statLabel}>Testimoni Klien</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.2) 100%)', color: '#059669' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <div className={styles.statValue}>{loading ? '—' : stats.gallery}</div>
          <div className={styles.statLabel}>Foto Gallery</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>🚀 Menu Cepat</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <Link href="/admin/dashboard/content" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '1.5rem', border: '1.5px solid #e2e8f0', borderRadius: '14px', background: 'linear-gradient(135deg, #fafbfc, #f8fafc)', cursor: 'pointer', transition: 'all 0.25s' }} 
              onMouseOver={e => { e.currentTarget.style.borderColor = '#B91C1C40'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(185,28,28,0.08)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>📝</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>Konten Website</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Edit hero, tentang kami, kontak, dan footer.</p>
            </div>
          </Link>
          <Link href="/admin/dashboard/team" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '1.5rem', border: '1.5px solid #e2e8f0', borderRadius: '14px', background: 'linear-gradient(135deg, #fafbfc, #f8fafc)', cursor: 'pointer', transition: 'all 0.25s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#B91C1C40'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(185,28,28,0.08)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>👥</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>Tim Advokat</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Kelola daftar tim advokat dan asisten.</p>
            </div>
          </Link>
          <Link href="/admin/dashboard/testimonials" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '1.5rem', border: '1.5px solid #e2e8f0', borderRadius: '14px', background: 'linear-gradient(135deg, #fafbfc, #f8fafc)', cursor: 'pointer', transition: 'all 0.25s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#B91C1C40'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(185,28,28,0.08)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>💬</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>Testimoni</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Tambah dan kelola testimoni dari klien.</p>
            </div>
          </Link>
          <Link href="/admin/dashboard/gallery" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '1.5rem', border: '1.5px solid #e2e8f0', borderRadius: '14px', background: 'linear-gradient(135deg, #fafbfc, #f8fafc)', cursor: 'pointer', transition: 'all 0.25s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#B91C1C40'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(185,28,28,0.08)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>🖼️</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>Gallery</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Upload dan kelola foto dokumentasi.</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
