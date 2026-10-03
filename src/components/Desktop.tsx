import React, { useEffect } from 'react';
import { useSim } from '../store';
import { eraFor } from '../eras';
import Browser from './Browser';
import { FileExplorer, ChatApp, MailApp, MusicPlayer, GamesApp, NotepadApp } from './MoreApps';
import { DayApp, MysteriesApp, DownloadsApp, SettingsPanel, AchievementsApp, TerminalApp, VideoCallApp, AIApp, HelpApp } from './MoreApps2';
import { VideoSite } from './Browser';

const ICONS: Record<string, { em: string; label: string }> = {
  browser: { em: '🌐', label: 'Browser' },
  mail: { em: '📬', label: 'Mail' },
  chat: { em: '💬', label: 'Chat' },
  files: { em: '📁', label: 'Files' },
  music: { em: '🎵', label: 'Music' },
  games: { em: '🎮', label: 'Games' },
  video: { em: '📺', label: 'Videos' },
  social: { em: '👥', label: 'Friends' },
  forum: { em: '💭', label: 'Forum' },
  downloads: { em: '⬇️', label: 'Downloads' },
  mysteries: { em: '🔍', label: 'Mysteries' },
  day: { em: '📅', label: 'Random Day' },
  settings: { em: '⚙️', label: 'Settings' },
  achievements: { em: '🏆', label: 'Awards' },
  notepad: { em: '📝', label: 'Notepad' },
  terminal: { em: '⌨️', label: 'Terminal' },
  'video-call': { em: '📹', label: 'Call' },
  ai: { em: '✨', label: 'AI' },
};

function chromeStyle(eraYear: number) {
  const e = eraFor(eraYear);
  switch (e.windowChrome) {
    case 'gray-bevel': return { bar: { background: 'linear-gradient(90deg,#000080,#1084d0)', color: '#fff' }, body: {} };
    case 'blue-luna': return { bar: { background: 'linear-gradient(180deg,#3b8ef0,#1663c7)', color: '#fff' }, body: {} };
    case 'gloss-black': return { bar: { background: 'linear-gradient(180deg,#444,#111)', color: '#fff' }, body: {} };
    case 'aero-glass': return { bar: { background: 'linear-gradient(180deg,#bfe3ffcc,#2e9bd6)', color: '#06283d' }, body: {} };
    case 'flat-white': return { bar: { background: '#f1f5f9', color: '#0f172a' }, body: {} };
    case 'dark-modern': return { bar: { background: '#1e1e2e', color: '#fff' }, body: {} };
    case 'rounded-ai': return { bar: { background: 'linear-gradient(90deg,#6d28d9,#a855f7)', color: '#fff' }, body: {} };
    default: return { bar: { background: '#2456c8', color: '#fff' }, body: {} };
  }
}

export default function Desktop() {
  const sim = useSim();
  const { wins, year, simTime, online, connecting, settings } = sim;
  const era = eraFor(year);

  // keyboard: Ctrl+K easter egg, Escape closes top
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); sim.findEaster('ctrl-k-wizard'); sim.openApp('mysteries'); }
      if (e.key === 'Escape' && wins.length) { const top = [...wins].sort((a, b) => b.z - a.z)[0]; if (top) sim.closeWin(top.id); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [wins, sim]);

  const taskbarBg = () => {
    switch (era.taskbar) {
      case 'bottom-gray': return '#c0c0c0';
      case 'classic-blue': return '#2456c8';
      case 'gloss': return 'linear-gradient(180deg,#3a9b4f,#0e5c2f)';
      case 'aero-dark': return '#101820ee';
      case 'flat-dark': return '#20232a';
      case 'modern-light': return '#f1f5f9';
      case 'floating': return '#1a1530ee';
      default: return '#333';
    }
  };

  const apps = ['browser', 'mail', 'chat', 'files', 'music', 'games', 'video', 'social', 'forum', 'downloads', 'mysteries', 'day', 'settings', 'achievements'];
  const extra = [...era.defaultApps.filter(a => !apps.includes(a)), 'notepad', 'terminal'];
  if (year >= 2020) extra.push('video-call');
  if (year >= 2025) extra.push('ai');

  const renderApp = (app: string, payload: any) => {
    switch (app) {
      case 'browser': return <Browser initialUrl={payload?.url} />;
      case 'files': return <FileExplorer />;
      case 'chat': return <ChatApp />;
      case 'mail': return <MailApp />;
      case 'music': return <MusicPlayer />;
      case 'games': return <GamesApp />;
      case 'video': return <VideoSite />;
      case 'social': return <ChatApp social />;
      case 'forum': return <MysteriesApp forum />;
      case 'downloads': return <DownloadsApp />;
      case 'mysteries': return <MysteriesApp />;
      case 'day': return <DayApp />;
      case 'settings': return <SettingsPanel />;
      case 'achievements': return <AchievementsApp />;
      case 'notepad': return <NotepadApp payload={payload} />;
      case 'terminal': return <TerminalApp />;
      case 'video-call': return <VideoCallApp />;
      case 'ai': return <AIApp />;
      case 'history': return <HistoryView />;
      case 'help': return <HelpApp />;
      default: return <div className="app"><h2>{app}</h2><p>Simulated app (fictional).</p></div>;
    }
  };

  const timeStr = `${String(simTime.h).padStart(2, '0')}:${String(simTime.m).padStart(2, '0')}`;
  const cls = `desktop ${settings.crt ? 'effects-crt' : ''} ${settings.scanlines ? 'effects-glow' : ''} ${settings.reducedMotion || !settings.animations ? 'no-anim' : ''}`;

  return (
    <div className={cls} style={{ background: settings.screenshot ? era.wallpaper : `${era.wallpaper}`, fontFamily: era.font }} onClick={() => { if ((window as any).__pix === undefined) (window as any).__pix = 0; }}>
      {/* wallpaper emoji art */}
      <div style={{ position: 'absolute', right: 24, bottom: 70, fontSize: 120, opacity: 0.35, pointerEvents: 'none' }}>{era.wallpaperEmoji}</div>
      <div style={{ position: 'absolute', top: 12, right: 14, zIndex: 5 }}>
        <div style={{ background: '#0008', color: '#fff', fontSize: 11, padding: '6px 10px', borderRadius: 8 }}>SIMULATED · {era.osName} · {year}</div>
      </div>

      <div className="dicons">
        {[...era.defaultApps.slice(0, 6), 'mysteries', 'day'].map(a => (
          <button key={a} className="dicon kbd-focus" onDoubleClick={() => sim.openApp(a)} onClick={e => { if (e.detail === 2) return; }} onKeyDown={e => { if (e.key === 'Enter') sim.openApp(a); }} aria-label={`Open ${a}`}>
            <span className="em">{ICONS[a]?.em ?? '📦'}</span>{ICONS[a]?.label ?? a}
          </button>
        ))}
        <button className="dicon kbd-focus" onClick={() => sim.openApp('files')} aria-label="My Computer"><span className="em">💻</span>My Computer</button>
      </div>

      {wins.map(w => {
        const ch = chromeStyle(year);
        const style: React.CSSProperties = w.maximized
          ? { left: 0, top: 0, right: 0, bottom: 48, zIndex: w.z }
          : { left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z };
        return (
          <div key={w.id} className={`win ${w.minimized ? 'min' : ''} ${w.maximized ? 'max' : ''}`} style={style} onMouseDown={() => sim.focusWin(w.id)}>
            <div className="titlebar" style={ch.bar as React.CSSProperties}
              onMouseDown={e => {
                if (w.maximized) return;
                const sx = e.clientX - w.x, sy = e.clientY - w.y;
                const mv = (ev: MouseEvent) => sim.moveWin(w.id, ev.clientX - sx, ev.clientY - sy);
                const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
                window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
              }}>
              <span>{ICONS[w.app]?.em ?? '🪟'} {w.title}</span><span className="sp" />
              <button className="wbtn" onClick={() => sim.toggleMin(w.id)} aria-label="Minimize">_</button>
              <button className="wbtn" onClick={() => sim.toggleMax(w.id)} aria-label="Maximize">▢</button>
              <button className="wbtn" onClick={() => sim.closeWin(w.id)} aria-label="Close" style={{ background: '#e81123', color: '#fff' }}>✕</button>
            </div>
            <div className="win-body">{renderApp(w.app, w.payload)}</div>
            {!w.maximized && <div className="resize-handle" onMouseDown={e => {
              e.stopPropagation(); const sw = w.w, sh = w.h, sx = e.clientX, sy = e.clientY;
              const mv = (ev: MouseEvent) => sim.resizeWin(w.id, sw + (ev.clientX - sx), sh + (ev.clientY - sy));
              const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
              window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
            }}>◢</div>}
          </div>
        );
      })}

      <div className="notif-stack">
        {sim.notifs.map(n => (
          <button key={n.id} className="notif kbd-focus" style={{ textAlign: 'left' }} onClick={() => { sim.openApp(n.app === 'day' ? 'day' : n.app); sim.dismissNotif(n.id); }}>
            <b>{n.app}</b> · {n.time}<br />{n.text}<br /><small>click to open →</small>
          </button>
        ))}
      </div>

      {!settings.screenshot && (
        <div className={`taskbar ${era.taskbar === 'floating' ? 'floating' : ''}`} style={{ background: taskbarBg() }}>
          <button className="start-btn kbd-focus" style={{ background: era.taskbar === 'bottom-gray' ? '#c0c0c0' : era.accent, color: '#fff' }} onClick={() => sim.openApp('browser')}>★ start</button>
          <div className="task-wins">
            {wins.map(w => (
              <button key={w.id} className="task-win kbd-focus" onClick={() => sim.toggleMin(w.id)}>{w.minimized ? '▸ ' : ''}{w.title.slice(0, 22)}</button>
            ))}
          </div>
          <div className="row">
            <button className="btn small" title="Internet status (click to toggle)" onClick={() => sim.setOnline(!online)}>{connecting ? '📞 connecting…' : online ? `🌐 ${era.connectionLabel}` : '❌ offline (sim)'}</button>
            <button className="btn small" onClick={() => sim.setSimTime({ paused: !simTime.paused })}>{simTime.paused ? '▶' : '⏸'}</button>
            <button className="btn small" onClick={() => sim.setSimTime({ speed: simTime.speed >= 5 ? 1 : simTime.speed * 2 })}>×{simTime.speed}</button>
            <button className="btn small" onClick={() => sim.exit()}>⏻ exit</button>
          </div>
          <div className="clock"><div>{timeStr} (sim)</div><div>{year} · {era.osName.slice(0, 18)}</div></div>
        </div>
      )}
      {/* hidden clickable pixel easter egg */}
      <div onClick={() => sim.findEaster('lone-pixel')} title="." style={{ position: 'absolute', left: 2, bottom: settings.screenshot ? 4 : 52, width: 6, height: 6, background: '#ffffff88', zIndex: 950, cursor: 'crosshair' }} />
    </div>
  );
}

function HistoryView() {
  const { history } = useSim();
  return <div className="app"><h2>📜 History (this session, simulated)</h2>{history.length === 0 ? <p>No pages yet — browse *.local sites.</p> : <div className="list">{history.map((h, i) => <div key={i} className="list-item"><b>{h.title}</b><br /><small>{h.url} · {h.time}</small></div>)}</div>}</div>;
}
