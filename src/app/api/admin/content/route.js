import { verifyAuth } from '@/lib/data';
import { getDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDbConnection();
    const [rows] = await db.query('SELECT section, data FROM site_content');
    const content = {};
    for (const row of rows) {
      content[row.section] = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
    }
    if (content.hero?.stats) {
      const [[{ count }]] = await db.query('SELECT COUNT(*) AS count FROM team');
      content.hero.stats = content.hero.stats.map(stat => (
        stat.source === 'teamCount' ? { ...stat, value: String(count) } : stat
      ));
    }
    return Response.json(content);
  } catch (error) {
    return Response.json({ error: 'Gagal membaca data dari database' }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!verifyAuth(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await request.json();
    const db = await getDbConnection();
    if (data.hero?.stats) {
      const [[{ count }]] = await db.query('SELECT COUNT(*) AS count FROM team');
      data.hero.stats = data.hero.stats.map(stat => (
        stat.source === 'teamCount' ? { ...stat, value: String(count) } : stat
      ));
    }
    
    // update each section
    for (const [section, sectionData] of Object.entries(data)) {
      await db.query(
        'UPDATE site_content SET data = ? WHERE section = ?',
        [JSON.stringify(sectionData), section]
      );
    }
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Gagal menyimpan ke database' }, { status: 500 });
  }
}
