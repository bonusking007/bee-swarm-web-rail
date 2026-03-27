export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { loadAll, saveAll, bumpVersion } from '@/lib/storage';

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  const data = await loadAll();
  const user = (data.users || {})[params.name];
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest, { params }: { params: { name: string } }) {
  // Only admin can delete
  const role = req.cookies.get('bss_role')?.value;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const data = await loadAll();
  delete (data.users || {})[params.name];
  await saveAll(data);
  bumpVersion();
  return NextResponse.json({ ok: true });
}
