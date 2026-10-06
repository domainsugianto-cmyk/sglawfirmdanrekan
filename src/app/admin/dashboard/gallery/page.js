'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from '../dashboard.module.css';
import { authFetch } from '@/lib/authFetch';

export default function GalleryManager() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/admin/gallery');
      const data = await res.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (err) {
      alert('Gagal memuat gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Note: FormData upload - use authFetch without Content-Type (browser sets multipart)
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers,
        body: formData,
      });
      const result = await res.json();
      
      if (res.ok) {
        setImages(Array.isArray(result.data) ? result.data : []);
      } else {
        alert(result.error || 'Gagal mengupload');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReorder = async (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === images.length - 1)
    ) return;

    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap elements
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    
    // Optimistically update UI
    setImages(newImages);
    
    // Build payload with new positions
    const payload = newImages.map((img, i) => ({ id: img.id, position: i }));
    
    try {
      const res = await authFetch('/api/admin/gallery', {
        method: 'PUT',
        body: JSON.stringify({ items: payload }),
      });
      if (!res.ok) {
        const result = await res.json();
        alert(result.error || 'Gagal menyimpan urutan');
        fetchGallery();
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
      fetchGallery();
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Yakin ingin menghapus gambar ini?');
    if (!confirmed) return;
    
    try {
      const res = await authFetch(`/api/admin/gallery?id=${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      
      if (res.ok) {
        setImages(Array.isArray(result.data) ? result.data : []);
      } else {
        alert(result.error || 'Gagal menghapus');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Terjadi kesalahan koneksi saat menghapus');
    }
  };

  if (loading) return <div>Memuat data...</div>;

  return (
    <>
      <div className={styles.pageHeader}>
        <h1>Kelola Gallery</h1>
        <button 
          className={styles.btnPrimary} 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Mengupload...' : 'Tambah Foto'}
        </button>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          style={{ display: 'none' }} 
          onChange={handleUpload}
        />
      </div>

      <div className={styles.card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {images.map((item, index) => (
            <div key={item.id} style={{ position: 'relative', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: '150px', width: '100%', background: '#f8fafc' }}>
                <Image src={item.image_url} alt={`Gallery ${index}`} fill style={{ objectFit: 'contain' }} />
              </div>
              <div style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleReorder(index, 'up')}
                    disabled={index === 0}
                    style={{ padding: '0.4rem 0.6rem', background: index === 0 ? '#f1f5f9' : '#e2e8f0', border: 'none', borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer', color: index === 0 ? '#94a3b8' : '#334155' }}
                    title="Geser ke Kiri/Atas"
                  >
                    ◀
                  </button>
                  <button 
                    onClick={() => handleReorder(index, 'down')}
                    disabled={index === images.length - 1}
                    style={{ padding: '0.4rem 0.6rem', background: index === images.length - 1 ? '#f1f5f9' : '#e2e8f0', border: 'none', borderRadius: '4px', cursor: index === images.length - 1 ? 'not-allowed' : 'pointer', color: index === images.length - 1 ? '#94a3b8' : '#334155' }}
                    title="Geser ke Kanan/Bawah"
                  >
                    ▶
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleDelete(item.id || item.ID); }} 
                  style={{ 
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(239,68,68,0.2)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: 'rgba(239,68,68,0.08)',
                    color: '#dc2626',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    position: 'relative',
                    zIndex: 10
                  }}
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              Belum ada foto di gallery
            </div>
          )}
        </div>
      </div>
    </>
  );
}
