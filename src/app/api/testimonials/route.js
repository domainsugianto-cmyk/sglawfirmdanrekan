import { getDbConnection } from '@/lib/db';

export async function POST(request) {
  try {
    const { name, text, rating } = await request.json();
    
    if (!name || !text) {
      return Response.json({ error: 'Nama dan ulasan wajib diisi' }, { status: 400 });
    }

    const db = await getDbConnection();
    // Default is_approved is 0 (false) for public submissions
    await db.query('INSERT INTO testimonials (name, text, rating, is_approved) VALUES (?, ?, ?, 0)', [name, text, rating || 5]);
    
    return Response.json({ success: true, message: 'Testimoni berhasil dikirim dan menunggu persetujuan.' });
  } catch (error) {
    return Response.json({ error: 'Gagal mengirim testimoni' }, { status: 500 });
  }
}
