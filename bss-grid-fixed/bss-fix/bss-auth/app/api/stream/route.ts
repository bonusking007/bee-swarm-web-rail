import { NextRequest } from 'next/server';
import { loadAll, loadConfig, computeStatus, aggregateInventory, getVersion, subscribe } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      let stopped = false;
      async function send() {
        const cfg = await loadConfig();
        const data = await loadAll();
        const computed: Record<string, any> = {};
        for (const [name, u] of Object.entries(data.users || {})) {
          const { online, offline_secs } = computeStatus((u as any).updated_at, cfg.online_threshold_secs);
          computed[name] = { ...(u as any), online, offline_secs: online ? 0 : offline_secs };
        }
        const payload = JSON.stringify({ users: computed, profiles: data.profiles || {}, summary: aggregateInventory(computed), config: cfg });
        controller.enqueue(encoder.encode(`event: stats\nid: ${getVersion()}\ndata: ${payload}\n\n`));
      }
      send();
      let last = -1;
      const unsub = subscribe(async (v) => {
        if (stopped) return;
        if (v !== last) { last = v; await send(); }
      });
      const keepalive = setInterval(() => { controller.enqueue(encoder.encode(`: ping\n\n`)); }, 15000);
      (req as any).signal.addEventListener('abort', () => {
        stopped = true; clearInterval(keepalive); unsub(); controller.close();
      });
    }
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
