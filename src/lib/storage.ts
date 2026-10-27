import type { Item } from "./movies";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* cota cheia */ }
}

const K = { fav: "cinematch:favorites", hist: "cinematch:history", rate: "cinematch:ratings", theme: "cinematch:theme" };

export const getFavorites = (): Item[] => { const v = read<Item[]>(K.fav, []); return Array.isArray(v) ? v : []; };
export function toggleFavorite(item: Item): Item[] {
  const favs = getFavorites();
  const next = favs.some((f) => f.id === item.id) ? favs.filter((f) => f.id !== item.id) : [...favs, item];
  write(K.fav, next);
  return next;
}

export interface HistoryEntry { date: string; items: { id: string; title: string }[] }
export const HISTORY_LIMIT = 20;
export const getHistory = (): HistoryEntry[] => { const v = read<HistoryEntry[]>(K.hist, []); return Array.isArray(v) ? v : []; };
export function addHistory(items: Item[]): HistoryEntry[] {
  if (!items.length) return getHistory();
  const next = [{ date: new Date().toISOString(), items: items.map((i) => ({ id: i.id, title: i.title })) }, ...getHistory()].slice(0, HISTORY_LIMIT);
  write(K.hist, next);
  return next;
}
export const clearHistory = () => write(K.hist, []);

export const getRatings = (): Record<string, number> => { const v = read<Record<string, number>>(K.rate, {}); return typeof v === "object" ? v : {}; };
export function setRating(id: string, n: number) { const r = { ...getRatings(), [id]: n }; write(K.rate, r); return r; }

export const getTheme = (): "light" | "dark" => (read<string>(K.theme, "dark") === "light" ? "light" : "dark");
export const saveTheme = (t: "light" | "dark") => write(K.theme, t);
