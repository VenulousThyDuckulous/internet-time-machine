// Fictional local content. Nothing here is a historical record.
import type { Year, SiteResult, VideoItem, SocialPost, EmailMsg, ChatContact, ForumThread } from './types';

export const DISCLAIMER = 'SIMULATED · fictional content for education/creativity — not a historical record.';

export const SEARCH_INDEX: SiteResult[] = [
  { title: 'Pixel Pets — adopt a blinking cat', url: 'pets.local', desc: 'Adopt a 12KB pixel cat. Feed it clicks. Fictional demo.', date: '1996-03-02', yearMin: 1995, yearMax: 2005 },
  { title: 'Funny Clips — TubeYou (fictional)', url: 'video.local', desc: 'Skateboarding hamsters and buffering classics. Simulated videos.', date: '2006-05-11', yearMin: 2005, yearMax: 2025 },
  { title: 'Funny videos — Buffer Theater', url: 'video.local/funny', desc: 'Top fictional funny clips for your era. Low-res then HD.', date: '2008-01-01', yearMin: 2005, yearMax: 2025 },
  { title: 'Starry Night BBS — chat & ASCII art', url: 'bbs.local', desc: 'A cozy fictional bulletin board. Say hi to MARQUEE_BOT.', date: '1995-08-14', yearMin: 1995, yearMax: 2000 },
  { title: 'Zorp Portal — news-ish (simulated)', url: 'internet.local', desc: 'Fictional portal with weather, polls and pixel headlines.', date: '1999-12-01', yearMin: 1995, yearMax: 2010 },
  { title: 'FriendCircle — your fictional friends', url: 'chat.local', desc: 'Profiles, pokes and glitter text (simulated).', date: '2006-09-20', yearMin: 2005, yearMax: 2015 },
  { title: 'PostBox Mail — free 5MB inbox!', url: 'mail.local', desc: 'Open your fictional inbox inside the simulation.', date: '1998-04-04', yearMin: 1995, yearMax: 2025 },
  { title: 'CodeHaven Forum — help & hobbies', url: 'forum.local', desc: 'Ask about pixel art, MIDI, skate tricks (all fictional).', date: '2004-07-07', yearMin: 2000, yearMax: 2025 },
  { title: 'Cool Personal Pages Directory', url: 'pages.local', desc: 'Tiled backgrounds, visitor counters, guestbooks.', date: '1997-02-02', yearMin: 1995, yearMax: 2010 },
  { title: 'Longform essays (simulated)', url: 'reads.local', desc: 'Fictional essays about the fictional web.', date: '2016-06-06', yearMin: 2010, yearMax: 2025 },
  { title: 'Speed test — how fast is 56k?', url: 'speed.local', desc: 'A playful fictional meter. No real measurement.', date: '2001-01-01', yearMin: 1995, yearMax: 2025 },
  { title: 'Mystery: the blinking page', url: 'mystery.local/static', desc: 'Hmm. This page blinks. View source? (puzzle start)', date: '1999-10-31', yearMin: 1995, yearMax: 2025 },
  { title: 'under construction gifs', url: 'pages.local/cool-dave', desc: 'Dave’s fictional page. Open in browser for full glitter.', date: '1998-11-11', yearMin: 1995, yearMax: 2005 },
  { title: 'lofi beats to render to (fictional)', url: 'music.local', desc: 'Generated tones, no copyrighted audio.', date: '2021-03-03', yearMin: 2010, yearMax: 2025 },
  { title: 'AI helper (simulated, offline)', url: 'ai.local', desc: 'A tiny fictional assistant that runs locally in your browser.', date: '2025-01-01', yearMin: 2020, yearMax: 2025 },
  { title: 'dialup sounds explained (fictional)', url: 'internet.local/dialup', desc: 'Why does it screech? A kid-friendly fictional explainer.', date: '1996-06-06', yearMin: 1995, yearMax: 2005 },
];

export function searchFor(q: string, year: Year): SiteResult[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  if (query.includes('secret') || query.includes('xyzzy') || query === '42') {
    return [{ title: '??? you found a whisper ???', url: 'mystery.local/static', desc: 'The static hums. Something hidden. Click through.', date: '1999-10-31', yearMin: 1995, yearMax: 2025 }];
  }
  const pool = SEARCH_INDEX.filter(s => year >= s.yearMin && year <= s.yearMax);
  const scored = pool.map(s => {
    const hay = (s.title + ' ' + s.desc + ' ' + s.url).toLowerCase();
    let score = 0;
    for (const w of query.split(/\s+/)) { if (hay.includes(w)) score += 2; }
    if (hay.includes(query)) score += 3;
    if (s.url.includes('video') && query.includes('video')) score += 2;
    if (s.url.includes('video') && query.includes('funny')) score += 2;
    return { s, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  if (scored.length) return scored.map(x => x.s);
  // era-flavored fallback
  const eraFallback: SiteResult[] = [
    { title: `“${q}” on the fictional web (${year})`, url: 'search.local', desc: `No exact match in this demo index — try video.local, forum.local, pages.local or mystery.local.`, date: `${year}-01-01`, yearMin: 1995, yearMax: 2025 },
    ...pool.slice(0, 4),
  ];
  return eraFallback;
}

const VIDEOS_BY_ERA: Record<string, VideoItem[]> = {
  funny: [
    { id: 'hamster', title: 'Hamster on a Tiny Skateboard (fictional)', views: '1,204,553', rating: 4.8, category: 'funny', desc: 'A fictional hamster. No animals were rushed.', year: 2005, duration: '1:24', comments: [{ user: 'pixel_fan92', text: 'buffered 3 times, worth it', time: '2007' }, { user: 'modem_mama', text: 'my kids watch this daily', time: '2008' }] },
    { id: 'dialup', title: 'I Pranked My Modem (it screamed back)', views: '883,201', rating: 4.5, category: 'funny', desc: 'Fictional skit. Modem sounds simulated.', year: 2010, duration: '2:01', comments: [{ user: 'lol.exe', text: 'that screech at 0:42 lol', time: '2011' }] },
    { id: 'cat', title: 'Keyboard Cat 2.0 (pixel edition)', views: '5,001,932', rating: 4.9, category: 'funny', desc: 'A fictional pixel cat plays a fictional keyboard.', year: 2015, duration: '0:58', comments: [{ user: 'vibe_check', text: 'instant classic', time: '2016' }] },
  ],
  tech: [
    { id: 'tour95', title: 'Tour of My Fictional Desktop (1995 sim)', views: '44,102', rating: 4.2, category: 'tech', desc: 'Gray windows, chunky icons. Simulated tour.', year: 1995, duration: '4:10', comments: [{ user: 'retro_dan', text: 'so chunky, love it', time: '1996' }] },
    { id: 'broadband', title: 'Broadband vs Dial-Up (fictional race)', views: '312,884', rating: 4.6, category: 'tech', desc: 'Two fictional PCs race to load a 100KB image.', year: 2005, duration: '3:12', comments: [{ user: 'dsl_fan', text: 'broadband wins?! shocking', time: '2006' }] },
    { id: 'ai2025', title: 'I Asked AI to Build My Homepage', views: '2,103,445', rating: 4.4, category: 'tech', desc: 'Fictional demo, runs offline in this sim.', year: 2025, duration: '6:44', comments: [{ user: 'prompt_goblin', text: 'it made glitter??', time: '2025' }] },
  ],
  music: [
    { id: 'midi', title: 'MIDI Jam — 4 Channels of Joy', views: '120,553', rating: 4.7, category: 'music', desc: 'Generated bleeps. Fictional artist “Chip Sparrow”.', year: 2000, duration: '2:30', comments: [{ user: 'chiptune_kid', text: 'this slaps in 16 colors', time: '2001' }] },
    { id: 'lofi', title: 'lofi beats to render to (1hr fictional)', views: '9,883,110', rating: 4.9, category: 'music', desc: 'Generated loop. Study/relax sim.', year: 2020, duration: '59:59', comments: [{ user: 'night_owl', text: 'on loop while I explore', time: '2021' }] },
  ],
};
export function videosFor(year: Year): VideoItem[] {
  const all = [...VIDEOS_BY_ERA.funny, ...VIDEOS_BY_ERA.tech, ...VIDEOS_BY_ERA.music];
  return all.filter(v => Math.abs(v.year - year) <= 10);
}

export function initialEmails(year: Year): EmailMsg[] {
  const t = (s: string) => `${s}`;
  return [
    { id: 'w1', from: 'welcome@postbox.local', to: 'you@local', subject: `Welcome to the (fictional) ${year} internet!`, body: `Hi!\n\nThis inbox is 100% simulated for play.\n\nTry:\n- replying to a message\n- composing a new one\n- searching\n- clicking GENERATE A RANDOM DAY\n\n— The Time Machine Team (fictional)`, time: t(`${year}-01-02 09:12`), folder: 'inbox', read: false },
    { id: 'f1', from: 'pixelfriend@postbox.local', to: 'you@local', subject: year < 2010 ? 'yo u online tonight?' : 'you joining the call?', body: year < 2010 ? 'yo!!\n\ncome on chat after dinner. i found the funniest video page. video.local/funny\n\nalso check my page: pages.local/cool-dave\n\n— J' : 'heyyy\n\nwe’re doing a watch party on video.local + voice in chat. bring snacks (virtual).\n\n— J', time: t(`${year}-01-03 18:02`), folder: 'inbox', read: false },
    { id: 'n1', from: 'newsletter@zorportal.local', to: 'you@local', subject: 'Your fictional weekly digest (simulated)', body: 'Top fictional stories:\n- Local cat learns to type (allegedly)\n- 100KB image loads in record time\n- Forum debates best wallpaper\n\nAll simulated. No real news.', time: t(`${year}-01-04 07:30`), folder: 'inbox', read: false },
  ];
}

export function contactsFor(year: Year): ChatContact[] {
  if (year <= 2000) return [
    { id: 'j', name: 'PixelJo', online: true, mood: year === 1995 ? 'online via dial-up!' : 'brb — mom needs phone' },
    { id: 'm', name: 'MARQUEE_BOT', online: true, mood: '*~* ascii hugs *~*' },
    { id: 's', name: 'Sk8rBoi_99', online: false, mood: 'away' },
  ];
  if (year <= 2010) return [
    { id: 'j', name: 'jo_online', online: true, mood: year <= 2005 ? 'yo u on chat?' : 'listening to StreamBox' },
    { id: 'k', name: 'katie_bug', online: true, mood: 'check my new page!!' },
    { id: 'm', name: 'MARQUEE_BOT', online: true, mood: 'beep boop' },
    { id: 'z', name: 'zerosignal', online: false, mood: 'offline' },
  ];
  return [
    { id: 'j', name: 'Jo', online: true, mood: year >= 2025 ? 'you joining the call?' : 'in the group thread' },
    { id: 'k', name: 'Katie', online: true, mood: 'sent you a video' },
    { id: 'a', name: 'AI Helper (local)', online: true, mood: 'runs offline, always here' },
    { id: 'z', name: 'Zero', online: false, mood: 'dnd' },
  ];
}

export function greetingFor(year: Year, name: string): string {
  if (year <= 2000) return `heyyy ${name}!! welcome to the chat zone 😎 (simulated)`;
  if (year === 2005) return `yo u on chat? 😎 check video.local/funny`;
  if (year === 2010) return `heyy! did you see the new feed?? so much drama lol`;
  if (year === 2015) return `yo did you see that stream last night??`;
  if (year === 2020) return `you joining the call in 5? camera optional lol`;
  return `you joining the call? also the AI made us a playlist 🎶`;
}

export function botReply(year: Year, text: string): string {
  const t = text.toLowerCase();
  if (t.includes('video') || t.includes('funny')) return 'omg yes — open video.local/funny and watch the hamster one 🐹';
  if (t.includes('mystery') || t.includes('secret') || t.includes('hidden')) return 'psst… check mystery.local/static and view source. then try the forum. 🤫';
  if (t.includes('mail') || t.includes('email')) return 'check mail.local — I sent you something totally fictional 📬';
  if (t.includes('game')) return 'open Games from the desktop — try minesweeper or snake!';
  if (t.includes('music')) return 'open the music player — all tones are generated, no copyrighted stuff 🎵';
  if (t.includes('hello') || t.includes('hi') || t.includes('yo')) return greetingFor(year, 'friend');
  if (year <= 2000) return 'cool cool. brb, my sister needs the phone line lol. try pages.local/cool-dave!';
  if (year <= 2010) return 'lol exactly. btw did you reply to that forum thread? forum.local';
  if (year <= 2020) return 'fr fr. also check the feed on chat.local — I tagged you (fictionally)';
  return 'bet. ask the AI app (ai.local) to summarize your day — it runs locally ✨';
}

export function feedFor(year: Year): SocialPost[] {
  const base: SocialPost[] = [
    { id: 'p1', user: 'jo_online', text: year <= 2005 ? 'just updated my page with NEW glitter text ✨ visit pages.local/cool-dave' : 'just posted a new video essay (fictional) 🎬', time: '2h ago', likes: 24, comments: [{ user: 'katie_bug', text: 'omg love it!!' }] },
    { id: 'p2', user: 'katie_bug', text: year <= 2005 ? 'rate my top 8!! be honest lol' : 'POV: your download finishes at 99% then… completes! 🎉', time: '4h ago', likes: 41, comments: [{ user: 'jo_online', text: 'classic' }] },
    { id: 'p3', user: 'MARQUEE_BOT', text: `Reminder: everything here is SIMULATED fiction, not history. Be kind. (${year} edition)`, time: '6h ago', likes: 99, comments: [] },
  ];
  if (year >= 2020) base.push({ id: 'p4', user: 'Zero', text: 'going live (simulated) in the video-call app in 10 — q&a about the time machine!', time: '1h ago', likes: 12, comments: [] });
  return base;
}

export function threadsFor(year: Year): ForumThread[] {
  return [
    { id: 't1', category: 'General', title: year <= 2005 ? 'Best “under construction” GIF? (fictional contest)' : 'Best wallpaper? (screenshots welcome)', time: 'today', author: 'mod_marquee', replies: [{ user: 'jo_online', text: 'the digging one!!', time: '1h ago' }, { user: 'katie_bug', text: '+1 digging guy', time: '44m ago' }] },
    { id: 't2', category: 'Help', title: 'How do I view source? (to solve a mystery 👀)', time: 'yesterday', author: 'newbie_42', replies: [{ user: 'zerosignal', text: 'open mystery.local/static — the page tells you', time: '3h ago' }] },
    { id: 't3', category: 'Creations', title: `Show off your ${year}-style page!`, time: '2 days ago', author: 'pixel_dan', replies: [{ user: 'katie_bug', text: 'mine has 3 counters lol', time: '5h ago' }] },
  ];
}

// Mystery chain: mystery.local/static (view source -> phrase SUNSET MODEM) -> forum user zerosignal thread -> password "pixel-harbor-1999" -> locked file /Downloads/secret-harbor.txt
export const MYSTERY = {
  phrase: 'SUNSET MODEM',
  password: 'pixel-harbor-1999',
  hiddenUrl: 'mystery.local/harbor',
  finalFileName: 'secret-harbor.txt',
  finalText: 'You found the Pixel Harbor! 🏝️\n\nA fictional lighthouse blinks: SUNSET MODEM.\n\nThanks for exploring kindly — everything here was made up for play.\n\nAchievement: Digital Archaeologist (check Achievements app).',
};
