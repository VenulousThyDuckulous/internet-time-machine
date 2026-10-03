import { useState } from 'react';
import { useSim } from '../store';
import { MYSTERY } from '../data';

export function DayApp() {
  const sim = useSim();
  if (!sim.day) return <div className="app"><h2>📅 A Day On The Internet</h2><p>Generate a fictional scenario for <b>{sim.year}</b>. Procedural events you can click to explore.</p><div className="row"><button className="btn primary" onClick={sim.generateDay}>✨ GENERATE A RANDOM DAY</button></div><p style={{ fontSize: 12, color: '#64748b' }}>Example: “OCTOBER 3, {sim.year} — 7:42 PM. You turn on your computer. You have 3 unread messages…” All fictional.</p></div>;
  return (
    <div className="app"><h2>📅 {sim.dayDate}</h2><p>You turn on your computer. You have:</p>
      <div className="list">{sim.day.map(e => <button key={e.id} className="list-item kbd-focus" style={{ width: '100%', textAlign: 'left' }} onClick={() => {
        if (e.app === 'browser' && e.payload?.url) sim.openApp('browser', { url: e.payload.url, title: 'Browser — day link' });
        else if (e.payload?.name) sim.startDownload(e.payload.name, e.payload.size);
        else sim.openApp(e.app === 'day' ? 'browser' : e.app);
      }}><b>{e.time} — {e.title}</b><br /><small>{e.detail} → open {e.app} →</small></button>)}</div>
      <div className="row" style={{ marginTop: 8 }}><button className="btn" onClick={sim.generateDay}>🎲 Regenerate</button><button className="btn ghost" onClick={sim.clearDay}>Clear</button></div>
    </div>
  );
}

export function MysteriesApp({ forum }: { forum?: boolean }) {
  const sim = useSim();
  if (forum) return <ForumWrap />;
  const [pw, setPw] = useState('');
  return (
    <div className="app"><h2>🔍 Internet Mysteries <small>(100% fictional puzzles)</small></h2>
      <p style={{ fontSize: 13 }}>A lighthouse blinks somewhere in the static. Chain: <b>mystery.local/static → View Source → forum.local (zerosignal) → mystery.local/harbor → locked file</b>.</p>
      <div className="list">
        <button className="list-item kbd-focus" style={{ width: '100%', textAlign: 'left' }} onClick={() => sim.openApp('browser', { url: 'mystery.local/static', title: 'Browser — static' })}>📺 1. The blinking page — mystery.local/static {sim.easterFound.includes('ctrl-k-wizard') ? '✅ visited' : ''}</button>
        <button className="list-item kbd-focus" style={{ width: '100%', textAlign: 'left' }} onClick={() => sim.openApp('browser', { url: 'forum.local', title: 'Browser — forum' })}>💭 2. Hidden thread hint — forum.local (find zerosignal)</button>
        <button className="list-item kbd-focus" style={{ width: '100%', textAlign: 'left' }} onClick={() => sim.openApp('browser', { url: 'mystery.local/harbor', title: 'Browser — harbor' })}>🏝️ 3. The harbor — mystery.local/harbor</button>
      </div>
      <div className="row" style={{ marginTop: 8 }}><input value={pw} onChange={e => setPw(e.target.value)} placeholder="harbor password" aria-label="Harbor password" /><button className="btn primary small" onClick={() => { if (pw.trim().toLowerCase() === MYSTERY.password) sim.solveMystery(); else sim.notify('Nope — re-read the forum clue (sim).', 'mysteries'); }}>Unlock file</button></div>
      <p>Status: {sim.mysterySolved ? '✅ Solved — Digital Archaeologist!' : '❌ Unsolved'} · Easter eggs found: {sim.easterFound.length} ({sim.easterFound.join(', ') || 'none yet — try Ctrl+K, the 404 cow, the lone pixel, guestbook'})</p>
    </div>
  );
}
function ForumWrap() {
  const sim = useSim();
  return <div className="app"><h2>💭 CodeHaven Forum</h2><p>Full forum lives in the browser (better layout there).</p><button className="btn primary" onClick={() => sim.openApp('browser', { url: 'forum.local', title: 'Browser — forum' })}>Open forum.local</button></div>;
}

export function DownloadsApp() {
  const sim = useSim();
  return (
    <div className="app"><h2>⬇️ Downloads <small>(all simulated, harmless)</small></h2>
      <div className="row"><button className="btn small" onClick={() => sim.startDownload('glitter-pack.zip (simulated)', '1.2 MB')}>⬇ glitter-pack.zip</button><button className="btn small" onClick={() => sim.startDownload('chip-jam.mid (generated)', '88 KB')}>⬇ chip-jam.mid</button></div>
      <div className="list" style={{ marginTop: 8 }}>{sim.downloads.map(d => <div key={d.id} className="list-item"><b>{d.name}</b> · {d.size} · {d.speed}<br /><div style={{ height: 8, background: '#e2e8f0', borderRadius: 4 }}><div style={{ width: d.progress + '%', height: 8, background: d.done ? '#22c55e' : '#2563eb', borderRadius: 4 }} /></div><small>{d.done ? '✅ complete (sim)' : Math.floor(d.progress) + '% (sim)'}</small></div>)}{sim.downloads.length === 0 && <div className="list-item">No downloads yet — grab one from video.local or pages.local.</div>}</div>
    </div>
  );
}

export function SettingsPanel() {
  const sim = useSim();
  const s = sim.settings;
  return (
    <div className="app"><h2>⚙️ Settings</h2>
      <div className="grid2">
        <label><input type="checkbox" checked={s.sound} onChange={e => sim.setSettings({ sound: e.target.checked })} /> Sound</label>
        <label>🔊 Volume <input type="range" min={0} max={1} step={0.1} value={s.volume} onChange={e => sim.setSettings({ volume: Number(e.target.value) })} /></label>
        <label><input type="checkbox" checked={s.animations} onChange={e => sim.setSettings({ animations: e.target.checked })} /> Animations</label>
        <label><input type="checkbox" checked={s.reducedMotion} onChange={e => sim.setSettings({ reducedMotion: e.target.checked })} /> Reduced motion (also disables blink)</label>
        <label><input type="checkbox" checked={s.modernMode} onChange={e => sim.setSettings({ modernMode: e.target.checked })} /> Modern accessibility mode (no blink/tile)</label>
        <label><input type="checkbox" checked={s.crt} onChange={e => sim.setSettings({ crt: e.target.checked })} /> CRT scanlines</label>
        <label><input type="checkbox" checked={s.scanlines} onChange={e => sim.setSettings({ scanlines: e.target.checked })} /> Screen glow</label>
        <label>Sim speed <input type="range" min={0.5} max={3} step={0.5} value={s.connectionSpeed} onChange={e => sim.setSettings({ connectionSpeed: Number(e.target.value) })} /> {s.connectionSpeed}×</label>
      </div>
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn small" onClick={() => sim.setSettings({ screenshot: !s.screenshot })}>📸 Screenshot mode: {s.screenshot ? 'ON (click again to exit)' : 'OFF'}</button>
        <button className="btn small" onClick={sim.saveSlot}>💾 Save session</button>
        <button className="btn small" onClick={sim.loadSlot}>📂 Load session</button>
        <button className="btn small" onClick={sim.newSession}>🆕 New session</button>
        <button className="btn small" onClick={() => { if (confirm('Reset everything? (sim data only)')) sim.resetAll(); }}>♻ Reset</button>
      </div>
      <p style={{ fontSize: 12, color: '#64748b' }}>Saves: year, filesystem, mail, history, bookmarks, achievements, mystery, day, time. Stored in localStorage key <b>itm-save</b>.</p>
    </div>
  );
}

export function AchievementsApp() {
  const sim = useSim();
  return <div className="app"><h2>🏆 Achievements</h2><div className="list">{sim.achievements.map(a => <div key={a.id} className="list-item">{a.unlocked ? '✅' : '🔒'} <b>{a.name}</b><br /><small>{a.desc}</small></div>)}</div></div>;
}

export function TerminalApp() {
  const sim = useSim();
  const [lines, setLines] = useState(['Fictional DOS-ish shell. Try: help, years, secret, dialup']);
  const [v, setV] = useState('');
  const run = () => {
    const c = v.trim().toLowerCase(); const out = [...lines, '> ' + v];
    if (c === 'help') out.push('commands: help, years, secret, dialup, clear');
    else if (c === 'years') out.push('1995 2000 2005 2010 2015 2020 2025 — change via exit → landing');
    else if (c === 'secret' || c === 'xyzzy') { out.push('a whisper: SUNSET… (check Mysteries app)'); sim.findEaster('terminal-secret'); }
    else if (c === 'dialup') out.push('SCREECHHHH (simulated). you are connected. probably.');
    else if (c === 'clear') { setLines([]); setV(''); return; }
    else out.push(`unknown: ${v} (fictional shell)`);
    setLines(out.slice(-20)); setV('');
  };
  return <div className="app" style={{ background: '#000', color: '#0f0', fontFamily: 'monospace', height: '100%' }}>{lines.map((l, i) => <div key={i}>{l}</div>)}<div className="row"><span>&gt;</span><input value={v} onChange={e => setV(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') run(); }} style={{ flex: 1, background: '#000', color: '#0f0', border: '1px solid #0f0' }} aria-label="Terminal input" /></div></div>;
}

export function VideoCallApp() {
  const [on, setOn] = useState(false);
  const [muted, setMuted] = useState(false);
  return <div className="app"><h2>📹 PingMeet (simulated call)</h2><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}><div style={{ background: '#0f172a', color: '#fff', borderRadius: 10, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>{on ? '🧑‍💻' : '📷 off'}</div><div style={{ background: '#1e293b', color: '#fff', borderRadius: 10, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🤖<small>(bot, fictional)</small></div></div><div className="row" style={{ marginTop: 8 }}><button className="btn primary small" onClick={() => setOn(o => !o)}>{on ? 'Leave' : 'Join (sim)'}</button><button className="btn small" onClick={() => setMuted(m => !m)}>{muted ? '🔇 muted' : '🎤 unmuted (sim)'}</button></div><p style={{ fontSize: 12 }}>No real camera/mic used. Pure theater.</p></div>;
}

export function AIApp() {
  const sim = useSim();
  return <div className="app"><h2>✨ Aura AI (offline sim)</h2><p>Runs locally, makes things up for play.</p><button className="btn primary" onClick={() => sim.openApp('browser', { url: 'ai.local', title: 'Browser — AI' })}>Open ai.local</button></div>;
}

export function HelpApp() {
  return <div className="app"><h2>About this sim</h2><p>Everything is <b>fictional and simulated</b> for education/creativity — not historical record. No external sites, no iframes, no copyrighted music, no backend.</p><p>Try: search “secret”, 404 page cow 🐮, lone pixel bottom-left, Ctrl+K, terminal “secret”.</p></div>;
}
