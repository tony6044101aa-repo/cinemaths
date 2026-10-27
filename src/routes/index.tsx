import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AGE_RATINGS, CATALOG, GENRES, MOODS, type AgeRating, type Item, type Mood } from "@/lib/movies";
import { favoriteStats, recommend, validatePrefs, type Scored } from "@/lib/recommend";
import * as store from "@/lib/storage";
import { fetchTmdb } from "@/lib/tmdb.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CineMatch – Recomendador de Filmes e Séries" },
      { name: "description", content: "Receba três recomendações de filmes e séries com base no seu gosto, humor e tempo disponível." },
      { property: "og:title", content: "CineMatch – Recomendador de Filmes e Séries" },
      { property: "og:description", content: "Recomendações por preferências, favoritos, histórico, avaliações e estatísticas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const typeLabel = (t: Item["type"]) => (t === "filme" ? "Filme" : "Série");
const ageLabel = (a: Item["ageRating"]) => (a === "NI" ? "Não informada" : a === "L" ? "Livre" : `${a} anos`);

function Index() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [favs, setFavs] = useState<Item[]>([]);
  const [history, setHistory] = useState<store.HistoryEntry[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [toast, setToast] = useState("");

  // preferências
  const [genres, setGenres] = useState<string[]>([]);
  const [mood, setMood] = useState<Mood | "">("");
  const [maxAge, setMaxAge] = useState<AgeRating>("14");
  const [time, setTime] = useState(120);
  const [errors, setErrors] = useState<string[]>([]);
  const [recs, setRecs] = useState<Scored[] | null>(null);

  // catálogo
  const [q, setQ] = useState("");
  const [fGenre, setFGenre] = useState("");
  const [fType, setFType] = useState("");
  const [tmdb, setTmdb] = useState<{ enabled: boolean; items: Item[] }>({ enabled: false, items: [] });
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setTheme(store.getTheme());
    setFavs(store.getFavorites());
    setHistory(store.getHistory());
    setRatings(store.getRatings());
  }, []);
  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); }, [theme]);

  useEffect(() => {
    const t = setTimeout(() => { fetchTmdb({ data: { query: q.trim().length >= 2 ? q.trim() : "" } }).then(setTmdb).catch(() => {}); }, 400);
    return () => clearTimeout(t);
  }, [q]);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2200); };

  const allItems = useMemo(() => [...CATALOG, ...tmdb.items], [tmdb.items]);
  const filtered = allItems.filter((i) =>
    i.title.toLowerCase().includes(q.trim().toLowerCase()) &&
    (!fGenre || i.genres.includes(fGenre)) && (!fType || i.type === fType));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const prefs = { genres, mood, maxAge, time };
    const errs = validatePrefs(prefs);
    setErrors(errs);
    if (errs.length) return;
    const r = recommend(prefs, CATALOG);
    setRecs(r);
    setHistory(store.addHistory(r.map((s) => s.item)));
  };

  const toggleFav = (i: Item) => {
    const was = favs.some((f) => f.id === i.id);
    setFavs(store.toggleFavorite(i));
    flash(was ? `"${i.title}" removido dos favoritos` : `"${i.title}" adicionado aos favoritos`);
  };
  const rate = (i: Item, n: number) => { setRatings(store.setRating(i.id, n)); flash(`Avaliação salva: ${n} estrela${n > 1 ? "s" : ""}`); };

  const stats = favoriteStats(favs);
  const cardProps = { favs, ratings, onFav: toggleFav, onRate: rate };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">Pular para o conteúdo</a>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <p className="font-display text-2xl tracking-wide"><span className="text-primary">Cine</span>Match</p>
          <nav aria-label="Seções" className="hidden gap-5 text-sm text-muted-foreground md:flex">
            {[["#preferencias", "Recomendar"], ["#catalogo", "Catálogo"], ["#favoritos", "Favoritos"], ["#historico", "Histórico"]].map(([h, l]) => (
              <a key={h} href={h} className="hover:text-foreground">{l}</a>))}
          </nav>
          <button onClick={() => { const t = theme === "dark" ? "light" : "dark"; setTheme(t); store.saveTheme(t); }}
            aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-accent focus-ring">
            {theme === "dark" ? "☀ Tema claro" : "☾ Tema escuro"}
          </button>
        </div>
      </header>

      <main id="conteudo" className="mx-auto max-w-6xl space-y-16 px-4 py-10">
        <section aria-labelledby="hero" className="hero-glow rounded-2xl border border-border p-8 md:p-12">
          <h1 id="hero" className="font-display text-5xl leading-none md:text-7xl">O que assistir <span className="text-primary">hoje?</span></h1>
          <p className="mt-4 max-w-xl text-muted-foreground">Conte seus gêneros favoritos, seu humor e quanto tempo você tem. O CineMatch escolhe três títulos compatíveis — sem sorteio.</p>
        </section>

        <section id="preferencias" aria-labelledby="pref-t" className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <form onSubmit={submit} noValidate className="space-y-5 rounded-2xl border border-border bg-card p-6">
            <h2 id="pref-t" className="font-display text-3xl">Suas preferências</h2>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Gêneros favoritos *</legend>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => {
                  const on = genres.includes(g);
                  return (
                    <label key={g} className={`cursor-pointer rounded-full border px-3 py-1 text-sm focus-within:ring-2 focus-within:ring-ring ${on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"}`}>
                      <input type="checkbox" className="sr-only" checked={on} onChange={() => setGenres(on ? genres.filter((x) => x !== g) : [...genres, g])} />{g}
                    </label>);
                })}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">Humor atual
                <select value={mood} onChange={(e) => setMood(e.target.value as Mood | "")} className="field">
                  <option value="">Indiferente</option>
                  {MOODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold">Classificação máxima
                <select value={maxAge} onChange={(e) => setMaxAge(e.target.value as AgeRating)} className="field">
                  {AGE_RATINGS.map((a) => <option key={a} value={a}>{ageLabel(a)}</option>)}
                </select>
              </label>
            </div>
            <label className="block text-sm font-semibold">Tempo disponível: {time} min {time < 60 && "(bom para episódios)"}
              <input type="range" min={15} max={180} step={5} value={time} onChange={(e) => setTime(+e.target.value)} className="mt-2 w-full accent-primary" />
            </label>
            {errors.length > 0 && (
              <ul role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {errors.map((e) => <li key={e}>{e}</li>)}
              </ul>)}
            <button type="submit" className="w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90 focus-ring">Gerar 3 recomendações</button>
          </form>

          <div aria-live="polite">
            <h2 className="font-display text-3xl">Recomendações</h2>
            {recs === null && <p className="mt-3 text-muted-foreground">Preencha o formulário para ver suas sugestões.</p>}
            {recs?.length === 0 && <p className="mt-3 rounded-lg border border-border p-4 text-muted-foreground">Nenhum título combina com todas as escolhas. Tente mais gêneros, mais tempo ou uma classificação maior. 🎬</p>}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recs?.map((s) => <Card key={s.item.id} item={s.item} reasons={s.reasons} {...cardProps} />)}
            </div>
          </div>
        </section>

        <section id="catalogo" aria-labelledby="cat-t">
          <h2 id="cat-t" className="font-display text-3xl">Catálogo</h2>
          <p className="text-sm text-muted-foreground">
            {tmdb.enabled ? "Inclui títulos ao vivo da TMDB (nota TMDB; classificação não informada)." : "Catálogo de demonstração. Conecte uma chave da TMDB para títulos reais."}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
            <label className="text-sm">Buscar por título<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex.: dragões" className="field" /></label>
            <label className="text-sm">Gênero<select value={fGenre} onChange={(e) => setFGenre(e.target.value)} className="field"><option value="">Todos</option>{GENRES.map((g) => <option key={g}>{g}</option>)}</select></label>
            <label className="text-sm">Tipo<select value={fType} onChange={(e) => setFType(e.target.value)} className="field"><option value="">Todos</option><option value="filme">Filme</option><option value="serie">Série</option></select></label>
          </div>
          <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">{filtered.length} resultado(s)</p>
          {filtered.length === 0 ? <p className="mt-3 rounded-lg border border-border p-4">Nenhum conteúdo encontrado com esses filtros.</p> : (
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((i) => <Card key={i.id} item={i} {...cardProps} />)}
            </div>)}
        </section>

        <section id="favoritos" aria-labelledby="fav-t" className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 id="fav-t" className="font-display text-3xl">Favoritos</h2>
            {favs.length === 0 ? <p className="mt-3 text-muted-foreground">Você ainda não tem favoritos. Toque em ♡ em qualquer título.</p> : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">{favs.map((i) => <Card key={i.id} item={i} {...cardProps} />)}</div>)}
          </div>
          <aside aria-labelledby="stat-t" className="h-fit rounded-2xl border border-border bg-card p-6">
            <h3 id="stat-t" className="font-display text-2xl">Estatísticas</h3>
            {stats.total === 0 ? <p className="mt-2 text-sm text-muted-foreground">Adicione favoritos para ver suas estatísticas.</p> : (
              <div className="mt-3 space-y-4 text-sm">
                <p className="text-4xl font-display text-primary">{stats.total} <span className="text-base text-muted-foreground">favorito(s)</span></p>
                <div>
                  <p>Filmes: {stats.movies} · Séries: {stats.series}</p>
                  <div className="mt-1 flex h-2 overflow-hidden rounded bg-muted" aria-hidden>
                    <div className="bg-primary" style={{ width: `${(stats.movies / stats.total) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <p className="font-semibold">Gêneros mais frequentes</p>
                  <ul className="mt-2 space-y-1">
                    {stats.topGenres.map(([g, n]) => (
                      <li key={g} className="flex items-center gap-2"><span className="w-28 shrink-0">{g}</span>
                        <span className="h-2 rounded bg-primary/70" style={{ width: `${(n / stats.topGenres[0][1]) * 100}%` }} /><span className="text-muted-foreground">{n}</span></li>))}
                  </ul>
                </div>
              </div>)}
          </aside>
        </section>

        <section id="historico" aria-labelledby="hist-t">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="hist-t" className="font-display text-3xl">Histórico <span className="text-base text-muted-foreground">(últimas {store.HISTORY_LIMIT})</span></h2>
            {history.length > 0 && (confirmClear ? (
              <div role="alertdialog" aria-label="Confirmar limpeza" className="flex items-center gap-2 text-sm">
                <span>Limpar todo o histórico?</span>
                <button autoFocus onClick={() => { store.clearHistory(); setHistory([]); setConfirmClear(false); flash("Histórico limpo"); }} className="rounded bg-destructive px-3 py-1 text-destructive-foreground focus-ring">Sim, limpar</button>
                <button onClick={() => setConfirmClear(false)} className="rounded border border-border px-3 py-1 focus-ring">Cancelar</button>
              </div>) : <button onClick={() => setConfirmClear(true)} className="rounded border border-border px-3 py-1 text-sm hover:bg-accent focus-ring">Limpar histórico</button>)}
          </div>
          {history.length === 0 ? <p className="mt-3 text-muted-foreground">Nenhuma recomendação gerada ainda.</p> : (
            <ol className="mt-4 divide-y divide-border rounded-xl border border-border">
              {history.map((h) => (
                <li key={h.date} className="flex flex-col gap-1 p-3 sm:flex-row sm:gap-4">
                  <time dateTime={h.date} className="shrink-0 text-sm text-muted-foreground">{new Date(h.date).toLocaleString("pt-BR")}</time>
                  <span>{h.items.map((i) => i.title).join(" · ")}</span>
                </li>))}
            </ol>)}
        </section>
      </main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">CineMatch · Notas do catálogo de demonstração são fictícias. {tmdb.enabled && "Dados de filmes reais fornecidos pela TMDB."}</footer>
      {toast && <div role="status" className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm text-background shadow-lg">{toast}</div>}
    </div>
  );
}

function Card({ item, reasons, favs, ratings, onFav, onRate }: {
  item: Item; reasons?: string[]; favs: Item[]; ratings: Record<string, number>;
  onFav: (i: Item) => void; onRate: (i: Item, n: number) => void;
}) {
  const fav = favs.some((f) => f.id === item.id);
  const my = ratings[item.id] ?? 0;
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-lg">
      {item.poster ? <img src={item.poster} alt="" loading="lazy" className="aspect-[2/3] w-full object-cover" /> :
        <div className="poster-fallback flex aspect-[3/2] items-end p-3"><span className="font-display text-2xl leading-none">{item.title}</span></div>}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{item.title}</h3>
          <button onClick={() => onFav(item)} aria-pressed={fav} aria-label={fav ? `Remover ${item.title} dos favoritos` : `Adicionar ${item.title} aos favoritos`}
            className={`text-xl leading-none focus-ring rounded ${fav ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>{fav ? "♥" : "♡"}</button>
        </div>
        <p className="text-xs text-muted-foreground">{typeLabel(item.type)} · {item.duration} min{item.type === "serie" ? "/ep" : ""}{item.source === "tmdb" ? " (estimado)" : ""} · {ageLabel(item.ageRating)}</p>
        <p className="text-xs">{item.genres.join(", ") || "Gênero não informado"}</p>
        <p className="line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
        {reasons && reasons.length > 0 && <p className="text-xs text-primary">{reasons.join(" · ")}</p>}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs">
          <span title={item.source === "tmdb" ? "Nota média da TMDB" : "Nota demonstrativa, não oficial"}>
            {item.source === "tmdb" ? "TMDB" : "Nota demo"}: <strong>{item.demoScore.toFixed(1)}</strong>
          </span>
          <div role="radiogroup" aria-label={`Sua avaliação de ${item.title}`} className="flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} role="radio" aria-checked={my === n} aria-label={`${n} estrela${n > 1 ? "s" : ""}`} onClick={() => onRate(item, n)}
                className={`px-0.5 text-base focus-ring rounded ${n <= my ? "text-star" : "text-muted-foreground/50 hover:text-star"}`}>★</button>))}
          </div>
        </div>
      </div>
    </article>
  );
}
