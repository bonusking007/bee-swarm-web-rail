import { NextResponse } from 'next/server';
import { loadAll, loadConfig, computeStatus, aggregateInventory, getVersion } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  const data = await loadAll();
  const cfg = await loadConfig();
  const computed: Record<string, any> = {};
  for (const [name, u] of Object.entries(data.users || {})) {
    const { online, offline_secs } = computeStatus((u as any).updated_at, cfg.online_threshold_secs);
    computed[name] = { ...(u as any), online, offline_secs: online ? 0 : offline_secs };
  }
  return NextResponse.json({ version: getVersion(), users: computed, profiles: data.profiles || {}, summary: aggregateInventory(computed) });
}
