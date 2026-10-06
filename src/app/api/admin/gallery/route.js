import { verifyAuth } from '@/lib/data';
import { getDbConnection } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDbConnection();
    const [rows] = await db.query('SELECT * FROM gallery ORDER BY position ASC, id ASC');
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
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filepath = join(uploadDir, filename);

    try {
      await import('fs/promises').then(fs => fs.mkdir(uploadDir, { recursive: true }));
    } catch(e) {}

    await writeFile(filepath, buffer);
    const imageUrl = `/uploads/${filename}`;

    const db = await getDbConnection();
    // Default position 0
    await db.query('INSERT INTO gallery (image_url, position) VALUES (?, 0)', [imageUrl]);
    
    const [rows] = await db.query('SELECT * FROM gallery ORDER BY position ASC, id ASC');
    return Response.json({ success: true, data: rows });
  } catch (error) {
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!verifyAuth(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { items } = await request.json(); // array of { id, position }
    const db = await getDbConnection();
    
    for (const item of items) {
      await db.query('UPDATE gallery SET position = ? WHERE id = ?', [item.position, item.id]);
    }
    
    const [rows] = await db.query('SELECT * FROM gallery ORDER BY position ASC, id ASC');
    return Response.json({ success: true, data: rows });
  } catch (error) {
    return Response.json({ error: 'Gagal mengupdate urutan' }, { status: 500 });
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
    await db.query('DELETE FROM gallery WHERE id = ? OR ID = ?', [id, id]);
    
    const [rows] = await db.query('SELECT * FROM gallery ORDER BY position ASC, id ASC');
    return Response.json({ success: true, data: rows });
  } catch (error) {
    return Response.json({ error: 'Gagal menghapus data' }, { status: 500 });
  }
}
