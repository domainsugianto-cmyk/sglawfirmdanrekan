import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'src', 'data');

export function readData(filename) {
  const filePath = path.join(dataDir, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

export function writeData(filename, data) {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Simple session token - in production use a proper auth library
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'sglawfirm2024';

export function verifyCredentials(username, password) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function verifyAuth(request) {
  const token = createToken();
  
  // Check Authorization header first (used by clients that can't rely on cookies, e.g. via IP)
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice(7);
    if (bearerToken === token) return true;
  }

  // Fallback: check cookie
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/admin_token=([^;]+)/);
  if (!match) return false;
  try {
    const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
    return decoded === `${ADMIN_USERNAME}:authenticated`;
  } catch {
    return false;
  }
}

export function createToken() {
  return Buffer.from(`${ADMIN_USERNAME}:authenticated`).toString('base64');
}
