import { verifyAuth } from '../../../../lib/data.js';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const mediaTypes = {
  'image/jpeg': { type: 'image', extension: '.jpg' },
  'image/png': { type: 'image', extension: '.png' },
  'image/webp': { type: 'image', extension: '.webp' },
  'image/gif': { type: 'image', extension: '.gif' },
  'image/avif': { type: 'image', extension: '.avif' },
  'video/mp4': { type: 'video', extension: '.mp4' },
  'video/webm': { type: 'video', extension: '.webm' },
  'video/quicktime': { type: 'video', extension: '.mov' },
};

export async function POST(request) {
  if (!verifyAuth(request)) {
    return Response.json({ error: 'Silakan masuk sebagai administrator.' }, { status: 401 });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_FILE_SIZE + 1024 * 1024) {
    return Response.json({ error: 'Ukuran file melebihi batas 100 MB.' }, { status: 413 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file.arrayBuffer !== 'function') {
      return Response.json({ error: 'Pilih satu file gambar atau video.' }, { status: 400 });
    }

    const mediaType = mediaTypes[file.type];
    if (!mediaType) {
      return Response.json({ error: 'Format file tidak didukung. Gunakan gambar atau video yang didukung.' }, { status: 415 });
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return Response.json({ error: 'Ukuran file harus lebih dari 0 dan maksimal 100 MB.' }, { status: 413 });
    }

    const filename = `${randomUUID()}${mediaType.extension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'about');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

    return Response.json({
      success: true,
      type: mediaType.type,
      path: `/uploads/about/${filename}`,
    });
  } catch (error) {
    console.error('About media upload failed:', error);
    return Response.json({ error: 'Gagal mengunggah media. Silakan coba lagi.' }, { status: 500 });
  }
}
