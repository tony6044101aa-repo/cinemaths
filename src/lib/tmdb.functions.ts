import { createServerFn } from "@tanstack/react-start";
import type { Item } from "./movies";
import { mapTmdbItem, type TmdbRaw, type TmdbDetails } from "./tmdb";

export const fetchTmdb = createServerFn({ method: "GET" })
  .inputValidator((d: { query?: string }) => ({ query: (d?.query ?? "").trim().slice(0, 100) }))
  .handler(async ({ data }): Promise<{ enabled: boolean; items: Item[]; error?: string }> => {
    const key = process.env['TMDB_API_KEY'];
    if (!key) return { enabled: false, items: [] };
    const request = async (path: string) => {
      const url = new URL(`https://api.themoviedb.org/3${path}`);
      url.searchParams.set("language", "pt-BR");
      url.searchParams.set("api_key", key);
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error("TMDB unavailable");
      return response.json();
    };
    try {
      const path = data.query
        ? `/search/multi?query=${encodeURIComponent(data.query)}&include_adult=false`
        : "/trending/all/week";
      const json = await request(path) as { results: TmdbRaw[] };
      const rows = json.results.filter(r => r.media_type === "movie" || r.media_type === "tv").slice(0, 20);
      const items: Item[] = [];
      // Bound detail concurrency instead of issuing all requests at once.
      for (let offset = 0; offset < rows.length; offset += 5) {
        items.push(...await Promise.all(rows.slice(offset, offset + 5).map(async raw => {
          try {
            const extra = raw.media_type === "tv" ? "content_ratings" : "release_dates";
            const details = await request(`/${raw.media_type}/${raw.id}?append_to_response=${extra}`) as TmdbDetails;
            return mapTmdbItem(raw, details);
          } catch { return mapTmdbItem(raw); }
        })));
      }
      return { enabled: true, items };
    } catch {
      return { enabled: true, items: [], error: "Não foi possível consultar o TMDB. Tente novamente em instantes." };
    }
  });
