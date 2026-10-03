export type Year = 1995 | 2000 | 2005 | 2010 | 2015 | 2020 | 2025;

export interface EraConfig {
  year: Year;
  label: string;
  osName: string;
  browserName: string;
  desktopStyle: 'win95' | 'win2000' | 'xp-gloss' | 'aero' | 'flat' | 'modern' | 'ai-modern';
  taskbar: 'bottom-gray' | 'classic-blue' | 'gloss' | 'aero-dark' | 'flat-dark' | 'modern-light' | 'floating';
  wallpaper: string; // css gradient
  wallpaperEmoji: string;
  font: string;
  accent: string;
  windowChrome: 'gray-bevel' | 'blue-luna' | 'gloss-black' | 'aero-glass' | 'flat-white' | 'dark-modern' | 'rounded-ai';
  soundStyle: string;
  searchName: string;
  chatName: string;
  musicName: string;
  connectionLabel: string;
  dialup: boolean;
  tagline: string;
  defaultApps: string[];
}

export interface WinState {
  id: string;
  app: string;
  title: string;
  x: number; y: number; w: number; h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  prev?: { x: number; y: number; w: number; h: number };
  payload?: any;
}

export interface FSNode {
  id: string;
  name: string;
  type: 'folder' | 'text' | 'image' | 'webpage' | 'audio' | 'program' | 'mystery';
  parentId: string | null;
  content?: string;
  size?: string;
  created: string;
  locked?: boolean;
  password?: string;
}

export interface SiteResult {
  title: string;
  url: string;
  desc: string;
  date: string;
  yearMin: Year; yearMax: Year;
  body?: string;
}

export interface VideoItem { id: string; title: string; views: string; rating: number; category: string; desc: string; year: Year; duration: string; comments: { user: string; text: string; time: string }[] }
export interface SocialPost { id: string; user: string; text: string; time: string; likes: number; comments: { user: string; text: string }[] }
export interface EmailMsg { id: string; from: string; to: string; subject: string; body: string; time: string; folder: 'inbox' | 'sent' | 'drafts' | 'trash'; read: boolean }
export interface ChatContact { id: string; name: string; online: boolean; mood: string }
export interface ChatMsg { from: string; text: string; time: string; me: boolean }
export interface ForumThread { id: string; category: string; title: string; author: string; time: string; replies: { user: string; text: string; time: string }[] }
export interface Notif { id: string; text: string; app: string; time: string }
export interface Achievement { id: string; name: string; desc: string; unlocked: boolean; time?: string }
export interface MysteryState { id: string; solved: boolean }
export interface DownloadItem { id: string; name: string; size: string; progress: number; speed: string; done: boolean }
export interface HistoryEntry { url: string; title: string; time: string }
export interface DayEvent {
  id: string; kind: 'message' | 'email' | 'forum' | 'video' | 'download' | 'offline' | 'mystery' | 'notification' | 'comment' | 'popup';
  title: string; detail: string; time: string; app: string; payload?: any;
}
