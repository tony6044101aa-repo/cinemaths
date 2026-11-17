import { AGE_RATINGS, type Item, type Mood } from "./movies";

const GENRE_MAP: Record<number, string> = {
  28: "Ação", 12: "Aventura", 16: "Animação", 35: "Comédia", 18: "Drama", 878: "Ficção científica",
  14: "Fantasia", 10749: "Romance", 53: "Suspense", 27: "Terror", 99: "Documentário", 9648: "Mistério",
  10759: "Ação", 10765: "Ficção científica", 80: "Suspense",
};
const MOOD_GENRES: Record<Mood, string[]> = {
  animado: ["Ação", "Aventura", "Animação", "Comédia"],
  relaxado: ["Comédia", "Animação", "Documentário"],
  reflexivo: ["Drama", "Documentário", "Ficção científica"],
  tenso: ["Suspense", "Terror", "Mistério"],
  romantico: ["Romance"],
};
export interface TmdbRaw {
  id: number; title?: string; name?: string; media_type?: string; genre_ids?: number[];
  overview?: string; vote_average?: number; poster_path?: string | null;
}
export interface TmdbDetails {
  runtime?: number; episode_run_time?: number[]; last_episode_to_air?: { runtime?: number } | null;
  genres?: { id: number }[];
  release_dates?: { results?: { iso_3166_1: string; release_dates: { certification: string }[] }[] };
  content_ratings?: { results?: { iso_3166_1: string; rating: string }[] };
}
export function mapTmdbItem(raw: TmdbRaw, details: TmdbDetails = {}): Item {
  const series = raw.media_type === "tv";
  const genres = [...new Set((details.genres?.map(g => g.id) ?? raw.genre_ids ?? [])
    .map(id => GENRE_MAP[id]).filter((g): g is string => Boolean(g)))];
  const certifications = series
    ? details.content_ratings?.results?.filter(r => r.iso_3166_1 === "BR").map(r => r.rating) ?? []
    : details.release_dates?.results?.filter(r => r.iso_3166_1 === "BR").flatMap(r => r.release_dates.map(d => d.certification)) ?? [];
  const valid = certifications.filter((r): r is Item["ageRating"] & Exclude<Item["ageRating"], "NI"> => AGE_RATINGS.some(a => a === r));
  const ageRating = valid.sort((a, b) => AGE_RATINGS.indexOf(b) - AGE_RATINGS.indexOf(a))[0] ?? "NI";
  return {
    id: `tmdb-${raw.media_type}-${raw.id}`, title: raw.title ?? raw.name ?? "Sem título",
    type: series ? "serie" : "filme", genres,
    duration: series ? details.episode_run_time?.find(n => n > 0) ?? details.last_episode_to_air?.runtime ?? 0 : details.runtime ?? 0,
    ageRating, demoScore: Math.round((raw.vote_average ?? 0) * 10) / 10,
    description: raw.overview || "Sem descrição disponível.",
    moods: (Object.keys(MOOD_GENRES) as Mood[]).filter(m => MOOD_GENRES[m].some(g => genres.includes(g))),
    poster: raw.poster_path ? `https://image.tmdb.org/t/p/w342${raw.poster_path}` : undefined, source: "tmdb",
  };
}