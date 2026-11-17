import { describe, expect, it } from "vitest";
import { mapTmdbItem } from "@/lib/tmdb";
import { recommend } from "@/lib/recommend";

describe("TMDB recommendations", () => {
  const raw = { id: 1, media_type: "movie", title: "Filme real", genre_ids: [35], vote_average: 8 };
  it("uses reported runtime and Brazilian certification", () => {
    const item = mapTmdbItem(raw, { runtime: 95, release_dates: { results: [
      { iso_3166_1: "US", release_dates: [{ certification: "R" }] },
      { iso_3166_1: "BR", release_dates: [{ certification: "12" }] },
    ] } });
    expect(item.duration).toBe(95);
    expect(item.ageRating).toBe("12");
    expect(recommend({ genres: ["Comédia"], mood: "relaxado", maxAge: "12", time: 95 }, [item]).map(r => r.item.id)).toEqual(["tmdb-movie-1"]);
  });
  it("excludes titles without classification", () => {
    expect(recommend({ genres: ["Comédia"], mood: "", maxAge: "18", time: 180 }, [mapTmdbItem(raw, { runtime: 95 })])).toEqual([]);
  });
  it("excludes titles without runtime", () => {
    const item = mapTmdbItem({ ...raw, media_type: "tv" }, { content_ratings: { results: [{ iso_3166_1: "BR", rating: "L" }] } });
    expect(item.duration).toBe(0);
    expect(recommend({ genres: ["Comédia"], mood: "", maxAge: "18", time: 180 }, [item])).toEqual([]);
  });
  it("uses actual episode runtime for series", () => {
    expect(mapTmdbItem({ ...raw, media_type: "tv" }, { episode_run_time: [24] }).duration).toBe(24);
  });
});