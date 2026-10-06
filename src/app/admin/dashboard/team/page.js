'use client';
import { useState, useEffect } from 'react';
import styles from '../dashboard.module.css';
import { authFetch } from '@/lib/authFetch';

export default function TeamManager() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null, 'new', or item id
  const [formData, setFormData] = useState({ name: '', title: '', role: 'Advokat' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/team');
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (err) {
      alert('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({ name: '', title: '', role: 'Advokat' });
    setEditing('new');
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name, title: item.title || '', role: item.role });
    setEditing(item.id);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Yakin ingin menghapus anggota tim ini?');
    if (!confirmed) return;
    try {
      const res = await authFetch(`/api/admin/team?id=${id}`, {
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
      alert('Terjadi kesalahan koneksi saat menghapus');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = '/api/admin/team';
      const method = editing === 'new' ? 'POST' : 'PUT';
      const body = editing === 'new' 
        ? formData 
        : { id: editing, member: formData };
        
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

  if (loading) return <div className={styles.loadingState}><div className={styles.spinner} /><p>Memuat data...</p></div>;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Kelola Tim Advokat</h1>
          <p className={styles.pageSubtitle}>{data.length} anggota tim terdaftar</p>
        </div>
        {!editing && (
          <button className={styles.btnPrimary} onClick={handleAddNew}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Tambah Anggota
          </button>
        )}
      </div>

      {editing !== null ? (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{editing === 'new' ? '✨ Tambah Anggota Baru' : '✏️ Edit Anggota'}</h2>
          </div>
          <form onSubmit={handleSave} className={styles.formGrid}>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nama Lengkap</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                className={styles.formInput}
                placeholder="Masukkan nama lengkap..."
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Gelar (Opsional)</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className={styles.formInput}
                placeholder="S.H., M.H., dll..."
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Jabatan / Role</label>
              <select 
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className={styles.formSelect}
              >
                <option value="Advokat">Advokat</option>
                <option value="Asisten Advokat">Asisten Advokat</option>
              </select>
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
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Gelar</th>
                <th>Jabatan</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.tableNameCell}>
                      <div className={styles.avatarPlaceholder}>
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={styles.tableName}>{item.name}</span>
                    </div>
                  </td>
                  <td className={styles.tableSecondary}>{item.title || '-'}</td>
                  <td>
                    <span className={`${styles.badge} ${item.role === 'Advokat' ? styles.badgeGreen : styles.badgeGray}`}>
                      {item.role}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className={styles.tableActions}>
                      <button onClick={() => handleEdit(item)} className={styles.btnEdit}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        Edit
                      </button>
                      <button type="button" onClick={(e) => { e.preventDefault(); handleDelete(item.id || item.ID); }} className={styles.btnDanger}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="4" className={styles.emptyState}>
                    <p>Belum ada anggota tim</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
