import { useEffect, useRef, useState } from 'react';
import { useSim } from '../store';
import { contactsFor, greetingFor, feedFor, threadsFor, MYSTERY } from '../data';
import { startMusic, stopMusic, blip, trackList } from '../audio';

/* ---------- Files ---------- */
export function FileExplorer() {
  const sim = useSim();
  const [cwd, setCwd] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [newName, setNewName] = useState('');
  const kids = sim.files.filter(f => f.parentId === cwd && (!q || f.name.toLowerCase().includes(q.toLowerCase())));
  const path = cwd ? sim.files.find(f => f.id === cwd)?.name ?? '' : 'Computer';
  const open = (id: string) => {
    const f = sim.files.find(x => x.id === id)!;
    if (f.type === 'folder') setCwd(id);
    else if (f.type === 'mystery' && f.locked) sim.notify('Locked file — needs harbor password. See Mysteries app.', 'mysteries');
    else sim.openApp('notepad', { title: f.name, fileId: f.id });
  };
  return (
    <div className="app">
      <div className="toolbar">
        <button className="btn small" onClick={() => setCwd(sim.files.find(f => f.id === cwd)?.parentId ?? null)}>↑ Up</button>
        <b>{path}</b>
        <input placeholder="Search files…" value={q} onChange={e => setQ(e.target.value)} aria-label="Search files" />
      </div>
      <div className="toolbar">
        <input placeholder="New folder name" value={newName} onChange={e => setNewName(e.target.value)} aria-label="New folder name" />
        <button className="btn small" onClick={() => { if (newName.trim()) { sim.createFolder(newName.trim(), cwd); setNewName(''); } }}>＋ Folder</button>
        <button className="btn small" onClick={() => sim.addFile({ name: 'note.txt', type: 'text', parentId: cwd, content: 'fresh fictional note' })}>＋ Note</button>
      </div>
      {cwd === null && <p>Drives: {sim.files.filter(f => f.parentId === null).map(d => <button key={d.id} className="btn small" onClick={() => setCwd(d.id)} style={{ marginRight: 6 }}>{d.name}</button>)}</p>}
      <div className="list">
        {kids.map(f => (
          <div key={f.id} className="list-item row" style={{ justifyContent: 'space-between' }}>
            <button onClick={() => open(f.id)} style={{ background: 'none', border: 'none', textAlign: 'left' }}>{f.type === 'folder' ? '📁' : f.type === 'text' ? '📝' : f.type === 'image' ? '🖼️' : f.type === 'audio' ? '🎵' : f.type === 'mystery' ? (f.locked ? '🔒' : '🎉') : '📦'} {f.name} {f.locked ? '(locked)' : ''}</button>
            <span className="row">
              <button className="btn small" onClick={() => { const n = prompt('Rename to:', f.name); if (n) sim.renameNode(f.id, n); }}>✏️</button>
              <button className="btn small" onClick={() => sim.deleteNode(f.id)}>🗑</button>
            </span>
          </div>
        ))}
        {kids.length === 0 && <div className="list-item">Empty (fictional) folder.</div>}
      </div>
      <p style={{ fontSize: 12, color: '#64748b' }}>Persisted to localStorage via Save in Settings. Double-click/Enter opens.</p>
    </div>
  );
}

export function NotepadApp({ payload }: { payload?: any }) {
  const sim = useSim();
  const f = sim.files.find(x => x.id === payload?.fileId);
  const [text, setText] = useState(f?.content ?? 'Fresh fictional note. Everything saves to the sim filesystem (not real).');
  const [pw, setPw] = useState('');
  if (f?.type === 'image') return <div className="app"><h2>🖼️ {f.name} (simulated image)</h2><div style={{ height: 180, borderRadius: 12, background: 'linear-gradient(135deg,#0e5c2f,#7ed957,#1e90ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>⛰️</div><p>Fake bitmap. No real pixels were harmed.</p></div>;
  if (f?.type === 'audio') return <div className="app"><h2>🎵 {f.name}</h2><p>Generated tone (no copyrighted audio).</p><button className="btn" onClick={() => blip(523, 0.3, 'triangle', 0.06)}>▶ play blip</button></div>;
  if (f?.type === 'mystery' && f.locked) {
    return <div className="app"><h2>🔒 {f.name}</h2><p>Needs harbor password. Hint: Mysteries app.</p><div className="row"><input value={pw} onChange={e => setPw(e.target.value)} placeholder="password" /><button className="btn primary" onClick={() => { if (pw.trim().toLowerCase() === MYSTERY.password) { sim.unlockFile(f.id); sim.solveMystery(); setText(MYSTERY.finalText); } else sim.notify('Wrong password (sim).', 'mysteries'); }}>Unlock</button></div></div>;
  }
  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2>📝 {f?.name ?? 'Untitled'} <small style={{ fontWeight: 400 }}>(simulated file)</small></h2>
      <textarea className="kbd-focus" value={text} onChange={e => setText(e.target.value)} style={{ flex: 1, minHeight: 200 }} aria-label="File content" />
      <div className="row" style={{ marginTop: 8 }}>
        <button className="btn small" onClick={() => { if (f) { sim.renameNode(f.id, f.name); sim.notify('Saved to sim filesystem.', 'files'); } }}>💾 Save (sim)</button>
        {f && <span style={{ fontSize: 12, color: '#64748b' }}>{f.id} · {f.created}</span>}
      </div>
    </div>
  );
}

/* ---------- Chat + Social ---------- */
export function ChatApp({ social }: { social?: boolean }) {
  const sim = useSim();
  const contacts = contactsFor(sim.year);
  const [sel, setSel] = useState(contacts[0].id);
  const [draft, setDraft] = useState('');
  const msgs = sim.chats[sel] ?? [];
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => { boxRef.current?.scrollTo(0, 99999); }, [msgs.length, sel]);
  if (social) {
    const posts = feedFor(sim.year);
    const [txt, setTxt] = useState('');
    const [extra, setExtra] = useState<{ user: string; text: string }[]>([]);
    return (
      <div className="app"><h2>👥 FriendCircle <small>(fictional social feed, {sim.year})</small></h2>
        <div className="row"><input style={{ flex: 1 }} value={txt} onChange={e => setTxt(e.target.value)} placeholder="Post something fictional…" aria-label="New post" /><button className="btn primary small" onClick={() => { if (txt.trim()) { setExtra(e => [{ user: 'you', text: txt.trim() }, ...e]); setTxt(''); } }}>Post</button></div>
        {extra.map((p, i) => <div key={i} className="list-item"><b>@{p.user}</b> · now<br />{p.text}</div>)}
        {posts.map((p: any) => <div key={p.id} className="list-item"><b>@{p.user}</b> <small>{p.time}</small><br />{p.text}<br />❤ {p.likes}</div>)}
      </div>
    );
  }
  return (
    <div className="app" style={{ display: 'flex', gap: 10, height: '100%' }}>
      <div style={{ width: 170 }}>
        <h2 style={{ fontSize: 15 }}>{sim.year >= 2020 ? 'PingMeet' : 'Chat'} <small>({sim.year})</small></h2>
        {contacts.map(c => <button key={c.id} onClick={() => setSel(c.id)} className="kbd-focus" style={{ display: 'block', width: '100%', textAlign: 'left', background: sel === c.id ? '#e0e7ff' : '#f1f5f9', border: '1px solid #dde', borderRadius: 8, padding: 8, marginBottom: 6 }}>{c.online ? '🟢' : '⚫'} <b>{c.name}</b><br /><small>{c.mood}</small></button>)}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div ref={boxRef} style={{ flex: 1, overflow: 'auto', border: '1px solid #dde', borderRadius: 10, padding: 8, minHeight: 200 }}>
          {msgs.length === 0 && <p style={{ color: '#64748b' }}>Say hi — replies are fictional + local. Try “mystery”!</p>}
          {msgs.map((m, i) => <div key={i} style={{ textAlign: m.me ? 'right' : 'left', margin: '6px 0' }}><span style={{ display: 'inline-block', background: m.me ? '#2563eb' : '#f1f5f9', color: m.me ? '#fff' : '#111', borderRadius: 12, padding: '6px 10px', maxWidth: '80%' }}>{m.text}<br /><small style={{ opacity: 0.7 }}>{m.time}</small></span></div>)}
        </div>
        <form className="row" style={{ marginTop: 8 }} onSubmit={e => { e.preventDefault(); if (draft.trim()) { sim.sendChat(sel, draft.trim()); setDraft(''); } }}>
          <input className="kbd-focus" style={{ flex: 1 }} value={draft} onChange={e => setDraft(e.target.value)} placeholder={`Message ${contacts.find(c => c.id === sel)?.name}… (fictional)`} aria-label="Chat message" />
          <button className="btn primary small" type="submit">Send</button>
        </form>
        <small style={{ color: '#64748b' }}>Example eras: 2005 “yo u on chat?” · 2025 “you joining the call?” All fictional.</small>
      </div>
    </div>
  );
}

/* ---------- Mail ---------- */
export function MailApp() {
  const sim = useSim();
  const [folder, setFolder] = useState<'inbox' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [openId, setOpenId] = useState<string | null>(null);
  const [compose, setCompose] = useState(false);
  const [to, setTo] = useState('pixelfriend@postbox.local'); const [subj, setSubj] = useState('hello from the time machine (sim)'); const [body, setBody] = useState('this email is fictional!');
  const [q, setQ] = useState('');
  const list = sim.emails.filter(e => e.folder === folder && (!q || (e.subject + e.body + e.from).toLowerCase().includes(q.toLowerCase())));
  const open = sim.emails.find(e => e.id === openId);
  return (
    <div className="app" style={{ display: 'flex', gap: 10, height: '100%' }}>
      <div style={{ width: 150 }}>
        <button className="btn primary small" style={{ width: '100%', marginBottom: 8 }} onClick={() => setCompose(true)}>✏ Compose</button>
        {(['inbox', 'sent', 'drafts', 'trash'] as const).map(f => <button key={f} onClick={() => { setFolder(f); setOpenId(null); }} style={{ display: 'block', width: '100%', textAlign: 'left', background: folder === f ? '#e0e7ff' : 'transparent', border: 'none', padding: 8, borderRadius: 8 }}>📁 {f} ({sim.emails.filter(e => e.folder === f).length})</button>)}
        <input placeholder="Search mail…" value={q} onChange={e => setQ(e.target.value)} style={{ width: '100%', marginTop: 8 }} aria-label="Search mail" />
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {compose ? (
          <div><h2>✏ Compose (simulated — stays local)</h2><div className="grid2"><input value={to} onChange={e => setTo(e.target.value)} aria-label="To" /><input value={subj} onChange={e => setSubj(e.target.value)} aria-label="Subject" /></div><textarea value={body} onChange={e => setBody(e.target.value)} style={{ width: '100%', minHeight: 140, marginTop: 8 }} aria-label="Body" /><div className="row" style={{ marginTop: 8 }}><button className="btn primary small" onClick={() => { sim.sendEmail(to, subj, body); setCompose(false); setFolder('sent'); }}>Send (sim)</button><button className="btn small" onClick={() => setCompose(false)}>Cancel</button></div></div>
        ) : open ? (
          <div><button className="btn small" onClick={() => setOpenId(null)}>← back</button><h2>{open.subject}</h2><p><b>From:</b> {open.from} · <b>To:</b> {open.to} · {open.time}</p><pre style={{ whiteSpace: 'pre-wrap', background: '#f8fafc', padding: 10, borderRadius: 8 }}>{open.body}</pre><div className="row"><ReplyBox id={open.id} /><button className="btn small" onClick={() => { sim.trashEmail(open.id); setOpenId(null); }}>🗑 Delete</button></div></div>
        ) : (
          <div className="list">{list.map(e => <button key={e.id} className="list-item kbd-focus" style={{ width: '100%', textAlign: 'left', background: e.read ? '#fff' : '#eef2ff' }} onClick={() => { setOpenId(e.id); sim.markRead(e.id); }}><b>{e.read ? '' : '● '}{e.subject}</b><br /><small>{e.from} · {e.time}</small></button>)}{list.length === 0 && <div className="list-item">Empty folder (sim).</div>}</div>
        )}
      </div>
    </div>
  );
}
function ReplyBox({ id }: { id: string }) {
  const sim = useSim(); const [v, setV] = useState('');
  return <span className="row"><input value={v} onChange={e => setV(e.target.value)} placeholder="Quick reply (sim)…" aria-label="Reply" /><button className="btn small" onClick={() => { if (v.trim()) { sim.replyEmail(id, v.trim()); setV(''); } }}>Reply</button></span>;
}

/* ---------- Music ---------- */
export function MusicPlayer() {
  const sim = useSim();
  const tracks = trackList();
  const [prog, setProg] = useState(0);
  useEffect(() => {
    if (!sim.musicPlaying) { stopMusic(); return; }
    startMusic(sim.year, sim.settings.volume);
    const iv = setInterval(() => setProg(p => (p + 2) % 100), 500);
    return () => { stopMusic(); clearInterval(iv); };
  }, [sim.musicPlaying, sim.year]);
  const t = tracks[sim.musicTrack % tracks.length];
  return (
    <div className="app"><h2>🎵 Music <small>(generated tones only · {sim.year})</small></h2>
      <div style={{ background: '#0f172a', color: '#fff', borderRadius: 12, padding: 14 }}>
        <b>{t.title}</b> — {t.artist}<br /><small>Track {sim.musicTrack + 1}/{tracks.length} · fictional</small>
        <div style={{ height: 8, background: '#334155', borderRadius: 4, margin: '10px 0' }}><div style={{ width: prog + '%', height: 8, background: '#a78bfa', borderRadius: 4 }} /></div>
        <div className="row">
          <button className="btn small" onClick={() => sim.setMusicTrack((sim.musicTrack + tracks.length - 1) % tracks.length)}>⏮</button>
          <button className="btn primary small" onClick={() => sim.setMusicPlaying(!sim.musicPlaying)}>{sim.musicPlaying ? '⏸ Pause' : '▶ Play'}</button>
          <button className="btn small" onClick={() => sim.setMusicTrack((sim.musicTrack + 1) % tracks.length)}>⏭</button>
          <label>🔊 <input type="range" min={0} max={1} step={0.1} value={sim.settings.volume} onChange={e => sim.setSettings({ volume: Number(e.target.value) })} aria-label="Volume" /></label>
        </div>
      </div>
      <div className="list" style={{ marginTop: 8 }}>{tracks.map((x: any, i: number) => <button key={i} className="list-item" style={{ width: '100%', textAlign: 'left', background: i === sim.musicTrack ? '#f5f3ff' : '#fff' }} onClick={() => { sim.setMusicTrack(i); sim.setMusicPlaying(true); }}>🎶 {x.title} — {x.artist}</button>)}</div>
    </div>
  );
}

/* ---------- Games ---------- */
export function GamesApp() {
  const sim = useSim();
  const [g, setG] = useState<string | null>(null);
  return (
    <div className="app"><h2>🎮 Arcade <small>(local games, {sim.year})</small></h2>
      {!g ? <div className="grid2">{[
        { id: 'mines', em: '💣', n: 'Minesweeper-ish', d: '90s classic. Flag the pixels.' },
        { id: 'snake', em: '🐍', n: 'Snake', d: 'Arrows/WASD. Eat, grow, don’t crash.' },
        { id: 'typing', em: '⌨️', n: 'Typing Rush', d: '2000s typing game. 30s sprint.' },
        { id: 'react', em: '⚡', n: 'Reaction', d: 'Click when green. Modern mini.' },
        { id: 'memory', em: '🃏', n: 'Memory Match', d: 'Match 6 pairs (fictional emoji).' },
      ].map(x => <button key={x.id} className="card kbd-focus" style={{ textAlign: 'left' }} onClick={() => { setG(x.id); sim.unlock('gamer'); }}><div style={{ fontSize: 28 }}>{x.em}</div><b>{x.n}</b><p style={{ color: '#64748b', fontSize: 12 }}>{x.d}</p></button>)}</div>
        : <div><button className="btn small" onClick={() => setG(null)}>← games</button>{g === 'mines' && <Mines />} {g === 'snake' && <Snake />} {g === 'typing' && <Typing />} {g === 'react' && <ReactGame />} {g === 'memory' && <Memory />}</div>}
    </div>
  );
}
function Mines() {
  const N = 8, B = 10;
  const [bombs] = useState(() => { const s = new Set<number>(); while (s.size < B) s.add(Math.floor(Math.random() * N * N)); return s; });
  const [open, setOpen] = useState<Set<number>>(new Set()); const [over, setOver] = useState(false); const [win, setWin] = useState(false);
  const adj = (i: number) => { let c = 0; const r = Math.floor(i / N), col = i % N; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const rr = r + dr, cc = col + dc; if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue; if (bombs.has(rr * N + cc)) c++; } return c; };
  const click = (i: number) => { if (over || win || open.has(i)) return; if (bombs.has(i)) { setOver(true); return; } const n = new Set(open); n.add(i); setOpen(n); if (n.size === N * N - B) setWin(true); };
  return <div><h3>💣 Minesweeper-ish</h3>{over && <p>💥 Boom! (simulated) <button className="btn small" onClick={() => { setOpen(new Set()); setOver(false); }}>retry</button></p>}{win && <p>🎉 You cleared it!</p>}<div style={{ display: 'grid', gridTemplateColumns: `repeat(${N},28px)`, gap: 2 }}>{Array.from({ length: N * N }, (_, i) => <button key={i} onClick={() => click(i)} style={{ width: 28, height: 28, background: open.has(i) ? '#e2e8f0' : '#94a3b8' }}>{open.has(i) ? adj(i) || '' : over && bombs.has(i) ? '💣' : ''}</button>)}</div></div>;
}
function Snake() {
  const [snake, setSnake] = useState([42, 41, 40]); const [food, setFood] = useState(55); const [dir, setDir] = useState(1); const [score, setScore] = useState(0); const [dead, setDead] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'ArrowUp') setDir(-10); if (e.key === 'ArrowDown') setDir(10); if (e.key === 'ArrowLeft') setDir(-1); if (e.key === 'ArrowRight') setDir(1); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, []);
  useEffect(() => {
    if (dead) return; const iv = setInterval(() => setSnake(s => {
      const h = s[0] + dir; if (h < 0 || h >= 100 || (dir === 1 && h % 10 === 0) || (dir === -1 && h % 10 === 9) || s.includes(h)) { setDead(true); return s; }
      const n = [h, ...s]; if (h === food) { setScore(v => v + 1); setFood(Math.floor(Math.random() * 100)); } else n.pop(); return n;
    }), 220); return () => clearInterval(iv);
  }, [dir, dead, food]);
  return <div><h3>🐍 Snake — {score}</h3>{dead && <p>💀 <button className="btn small" onClick={() => { setSnake([42, 41, 40]); setDead(false); setScore(0); }}>retry</button></p>}<div style={{ display: 'grid', gridTemplateColumns: 'repeat(10,22px)', gap: 1, background: '#0f172a', padding: 6, borderRadius: 8 }}>{Array.from({ length: 100 }, (_, i) => <div key={i} style={{ width: 22, height: 22, background: snake.includes(i) ? '#22c55e' : i === food ? '#ef4444' : '#1e293b', borderRadius: 4 }} />)}</div><p style={{ fontSize: 12 }}>Use arrow keys. Touch: use buttons <button className="btn small" onClick={() => setDir(-10)}>↑</button><button className="btn small" onClick={() => setDir(10)}>↓</button><button className="btn small" onClick={() => setDir(-1)}>←</button><button className="btn small" onClick={() => setDir(1)}>→</button></p></div>;
}
function Typing() {
  const words = 'glitter modem pixel dialup forum guestbook broadband stream'.split(' ');
  const [target] = useState(() => Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)]).join(' '));
  const [v, setV] = useState(''); const done = v.trim() === target;
  return <div><h3>⌨️ Typing Rush</h3><p>Type exactly:</p><p style={{ background: '#f1f5f9', padding: 8, borderRadius: 8 }}>{target}</p><input style={{ width: '100%' }} value={v} onChange={e => setV(e.target.value)} aria-label="Typing input" />{done && <p>🎉 {target.length} chars! Nice.</p>}</div>;
}
function ReactGame() {
  const [state, setState] = useState<'wait' | 'ready' | 'go' | 'done'>('wait'); const [t0, setT0] = useState(0); const [ms, setMs] = useState(0);
  const start = () => { setState('ready'); setTimeout(() => { setState('go'); setT0(Date.now()); }, 1200 + Math.random() * 2000); };
  return <div><h3>⚡ Reaction</h3>{state === 'wait' && <button className="btn primary" onClick={start}>Start</button>}{state === 'ready' && <div style={{ background: '#ef4444', color: '#fff', padding: 30, borderRadius: 10 }}>wait for green…</div>}{state === 'go' && <button style={{ background: '#22c55e', color: '#fff', padding: 30, borderRadius: 10, width: '100%' }} onClick={() => { setMs(Date.now() - t0); setState('done'); }}>CLICK!</button>}{state === 'done' && <p>⚡ {ms}ms! <button className="btn small" onClick={() => setState('wait')}>again</button></p>}</div>;
}
function Memory() {
  const deck = ['🐱', '🐹', '📼', '💾', '🌈', '🚀'];
  const [cards] = useState(() => [...deck, ...deck].sort(() => Math.random() - 0.5));
  const [flip, setFlip] = useState<number[]>([]); const [done, setDone] = useState<Set<string>>(new Set());
  const click = (i: number) => { if (flip.includes(i) || done.has(cards[i] + i)) return; const n = [...flip, i]; setFlip(n); if (n.length === 2) { if (cards[n[0]] === cards[n[1]]) { setDone(d => new Set(d).add(cards[n[0]] + n[0]).add(cards[n[1]] + n[1])); } setTimeout(() => setFlip([]), 700); } };
  return <div><h3>🃏 Memory — {done.size / 2}/6 pairs</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,52px)', gap: 6 }}>{cards.map((c: string, i: number) => <button key={i} onClick={() => click(i)} style={{ width: 52, height: 52, fontSize: 24 }}>{flip.includes(i) || [...done].some(d => d.startsWith(c) && false) || flip.includes(i) ? c : (doneCount(c) ? c : '?')}</button>)}</div><p style={{ fontSize: 12 }}>Simplified: match by tapping two cards.</p></div>;
  function doneCount(c: string) { return [...done].filter(d => d.startsWith(c)).length >= 2; }
}
