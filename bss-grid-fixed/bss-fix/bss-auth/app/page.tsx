'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ParticlesCanvas from '@/components/ParticlesCanvas';

type UsersMap = Record<string, any>;
type Summary = {
  ok: boolean;
  totals: { totalUsers: number; onlineUsers: number; offlineUsers: number; avgHoney: number; sumHoney: number; sumTickets: number; sumPollen: number; sumRoyalJelly: number; };
  generatedAt: string;
};

const ITEM_ICONS: Record<string, string> = {
  RoyalJelly: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/3/38/Royal_Jelly.png',
  Ticket: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/e/eb/Ticket.png',
  Glitter: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/8/87/Glitter.png',
  SunflowerSeed: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/b/b3/Sunflower_Seed.png',
  StarJelly: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/5/51/Star_Jelly.png',
  Treat: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/4/4c/Treat.png',
  Gumdrops: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/e/ea/Gumdrops.png',
  Blueberry: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/c/c1/Blueberry.png',
  Strawberry: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/9/9e/Strawberry.png',
  Stinger: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/2/2e/Stinger.png',
  Pineapple: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/a/ab/Pineapple.png',
  Coconut: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/5/5d/Coconut.png',
  MicroConverter: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/1/17/Micro-Converter.png',
  MoonCharm: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/0/0e/Moon_Charm.png',
  GoldEgg: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/4/46/Gold_Egg.png',
  DiamondEgg: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/4/41/Diamond_Egg.png',
  MythicEgg: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/c/c5/Mythic_Egg.png',
  RoboPass: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/2/29/Robo_Pass.png',
  SoftWax: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/5/56/Soft_Wax.png',
  HardWax: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/5/52/Hard_Wax.png',
  SwirledWax: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/6/68/Swirled_Wax.png',
  CausticWax: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/c/ca/Caustic_Wax.png',
  Oil: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/a/a2/Oil.png',
  Glue: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/c/c7/Glue.png',
  Enzymes: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/c/c6/Enzymes.png',
  TropicalDrink: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/e/e3/Tropical_Drink.png',
  SuperSmoothie: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/d/d8/Super_Smoothie.png',
  PurplePotion: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/a/a2/Purple_Potion.png',
  MagicBean: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/0/0a/Magic_Bean.png',
  Turpentine: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/b/b0/Turpentine.png',
  RedBalloon: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/a/a5/Red_Balloon.png',
  PinkBalloon: 'https://static.wikia.nocookie.net/bee-swarm-simulator/images/c/c7/Pink_Balloon.png',
};

function fmt(n: any) {
  if (n === undefined || n === null || n === '') return '—';
  const v = Number(n);
  if (!Number.isFinite(v)) return String(n);
  if (v >= 1e12) return (v / 1e12).toFixed(2) + 'T';
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  return v.toLocaleString();
}
function timeAgoSecs(s: number | null) {
  if (s == null) return '—';
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
}
function timeAgo(iso?: string) {
  if (!iso) return '—';
  return timeAgoSecs(Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
}

// ─── Login Screen ─────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (role: string) => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!pw) return;
    setLoading(true); setErr('');
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      const d = await r.json();
      if (d.ok) onLogin(d.role);
      else setErr('รหัสผ่านไม่ถูกต้อง');
    } catch { setErr('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง'); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <img src="/sea_shop_logo.png" alt="Sea Shop" className="navbar-logo" />
          <span className="navbar-name">SEA <span>SHOP</span></span>
        </div>
        <div className="navbar-links">
          <a href="https://discord.gg/PU9j3KtVuX" target="_blank" rel="noopener noreferrer" className="nav-support-btn">
            💬 Support
          </a>
        </div>
      </nav>

      {/* Login Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(0,212,255,0.15)',
          borderRadius: 24, padding: '48px 40px', width: 380,
          display: 'flex', flexDirection: 'column', gap: 20,
          boxShadow: '0 0 80px rgba(0,212,255,0.06)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <img src="/sea_shop_logo.png" alt="Sea Shop" style={{ width: 72, height: 72, borderRadius: 18, marginBottom: 12, objectFit: 'cover' }} />
            <div style={{ fontSize: 22, fontWeight: 800 }}>Farm Progress</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>กรอกรหัสผ่านเพื่อดูความคืบหน้า</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Password</label>
            <input
              type="password" value={pw}
              onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={{
                padding: '12px 16px', borderRadius: 12,
                border: `1px solid ${err ? '#ff6b6b' : 'rgba(255,255,255,0.1)'}`,
                background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15, outline: 'none',
              }}
            />
            {err && <div style={{ color: '#ff6b6b', fontSize: 13 }}>{err}</div>}
          </div>

          <button onClick={handleLogin} disabled={loading} style={{
            padding: '13px', borderRadius: 12,
            background: loading ? 'rgba(0,212,255,0.2)' : 'linear-gradient(135deg,#00d4ff,#0096ff)',
            color: '#000', fontWeight: 800, fontSize: 15,
            cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
          }}>
            {loading ? '⏳ กำลังตรวจสอบ...' : '🔓 เข้าสู่ระบบ'}
          </button>

          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
            ต้องการความช่วยเหลือ?{' '}
            <a href="https://discord.gg/PU9j3KtVuX" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
              ติดต่อ Discord
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ─── Inventory Modal ──────────────────────────────────────────────
function InventoryModal({ items, onClose }: { items: Record<string, number>; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const entries = Object.entries(items)
    .filter(([k]) => k.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b[1] - a[1]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0d1117', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 20, padding: 24, width: 700, maxHeight: '85vh', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>
            📦 Inventory{' '}
            <span style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent)', borderRadius: 999, padding: '2px 10px', fontSize: 13, fontWeight: 700 }}>{Object.keys(items).length}</span>
          </div>
          <button onClick={onClose} style={{ borderRadius: 10, padding: '6px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>✕</button>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search items..."
          style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', outline: 'none', fontSize: 14 }} />
        <div style={{ overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {entries.length === 0 && <div style={{ color: 'var(--muted)', gridColumn: '1/-1', textAlign: 'center', padding: 32 }}>No items found</div>}
          {entries.map(([itemKey, count]) => {
            const iconUrl = ITEM_ICONS[itemKey];
            return (
              <div key={itemKey} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 10px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {iconUrl ? <img src={iconUrl} alt={itemKey} style={{ width: 48, height: 48, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <div style={{ fontSize: 26 }}>📦</div>}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, wordBreak: 'break-word', lineHeight: 1.3 }}>{itemKey}</div>
                <div style={{ background: 'rgba(0,212,255,0.08)', borderRadius: 6, padding: '3px 10px', fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>{count.toLocaleString()}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ borderRadius: 10, padding: '8px 20px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600 }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        <div className="footer-copy">©2026 <span>SEA SHOP</span> | ALL SYSTEMS OPERATIONAL</div>
        <div className="footer-status">
          <span className="live-dot" /> SYSTEM ONLINE
        </div>
      </div>
      <div className="footer-links">
        <a href="https://discord.gg/PU9j3KtVuX" target="_blank" rel="noopener noreferrer">Support</a>
      </div>
      <div className="footer-disclaimer">
        NOT AFFILIATED WITH ROBLOX CORPORATION. ALL TRADEMARKS ARE PROPERTY OF THEIR RESPECTIVE OWNERS.
      </div>
    </footer>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────
export default function Home() {
  const [role, setRole] = useState<string | null | 'loading'>('loading');
  const [users, setUsers] = useState<UsersMap>({});
  const [lastSync, setLastSync] = useState('—');
  const [active, setActive] = useState<'cards' | 'table' | 'summary'>('cards');
  const [agg, setAgg] = useState<Summary | null>(null);
  const [aggErr, setAggErr] = useState<string | null>(null);
  const [aggAt, setAggAt] = useState(0);
  const [search, setSearch] = useState('');
  const [invModal, setInvModal] = useState<Record<string, number> | null>(null);
  const isAdmin = role === 'admin';

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setRole(d.role || null)).catch(() => setRole(null));
  }, []);

  const names = useMemo(() =>
    Object.keys(users).sort((a, b) => {
      const ua = users[a], ub = users[b];
      if (ua.online !== ub.online) return ua.online ? -1 : 1;
      return a.localeCompare(b);
    }), [users]);

  const filtered = useMemo(() => names.filter(n => n.toLowerCase().includes(search.toLowerCase())), [names, search]);

  const ov = useMemo(() => {
    let online = 0, latestAt: number | null = null;
    for (const n of names) {
      const u = users[n] || {};
      if (u.online) online++;
      if (u.updated_at) { const t = new Date(u.updated_at).getTime(); if (!latestAt || t > latestAt) latestAt = t; }
    }
    return { total: names.length, online, offline: names.length - online, lastUpdate: latestAt ? timeAgo(new Date(latestAt).toISOString()) : '—' };
  }, [names, users]);

  async function fetchOnce() {
    const r = await fetch('/api/stats'); const d = await r.json();
    setUsers(d.users || {});
    setLastSync(new Date().toLocaleTimeString());
  }

  useEffect(() => {
    if (!role || role === 'loading') return;
    fetchOnce();
    if ('EventSource' in window) {
      const es = new EventSource('/api/stream');
      es.addEventListener('stats', (ev: any) => {
        const d = JSON.parse(ev.data);
        setUsers(d.users || {});
        setLastSync('live');
      });
      return () => es.close();
    } else { const id = setInterval(fetchOnce, 15000); return () => clearInterval(id); }
  }, [role]);

  useEffect(() => {
    if (!role || role === 'loading') return;
    async function load() {
      try { setAggErr(null); const r = await fetch('/api/summary', { cache: 'no-store' }); if (!r.ok) throw new Error(`HTTP ${r.status}`); setAgg(await r.json()); setAggAt(Date.now()); }
      catch (e: any) { setAggErr(e?.message || 'Failed'); }
    }
    load(); const id = setInterval(load, 5000); return () => clearInterval(id);
  }, [role]);

  async function del(name: string) {
    if (!confirm(`Delete '${name}'?`)) return;
    await fetch(`/api/users/${encodeURIComponent(name)}`, { method: 'DELETE' });
    fetchOnce();
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setRole(null);
  }

  if (role === 'loading') {
    return (
      <>
        <ParticlesCanvas />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, color: 'var(--muted)' }}>Loading...</div>
      </>
    );
  }

  if (!role) {
    return <><ParticlesCanvas /><LoginScreen onLogin={r => setRole(r)} /></>;
  }

  return (
    <>
      <ParticlesCanvas />
      {invModal && <InventoryModal items={invModal} onClose={() => setInvModal(null)} />}

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* NAVBAR */}
        <nav className="navbar">
          <div className="navbar-brand">
            <img src="/sea_shop_logo.png" alt="Sea Shop" className="navbar-logo" />
            <span className="navbar-name">SEA <span>SHOP</span></span>
          </div>
          <div className="navbar-links">
            <a href="https://discord.gg/PU9j3KtVuX" target="_blank" rel="noopener noreferrer" className="nav-support-btn">
              💬 Support
            </a>
          </div>
          <div className="nav-right">
            <span className="live-dot" />
            <span style={{ fontSize: 12, color: lastSync === 'live' ? '#9cff8a' : 'var(--muted)' }}>
              {lastSync === 'live' ? 'Live' : lastSync}
            </span>
            <span className="nav-role-badge" style={{ background: isAdmin ? 'rgba(255,100,100,0.15)' : 'rgba(0,212,255,0.1)', color: isAdmin ? '#ff9da3' : 'var(--accent)' }}>
              {isAdmin ? '👑 Admin' : '👁 View'}
            </span>
            <button className="nav-logout" onClick={logout}>Logout</button>
          </div>
        </nav>

        {/* OVERVIEW BAR */}
        <div className="overview-bar">
          <span className="ov-item"><b style={{ color: '#9cff8a' }}>{ov.online}</b> Online</span>
          <span className="ov-sep">·</span>
          <span className="ov-item"><b style={{ color: '#ff9da3' }}>{ov.offline}</b> Offline</span>
          <span className="ov-sep">·</span>
          <span className="ov-item">Total <b>{ov.total}</b></span>
          <span className="ov-sep">·</span>
          <span className="ov-item">Updated <b>{ov.lastUpdate}</b></span>
        </div>

        {/* TABS */}
        <nav className="tabs">
          {(['cards', 'table', 'summary'] as const).map(t => (
            <button key={t} className={`tab ${active === t ? 'active' : ''}`} onClick={() => setActive(t)}>
              {t === 'cards' ? '🐝 Cards' : t === 'table' ? '📋 Table' : '📊 Summary'}
            </button>
          ))}
        </nav>

        {/* CONTENT */}
        <main className="container" style={{ flex: 1 }}>

          {/* CARDS */}
          <section className={`view ${active === 'cards' ? 'active' : ''}`}>
            <div style={{ marginBottom: 14 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search username..."
                style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'var(--text)', outline: 'none', width: 280, fontSize: 13 }} />
            </div>
            <section className="grid">
              {filtered.length === 0 && (
                <div style={{ color: 'var(--muted)', padding: 24 }}>
                  {names.length === 0 ? 'ยังไม่มีข้อมูล — รัน Lua script ใน Bee Swarm Simulator ก่อน 🐝' : 'ไม่พบผู้เล่นที่ค้นหา'}
                </div>
              )}
              {filtered.map(name => {
                const u = users[name] || {};
                const online = !!u.online;
                const inv = u.inventory || {};
                const invCount = Object.keys(inv).length;
                return (
                  <article className="card" key={name}>
                    <div className="card-head">
                      <div className="avatar">🐝</div>
                      <div className="meta">
                        <div className="name">{name}</div>
                        <div className="sub">
                          {online ? <span className="pill-online">● Online</span> : <span className="pill-offline">● Offline {timeAgoSecs(u.offline_secs)} ago</span>}
                          {' '}· {timeAgo(u.updated_at)}
                        </div>
                      </div>
                      <div style={{ flex: 1 }} />
                      {isAdmin && <button className="icon-btn danger" onClick={() => del(name)}>🗑</button>}
                    </div>

                    <div className="stats">
                      <div className="stat">
                        <div className="stat-label">🍯 Honey</div>
                        <div className="stat-value">{fmt(u.honey ?? 0)}</div>
                      </div>
                      <div className="stat">
                        <div className="stat-label">🌸 Pollen</div>
                        <div className="stat-value">{fmt(u.pollen ?? 0)}</div>
                      </div>
                      <div className="stat">
                        <div className="stat-label">🧺 Capacity</div>
                        <div className="stat-value">{fmt(u.capacity ?? 0)}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <button onClick={() => setInvModal(inv)}
                        style={{ width: '100%', borderRadius: 10, padding: '8px 12px', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', cursor: 'pointer', color: 'var(--accent)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        📦 Inventory
                        <span style={{ background: 'rgba(0,212,255,0.12)', borderRadius: 999, padding: '1px 8px', fontSize: 12 }}>{invCount}</span>
                      </button>
                    </div>

                    {u.activeQuest && (
                      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 10, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)', fontSize: 12, color: 'var(--muted)' }}>
                        📜 {u.activeQuest}
                      </div>
                    )}
                  </article>
                );
              })}
            </section>
          </section>

          {/* TABLE */}
          <section className={`view ${active === 'table' ? 'active' : ''}`}>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Status</th><th>Username</th><th>🍯 Honey</th>
                    <th>🌸 Pollen</th><th>🧺 Capacity</th><th>📦 Inventory</th>
                    <th>📜 Quest</th><th>Updated</th>
                    {isAdmin && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {names.map(name => {
                    const u = users[name] || {};
                    const online = !!u.online;
                    const inv = u.inventory || {};
                    return (
                      <tr key={name}>
                        <td>{online ? <span className="pill-online">● Online</span> : <span className="pill-offline">● {timeAgoSecs(u.offline_secs)} ago</span>}</td>
                        <td><b>{name}</b></td>
                        <td>{fmt(u.honey ?? 0)}</td>
                        <td>{fmt(u.pollen ?? 0)}</td>
                        <td>{fmt(u.capacity ?? 0)}</td>
                        <td>
                          <button onClick={() => setInvModal(inv)}
                            style={{ borderRadius: 8, padding: '4px 12px', fontSize: 12, cursor: 'pointer', background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.15)', color: 'var(--accent)', fontWeight: 600 }}>
                            Show {Object.keys(inv).length}
                          </button>
                        </td>
                        <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.activeQuest || '—'}</td>
                        <td>{timeAgo(u.updated_at)}</td>
                        {isAdmin && <td><button className="icon-btn danger" onClick={() => del(name)}>🗑</button></td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* SUMMARY */}
          <section className={`view ${active === 'summary' ? 'active' : ''}`}>
            <div style={{ padding: '8px 0 24px' }}>
              <h2 style={{ marginBottom: 4, fontSize: 20, fontWeight: 800 }}>📊 Farm Summary</h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Aggregated stats across all accounts</p>
              {agg ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                    {[
                      { label: 'Total Users', value: agg.totals.totalUsers, icon: '👥' },
                      { label: 'Online', value: agg.totals.onlineUsers, icon: '🟢' },
                      { label: 'Offline', value: agg.totals.offlineUsers, icon: '🔴' },
                      { label: 'Total Honey', value: fmt(agg.totals.sumHoney), icon: '🍯' },
                      { label: 'Total Tickets', value: fmt(agg.totals.sumTickets), icon: '🎫' },
                      { label: 'Total Pollen', value: fmt(agg.totals.sumPollen), icon: '🌸' },
                      { label: 'Royal Jelly', value: fmt(agg.totals.sumRoyalJelly), icon: '👑' },
                      { label: 'Avg Honey', value: fmt(agg.totals.avgHoney), icon: '📊' },
                    ].map(item => (
                      <div key={item.label} className="stat" style={{ borderRadius: 14, padding: '14px 16px' }}>
                        <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                        <div style={{ fontSize: 20, fontWeight: 900 }}>{item.value}</div>
                        <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 2, fontWeight: 600 }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                    Generated: {new Date(agg.generatedAt).toLocaleTimeString()} · Refreshed: {Math.round((Date.now() - aggAt) / 1000)}s ago
                  </div>
                </>
              ) : aggErr ? (
                <div style={{ color: '#ff9da3', padding: 16, background: 'rgba(255,70,70,0.08)', borderRadius: 12, border: '1px solid rgba(255,70,70,0.2)' }}>Error: {aggErr}</div>
              ) : (
                <div style={{ color: 'var(--muted)' }}>Loading...</div>
              )}
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
}
