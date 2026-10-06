'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from '../dashboard.module.css';
import { authFetch } from '@/lib/authFetch';

export default function TestimonialsManager() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null, 'new', or item id
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'approved'
  
  const [formData, setFormData] = useState({ name: '', text: '', avatar: '' });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/testimonials');
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (err) {
      alert('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({ name: '', text: '', avatar: '' });
    setEditing('new');
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name, text: item.text, avatar: item.avatar || '', rating: item.rating || 5 });
    setEditing(item.id);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Yakin ingin menghapus testimoni ini?');
    if (!confirmed) return;
    try {
      const res = await authFetch(`/api/admin/testimonials?id=${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (res.ok) {
        setData(Array.isArray(result.data) ? result.data : []);
      } else {
        alert(result.error || 'Gagal menghapus');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const handleToggleApprove = async (id, currentStatus) => {
    try {
      const res = await authFetch('/api/admin/testimonials', {
        method: 'PATCH',
        body: JSON.stringify({ id, is_approved: !currentStatus }),
      });
      const result = await res.json();
      if (res.ok) setData(Array.isArray(result.data) ? result.data : []);
      else alert(result.error);
    } catch (err) {
      alert('Gagal mengupdate status');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = '/api/admin/testimonials';
      const method = editing === 'new' ? 'POST' : 'PUT';
      const body = editing === 'new' 
        ? formData 
        : { id: editing, testimonial: formData };
        
      const res = await authFetch(url, {
        method,
        body: JSON.stringify(body),
      });
      
      const result = await res.json();
      if (res.ok) {
        setData(Array.isArray(result.data) ? result.data : []);
        setEditing(null);
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'images');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers,
        body: fd,
      });
      const result = await res.json();
      if (res.ok) {
        setFormData({ ...formData, avatar: result.path });
      } else {
        alert(result.error || 'Gagal upload avatar');
      }
    } catch (err) {
      alert('Gagal koneksi');
    }
  };

  if (loading) return <div className={styles.loadingState}><div className={styles.spinner} /><p>Memuat data...</p></div>;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Kelola Testimoni</h1>
          <p className={styles.pageSubtitle}>{data.length} testimoni dari klien</p>
        </div>
        {!editing && (
          <button className={styles.btnPrimary} onClick={handleAddNew}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Tambah Testimoni
          </button>
        )}
      </div>

      {editing !== null ? (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{editing === 'new' ? '✨ Tambah Testimoni Baru' : '✏️ Edit Testimoni'}</h2>
          </div>
          <form onSubmit={handleSave} className={styles.formGrid}>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nama Klien</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                className={styles.formInput}
                placeholder="Masukkan nama klien..."
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Isi Testimoni</label>
              <textarea 
                value={formData.text}
                onChange={e => setFormData({ ...formData, text: e.target.value })}
                required
                rows="4"
                className={styles.formTextarea}
                placeholder="Tulis testimoni klien..."
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Rating Bintang</label>
              <select 
                value={formData.rating || 5} 
                onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className={styles.formInput}
              >
                <option value={5}>5 Bintang (Sangat Puas)</option>
                <option value={4}>4 Bintang (Puas)</option>
                <option value={3}>3 Bintang (Cukup)</option>
                <option value={2}>2 Bintang (Kurang)</option>
                <option value={1}>1 Bintang (Buruk)</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Avatar (URL / Upload)</label>
              <div className={styles.uploadRow}>
                <input 
                  type="text" 
                  value={formData.avatar}
                  onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                  className={styles.formInput}
                  placeholder="URL gambar avatar..."
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} className={styles.btnOutline}>
                  📷 Upload
                </button>
                <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
              </div>
              {formData.avatar && (
                <div style={{ marginTop: '0.75rem', width: '80px', height: '80px', position: 'relative', borderRadius: '50%', overflow: 'hidden', border: '3px solid #e2e8f0' }}>
                  <Image src={formData.avatar} alt="Preview" fill style={{ objectFit: 'cover' }} />
                </div>
              )}
            </div>
            
            <div className={styles.formActions}>
              <button type="submit" className={styles.btnPrimary} disabled={saving}>
                {saving ? 'Menyimpan...' : '💾 Simpan'}
              </button>
              <button type="button" onClick={() => setEditing(null)} className={styles.btnOutline}>
                Batal
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0' }}>
            <button 
              onClick={() => setActiveTab('pending')}
              style={{
                padding: '0.75rem 1.5rem', background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === 'pending' ? '2px solid #ea580c' : '2px solid transparent',
                color: activeTab === 'pending' ? '#ea580c' : '#64748b', fontWeight: activeTab === 'pending' ? 700 : 500,
                fontSize: '1rem', marginBottom: '-2px'
              }}
            >
              ⏳ Menunggu Persetujuan ({data.filter(i => !i.is_approved).length})
            </button>
            <button 
              onClick={() => setActiveTab('approved')}
              style={{
                padding: '0.75rem 1.5rem', background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === 'approved' ? '2px solid #16a34a' : '2px solid transparent',
                color: activeTab === 'approved' ? '#16a34a' : '#64748b', fontWeight: activeTab === 'approved' ? 700 : 500,
                fontSize: '1rem', marginBottom: '-2px'
              }}
            >
              ✅ Sudah Disetujui ({data.filter(i => i.is_approved).length})
            </button>
          </div>

          {/* Menunggu Persetujuan */}
          {activeTab === 'pending' && (
              <div className={styles.testimonialList} style={{ marginBottom: '2rem' }}>
                {data.filter(i => !i.is_approved).map((item) => (
                  <div key={item.id} className={styles.testimonialItem} style={{ borderLeft: '4px solid #fbbf24' }}>
                    <div className={styles.testimonialItemAvatar}>
                      {item.avatar ? (
                        <Image src={item.avatar} alt={item.name} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <span>{item.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className={styles.testimonialItemContent}>
                      <h3>{item.name}</h3>
                      <div style={{ color: '#fbbf24', fontSize: '1rem', marginBottom: '0.25rem' }}>
                        {'★'.repeat(item.rating || 5)}{'☆'.repeat(5 - (item.rating || 5))}
                      </div>
                      <p>&ldquo;{item.text}&rdquo;</p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button 
                          type="button"
                          onClick={() => handleToggleApprove(item.id, item.is_approved)} 
                          style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer', background: '#dcfce7', color: '#166534' }}
                        >
                          ✓ Setujui
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleEdit(item)} 
                          style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#2563eb' }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #fecaca', fontWeight: 600, cursor: 'pointer', background: '#fef2f2', color: '#991b1b' }}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          )}

          {/* Sudah Disetujui */}
          {activeTab === 'approved' && (
            <div className={styles.testimonialList}>
            {data.filter(i => i.is_approved).map((item) => (
              <div key={item.id} className={styles.testimonialItem} style={{ borderLeft: '4px solid #22c55e' }}>
                <div className={styles.testimonialItemAvatar}>
                  {item.avatar ? (
                    <Image src={item.avatar} alt={item.name} fill style={{ objectFit: 'cover' }} />
                  ) : (
                    <span>{item.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className={styles.testimonialItemContent}>
                  <h3>{item.name}</h3>
                  <div style={{ color: '#fbbf24', fontSize: '1rem', marginBottom: '0.25rem' }}>
                    {'★'.repeat(item.rating || 5)}{'☆'.repeat(5 - (item.rating || 5))}
                  </div>
                  <p>&ldquo;{item.text}&rdquo;</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button 
                      type="button"
                      onClick={() => handleToggleApprove(item.id, item.is_approved)} 
                      style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer', background: '#fef2f2', color: '#991b1b' }}
                    >
                      Sembunyikan
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleEdit(item)} 
                      style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#2563eb' }}
                    >
                      ✏️ Edit
                    </button>
                      <button 
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #fecaca', fontWeight: 600, cursor: 'pointer', background: '#fef2f2', color: '#991b1b' }}
                      >
                        Hapus
                      </button>
                  </div>
                </div>
              </div>
            ))}
            {data.filter(i => i.is_approved).length === 0 && (
              <div className={styles.emptyState}>
                <p>Belum ada testimoni yang disetujui</p>
              </div>
            )}
          </div>
          )}

        </>
      )}
    </>
  );
}
