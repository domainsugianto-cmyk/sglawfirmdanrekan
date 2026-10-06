import { verifyAuth } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const isAuthenticated = verifyAuth(request);
  return Response.json({ authenticated: isAuthenticated });
}
