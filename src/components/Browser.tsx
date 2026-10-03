import { useMemo, useState } from 'react';
import { useSim } from '../store';
import { searchFor, videosFor, feedFor, threadsFor, DISCLAIMER, MYSTERY } from '../data';

function normalize(u: string) {
  u = u.trim().toLowerCase();
  u = u.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!u) return 'search.local';
  if (!u.includes('.')) return u + '.local';
  return u;
}

export default function Browser({ initialUrl }: { initialUrl?: string }) {
  const sim = useSim();
  const [tabs, setTabs] = useState<{ id: string; url: string; title: string }[]>([{ id: 't1', url: initialUrl ?? 'search.local', title: 'Start' }]);
  const [active, setActive] = useState('t1');
  const [addr, setAddr] = useState(initialUrl ?? 'search.local');
  const [back, setBack] = useState<string[]>([]);
  const [fwd, setFwd] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const cur = tabs.find(t => t.id === active)!;

  const nav = (raw: string) => {
    const url = normalize(raw);
    if (!sim.online) { setAddr(url); setTabs(ts => ts.map(t => t.id === active ? { ...t, url: '__offline', title: 'Offline' } : t)); return; }
    setLoading(true);
    const delay = sim.year <= 2000 ? 1400 / sim.settings.connectionSpeed : 500 / sim.settings.connectionSpeed;
    setTimeout(() => {
      setLoading(false);
      setBack(b => [...b, cur.url]);
      setFwd([]);
      setTabs(ts => ts.map(t => t.id === active ? { ...t, url, title: url } : t));
      setAddr(url);
      sim.visit(url, url);
      if (url.includes('mystery.local/harbor')) sim.unlock('deep-dive');
      if (url === 'mystery.local/guestbook-secret') sim.findEaster('guestbook-ghost');
    }, sim.settings.reducedMotion ? 50 : delay);
  };

  const goBack = () => { if (!back.length) return; const prev = back[back.length - 1]; setFwd(f => [cur.url, ...f]); setBack(b => b.slice(0, -1)); setTabs(ts => ts.map(t => t.id === active ? { ...t, url: prev } : t)); setAddr(prev); };
  const goFwd = () => { if (!fwd.length) return; const nx = fwd[0]; setBack(b => [...b, cur.url]); setFwd(f => f.slice(1)); setTabs(ts => ts.map(t => t.id === active ? { ...t, url: nx } : t)); setAddr(nx); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: 4, background: '#dfe5ee', padding: '6px 6px 0' }}>
        {tabs.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', background: t.id === active ? '#fff' : '#c9d2e0', borderRadius: '8px 8px 0 0', padding: '4px 8px', fontSize: 12 }}>
            <button onClick={() => { setActive(t.id); setAddr(t.url); }} style={{ background: 'none', border: 'none' }}>🌐 {t.url.slice(0, 22)}</button>
            <button onClick={() => { if (tabs.length === 1) return; setTabs(ts => ts.filter(x => x.id !== t.id)); setActive(tabs[0].id); }} style={{ background: 'none', border: 'none' }}>✕</button>
          </div>
        ))}
        <button className="btn small" onClick={() => { const id = 't' + Date.now(); setTabs(ts => [...ts, { id, url: 'search.local', title: 'New' }]); setActive(id); setAddr('search.local'); }}>＋</button>
      </div>
      <div className="browser-bar">
        <button className="btn small" onClick={goBack}>←</button>
        <button className="btn small" onClick={goFwd}>→</button>
        <button className="btn small" onClick={() => nav(addr)}>⟳</button>
        <input className="addr kbd-focus" value={addr} onChange={e => setAddr(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') nav(addr); }} aria-label="Address bar" />
        <button className="btn small" onClick={() => nav(addr)}>Go</button>
        <button className="btn small" onClick={() => sim.toggleBookmark(cur.url)}>{sim.bookmarks.includes(cur.url) ? '★' : '☆'}</button>
        <button className="btn small" onClick={() => sim.openApp('history')}>🕘</button>
      </div>
      <div style={{ background: '#f7f9fc', padding: '4px 8px', fontSize: 11, color: '#64748b' }}>🔖 {sim.bookmarks.slice(0, 5).map(b => <button key={b} onClick={() => nav(b)} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 11 }}>{b} · </button>)} <span>· {DISCLAIMER}</span></div>
      <div style={{ flex: 1, overflow: 'auto', background: '#fff' }}>
        {loading ? <LoadingAnim year={sim.year} /> : <Site url={cur.url} nav={nav} />}
      </div>
    </div>
  );
}

function LoadingAnim({ year }: { year: number }) {
  const msg = year <= 2000 ? '📞 Dialing… screech… handshake… (simulated)' : year <= 2005 ? '⏳ Loading… (broadband-ish, simulated)' : '⏳ Loading…';
  return <div style={{ padding: 40, textAlign: 'center' }}><div style={{ fontSize: 32 }}>🌀</div><p>{msg}</p><div style={{ height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden', maxWidth: 300, margin: '0 auto' }}><div style={{ height: 8, width: '60%', background: '#2563eb', animation: 'blink 0.8s infinite' }} /></div></div>;
}

export function Site({ url, nav }: { url: string; nav: (u: string) => void }) {
  const sim = useSim();
  if (url === '__offline') return <div className="site"><h1>❌ You’re offline (simulated)</h1><p>The {sim.year} internet can’t load <b>{url}</b> without a connection.</p><button className="btn" onClick={() => sim.setOnline(true)}>Reconnect (simulated)</button></div>;
  const [u, path] = url.split(/\/(.+)/);
  if (u === 'search.local' || u === 'findit.local') return <SearchSite nav={nav} />;
  if (u === 'video.local') return <VideoSite path={path} nav={nav} />;
  if (u === 'mail.local') return <div className="site"><h1>📬 PostBox Mail</h1><p>Your fictional inbox lives in the <b>Mail</b> desktop app (richer UI there).</p><button className="btn" onClick={() => sim.openApp('mail')}>Open Mail app</button></div>;
  if (u === 'chat.local') return <div className="site"><h1>👥 FriendCircle (fictional)</h1><Feed nav={nav} /></div>;
  if (u === 'forum.local') return <ForumSite />;
  if (u === 'pages.local') return <PagesSite path={path} nav={nav} />;
  if (u === 'internet.local') return <PortalSite path={path} nav={nav} />;
  if (u === 'mystery.local') return <MysterySite path={path} nav={nav} />;
  if (u === 'bbs.local') return <div className="site" style={{ background: '#000', color: '#0f0', fontFamily: 'monospace' }}><h1>★ STARRY NIGHT BBS ★</h1><p>(fictional bulletin board, {sim.year})</p><p>&gt; hello traveler. ascii hug: (づ｡◕‿‿◕｡)づ</p><p>&gt; hint: the static at mystery.local/static hums…</p><button className="btn small" onClick={() => nav('mystery.local/static')}>visit static →</button></div>;
  if (u === 'ai.local') return <AISite />;
  if (u === 'music.local') return <div className="site"><h1>🎵 StreamBox (fictional)</h1><p>All tracks are generated tones. Open the desktop <b>Music</b> app to play.</p><button className="btn" onClick={() => sim.openApp('music')}>Open Music</button></div>;
  if (u === 'speed.local') return <div className="site"><h1>⏱️ Speed-ish test (fictional)</h1><p>{sim.year} plan: <b>{sim.year <= 2000 ? '56k dial-up — a 100KB image in ~20s' : sim.year <= 2010 ? 'Broadband — fast enough for video!' : 'Fiber/6G — instant-ish'}</b></p><div className="counter">{sim.year <= 2000 ? '56 Kb/s' : '100 Mb/s'} SIM</div></div>;
  if (u === 'reads.local') return <div className="site"><h1>📖 Longform (simulated essays)</h1><p><i>“On tiled backgrounds”</i> — a fictional essay about fictional pages. Glitter is a lifestyle.</p></div>;
  if (u === 'pets.local') return <div className="site"><h1>🐱 Pixel Pets (fictional)</h1><PetGame /></div>;
  return <div className="site"><h1>404 — page not found (simulated)</h1><p>No fictional page at <b>{url}</b>. Moo? 🐮 (That’s the joke — this error page is an easter egg. Click the cow!)</p><button onClick={() => sim.findEaster('404-cow')} style={{ fontSize: 40, background: 'none', border: 'none' }} aria-label="cow">🐮</button><p>Try: search.local · video.local · forum.local · pages.local · mystery.local/static</p><button className="btn" onClick={() => nav('search.local')}>Go to search</button></div>;
}

function SearchSite({ nav }: { nav: (u: string) => void }) {
  const sim = useSim();
  const [q, setQ] = useState('funny videos');
  const [res, setRes] = useState(() => searchFor('funny videos', sim.year));
  const go = (qq: string) => { setRes(searchFor(qq, sim.year)); sim.unlock('first-search'); sim.visit('search.local?q=' + qq, 'Search: ' + qq); };
  return (
    <div className="site">
      <h1>🔎 {sim.year >= 2025 ? 'FindIt AI' : 'FindIt'} <small style={{ fontWeight: 400 }}>(simulated search, {sim.year})</small></h1>
      <div className="row"><input className="kbd-focus" style={{ flex: 1 }} value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') go(q); }} aria-label="Search" /><button className="btn primary" onClick={() => go(q)}>Search</button></div>
      <p style={{ color: '#64748b', fontSize: 12 }}>{DISCLAIMER} Results change by era.</p>
      {res.map(r => (
        <div key={r.url + r.title} className="list-item" style={{ border: '1px solid #eee', borderRadius: 10, marginBottom: 8 }}>
          <button onClick={() => nav(r.url)} style={{ background: 'none', border: 'none', color: '#1a0dab', fontSize: 16, textAlign: 'left', padding: 0 }}>{r.title}</button>
          <div style={{ color: '#006621', fontSize: 12 }}>{r.url} · {r.date}</div>
          <div style={{ fontSize: 13 }}>{r.desc}</div>
        </div>
      ))}
    </div>
  );
}

export function VideoSite({ path, nav }: { path?: string; nav?: (u: string) => void }) {
  const sim = useSim();
  const vids = videosFor(sim.year);
  const [watch, setWatch] = useState<string | null>(path && path !== 'funny' ? path : null);
  const [query, setQuery] = useState('');
  const list = vids.filter(v => !query || (v.title + v.desc).toLowerCase().includes(query.toLowerCase()));
  const go = (id: string) => { setWatch(id); sim.visit('video.local/' + id, 'Watch fictional video'); if (nav) nav('video.local/' + id); };
  if (watch) {
    const v = vids.find(x => x.id === watch) ?? vids[0];
    if (!v) return <div className="site">No videos.</div>;
    return (
      <div className="site">
        <button className="btn small" onClick={() => setWatch(null)}>← all videos</button>
        <h1>▶ {v.title}</h1>
        <div style={{ background: '#000', color: '#fff', borderRadius: 12, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>📼<span style={{ fontSize: 14, marginLeft: 8 }}>(simulated player · {v.duration})</span></div>
        <p>👁 {v.views} · ⭐ {v.rating}/5 · {v.duration} · fictional</p>
        <p>{v.desc}</p>
        <div className="row"><button className="btn small" onClick={() => sim.startDownload(v.id + '.vid (simulated)', '24 MB')}>⬇ Download (sim)</button><button className="btn small" onClick={() => sim.openApp('music')}>🎵 soundtrack?</button></div>
        <h3>💬 Comments (fictional)</h3>
        {v.comments.map((c, i) => <div key={i} className="list-item"><b>{c.user}</b> <small>{c.time}</small><br />{c.text}</div>)}
        <h3>Related (fictional)</h3>
        <div className="thumbs">{vids.filter(x => x.id !== v.id).slice(0, 4).map(r => <button key={r.id} className="thumb kbd-focus" onClick={() => go(r.id)}><div className="art">🎬</div><div style={{ padding: 6, fontSize: 12 }}>{r.title}</div></button>)}</div>
      </div>
    );
  }
  return (
    <div className="site" style={{ maxWidth: 900 }}>
      <h1>📺 TubeYou <small>(fictional video site, {sim.year})</small></h1>
      <div className="row"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search fictional videos…" style={{ flex: 1 }} /><span>Categories: funny · tech · music</span></div>
      <div className="thumbs" style={{ marginTop: 10 }}>
        {list.map(v => (
          <button key={v.id} className="thumb kbd-focus" onClick={() => go(v.id)} style={{ textAlign: 'left', background: '#fff' }}>
            <div className="art" style={{ background: 'linear-gradient(135deg,#1e293b,#475569)', color: '#fff' }}>▶</div>
            <div style={{ padding: 8 }}><b style={{ fontSize: 13 }}>{v.title}</b><div style={{ fontSize: 11, color: '#64748b' }}>{v.views} views · {v.duration}</div></div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Feed({ nav }: { nav?: (u: string) => void }) {
  const sim = useSim();
  const posts = useMemo(() => feedFor(sim.year), [sim.year]);
  return (
    <div>
      {posts.map(p => (
        <div key={p.id} className="list-item" style={{ border: '1px solid #eee', borderRadius: 10, marginBottom: 8 }}>
          <b>@{p.user}</b> <small>· {p.time} · fictional</small><p>{p.text}</p>
          <div className="row"><span>❤ {p.likes}</span>{p.comments.map((c, i) => <span key={i} style={{ fontSize: 12 }}>💬 {c.user}: {c.text}</span>)}</div>
        </div>
      ))}
      <p style={{ fontSize: 12, color: '#64748b' }}>All profiles are fictional.</p>
    </div>
  );
}

function ForumSite() {
  const sim = useSim();
  const [threads, setThreads] = useState(() => threadsFor(sim.year));
  const [reply, setReply] = useState<Record<string, string>>({});
  return (
    <div className="site" style={{ maxWidth: 820 }}>
      <h1>💭 CodeHaven Forum <small>(fictional, {sim.year})</small></h1>
      <p style={{ fontSize: 12, color: '#64748b' }}>{DISCLAIMER}</p>
      {threads.map(t => (
        <div key={t.id} style={{ border: '1px solid #dde', borderRadius: 10, marginBottom: 10, padding: 10 }}>
          <b>[{t.category}] {t.title}</b> <small>by {t.author} · {t.time}</small>
          {t.id === 't2' && <div style={{ background: '#fef9c3', borderRadius: 8, padding: 8, marginTop: 6, fontSize: 13 }}>🧵 <b>zerosignal</b>: “the harbor password is the thing the lighthouse blinks + the year on the static page. lowercase, dashes.” (fictional clue)</div>}
          {t.replies.map((r, i) => <div key={i} style={{ marginLeft: 12, fontSize: 13, marginTop: 6 }}><b>{r.user}</b> <small>{r.time}</small><br />{r.text}</div>)}
          <div className="row" style={{ marginTop: 8 }}>
            <input placeholder="Write a reply (simulated)…" value={reply[t.id] ?? ''} onChange={e => setReply(s => ({ ...s, [t.id]: e.target.value }))} style={{ flex: 1 }} />
            <button className="btn small" onClick={() => { const v = (reply[t.id] ?? '').trim(); if (!v) return; setThreads(ts => ts.map(x => x.id === t.id ? { ...x, replies: [...x.replies, { user: 'you', text: v, time: 'now' }] } : x)); setReply(s => ({ ...s, [t.id]: '' })); sim.notify('Reply posted (simulated).', 'forum'); }}>Reply</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PagesSite({ path, nav }: { path?: string; nav: (u: string) => void }) {
  const sim = useSim();
  const blinkOff = sim.settings.modernMode || sim.settings.reducedMotion;
  if (!path || path === '') {
    return (
      <div className="site"><h1>🌈 Personal Pages Directory (fictional)</h1>
        <div className="list">
          <button className="list-item kbd-focus" style={{ width: '100%', textAlign: 'left' }} onClick={() => nav('pages.local/cool-dave')}>🕺 Cool Dave’s Page — glitter, MIDI (sim)</button>
          <button className="list-item kbd-focus" style={{ width: '100%', textAlign: 'left' }} onClick={() => nav('pages.local/star-girl')}>⭐ Star Girl’s Diary — tiled stars</button>
        </div></div>
    );
  }
  return (
    <div className="site" style={{ background: 'repeating-linear-gradient(45deg,#fef3c7,#fef3c7 20px,#fde68a 20px,#fde68a 40px)', borderRadius: 12, border: '4px ridge #f59e0b' }}>
      <h1 style={{ color: '#b45309' }}>✨ {(path.includes('dave') ? 'Cool Dave' : 'Star Girl') + '’s Homepage'} ✨</h1>
      {!blinkOff && <div className="blink" style={{ fontSize: 20 }}>★ WELCOME TO MY PAGE ★</div>}
      <div><span className="counter">001337</span> visitors (fictional counter)</div>
      <p>🚧 <b>UNDER CONSTRUCTION</b> 🚧 (fictional joke, forever)</p>
      <p>🎸 My fictional band. Sign my guestbook!</p>
      <div className="row">
        <button className="btn small" onClick={() => { sim.notify('Guestbook signed! (simulated)', 'browser'); if (path.includes('dave')) sim.findEaster('guestbook-ghost'); }}>✍ Sign guestbook</button>
        <button className="btn small" onClick={() => sim.startDownload('glitter-pack.zip (simulated)', '1.2 MB')}>⬇ glitter-pack.zip</button>
        <button className="btn small" onClick={() => nav('pages.local')}>← directory</button>
      </div>
      {path.includes('dave') && <p style={{ fontSize: 12 }}>P.S. Dave’s MIDI is in Music. P.P.S. zerosignal says hi in forum.local 👀</p>}
    </div>
  );
}

function PortalSite({ path, nav }: { path?: string; nav: (u: string) => void }) {
  if (path === 'dialup') return <div className="site"><h1>📞 Why does dial-up screech? (fictional explainer)</h1><p>Two fictional modems negotiating: beeps = “hello?”, screech = “let’s agree on speed!”, silence = connected. In this sim, press the 🌐 button in the taskbar to hear-ish (visual only) a reconnect.</p><button className="btn" onClick={() => nav('internet.local')}>← portal</button></div>;
  return (
    <div className="site"><h1>🌀 Zorp Portal <small>(fictional)</small></h1>
      <div className="grid2">
        <div className="card"><h3>🌤 Fictional weather</h3><p>Sunny with 40% chance of popups.</p></div>
        <div className="card"><h3>📊 Poll (sim)</h3><Poll /></div>
      </div>
      <p><button className="btn small" onClick={() => nav('internet.local/dialup')}>Why does dial-up screech? →</button></p>
    </div>
  );
}
function Poll() {
  const [v, setV] = useState<string | null>(null);
  if (v) return <p>You voted <b>{v}</b>! (simulated, 1,337 fictional votes)</p>;
  return <div className="row">{['glitter text', 'tiled bg', 'guestbook'].map(o => <button key={o} className="btn small" onClick={() => setV(o)}>{o}</button>)}</div>;
}

function MysterySite({ path, nav }: { path?: string; nav: (u: string) => void }) {
  const sim = useSim();
  const [src, setSrc] = useState(false);
  const [pw, setPw] = useState('');
  if ((path ?? '') === 'harbor') {
    return (
      <div className="site" style={{ background: '#0b1020', color: '#c4b5fd', borderRadius: 12 }}>
        <h1>🏝️ Pixel Harbor (hidden page — fictional)</h1>
        <p>You followed the static. Nice.</p>
        <p>Enter the harbor password (clue: check the forum thread “How do I view source?”).</p>
        <div className="row"><input value={pw} onChange={e => setPw(e.target.value)} placeholder="harbor password" aria-label="Harbor password" /><button className="btn primary" onClick={() => {
          if (pw.trim().toLowerCase() === MYSTERY.password) { sim.solveMystery(); } else { sim.notify('Wrong password (simulated). Re-read the forum clue!', 'mysteries'); }
        }}>Unlock</button></div>
        {sim.mysterySolved && <p>✅ Unlocked! The file in Downloads is now readable. Check Files → Downloads → {MYSTERY.finalFileName}</p>}
      </div>
    );
  }
  // static page
  return (
    <div className="site" style={{ background: '#111', color: '#eee', borderRadius: 12 }}>
      <h1>📺 mystery.local/static <small>(fictional puzzle start)</small></h1>
      {!sim.settings.reducedMotion && <div style={{ fontSize: 40, animation: 'blink 0.7s infinite' }}>▓▒░ STATIC ░▒▓</div>}
      <p>The hum says: <i>“view my source…”</i></p>
      <div className="row">
        <button className="btn small" onClick={() => setSrc(s => !s)}>{src ? 'Hide source' : 'View source'}</button>
        <button className="btn small" onClick={() => nav('mystery.local/harbor')}>→ try the harbor</button>
      </div>
      {src && <pre style={{ background: '#000', padding: 12, borderRadius: 8, fontSize: 12 }}>{`<!-- fictional source. nothing real. -->\n<!-- the lighthouse blinks: ${MYSTERY.phrase} -->\n<!-- year etched: 1999 -->\n<!-- password shape: words-with-dashes + year -->\n<!-- next: forum.local, find zerosignal -->`}</pre>}
      <p style={{ fontSize: 12, color: '#9ca3af' }}>Fictional puzzle. No real secrets. Screenshot freely.</p>
    </div>
  );
}

function AISite() {
  const sim = useSim();
  const [q, setQ] = useState('');
  const [a, setA] = useState('I run 100% locally in this sim. Ask me: “summarize my day”, “where is the mystery?”, “funny videos”. (fictional)');
  const ask = () => {
    const t = q.toLowerCase();
    if (t.includes('day')) setA(sim.day ? `Your simulated day (${sim.dayDate}): ${sim.day.length} events. Open the Random Day app!` : 'No day generated yet — open the Random Day app and hit GENERATE.');
    else if (t.includes('mystery') || t.includes('harbor') || t.includes('secret')) setA('Start at mystery.local/static → View Source → forum.local (zerosignal) → mystery.local/harbor. All fictional!');
    else if (t.includes('video') || t.includes('funny')) setA('Open video.local — try the hamster short. It’s fictional but delightful.');
    else setA(`(simulated, offline) You said: “${q}”. Cute. Everything I say is made up for play — not history!`);
    sim.visit('ai.local', 'AI chat');
  };
  if (sim.year < 2020) return <div className="site"><h1>✨ AI (not yet invented in {sim.year}!)</h1><p>In this era the “AI” is just MARQUEE_BOT doing its best. Try the Chat app.</p></div>;
  return <div className="site"><h1>✨ Aura AI <small>(offline sim, fictional)</small></h1><div className="row"><input style={{ flex: 1 }} value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') ask(); }} placeholder="Ask something…" aria-label="Ask AI" /><button className="btn primary" onClick={ask}>Ask</button></div><p style={{ background: '#f5f3ff', padding: 10, borderRadius: 8 }}>{a}</p></div>;
}

function PetGame() {
  const [fed, setFed] = useState(3);
  const [msg, setMsg] = useState('Your fictional cat blinks at you.');
  return <div><div style={{ fontSize: 64 }}>{fed > 0 ? '🐱' : '🙀'}</div><p>{msg} (fed: {fed})</p><div className="row"><button className="btn small" onClick={() => { setFed(f => f + 1); setMsg('Nom! +1 click-food (simulated).'); }}>🍪 feed click</button><button className="btn small" onClick={() => { setFed(f => Math.max(0, f - 1)); setMsg('The cat blinks slowly…'); }}>⏳ wait</button></div></div>;
}
