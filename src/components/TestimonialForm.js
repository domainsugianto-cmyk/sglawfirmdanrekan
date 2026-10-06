'use client';
import { useState } from 'react';

export default function TestimonialForm() {
  const [formData, setFormData] = useState({ name: '', text: '', rating: 5 });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        setStatus({ loading: false, success: true, error: '' });
        setFormData({ name: '', text: '', rating: 5 });
        setTimeout(() => setStatus(s => ({ ...s, success: false })), 5000);
      } else {
        setStatus({ loading: false, success: false, error: result.error || 'Gagal mengirim' });
      }
    } catch (error) {
      setStatus({ loading: false, success: false, error: 'Terjadi kesalahan koneksi' });
    }
  };

  return (
    <div style={{ marginTop: '3rem', maxWidth: '600px', margin: '3rem auto 0', background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center', color: '#0f172a' }}>Pernah menggunakan jasa kami?</h3>
      
      {status.success ? (
        <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          Terima kasih! Testimoni Anda telah dikirim dan menunggu persetujuan admin.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {status.error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}>
              {status.error}
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>Nama Lengkap / Perusahaan</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border 0.2s', fontSize: '1rem' }}
              placeholder="Contoh: Budi Santoso"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>Penilaian Anda (Rating Bintang)</label>
            <div style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <label 
                  key={star} 
                  style={{ 
                    cursor: 'pointer', 
                    display: 'inline-block', 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                >
                  <input 
                    type="radio" 
                    name="rating" 
                    value={star} 
                    checked={formData.rating >= star} 
                    onChange={() => setFormData(prev => ({ ...prev, rating: star }))}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} 
                  />
                  <span style={{
                    fontSize: '2rem', 
                    color: star <= formData.rating ? '#fbbf24' : '#e2e8f0', 
                    transition: 'color 0.2s', 
                    lineHeight: 1,
                    userSelect: 'none',
                    display: 'block'
                  }}>
                    ★
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>Ulasan / Testimoni</label>
            <textarea 
              required
              value={formData.text}
              onChange={e => setFormData({ ...formData, text: e.target.value })}
              rows="4"
              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border 0.2s', fontSize: '1rem', resize: 'vertical' }}
              placeholder="Tuliskan pengalaman Anda bersama SG Law Firm..."
            />
          </div>
          
          <button 
            type="submit" 
            disabled={status.loading}
            style={{ 
              marginTop: '0.5rem', 
              padding: '0.8rem 1.5rem', 
              background: 'linear-gradient(135deg, #B91C1C 0%, #dc2626 100%)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 600, 
              cursor: status.loading ? 'not-allowed' : 'pointer',
              opacity: status.loading ? 0.7 : 1,
              transition: 'transform 0.2s'
            }}
          >
            {status.loading ? 'Mengirim...' : 'Kirim Testimoni'}
          </button>
        </form>
      )}
    </div>
  );
}
