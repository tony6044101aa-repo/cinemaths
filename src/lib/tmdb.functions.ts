import { createServerFn } from "@tanstack/react-start";
import type { Item } from "./movies";

const GENRE_MAP: Record<number, string> = {
  28: "Ação", 12: "Aventura", 16: "Animação", 35: "Comédia", 18: "Drama", 878: "Ficção científica",
  14: "Fantasia", 10749: "Romance", 53: "Suspense", 27: "Terror", 99: "Documentário", 9648: "Mistério",
  10759: "Ação", 10765: "Ficção científica", 80: "Suspense",
};

type Raw = { id: number; title?: string; name?: string; media_type?: string; genre_ids?: number[]; overview?: string; vote_average?: number; poster_path?: string | null };

export const fetchTmdb = createServerFn({ method: "GET" })
  .inputValidator((d: { query?: string }) => ({ query: (d?.query ?? "").slice(0, 100) }))
  .handler(async ({ data }): Promise<{ enabled: boolean; items: Item[] }> => {
    const key = process.env.TMDB_API_KEY;
    if (!key) return { enabled: false, items: [] };
    const isBearer = key.length > 40;
    const base = "https://api.themoviedb.org/3";
    const path = data.query
      ? `/search/multi?query=${encodeURIComponent(data.query)}&language=pt-BR`
      : `/trending/all/week?language=pt-BR`;
    const url = base + path + (isBearer ? "" : `&api_key=${key}`);
    try {
      const res = await fetch(url, { headers: isBearer ? { Authorization: `Bearer ${key}` } : {} });
      if (!res.ok) return { enabled: true, items: [] };
      const json = (await res.json()) as { results: Raw[] };
      const items = json.results
        .filter((r) => r.media_type === "movie" || r.media_type === "tv")
        .map((r): Item => ({
          id: `tmdb-${r.media_type}-${r.id}`,
          title: r.title ?? r.name ?? "Sem título",
          type: r.media_type === "tv" ? "serie" : "filme",
          genres: [...new Set((r.genre_ids ?? []).map((g) => GENRE_MAP[g]).filter(Boolean))],
          duration: r.media_type === "tv" ? 45 : 110,
          ageRating: "NI",
          demoScore: Math.round((r.vote_average ?? 0) * 10) / 10,
          description: r.overview || "Sem descrição disponível.",
          moods: [],
          poster: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : undefined,
          source: "tmdb",
        }));
      return { enabled: true, items };
    } catch {
      return { enabled: true, items: [] };
    }
  });
