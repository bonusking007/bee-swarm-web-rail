import { NextRequest, NextResponse } from 'next/server';
import { loadAll, saveAll, bumpVersion } from '@/lib/storage';

export async function PATCH(req: NextRequest, { params }: { params: { name: string } }) {
  const body = await req.json();
  const data = await loadAll();
  const profiles = data.profiles || (data.profiles = {});
  const name = params.name;
  if (!profiles[name]) return new NextResponse('Not found', { status: 404 });
  if ('map' in body) profiles[name].map = body.map;
  await saveAll(data);
  bumpVersion();
  return NextResponse.json({ ok: true, profile: profiles[name] });
}
