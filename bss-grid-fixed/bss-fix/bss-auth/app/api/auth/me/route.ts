export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  const role = req.cookies.get('bss_role')?.value;
  if (!role) return NextResponse.json({ role: null });
  return NextResponse.json({ role });
}
