import { verifyAuth } from '@/lib/data';
import { getDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDbConnection();
    const [rows] = await db.query('SELECT * FROM team ORDER BY id ASC');
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
    const { name, title, role } = await request.json();
    const db = await getDbConnection();
    await db.query(
      'INSERT INTO team (name, title, role) VALUES (?, ?, ?)',
      [name, title, role]
    );
    const [rows] = await db.query('SELECT * FROM team ORDER BY id ASC');
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
    const { id, member } = await request.json();
    const db = await getDbConnection();
    await db.query(
      'UPDATE team SET name = ?, title = ?, role = ? WHERE id = ?',
      [member.name, member.title, member.role, id]
    );
    const [rows] = await db.query('SELECT * FROM team ORDER BY id ASC');
    return Response.json({ success: true, data: rows });
  } catch (error) {
    return Response.json({ error: 'Gagal mengupdate data' }, { status: 500 });
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
      id = body.id || body.ID;
    }

    if (!id) {
       return Response.json({ error: 'ID tidak ditemukan' }, { status: 400 });
    }

    const db = await getDbConnection();
    await db.query('DELETE FROM team WHERE id = ? OR ID = ?', [id, id]);
    const [rows] = await db.query('SELECT * FROM team ORDER BY id ASC');
    return Response.json({ success: true, data: rows });
  } catch (error) {
    return Response.json({ error: 'Gagal menghapus data' }, { status: 500 });
  }
}
