import { NextRequest } from 'next/server';
export function isAdmin(req: NextRequest) {
  return req.cookies.get('rskd_admin')?.value === '1';
}
