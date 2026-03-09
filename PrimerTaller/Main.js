// Tipos 
// Estado 
let currentPage = 1;
let totalPages = 1;
let query = {};
const API_URL = "https://rickandmortyapi.com/api/character";
// Helpers 
function statusLabel(status) {
    const map = {
        Alive: "Vivo",
        Dead: "Muerto",
        unknown: "Desconocido",
    };
    return map[status];
}
function statusType(type) {
    if (!type)
        return "No registrado en la API";
    return type;
}
function buildUrl(page) {
    const params = new URLSearchParams(Object.assign({ page: String(page) }, query));
    return `${API_URL}?${params}`;
}
// Render 
function renderGrid(characters) {
    const grid = document.getElementById("grid");
    grid.innerHTML = "";
    characters.forEach((c) => {
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
function updateInfo(count) {
    const el = document.getElementById("info");
    el.textContent = `${count} personajes encontrados`;
}
function updatePagination() {
    const wrap = document.getElementById("pagination");
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");
    const pageEl = document.getElementById("pageInfo");
    wrap.style.display = "flex";
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    pageEl.textContent = `${currentPage} de ${totalPages}`;
}
function setLoading(visible) {
    const el = document.getElementById("loading");
    el.style.display = visible ? "block" : "none";
}
function setError(message) {
    const grid = document.getElementById("grid");
    grid.innerHTML = `<p class="error">${message}</p>`;
}
// Fetch 
async function loadCharacters(page = 1) {
    setLoading(true);
    document.getElementById("grid").innerHTML = "";
    document.getElementById("pagination").style.display = "none";
    try {
        const res = await fetch(buildUrl(page));
        const data = await res.json();
        if (data.error) {
            setError("No se encontraron personajes.");
            updateInfo(0);
            return;
        }
        currentPage = page;
        totalPages = data.info.pages;
        updateInfo(data.info.count);
        renderGrid(data.results);
        updatePagination();
    }
    catch (_a) {
        setError("Error al conectar con la API.");
    }
    finally {
        setLoading(false);
    }
}
// Eventos 
function initEvents() {
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("search");
    const statusSel = document.getElementById("status");
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");
    searchBtn.addEventListener("click", () => {
        query = {};
        const name = searchInput.value.trim();
        const status = statusSel.value;
        if (name)
            query.name = name;
        if (status)
            query.status = status;
        loadCharacters(1);
    });
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter")
            searchBtn.click();
    });
    prevBtn.addEventListener("click", () => loadCharacters(currentPage - 1));
    nextBtn.addEventListener("click", () => loadCharacters(currentPage + 1));
}
// Init 
document.addEventListener("DOMContentLoaded", () => {
    initEvents();
    loadCharacters(1);
});
