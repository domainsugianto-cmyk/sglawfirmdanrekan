/**
 * Helper function untuk fetch dengan Authorization header.
 * Mengambil token dari localStorage dan mengirimnya sebagai Bearer token.
 * Ini diperlukan agar auth bekerja ketika diakses via IP (bukan localhost),
 * karena browser kadang tidak mengirim cookie untuk IP address non-localhost.
 */
export function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch wrapper yang otomatis menyertakan Authorization header.
 */
export async function authFetch(url, options = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };
  return fetch(url, { ...options, headers });
}
