import { NextRequest, NextResponse } from 'next/server';
import { loadAll, saveAll, bumpVersion } from '@/lib/storage';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const xapi = req.headers.get('x-api-key') || '';
  const token = auth.startsWith('Bearer ') ? auth.split(' ')[1].trim() : (xapi || '');
  const APP_SECRET = process.env.RSKD_API_KEY || 'changeme-secret';
  if (token !== APP_SECRET) return new NextResponse('Unauthorized', { status: 401 });

  let payload: any;
  try { payload = await req.json(); } catch { return new NextResponse('Invalid JSON', { status: 400 }); }
  if (!payload || typeof payload !== 'object') return new NextResponse('Bad payload', { status: 400 });

  const username = payload.username;
  if (!username || typeof username !== 'string') return new NextResponse("Missing 'username'", { status: 400 });

  payload.updated_at = new Date().toISOString();
  const data = await loadAll();
  const users = data.users || (data.users = {});
  users[username] = { ...(users[username] || {}), ...payload };
  await saveAll(data);
  bumpVersion();
  return NextResponse.json({ ok: true, stored: users[username] });
}
