import { verifyCredentials, createToken } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    if (!verifyCredentials(username, password)) {
      return Response.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const token = createToken();
    
    // Set cookie (works on localhost) AND return token in body (works on IP access)
    const cookieHeader = `admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`;
    
    return new Response(JSON.stringify({ success: true, token }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieHeader,
      },
    });
  } catch (error) {
    return Response.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
