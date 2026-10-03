import type { EraConfig } from './types';

export const YEARS = [1995, 2000, 2005, 2010, 2015, 2020, 2025] as const;

export const ERAS: Record<number, EraConfig> = {
  1995: {
    year: 1995, label: 'Dial-Up Dawn', osName: 'Windowed ’95 (simulated)', browserName: 'Mosaic Trail 1.0',
    desktopStyle: 'win95', taskbar: 'bottom-gray',
    wallpaper: 'linear-gradient(135deg,#0b6e4f,#0a3d2e)', wallpaperEmoji: '🌲',
    font: '"MS Sans Serif", Tahoma, sans-serif', accent: '#0a7c66',
    windowChrome: 'gray-bevel', soundStyle: '8-bit blips', searchName: 'WebCrawler-ish “FindIt”',
    chatName: 'PingTalk', musicName: 'MIDI Jukebox', connectionLabel: 'Dial-up 28.8k', dialup: true,
    tagline: 'You’ve got (simulated) mail over a screeching modem.',
    defaultApps: ['browser', 'mail', 'chat', 'files', 'notepad', 'music', 'games', 'terminal'],
  },
  2000: {
    year: 2000, label: 'Y2K Pop', osName: 'Millennium Desktop', browserName: 'Navigator Orb 4.0',
    desktopStyle: 'win2000', taskbar: 'classic-blue',
    wallpaper: 'linear-gradient(135deg,#1a3a8f,#5b9bd5)', wallpaperEmoji: '🌊',
    font: 'Tahoma, Verdana, sans-serif', accent: '#2456c8',
    windowChrome: 'gray-bevel', soundStyle: 'pop chimes', searchName: 'FindIt Search',
    chatName: 'ZapChat', musicName: 'MP3 Deck', connectionLabel: 'Dial-up 56k', dialup: true,
    tagline: 'Glossy buttons, guestbooks and “under construction” GIFs.',
    defaultApps: ['browser', 'mail', 'chat', 'files', 'music', 'games', 'forum', 'notepad'],
  },
  2005: {
    year: 2005, label: 'Glossy Web', osName: 'XP-Style Bliss', browserName: 'Orb Explorer 6',
    desktopStyle: 'xp-gloss', taskbar: 'gloss',
    wallpaper: 'linear-gradient(135deg,#0e5c2f,#7ed957 60%,#1e90ff)', wallpaperEmoji: '⛰️',
    font: 'Verdana, "Trebuchet MS", sans-serif', accent: '#2e9e44',
    windowChrome: 'blue-luna', soundStyle: 'glossy pops', searchName: 'FindIt',
    chatName: 'ZapChat XP', musicName: 'MP3 Player Pro', connectionLabel: 'Broadband connected', dialup: false,
    tagline: 'Forums, MP3s and your very first profile page.',
    defaultApps: ['browser', 'mail', 'chat', 'files', 'music', 'games', 'video', 'social'],
  },
  2010: {
    year: 2010, label: 'Social Bloom', osName: 'Seven Glass', browserName: 'Tabbed Fox 3',
    desktopStyle: 'aero', taskbar: 'aero-dark',
    wallpaper: 'linear-gradient(135deg,#0a2a6b,#2e9bd6)', wallpaperEmoji: '💠',
    font: '"Segoe UI", Verdana, sans-serif', accent: '#1e88e5',
    windowChrome: 'aero-glass', soundStyle: 'soft dings', searchName: 'FindIt',
    chatName: 'PingWave', musicName: 'StreamBox', connectionLabel: 'Wi-Fi connected', dialup: false,
    tagline: 'Tabs, feeds, likes and endless video rabbit holes.',
    defaultApps: ['browser', 'mail', 'chat', 'files', 'music', 'games', 'video', 'social', 'forum'],
  },
  2015: {
    year: 2015, label: 'Flat Future', osName: 'FlatOS 10', browserName: 'FlatBrowse',
    desktopStyle: 'flat', taskbar: 'flat-dark',
    wallpaper: 'linear-gradient(135deg,#232526,#414345)', wallpaperEmoji: '🌃',
    font: '"Segoe UI", Roboto, sans-serif', accent: '#00bcd4',
    windowChrome: 'flat-white', soundStyle: 'minimal ticks', searchName: 'FindIt',
    chatName: 'PingWave', musicName: 'StreamBox', connectionLabel: 'LTE · Connected', dialup: false,
    tagline: 'Flat design, streaming and phones everywhere.',
    defaultApps: ['browser', 'mail', 'chat', 'files', 'music', 'games', 'video', 'social', 'forum', 'downloads'],
  },
  2020: {
    year: 2020, label: 'Remote Everything', osName: 'Modern Desktop', browserName: 'Chromium Ring 80',
    desktopStyle: 'modern', taskbar: 'modern-light',
    wallpaper: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)', wallpaperEmoji: '🏠',
    font: 'Inter, "Segoe UI", system-ui, sans-serif', accent: '#6c63ff',
    windowChrome: 'dark-modern', soundStyle: 'video-call bloops', searchName: 'FindIt',
    chatName: 'PingMeet', musicName: 'StreamBox+', connectionLabel: 'Fiber · Connected', dialup: false,
    tagline: 'Video calls, streaming marathons and remote everything.',
    defaultApps: ['browser', 'mail', 'chat', 'files', 'music', 'games', 'video', 'social', 'forum', 'downloads', 'video-call'],
  },
  2025: {
    year: 2025, label: 'AI Everywhere', osName: 'Aura OS', browserName: 'Aura AI Browser',
    desktopStyle: 'ai-modern', taskbar: 'floating',
    wallpaper: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', wallpaperEmoji: '✨',
    font: 'Inter, system-ui, sans-serif', accent: '#a855f7',
    windowChrome: 'rounded-ai', soundStyle: 'AI shimmer', searchName: 'FindIt AI',
    chatName: 'PingAI', musicName: 'Waveform AI Radio', connectionLabel: '6G · AI online', dialup: false,
    tagline: 'AI assistants, short video and the modern everything-app.',
    defaultApps: ['browser', 'mail', 'chat', 'files', 'music', 'games', 'video', 'social', 'forum', 'downloads', 'ai'],
  },
};

export function eraFor(year: number): EraConfig {
  return ERAS[year] ?? ERAS[2005];
}
