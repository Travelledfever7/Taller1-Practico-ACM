interface CharacterInfo {
  name: string;
  url: string;
}

type characterStatus = "Alive" | "Dead" | "unknown";

interface Character {
  id: number;
  name: string;
  status: characterStatus;
  species: string;
  type: string;
  gender: string;
  origin: CharacterInfo;
  location: CharacterInfo;
  image: string;
  episode: string[];
  url: string;
  created: string;
}

interface QueryParams {
  name?: string;
  status?: string;
}

// Estado

let currentPage: number = 1;
let totalPages: number  = 1;
let query: QueryParams  = {};

const API_URL = "https://rickandmortyapi.com/api/character";

// Helpers

function statusLabel(status: characterStatus): string {
  const map: Record<characterStatus, string> = {
    Alive:   "Vivo",
    Dead:    "Muerto",
    unknown: "Desconocido",
  };
  return map[status];
}

function statusType(type: string): string {
  if (!type) return "No registrado en la API";
  return type;
}

function buildUrl(page: number): string {
  const params = new URLSearchParams({ page: String(page), ...query });
  return `${API_URL}?${params}`;
}

// Render 

function renderGrid(characters: Character[]): void {
  const grid = document.getElementById("grid") as HTMLDivElement;
  grid.innerHTML = "";

  characters.forEach((c: Character) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${c.image}" alt="${c.name}" loading="lazy" />
      <div class="card-body">
        <p class="card-name">${c.name}</p>
        <p class="card-id-Character">ID: ${c.id}</p>
        <p class="card-type">Tipo: ${statusType(c.type)}</p>
        <p class="card-origin">Origen: ${c.origin.name}</p>
        <p class="card-location">Ubicación: ${c.location.name}</p>
        <p class="card-gender">Género: ${c.gender}</p>
        <p class="card-episodes">Episodios: ${c.episode.length}</p>
        <p class="card-created">Creado: ${new Date(c.created).toLocaleDateString()}</p>
        <span class="tag">${c.species}</span>
        <div class="card-status">
          <span class="dot ${c.status.toLowerCase()}"></span>
          <span>${statusLabel(c.status)}</span>
          </div>
        <p class="card-url">URL: <a href="${c.url}" target="_blank">${c.url}</a></p>
      </div>
    `;
    grid.appendChild(card);
  });
}

function updateInfo(count: number): void {
  const el = document.getElementById("info") as HTMLParagraphElement;
  el.textContent = `${count} personajes encontrados`;
}

function updatePagination(): void {
  const wrap    = document.getElementById("pagination") as HTMLDivElement;
  const prevBtn = document.getElementById("prev")       as HTMLButtonElement;
  const nextBtn = document.getElementById("next")       as HTMLButtonElement;
  const pageEl  = document.getElementById("pageInfo")   as HTMLSpanElement;

  wrap.style.display = "flex";
  prevBtn.disabled   = currentPage <= 1;
  nextBtn.disabled   = currentPage >= totalPages;
  pageEl.textContent = `${currentPage} de ${totalPages}`;
}

function setLoading(visible: boolean): void {
  const el = document.getElementById("loading") as HTMLDivElement;
  el.style.display = visible ? "block" : "none";
}

function setError(message: string): void {
  const grid = document.getElementById("grid") as HTMLDivElement;
  grid.innerHTML = `<p class="error">${message}</p>`;
}

// Fetch

async function loadCharacters(page: number = 1): Promise<void> {
  setLoading(true);
  (document.getElementById("grid") as HTMLDivElement).innerHTML = "";
  (document.getElementById("pagination") as HTMLDivElement).style.display = "none";

  try {
    const res  = await fetch(buildUrl(page));
    const data = await res.json();

    if (data.error) {
      setError("No se encontraron personajes.");
      updateInfo(0);
      return;
    }

    currentPage = page;
    totalPages  = data.info.pages;

    updateInfo(data.info.count);
    renderGrid(data.results as Character[]);
    updatePagination();
  } catch {
    setError("Error al conectar con la API.");
  } finally {
    setLoading(false);
  }
}

// Eventos

function initEvents(): void {
  const searchBtn   = document.getElementById("searchBtn") as HTMLButtonElement;
  const searchInput = document.getElementById("search")    as HTMLInputElement;
  const statusSel   = document.getElementById("status")    as HTMLSelectElement;
  const prevBtn     = document.getElementById("prev")      as HTMLButtonElement;
  const nextBtn     = document.getElementById("next")      as HTMLButtonElement;

  searchBtn.addEventListener("click", () => {
    query = {};
    const name   = searchInput.value.trim();
    const status = statusSel.value;
    if (name)   query.name   = name;
    if (status) query.status = status;
    loadCharacters(1);
  });

  searchInput.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter") searchBtn.click();
  });

  prevBtn.addEventListener("click", () => loadCharacters(currentPage - 1));
  nextBtn.addEventListener("click", () => loadCharacters(currentPage + 1));
}

// Init

document.addEventListener("DOMContentLoaded", () => {
  initEvents();
  loadCharacters(1);
});

export {};