// Catálogo de DEMONSTRAÇÃO. As notas são fictícias, não são avaliações oficiais.
export type ContentType = "filme" | "serie";
export type Mood = "animado" | "relaxado" | "reflexivo" | "tenso" | "romantico";
export type AgeRating = "L" | "10" | "12" | "14" | "16" | "18";

export interface Item {
  id: string;
  title: string;
  type: ContentType;
  genres: string[];
  duration: number; // minutos (filme) ou por episódio (série)
  ageRating: AgeRating | "NI"; // NI = não informada (itens da API)
  demoScore: number; // 0-10, demonstrativa
  description: string;
  moods: Mood[]; // regra explícita de humor
  poster?: string | undefined;
  source: "demo" | "tmdb";
}

export const GENRES = [
  "Ação", "Aventura", "Animação", "Comédia", "Drama", "Ficção científica",
  "Fantasia", "Romance", "Suspense", "Terror", "Documentário", "Mistério",
];

export const MOODS: { value: Mood; label: string }[] = [
  { value: "animado", label: "Animado" },
  { value: "relaxado", label: "Relaxado" },
  { value: "reflexivo", label: "Reflexivo" },
  { value: "tenso", label: "Querendo tensão" },
  { value: "romantico", label: "Romântico" },
];

export const AGE_RATINGS: AgeRating[] = ["L", "10", "12", "14", "16", "18"];

const d = (o: Omit<Item, "source">): Item => ({ ...o, source: "demo" });

export const CATALOG: Item[] = [
  d({ id: "d1", title: "Horizonte Vermelho", type: "filme", genres: ["Ação", "Aventura"], duration: 118, ageRating: "14", demoScore: 7.8, description: "Uma piloto de resgate atravessa um deserto hostil para salvar sua equipe.", moods: ["animado", "tenso"] }),
  d({ id: "d2", title: "A Casa da Colina Azul", type: "filme", genres: ["Drama", "Romance"], duration: 104, ageRating: "12", demoScore: 8.1, description: "Dois antigos amigos se reencontram ao herdar a mesma casa de praia.", moods: ["romantico", "reflexivo"] }),
  d({ id: "d3", title: "Órbita Silenciosa", type: "filme", genres: ["Ficção científica", "Suspense"], duration: 132, ageRating: "14", demoScore: 8.4, description: "Uma astronauta sozinha recebe sinais que não deveriam existir.", moods: ["tenso", "reflexivo"] }),
  d({ id: "d4", title: "Pipoca e Confusão", type: "filme", genres: ["Comédia"], duration: 92, ageRating: "L", demoScore: 6.9, description: "Uma família tenta organizar a festa de aniversário mais caótica do bairro.", moods: ["animado", "relaxado"] }),
  d({ id: "d5", title: "O Reino de Papel", type: "filme", genres: ["Animação", "Fantasia", "Aventura"], duration: 96, ageRating: "L", demoScore: 8.0, description: "Uma menina entra no livro que está escrevendo e precisa terminar a história.", moods: ["relaxado", "animado"] }),
  d({ id: "d6", title: "Sombras no Porão", type: "filme", genres: ["Terror", "Mistério"], duration: 99, ageRating: "16", demoScore: 7.1, description: "Ruídos noturnos levam uma família a descobrir segredos da casa nova.", moods: ["tenso"] }),
  d({ id: "d7", title: "Mares Profundos", type: "filme", genres: ["Documentário"], duration: 85, ageRating: "L", demoScore: 8.6, description: "Uma jornada pelos ecossistemas menos explorados do oceano.", moods: ["relaxado", "reflexivo"] }),
  d({ id: "d8", title: "Último Trem para Lisboa", type: "filme", genres: ["Romance", "Drama"], duration: 112, ageRating: "12", demoScore: 7.5, description: "Estranhos dividem uma cabine e uma noite que mudará suas vidas.", moods: ["romantico"] }),
  d({ id: "d9", title: "Código Zero", type: "filme", genres: ["Ação", "Suspense"], duration: 126, ageRating: "16", demoScore: 7.3, description: "Um hacker arrependido precisa impedir o ataque que ajudou a planejar.", moods: ["tenso", "animado"] }),
  d({ id: "d10", title: "A Biblioteca Perdida", type: "filme", genres: ["Aventura", "Mistério", "Fantasia"], duration: 141, ageRating: "10", demoScore: 7.9, description: "Arqueólogos buscam uma biblioteca que aparece apenas no eclipse.", moods: ["animado", "reflexivo"] }),
  d({ id: "d11", title: "Noite de Estreia", type: "filme", genres: ["Comédia", "Romance"], duration: 101, ageRating: "12", demoScore: 7.0, description: "Uma atriz substituta tem uma única noite para brilhar.", moods: ["romantico", "relaxado"] }),
  d({ id: "d12", title: "Cinzas", type: "filme", genres: ["Drama"], duration: 155, ageRating: "18", demoScore: 8.3, description: "Um retrato intenso de uma cidade industrial após o fechamento da fábrica.", moods: ["reflexivo"] }),
  d({ id: "s1", title: "Estação Ômega", type: "serie", genres: ["Ficção científica", "Drama"], duration: 52, ageRating: "14", demoScore: 8.5, description: "A tripulação de uma estação espacial lida com uma crise política.", moods: ["reflexivo", "tenso"] }),
  d({ id: "s2", title: "Café da Esquina", type: "serie", genres: ["Comédia"], duration: 24, ageRating: "L", demoScore: 7.6, description: "Os clientes fiéis de um café transformam cada dia em uma pequena aventura.", moods: ["relaxado", "animado"] }),
  d({ id: "s3", title: "Detetive Aurora", type: "serie", genres: ["Mistério", "Suspense"], duration: 45, ageRating: "14", demoScore: 8.2, description: "Uma investigadora resolve casos usando memórias de pessoas comuns.", moods: ["tenso", "reflexivo"] }),
  d({ id: "s4", title: "Dragões de Vidro", type: "serie", genres: ["Fantasia", "Aventura", "Ação"], duration: 58, ageRating: "16", demoScore: 8.7, description: "Reinos rivais disputam os últimos ovos de dragão do continente.", moods: ["animado", "tenso"] }),
  d({ id: "s5", title: "Pequenos Heróis", type: "serie", genres: ["Animação", "Aventura"], duration: 22, ageRating: "L", demoScore: 7.4, description: "Quatro amigos protegem a vizinhança com invenções malucas.", moods: ["animado", "relaxado"] }),
  d({ id: "s6", title: "Cartas de Verão", type: "serie", genres: ["Romance", "Drama"], duration: 40, ageRating: "12", demoScore: 7.7, description: "Um amor de juventude contado por cartas encontradas décadas depois.", moods: ["romantico", "reflexivo"] }),
  d({ id: "s7", title: "Mansão Hollow", type: "serie", genres: ["Terror", "Drama"], duration: 55, ageRating: "18", demoScore: 8.0, description: "Irmãos retornam à casa onde cresceram e enfrentam velhos fantasmas.", moods: ["tenso"] }),
  d({ id: "s8", title: "Planeta Vivo", type: "serie", genres: ["Documentário"], duration: 50, ageRating: "L", demoScore: 9.0, description: "Série sobre a vida selvagem nos cinco continentes.", moods: ["relaxado", "reflexivo"] }),
  d({ id: "s9", title: "Turno da Noite", type: "serie", genres: ["Drama", "Suspense"], duration: 47, ageRating: "16", demoScore: 7.8, description: "Os plantões de um hospital urbano onde cada noite traz um dilema.", moods: ["tenso", "reflexivo"] }),
  d({ id: "s10", title: "Sitcom dos Vizinhos", type: "serie", genres: ["Comédia", "Romance"], duration: 26, ageRating: "10", demoScore: 7.2, description: "Dois vizinhos opostos dividem uma parede fina e muitos mal-entendidos.", moods: ["romantico", "relaxado", "animado"] }),
];

export const ageIndex = (r: Item["ageRating"]) => (r === "NI" ? 99 : AGE_RATINGS.indexOf(r));
