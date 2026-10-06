import { verifyAuth } from '@/lib/data';
import { getDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDbConnection();
    const [rows] = await db.query('SELECT * FROM testimonials ORDER BY id ASC');
    return Response.json(rows);
  } catch (error) {
    return Response.json({ error: 'Gagal membaca data dari database' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!verifyAuth(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { name, text, avatar, rating } = await request.json();
    const db = await getDbConnection();
    await db.query(
      'INSERT INTO testimonials (name, text, avatar, rating, is_approved) VALUES (?, ?, ?, ?, 1)',
      [name, text, avatar, rating || 5]
    );
    const [rows] = await db.query('SELECT * FROM testimonials ORDER BY id ASC');
    return Response.json({ success: true, data: rows });
  } catch (error) {
    return Response.json({ error: 'Gagal menambah data' }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!verifyAuth(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, testimonial } = await request.json();
    const db = await getDbConnection();
    await db.query(
      'UPDATE testimonials SET name = ?, text = ?, avatar = ?, rating = ? WHERE id = ?',
      [testimonial.name, testimonial.text, testimonial.avatar, testimonial.rating || 5, id]
    );
    const [rows] = await db.query('SELECT * FROM testimonials ORDER BY id ASC');
    return Response.json({ success: true, data: rows });
  } catch (error) {
    return Response.json({ error: 'Gagal mengupdate data' }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!verifyAuth(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, is_approved } = await request.json();
    const db = await getDbConnection();
    await db.query(
      'UPDATE testimonials SET is_approved = ? WHERE id = ?',
      [is_approved ? 1 : 0, id]
    );
    const [rows] = await db.query('SELECT * FROM testimonials ORDER BY id ASC');
    return Response.json({ success: true, data: rows });
  } catch (error) {
    return Response.json({ error: 'Gagal mengupdate status' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!verifyAuth(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }
    if (!id) return Response.json({ error: 'ID tidak ditemukan' }, { status: 400 });
    
    const db = await getDbConnection();
    await db.query('DELETE FROM testimonials WHERE id = ?', [id]);
    const [rows] = await db.query('SELECT * FROM testimonials ORDER BY id ASC');
    return Response.json({ success: true, data: rows });
  } catch (error) {
    return Response.json({ error: 'Gagal menghapus data' }, { status: 500 });
  }
}
