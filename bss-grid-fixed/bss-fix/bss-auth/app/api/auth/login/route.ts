export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const CUSTOMER_PASSWORD = process.env.CUSTOMER_PASSWORD || 'view123';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password === ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true, role: 'admin' });
    res.cookies.set('bss_role', 'admin', { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    return res;
  }
  if (password === CUSTOMER_PASSWORD) {
    const res = NextResponse.json({ ok: true, role: 'customer' });
    res.cookies.set('bss_role', 'customer', { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    return res;
  }
  return NextResponse.json({ ok: false, error: 'Wrong password' }, { status: 401 });
}
