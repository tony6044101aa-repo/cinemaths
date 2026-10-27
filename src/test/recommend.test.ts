import { describe, it, expect } from "vitest";
import { recommend } from "@/lib/recommend";
import { CATALOG } from "@/lib/movies";
describe("recommend", () => {
  it("returns at most 3 items", () => {
    expect(recommend({ genres: ["Drama", "Comédia", "Ação"], mood: "", maxAge: "18", time: 180 }, CATALOG).length).toBe(3);
  });
  it("respects time and age limits", () => {
    const r = recommend({ genres: ["Drama", "Terror"], mood: "", maxAge: "12", time: 60 }, CATALOG);
    r.forEach((s) => { expect(s.item.duration).toBeLessThanOrEqual(60); expect(["L","10","12"]).toContain(s.item.ageRating); });
  });
});
