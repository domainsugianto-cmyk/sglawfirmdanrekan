import { verifyAuth } from '@/lib/data';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!verifyAuth(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'uploads';
    
    if (!file) {
      return Response.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', folder);
    await mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name);
    const filename = `upload-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    
    await writeFile(filePath, buffer);

    const publicPath = `/${folder}/${filename}`;

    return Response.json({ success: true, path: publicPath });
  } catch (error) {
    return Response.json({ error: 'Gagal mengupload file' }, { status: 500 });
  }
}
