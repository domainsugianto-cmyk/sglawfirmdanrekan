'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from '../dashboard.module.css';
import mediaStyles from './content.module.css';

export default function ContentManager() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [saved, setSaved] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const mediaInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      try {
        const res = await fetch('/api/admin/content');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal memuat data');
        if (isMounted) {
          setData({
            ...json,
            about: {
              ...json.about,
              media: Array.isArray(json.about?.media) && json.about.media.length > 0
                ? json.about.media
                : [{ type: 'image', src: '/logo-new.jpg', alt: 'Logo SG Law Firm', fit: 'contain' }],
            },
          });
        }
      } catch (error) {
        if (isMounted) alert(error.message || 'Gagal memuat data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menyimpan');
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateAboutMedia = media => {
    setData(prev => ({
      ...prev,
      about: { ...prev.about, media },
    }));
  };

  const handleMediaUpload = async event => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadingMedia(true);
    const uploadedMedia = [];
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('admin_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch('/api/admin/about-media', {
          method: 'POST',
          headers,
          body: formData,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || `Gagal mengunggah ${file.name}`);
        }
        uploadedMedia.push({
          type: result.type,
          src: result.path,
          alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
          fit: 'cover',
        });
      }
      updateAboutMedia([...(data.about?.media || []), ...uploadedMedia]);
    } catch (error) {
      if (uploadedMedia.length > 0) {
        updateAboutMedia([...(data.about?.media || []), ...uploadedMedia]);
      }
      alert(error.message || 'Gagal mengunggah media. Silakan coba lagi.');
    } finally {
      setUploadingMedia(false);
      event.target.value = '';
    }
  };

  const moveAboutMedia = (index, direction) => {
    const media = [...(data.about?.media || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= media.length) return;
    [media[index], media[targetIndex]] = [media[targetIndex], media[index]];
    updateAboutMedia(media);
  };

  const updateAboutMediaItem = (index, field, value) => {
    updateAboutMedia((data.about?.media || []).map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    ));
  };

  const updateHeroStat = (index, field, value) => {
    setData(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        stats: (prev.hero?.stats || []).map((stat, statIndex) =>
          statIndex === index ? { ...stat, [field]: value } : stat
        ),
      },
    }));
  };

  const addHeroStat = () => {
    setData(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        stats: [...(prev.hero?.stats || []), { value: '', label: '' }],
      },
    }));
  };

  const removeHeroStat = (index) => {
    setData(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        stats: (prev.hero?.stats || []).filter((_, statIndex) => statIndex !== index),
      },
    }));
  };

  if (loading) return <div className={styles.loadingState}><div className={styles.spinner} /><p>Memuat data...</p></div>;

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: '🏠' },
    { id: 'about', label: 'Tentang Kami', icon: '📋' },
    { id: 'contact', label: 'Info Kontak', icon: '📞' },
    { id: 'footer', label: 'Footer & Sosmed', icon: '🔗' },
  ];

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Kelola Konten Website</h1>
          <p className={styles.pageSubtitle}>Edit teks dan informasi yang tampil di halaman utama</p>
        </div>
        <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
          {saving ? 'Menyimpan...' : saved ? '✅ Tersimpan!' : '💾 Simpan Perubahan'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Tabs sidebar */}
        <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '0.35rem', flexShrink: 0 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.8rem 1rem',
                textAlign: 'left',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #B91C1C 0%, #dc2626 100%)' : '#fff',
                color: activeTab === tab.id ? 'white' : '#475569',
                border: `1.5px solid ${activeTab === tab.id ? 'transparent' : '#e2e8f0'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 600 : 500,
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(185, 28, 28, 0.25)' : 'none',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.card} style={{ flex: 1, margin: 0 }}>
          <form className={styles.formGrid} style={{ maxWidth: '100%' }}>
            
            {activeTab === 'hero' && (
              <>
                <div className={styles.cardHeader}><h2>🏠 Hero Section</h2></div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Badge Text</label>
                  <input type="text" value={data.hero?.badge || ''} onChange={e => updateField('hero', 'badge', e.target.value)} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Title Awal</label>
                  <input type="text" value={data.hero?.title || ''} onChange={e => updateField('hero', 'title', e.target.value)} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Title Highlight (Merah)</label>
                  <input type="text" value={data.hero?.titleAccent || ''} onChange={e => updateField('hero', 'titleAccent', e.target.value)} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Title Akhir</label>
                  <input type="text" value={data.hero?.titleEnd || ''} onChange={e => updateField('hero', 'titleEnd', e.target.value)} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Deskripsi Pendek</label>
                  <textarea value={data.hero?.description || ''} onChange={e => updateField('hero', 'description', e.target.value)} className={styles.formTextarea} />
                </div>
                <div className={styles.cardHeader}><h2>📊 Statistik Hero</h2></div>
                {(data.hero?.stats || []).map((stat, index) => (
                  <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'grid', gap: '0.75rem' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Nilai Statistik {index + 1}{stat.source === 'teamCount' ? ' (otomatis dari data tim)' : ''}
                      </label>
                      <input
                        type="text"
                        value={stat.value || ''}
                        onChange={stat.source === 'teamCount' ? undefined : e => updateHeroStat(index, 'value', e.target.value)}
                        readOnly={stat.source === 'teamCount'}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Label Statistik {index + 1}</label>
                      <input
                        type="text"
                        value={stat.label || ''}
                        onChange={e => updateHeroStat(index, 'label', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    {stat.source !== 'teamCount' && (
                      <button
                        type="button"
                        className={styles.btnDanger}
                        onClick={() => removeHeroStat(index)}
                      >
                        Hapus Statistik
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className={styles.btnPrimary} onClick={addHeroStat}>
                  + Tambah Statistik
                </button>
              </>
            )}

            {activeTab === 'about' && (
              <>
                <div className={styles.cardHeader}><h2>📋 Tentang Kami</h2></div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Judul</label>
                  <input type="text" value={data.about?.title || ''} onChange={e => updateField('about', 'title', e.target.value)} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Deskripsi</label>
                  <textarea value={data.about?.description || ''} onChange={e => updateField('about', 'description', e.target.value)} className={styles.formTextarea} style={{ minHeight: '150px' }} />
                </div>
                <div className={mediaStyles.mediaHeader}>
                  <div>
                    <h3 className={mediaStyles.mediaTitle}>Foto &amp; Video</h3>
                    <p className={mediaStyles.mediaHint}>Tambahkan satu atau beberapa media. Urutan di sini menentukan urutan slideshow di halaman utama.</p>
                  </div>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={() => mediaInputRef.current?.click()}
                    disabled={uploadingMedia}
                  >
                    {uploadingMedia ? 'Mengunggah...' : '+ Tambah Media'}
                  </button>
                  <input
                    ref={mediaInputRef}
                    className={mediaStyles.fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime"
                    multiple
                    onChange={handleMediaUpload}
                  />
                </div>
                <div className={mediaStyles.mediaGrid}>
                  {(data.about?.media || []).map((item, index) => (
                    <article className={mediaStyles.mediaCard} key={`${item.src}-${index}`}>
                      <div className={mediaStyles.preview}>
                        {item.type === 'video' ? (
                          <video src={item.src} controls muted playsInline />
                        ) : (
                          <Image
                            src={item.src}
                            alt={item.alt || `Media Tentang Kami ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 320px"
                            style={{ objectFit: item.fit === 'contain' ? 'contain' : 'cover' }}
                          />
                        )}
                        <span className={mediaStyles.typeBadge}>{item.type === 'video' ? 'VIDEO' : 'FOTO'}</span>
                      </div>
                      <div className={mediaStyles.mediaDetails}>
                        <label className={mediaStyles.altLabel} htmlFor={`about-media-alt-${index}`}>Teks alternatif</label>
                        <input
                          id={`about-media-alt-${index}`}
                          className={styles.formInput}
                          type="text"
                          value={item.alt || ''}
                          onChange={event => updateAboutMediaItem(index, 'alt', event.target.value)}
                          placeholder="Deskripsi singkat media"
                        />
                        {item.type === 'image' && (
                          <label className={mediaStyles.fitControl}>
                            Tampilan gambar
                            <select
                              className={styles.formInput}
                              value={item.fit === 'contain' ? 'contain' : 'cover'}
                              onChange={event => updateAboutMediaItem(index, 'fit', event.target.value)}
                            >
                              <option value="cover">Penuhi bingkai</option>
                              <option value="contain">Tampilkan utuh</option>
                            </select>
                          </label>
                        )}
                        <div className={mediaStyles.mediaActions}>
                          <button type="button" onClick={() => moveAboutMedia(index, -1)} disabled={index === 0} aria-label="Geser ke urutan sebelumnya">Naik</button>
                          <button type="button" onClick={() => moveAboutMedia(index, 1)} disabled={index === data.about.media.length - 1} aria-label="Geser ke urutan berikutnya">Turun</button>
                          <button type="button" className={mediaStyles.removeButton} onClick={() => updateAboutMedia(data.about.media.filter((_, itemIndex) => itemIndex !== index))}>Hapus</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <div className={mediaStyles.mediaSave}>
                  <p className={mediaStyles.uploadNote}>Format: JPG, PNG, WebP, GIF, AVIF, MP4, WebM, atau MOV. Maksimal 100 MB per file.</p>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={() => handleSave()}
                    disabled={saving || uploadingMedia}
                  >
                    {saving ? 'Menyimpan...' : saved ? '✓ Media Tersimpan' : 'Simpan Perubahan'}
                  </button>
                </div>
              </>
            )}

            {activeTab === 'contact' && (
              <>
                <div className={styles.cardHeader}><h2>📞 Informasi Kontak</h2></div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Alamat Lengkap</label>
                  <textarea value={data.contact?.address || ''} onChange={e => updateField('contact', 'address', e.target.value)} className={styles.formTextarea} style={{ minHeight: '80px' }} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Jam Operasional</label>
                  <input type="text" value={data.contact?.hours || ''} onChange={e => updateField('contact', 'hours', e.target.value)} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>No. HP / Telepon (Untuk Tampilan)</label>
                  <input type="text" value={data.contact?.phone || ''} onChange={e => updateField('contact', 'phone', e.target.value)} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>No. WhatsApp (Untuk Link, format: 628...)</label>
                  <input type="text" value={data.contact?.whatsapp || ''} onChange={e => updateField('contact', 'whatsapp', e.target.value)} className={styles.formInput} />
                </div>
              </>
            )}

            {activeTab === 'footer' && (
              <>
                <div className={styles.cardHeader}><h2>🔗 Footer & Sosial Media</h2></div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Deskripsi Footer</label>
                  <textarea value={data.footer?.description || ''} onChange={e => updateField('footer', 'description', e.target.value)} className={styles.formTextarea} style={{ minHeight: '80px' }} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Link YouTube</label>
                  <input type="text" value={data.footer?.youtube || ''} onChange={e => updateField('footer', 'youtube', e.target.value)} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Link TikTok</label>
                  <input type="text" value={data.footer?.tiktok || ''} onChange={e => updateField('footer', 'tiktok', e.target.value)} className={styles.formInput} />
                </div>
              </>
            )}

          </form>
        </div>
      </div>
    </>
  );
}
