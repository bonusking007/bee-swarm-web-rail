import { NextRequest, NextResponse } from 'next/server';
import { loadConfig, saveConfig, bumpVersion } from '@/lib/storage';
import { isAdmin } from '@/app/api/_auth';

export async function GET() {
  return NextResponse.json(await loadConfig());
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  const body = await req.json();
  const cfg = await loadConfig();
  await saveConfig({ ...cfg, ...body });
  bumpVersion();
  return NextResponse.json({ ok: true });
}
