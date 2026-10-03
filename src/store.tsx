import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Achievement, ChatMsg, DownloadItem, EmailMsg, FSNode, HistoryEntry, Notif, WinState, Year, DayEvent } from './types';
import { eraFor } from './eras';
import { initialEmails, contactsFor, greetingFor, MYSTERY } from './data';
import { jingle, setMuted } from './audio';

interface Settings { sound: boolean; volume: number; animations: boolean; reducedMotion: boolean; crt: boolean; scanlines: boolean; connectionSpeed: number; modernMode: boolean; screenshot: boolean; }
interface SimTime { h: number; m: number; paused: boolean; speed: number; }

interface Store {
  year: Year; setYear(y: Year): void;
  entered: boolean; enter(y: Year): void; exit(): void;
  wins: WinState[]; openApp(app: string, payload?: any): void; closeWin(id: string): void; focusWin(id: string): void; toggleMin(id: string): void; toggleMax(id: string): void; moveWin(id: string, x: number, y: number): void; resizeWin(id: string, w: number, h: number): void;
  files: FSNode[]; createFolder(name: string, parentId: string | null): void; renameNode(id: string, name: string): void; deleteNode(id: string): void; moveNode(id: string, parentId: string | null): void; addFile(n: Omit<FSNode,'id'|'created'>): void; unlockFile(id: string): void;
  emails: EmailMsg[]; sendEmail(to: string, subject: string, body: string): void; markRead(id: string): void; trashEmail(id: string): void; replyEmail(id: string, body: string): void;
  chats: Record<string, ChatMsg[]>; sendChat(contactId: string, text: string): void;
  history: HistoryEntry[]; visit(url: string, title: string): void;
  bookmarks: string[]; toggleBookmark(url: string): void;
  notifs: Notif[]; notify(text: string, app: string): void; dismissNotif(id: string): void;
  downloads: DownloadItem[]; startDownload(name: string, size: string): void;
  achievements: Achievement[]; unlock(id: string): void;
  mysterySolved: boolean; solveMystery(): void;
  day: DayEvent[] | null; dayDate: string; generateDay(): void; clearDay(): void;
  simTime: SimTime; setSimTime(p: Partial<SimTime>): void;
  online: boolean; setOnline(b: boolean): void; connecting: boolean;
  settings: Settings; setSettings(p: Partial<Settings>): void;
  saveSlot(): void; loadSlot(): void; resetAll(): void; newSession(): void;
  easterFound: string[]; findEaster(id: string): void;
  musicPlaying: boolean; setMusicPlaying(b: boolean): void; musicTrack: number; setMusicTrack(n: number): void;
}

const Ctx = createContext<Store | null>(null);
export const useSim = () => { const v = useContext(Ctx); if (!v) throw new Error('no sim'); return v; };

let zid = 1;
const uid = () => `id-${Date.now().toString(36)}-${(zid++).toString(36)}-${Math.floor(Math.random()*1e6).toString(36)}`;

const DEFAULT_ACHS: Achievement[] = [
  { id: 'first-search', name: 'First Search', desc: 'Perform your first search.', unlocked: false },
  { id: 'old-school', name: 'Old School', desc: 'Visit a 1990s-style page.', unlocked: false },
  { id: 'explorer', name: 'Internet Explorer', desc: 'Visit 10 different simulated sites.', unlocked: false },
  { id: 'deep-dive', name: 'Deep Dive', desc: 'Find a hidden page.', unlocked: false },
  { id: 'archaeologist', name: 'Digital Archaeologist', desc: 'Solve an internet mystery.', unlocked: false },
  { id: 'night-owl', name: 'Night Owl', desc: 'Use the sim after midnight (sim time).', unlocked: false },
  { id: 'day-one', name: 'A Day On The Internet', desc: 'Generate a random day.', unlocked: false },
  { id: 'gamer', name: 'Arcade Kid', desc: 'Play a mini-game.', unlocked: false },
];

function seedFiles(year: Year): FSNode[] {
  const now = `${year}-01-02`;
  const root: FSNode[] = [
    { id: 'd-desktop', name: 'Desktop', type: 'folder', parentId: null, created: now },
    { id: 'd-docs', name: 'Documents', type: 'folder', parentId: null, created: now },
    { id: 'd-dl', name: 'Downloads', type: 'folder', parentId: null, created: now },
    { id: 'd-music', name: 'Music', type: 'folder', parentId: null, created: now },
    { id: 'd-pics', name: 'Pictures', type: 'folder', parentId: null, created: now },
    { id: 'd-vids', name: 'Videos', type: 'folder', parentId: null, created: now },
  ];
  const kids: FSNode[] = [
    { id: 'f-welcome', name: 'welcome.txt', type: 'text', parentId: 'd-docs', content: `Welcome to the fictional ${year} internet!\n\nEverything here is SIMULATED — not history.\n\nTry:\n- Browser -> search.local, video.local, forum.local\n- mystery.local/static (view source!)\n- GENERATE A RANDOM DAY`, created: now },
    { id: 'f-idea', name: 'homepage-ideas.txt', type: 'text', parentId: 'd-docs', content: 'tiled bg + counter + guestbook = perfect page', created: now },
    { id: 'f-secret', name: 'note-from-admin.txt', type: 'text', parentId: 'd-desktop', content: `psst… the static hides something.\n\nOpen browser -> mystery.local/static\nView Source on that page.\nThen find zerosignal in forum.local.\n\n— M (fictional)`, created: now },
    { id: 'f-pic', name: 'wallpaper.bmp (simulated)', type: 'image', parentId: 'd-pics', content: 'IMAGE:gradient-mountains', created: now },
    { id: 'f-song', name: 'chip-jam.mid (generated)', type: 'audio', parentId: 'd-music', content: 'AUDIO:chip-jam', created: now },
    { id: 'f-locked', name: MYSTERY.finalFileName, type: 'mystery', parentId: 'd-dl', content: '🔒 Locked. Needs the harbor password. Hint: explore the mystery chain from note-from-admin.txt.', locked: true, password: MYSTERY.password, created: now },
  ];
  return [...root, ...kids];
}

import { botReply } from './data';

export function SimProvider({ children }: { children: React.ReactNode }) {
  const [year, setYearState] = useState<Year>(2005);
  const [entered, setEntered] = useState(false);
  const [wins, setWins] = useState<WinState[]>([]);
  const [files, setFiles] = useState<FSNode[]>(() => seedFiles(2005));
  const [emails, setEmails] = useState<EmailMsg[]>(() => initialEmails(2005));
  const [chats, setChats] = useState<Record<string, ChatMsg[]>>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>(['search.local', 'video.local']);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHS);
  const [mysterySolved, setMysterySolved] = useState(false);
  const [day, setDay] = useState<DayEvent[] | null>(null);
  const [dayDate, setDayDate] = useState('');
  const [simTime, setSimTimeState] = useState<SimTime>({ h: 19, m: 12, paused: false, speed: 1 });
  const [online, setOnlineState] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [settings, setSettingsState] = useState<Settings>({ sound: true, volume: 0.6, animations: true, reducedMotion: false, crt: true, scanlines: true, connectionSpeed: 1, modernMode: false, screenshot: false });
  const [easterFound, setEasterFound] = useState<string[]>([]);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicTrack, setMusicTrack] = useState(0);
  const zTop = useRef(10);
  const visitedRef = useRef<Set<string>>(new Set());

  const setYear = useCallback((y: Year) => {
    setYearState(y);
    setFiles(seedFiles(y));
    setEmails(initialEmails(y));
    setChats({}); setWins([]); setDay(null);
    setHistory([]); setDownloads([]); setMysterySolved(false);
    setSimTimeState({ h: 19, m: 12, paused: false, speed: 1 });
    setOnlineState(true);
  }, []);

  const enter = useCallback((y: Year) => {
    setYear(y); setEntered(true);
    const era = eraFor(y);
    if (era.dialup) { jingle('dialup'); } else jingle('open');
    setTimeout(() => notify(`Connected — ${era.connectionLabel} (simulated)`, 'browser'), 900);
    setTimeout(() => notify('Welcome! Try GENERATE A RANDOM DAY ✨', 'day'), 2200);
  }, []);

  const exit = useCallback(() => { setEntered(false); setWins([]); }, []);

  function notify(text: string, app: string) {
    const n: Notif = { id: uid(), text, app, time: `${simTime.h}:${String(simTime.m).padStart(2,'0')}` };
    setNotifs(prev => [n, ...prev].slice(0, 8));
    if (settings.sound) jingle('notify');
    setTimeout(() => setNotifs(prev => prev.filter(x => x.id !== n.id)), 7000);
  }

  const openApp = useCallback((app: string, payload?: any) => {
    if (settings.sound) jingle('open');
    setWins(prev => {
      const existing = prev.find(w => w.app === app && !payload);
      zTop.current += 1;
      if (existing) return prev.map(w => w.id === existing.id ? { ...w, minimized: false, z: zTop.current } : w);
      const titles: Record<string, string> = { browser: eraFor(year).browserName, mail: 'PostBox Mail (sim)', chat: eraFor(year).chatName, files: 'File Explorer', music: eraFor(year).musicName, games: 'Arcade (local)', video: 'TubeYou (fictional)', social: 'FriendCircle (fictional)', forum: 'CodeHaven Forum', downloads: 'Downloads', settings: 'Settings', achievements: 'Achievements', mysteries: 'Internet Mysteries', day: 'A Day On The Internet', notepad: 'Notepad', terminal: 'Terminal (sim)', 'video-call': 'PingMeet Call (sim)', ai: 'Aura AI (offline sim)', history: 'History', help: 'About This Sim' };
      const n = prev.length;
      const w: WinState = { id: uid(), app, title: payload?.title ?? titles[app] ?? app, x: 40 + (n % 6) * 36, y: 40 + (n % 6) * 28, w: app === 'browser' ? 860 : 640, h: app === 'browser' ? 560 : 440, z: zTop.current, minimized: false, maximized: false, payload };
      return [...prev, w].slice(-10);
    });
  }, [year, settings.sound]);

  const closeWin = useCallback((id: string) => { if (settings.sound) jingle('close'); setWins(p => p.filter(w => w.id !== id)); }, [settings.sound]);
  const focusWin = useCallback((id: string) => { zTop.current += 1; setWins(p => p.map(w => w.id === id ? { ...w, z: zTop.current } : w)); }, []);
  const toggleMin = useCallback((id: string) => setWins(p => p.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w)), []);
  const toggleMax = useCallback((id: string) => setWins(p => p.map(w => w.id === id ? (w.maximized ? { ...w, maximized: false, ...(w.prev ?? {}) } : { ...w, maximized: true, prev: { x: w.x, y: w.y, w: w.w, h: w.h } }) : w)), []);
  const moveWin = useCallback((id: string, x: number, y: number) => setWins(p => p.map(w => w.id === id ? { ...w, x: Math.max(0, x), y: Math.max(0, y) } : w)), []);
  const resizeWin = useCallback((id: string, w: number, h: number) => setWins(p => p.map(q => q.id === id ? { ...q, w: Math.max(320, w), h: Math.max(220, h) } : q)), []);

  const createFolder = useCallback((name: string, parentId: string | null) => setFiles(p => [...p, { id: uid(), name, type: 'folder', parentId, created: 'today' }]), []);
  const renameNode = useCallback((id: string, name: string) => setFiles(p => p.map(f => f.id === id ? { ...f, name } : f)), []);
  const deleteNode = useCallback((id: string) => setFiles(p => { const kill = new Set([id]); p.forEach(f => { if (f.parentId && kill.has(f.parentId)) kill.add(f.id); }); return p.filter(f => !kill.has(f.id)); }), []);
  const moveNode = useCallback((id: string, parentId: string | null) => setFiles(p => p.map(f => f.id === id ? { ...f, parentId } : f)), []);
  const addFile = useCallback((n: Omit<FSNode,'id'|'created'>) => setFiles(p => [...p, { ...n, id: uid(), created: 'today' }]), []);
  const unlockFile = useCallback((id: string) => setFiles(p => p.map(f => f.id === id ? { ...f, locked: false, content: MYSTERY.finalText } : f)), []);

  const sendEmail = useCallback((to: string, subject: string, body: string) => {
    setEmails(p => [{ id: uid(), from: 'you@local', to, subject, body, time: 'now', folder: 'sent', read: true }, ...p]);
    notify('Email sent (simulated).', 'mail');
  }, []);
  const markRead = useCallback((id: string) => setEmails(p => p.map(e => e.id === id ? { ...e, read: true } : e)), []);
  const trashEmail = useCallback((id: string) => setEmails(p => p.map(e => e.id === id ? { ...e, folder: 'trash' } : e)), []);
  const replyEmail = useCallback((id: string, body: string) => {
    setEmails(p => { const orig = p.find(e => e.id === id); if (!orig) return p; return [{ id: uid(), from: 'you@local', to: orig.from, subject: 'Re: ' + orig.subject, body, time: 'now', folder: 'sent', read: true }, ...p]; });
    notify('Reply sent.', 'mail');
  }, []);

  const sendChat = useCallback((contactId: string, text: string) => {
    const t = `${simTime.h}:${String(simTime.m).padStart(2,'0')}`;
    setChats(p => ({ ...p, [contactId]: [...(p[contactId] ?? []), { from: 'you', text, time: t, me: true }] }));
    setTimeout(() => {
      setChats(p => ({ ...p, [contactId]: [...(p[contactId] ?? []), { from: contactId, text: botReply(year, text), time: t, me: false }] }));
      notify('New chat message (simulated).', 'chat');
    }, 900 + Math.random() * 900);
  }, [year, simTime.h, simTime.m]);

  const visit = useCallback((url: string, title: string) => {
    const t = `${simTime.h}:${String(simTime.m).padStart(2,'0')}`;
    setHistory(p => [{ url, title, time: t }, ...p].slice(0, 100));
    visitedRef.current.add(url);
    if (url.includes('pages.local') || url.includes('bbs.local')) unlock('old-school');
    if (url.includes('mystery.local/harbor')) unlock('deep-dive');
    if (visitedRef.current.size >= 10) unlock('explorer');
  }, []);

  const toggleBookmark = useCallback((url: string) => {
    setBookmarks(p => p.includes(url) ? p.filter(b => b !== url) : [...p, url]);
  }, []);

  const dismissNotif = useCallback((id: string) => setNotifs(p => p.filter(n => n.id !== id)), []);

  const startDownload = useCallback((name: string, size: string) => {
    const id = uid();
    const speed = year <= 2000 ? '4 KB/s (sim)' : year <= 2010 ? '250 KB/s (sim)' : '12 MB/s (sim)';
    setDownloads(p => [...p, { id, name, size, progress: 0, speed, done: false }]);
    notify(`Download started: ${name} (simulated)`, 'downloads');
    const step = () => {
      setDownloads(p => p.map(d => {
        if (d.id !== id || d.done) return d;
        const inc = year <= 2000 ? 4 + Math.random()*6 : year <= 2010 ? 12 + Math.random()*14 : 25 + Math.random()*20;
        const np = Math.min(100, d.progress + inc);
        if (np >= 100) { setTimeout(() => notify(`Download complete: ${name}`, 'downloads'), 100); if (settings.sound) setTimeout(()=>jingle('success'),200); return { ...d, progress: 100, done: true }; }
        return { ...d, progress: np };
      }));
    };
    const iv = setInterval(() => {
      let done = false;
      setDownloads(p => { const d = p.find(x => x.id === id); if (d?.done) done = true; return p; });
      if (done) { clearInterval(iv); return; }
      step();
    }, 600 / settings.connectionSpeed);
  }, [year, settings.connectionSpeed, settings.sound]);

  const unlock = useCallback((id: string) => {
    setAchievements(p => p.map(a => a.id === id && !a.unlocked ? { ...a, unlocked: true, time: 'now' } : a));
  }, []);

  const solveMystery = useCallback(() => {
    setMysterySolved(true); unlock('archaeologist'); unlock('deep-dive');
    const f = files.find(f => f.name === MYSTERY.finalFileName);
    if (f?.locked) unlockFile(f.id);
    notify('Mystery solved! Check Achievements 🏆', 'mysteries');
    jingle('success');
  }, [files, unlockFile, unlock]);

  const generateDay = useCallback(() => {
    const names = contactsFor(year).map(c => c.name);
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const evts: DayEvent[] = [
      { id: uid(), kind: 'message', title: `${pick(names)} sent a message`, detail: pick(['“check video.local/funny!!”', '“yo u online tonight?”', '“new forum reply, come look”', '“rate my new page!!”']), time: '7:02 PM', app: 'chat', payload: {} },
      { id: uid(), kind: 'email', title: 'New email arrived', detail: pick(['Subject: your weekly digest (sim)', 'Subject: photos from the (fictional) picnic', 'Subject: forum notification (sim)']), time: '7:20 PM', app: 'mail', payload: {} },
      { id: uid(), kind: 'forum', title: 'New forum reply', detail: 'Someone replied in “Best wallpaper?” — forum.local', time: '7:45 PM', app: 'forum', payload: {} },
      { id: uid(), kind: 'video', title: 'Recommended videos', detail: '3 fictional videos trending on video.local', time: '8:05 PM', app: 'browser', payload: { url: 'video.local' } },
      { id: uid(), kind: 'download', title: 'Download finished', detail: 'chip-jam.mid (generated) — 100%', time: '8:15 PM', app: 'downloads', payload: { name: 'chip-jam.mid (generated)', size: '88 KB' } },
      { id: uid(), kind: 'mystery', title: 'Mysterious file appeared', detail: 'note-from-admin.txt is glowing on your Desktop…', time: '8:31 PM', app: 'files', payload: {} },
    ];
    if (Math.random() > 0.4) evts.push({ id: uid(), kind: 'popup', title: 'Strange popup', detail: '“You are visitor #001337! (fictional joke)”', time: '8:40 PM', app: 'browser', payload: {} });
    const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
    setDayDate(`${pick(months)} ${1+Math.floor(Math.random()*28)}, ${year} — 7:42 PM (simulated scenario)`);
    setDay(evts);
    unlock('day-one');
    // materialize: add an email + notifs
    setEmails(p => [{ id: uid(), from: 'pixelfriend@postbox.local', to: 'you@local', subject: 'did you see?? (sim day event)', body: 'open your apps — today is BUSY. start with chat + video.local/funny', time: '7:02 PM', folder: 'inbox', read: false }, ...p]);
    evts.forEach((e, i) => setTimeout(() => notify(e.title, e.app), 800 + i * 1600));
  }, [year, unlock]);
  const clearDay = useCallback(() => setDay(null), []);

  const setSimTime = useCallback((p: Partial<SimTime>) => setSimTimeState(s => ({ ...s, ...p })), []);
  const setOnline = useCallback((b: boolean) => {
    if (!b) { setOnlineState(false); notify('Disconnected (simulated). Sites will show offline errors.', 'browser'); return; }
    const era = eraFor(year);
    if (era.dialup) {
      setConnecting(true); jingle('dialup');
      setTimeout(() => { setConnecting(false); setOnlineState(true); notify('Connected at 56k! (simulated screech fades)', 'browser'); }, 2600);
    } else { setOnlineState(true); notify('Reconnected (simulated).', 'browser'); }
  }, [year]);
  const setSettings = useCallback((p: Partial<Settings>) => {
    setSettingsState(s => { const n = { ...s, ...p }; setMuted(!n.sound); return n; });
  }, []);
  const findEaster = useCallback((id: string) => {
    setEasterFound(p => p.includes(id) ? p : [...p, id]);
    notify(`Easter egg found: ${id} 🥚`, 'mysteries');
    jingle('success');
  }, []);

  // sim clock
  useEffect(() => {
    if (simTime.paused) return;
    const iv = setInterval(() => {
      setSimTimeState(s => {
        let m = s.m + 1 * s.speed;
        let h = s.h;
        while (m >= 60) { m -= 60; h = (h + 1) % 24; }
        if (h === 0 && m < 2) unlockRef.current('night-owl');
        return { ...s, h, m };
      });
    }, 5000);
    return () => clearInterval(iv);
  }, [simTime.paused, simTime.speed]);
  const unlockRef = useRef(unlock); unlockRef.current = unlock;

  // seed greeting chat once per year
  useEffect(() => {
    const cs = contactsFor(year);
    setChats(p => {
      if (Object.keys(p).length) return p;
      const first = cs[0];
      return { [first.id]: [{ from: first.id, text: greetingFor(year, 'traveler') + ' (All messages here are fictional.)', time: '7:00 PM', me: false }] };
    });
  }, [year]);

  // persistence
  const saveSlot = useCallback(() => {
    const data = { year, files, emails, history, bookmarks, achievements, mysterySolved, day, dayDate, simTime, easterFound };
    localStorage.setItem('itm-save', JSON.stringify(data));
    notify('Session saved locally.', 'settings');
  }, [year, files, emails, history, bookmarks, achievements, mysterySolved, day, dayDate, simTime, easterFound]);
  const loadSlot = useCallback(() => {
    const raw = localStorage.getItem('itm-save');
    if (!raw) { notify('No saved session yet.', 'settings'); return; }
    try {
      const d = JSON.parse(raw);
      setYearState(d.year); setFiles(d.files); setEmails(d.emails); setHistory(d.history); setBookmarks(d.bookmarks);
      setAchievements(d.achievements); setMysterySolved(d.mysterySolved); setDay(d.day); setDayDate(d.dayDate);
      setSimTimeState(d.simTime); setEasterFound(d.easterFound ?? []); setEntered(true);
      notify('Session loaded.', 'settings');
    } catch { notify('Save was corrupted.', 'settings'); }
  }, []);
  const resetAll = useCallback(() => {
    localStorage.removeItem('itm-save');
    setYearState(2005); setFiles(seedFiles(2005)); setEmails(initialEmails(2005)); setChats({}); setWins([]);
    setHistory([]); setBookmarks(['search.local','video.local']); setAchievements(DEFAULT_ACHS); setMysterySolved(false);
    setDay(null); setDownloads([]); setNotifs([]); setEasterFound([]); setEntered(false);
  }, []);
  const newSession = useCallback(() => { setWins([]); setDay(null); setEntered(false); }, []);

  const value: Store = useMemo(() => ({
    year, setYear, entered, enter, exit, wins, openApp, closeWin, focusWin, toggleMin, toggleMax, moveWin, resizeWin,
    files, createFolder, renameNode, deleteNode, moveNode, addFile, unlockFile,
    emails, sendEmail, markRead, trashEmail, replyEmail, chats, sendChat,
    history, visit, bookmarks, toggleBookmark, notifs, notify, dismissNotif,
    downloads, startDownload, achievements, unlock, mysterySolved, solveMystery,
    day, dayDate, generateDay, clearDay, simTime, setSimTime, online, setOnline, connecting,
    settings, setSettings, saveSlot, loadSlot, resetAll, newSession, easterFound, findEaster,
    musicPlaying, setMusicPlaying, musicTrack, setMusicTrack,
  }), [year, entered, wins, files, emails, chats, history, bookmarks, notifs, downloads, achievements, mysterySolved, day, dayDate, simTime, online, connecting, settings, easterFound, musicPlaying, musicTrack, setYear, enter, exit, openApp, closeWin, focusWin, toggleMin, toggleMax, moveWin, resizeWin, createFolder, renameNode, deleteNode, moveNode, addFile, unlockFile, sendEmail, markRead, trashEmail, replyEmail, sendChat, visit, toggleBookmark, dismissNotif, startDownload, unlock, solveMystery, generateDay, clearDay, setSimTime, setOnline, setSettings, saveSlot, loadSlot, resetAll, newSession, findEaster]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
