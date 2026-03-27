import { NextRequest, NextResponse } from 'next/server';
import { loadAll, saveAll, loadConfig, bumpVersion } from '@/lib/storage';

export async function POST(req: NextRequest) {
  const cfg = await loadConfig();
  if (!cfg.allow_profile_creation) return new NextResponse('Disabled', { status: 403 });
  const body = await req.json();
  const name = body?.name;
  if (!name || typeof name !== 'string') return new NextResponse("Missing 'name'", { status: 400 });
  const data = await loadAll();
  const profiles = data.profiles || (data.profiles = {});
  if (!profiles[name]) profiles[name] = { name, map: null, created_at: new Date().toISOString() };
  await saveAll(data);
  bumpVersion();
  return NextResponse.json({ ok: true, profile: profiles[name] });
}
