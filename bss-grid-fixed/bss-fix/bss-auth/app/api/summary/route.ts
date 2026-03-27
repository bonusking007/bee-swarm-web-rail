import { NextRequest, NextResponse } from 'next/server';
import { loadAll, loadConfig, computeStatus } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const TTL_MS = Number(process.env.USER_TTL_MS ?? 5 * 60 * 1000);

export async function GET(_req: NextRequest) {
  const data = await loadAll();
  const users: Record<string, any> = data.users || {};
  const now = Date.now();

  let totalUsers = 0, onlineUsers = 0;
  let sumHoney = 0, sumTickets = 0, sumPollen = 0, sumRoyalJelly = 0;

  for (const [, u] of Object.entries(users)) {
    totalUsers++;
    const updatedAt = u.updated_at ? new Date(u.updated_at).getTime() : 0;
    const online = updatedAt && (now - updatedAt) <= TTL_MS;
    if (online) onlineUsers++;
    sumHoney += Number(u.honey ?? 0) || 0;
    sumTickets += Number(u.tickets ?? 0) || 0;
    sumPollen += Number(u.pollen ?? 0) || 0;
    sumRoyalJelly += Number(u.royalJelly ?? 0) || 0;
  }

  return NextResponse.json({
    ok: true,
    totals: { totalUsers, onlineUsers, offlineUsers: totalUsers - onlineUsers, avgHoney: totalUsers > 0 ? Math.round(sumHoney / totalUsers) : 0, sumHoney, sumTickets, sumPollen, sumRoyalJelly },
    generatedAt: new Date().toISOString(),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
