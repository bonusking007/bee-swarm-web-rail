import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const statsPath = path.join(dataDir, 'stats.json');
const configPath = path.join(dataDir, 'config.json');

export type User = Record<string, any>;
export type Users = Record<string, User>;
export type Profiles = Record<string, { name: string; map?: string | null; created_at?: string }>;
export type Data = { users: Users; profiles: Profiles };

export type Config = {
  online_threshold_secs: number;
  sse_tick_ms: number;
  maps: string[];
  allow_profile_creation: boolean;
  maintenance_mode: boolean;
};

export const DEFAULT_CONFIG: Config = {
  online_threshold_secs: 60,
  sse_tick_ms: 500,
  maps: ['Bee Swarm Simulator'],
  allow_profile_creation: true,
  maintenance_mode: false,
};

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

export async function loadAll(): Promise<Data> {
  await ensureDir();
  try {
    return JSON.parse(await fs.readFile(statsPath, 'utf-8'));
  } catch {
    return { users: {}, profiles: {} };
  }
}

export async function saveAll(d: Data): Promise<void> {
  await ensureDir();
  await fs.writeFile(statsPath, JSON.stringify(d, null, 2), 'utf-8');
}

export async function loadConfig(): Promise<Config> {
  await ensureDir();
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(await fs.readFile(configPath, 'utf-8')) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(cfg: Config): Promise<void> {
  await ensureDir();
  await fs.writeFile(configPath, JSON.stringify(cfg, null, 2), 'utf-8');
}

export function computeStatus(updatedISO?: string | null, thresholdSecs?: number) {
  if (!updatedISO) return { online: false, offline_secs: null as number | null };
  try {
    const delta = (Date.now() - new Date(updatedISO).getTime()) / 1000;
    const online = delta <= (thresholdSecs ?? DEFAULT_CONFIG.online_threshold_secs);
    return { online, offline_secs: online ? 0 : Math.floor(delta) };
  } catch {
    return { online: false, offline_secs: null };
  }
}

export function aggregateInventory(users: Users) {
  const agg: Record<string, number> = {};
  for (const u of Object.values(users)) {
    const inv = (u as any)?.inventory;
    if (inv && typeof inv === 'object') {
      for (const [k, v] of Object.entries(inv)) {
        const n = typeof v === 'number' ? v : parseInt(String(v), 10);
        if (!Number.isFinite(n)) continue;
        agg[k] = (agg[k] || 0) + n;
      }
    }
  }
  return agg;
}

const g = globalThis as any;
if (!g.__bss_version) { g.__bss_version = 0; g.__bss_subs = new Set(); }
type Sub = (v: number) => void;
export function bumpVersion() { g.__bss_version++; for (const fn of Array.from(g.__bss_subs as Set<Sub>)) try { (fn as Sub)(g.__bss_version) } catch {}; return g.__bss_version; }
export function getVersion() { return g.__bss_version as number; }
export function subscribe(fn: Sub) { (g.__bss_subs as Set<Sub>).add(fn); return () => (g.__bss_subs as Set<Sub>).delete(fn); }
