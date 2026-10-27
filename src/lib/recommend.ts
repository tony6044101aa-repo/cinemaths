import { ageIndex, type AgeRating, type Item, type Mood } from "./movies";

export interface Preferences {
  genres: string[];
  mood: Mood | "";
  maxAge: AgeRating;
  time: number; // minutos disponíveis
}

export interface Scored { item: Item; score: number; reasons: string[] }

/**
 * Regras:
 * 1. Filtro obrigatório: classificação <= faixa escolhida (itens sem classificação são excluídos),
 *    duração <= tempo disponível e pelo menos um gênero em comum.
 * 2. Pontuação: +3 por gênero em comum, +2 se o humor está na regra explícita "moods" do item,
 *    + nota demonstrativa / 10 como desempate.
 * 3. Ordena por pontuação e retorna no máximo 3. Nada é aleatório.
 */
export function recommend(prefs: Preferences, catalog: Item[]): Scored[] {
  const max = ageIndex(prefs.maxAge);
  return catalog
    .filter((i) => i.ageRating !== "NI" && ageIndex(i.ageRating) <= max)
    .filter((i) => i.duration <= prefs.time)
    .map((item) => {
      const common = item.genres.filter((g) => prefs.genres.includes(g));
      const reasons = common.length ? [`Gêneros: ${common.join(", ")}`] : [];
      let score = common.length * 3;
      if (prefs.mood && item.moods.includes(prefs.mood)) {
        score += 2;
        reasons.push("Combina com seu humor");
      }
      return { item, score: score + item.demoScore / 10, reasons, common: common.length };
    })
    .filter((s) => s.common > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ item, score, reasons }) => ({ item, score, reasons }));
}

export function validatePrefs(p: Preferences): string[] {
  const e: string[] = [];
  if (!p.genres.length) e.push("Selecione pelo menos um gênero.");
  if (!p.time || p.time < 15) e.push("Informe um tempo disponível de pelo menos 15 minutos.");
  return e;
}

export function favoriteStats(favs: Item[]) {
  const genres: Record<string, number> = {};
  favs.forEach((f) => f.genres.forEach((g) => (genres[g] = (genres[g] ?? 0) + 1)));
  return {
    total: favs.length,
    movies: favs.filter((f) => f.type === "filme").length,
    series: favs.filter((f) => f.type === "serie").length,
    topGenres: Object.entries(genres).sort((a, b) => b[1] - a[1]).slice(0, 5),
  };
}
