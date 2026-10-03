import { useState } from 'react';
import { useSim } from '../store';
import { YEARS, eraFor } from '../eras';

export default function Landing({ onEnter }: { onEnter: () => void }) {
  const { enter, generateDay } = useSim();
  const [sel, setSel] = useState<number>(2005);
  const era = eraFor(sel);
  const randomYear = () => {
    const y = YEARS[Math.floor(Math.random() * YEARS.length)];
    setSel(y as number);
  };
  return (
    <div className="landing">
      <div className="landing-inner">
        <span className="badge">A PLAYABLE MUSEUM · 100% FICTIONAL & OFFLINE</span>
        <h1 className="hero-title">INTERNET <span>TIME MACHINE</span></h1>
        <p className="hero-sub">“Experience the web before everything looked the same.”</p>
        <p style={{ color: '#cbd5e1' }}>Pick a year, sit down at a simulated computer from that era, and actually use it — browser, mail, chat, files, games, mysteries. Currently previewing <b>{sel} — {era.label}</b>: {era.tagline}</p>
        <div className="timeline" role="radiogroup" aria-label="Choose year">
          {YEARS.map((y: number, i: number) => (
            <span key={y} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <button className={`tnode kbd-focus ${sel === y ? 'selected' : ''}`} role="radio" aria-checked={sel === y} onClick={() => setSel(y as number)}>
                <b>{y}</b><small>{eraFor(y as number).label}</small>
              </button>
              {i < YEARS.length - 1 && <span className="tlink" />}
            </span>
          ))}
        </div>
        <div className="row">
          <button className="btn primary kbd-focus" onClick={() => { enter(sel as any); onEnter(); }}>ENTER THE INTERNET →</button>
          <button className="btn kbd-focus" onClick={randomYear}>🎲 Random Year</button>
          <button className="btn kbd-focus" onClick={() => { enter(sel as any); generateDay(); onEnter(); }}>📅 Random Day</button>
        </div>
        <div className="cards">
          <div className="card"><h3>🖥️ About</h3><p>A creative simulation of “what using the internet <i>might have felt like</i>.” Every site, message and video is fictional and runs locally. No real history, no external pages.</p></div>
          <div className="card"><h3>⚙️ How it works</h3><p>Each year loads an <b>EraConfig</b> (OS skin, browser, apps, search index, chat style). The browser routes <i>*.local</i> addresses to built-in fictional sites. Saves live in localStorage.</p></div>
          <div className="card"><h3>🧭 What to try</h3><p>Search “funny videos” in 2005 vs 2025 · open mystery.local/static → view source · double-click Desktop/note-from-admin.txt · press <b>Ctrl+K</b> for secrets.</p></div>
          <div className="card"><h3>♿ Access</h3><p>Keyboard navigable, focus visible, reduced-motion + no-blink options in Settings, volume control, screenshot mode for clean captures.</p></div>
        </div>
        <div className="disclaimer">SIMULATED · All messages, websites, news and events are generated fiction for education/creativity — not genuine historical records.</div>
      </div>
    </div>
  );
}
