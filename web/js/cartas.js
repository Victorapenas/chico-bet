// RENDERIZADOR DE CARTAS ESTILO FIFA / FUT
function gerarHtmlCartaFUT(player) {
    const ovr = calcularOverall(player.stats);
    const photoUrl = player.foto || AVATAR_PRESETS.chico;
    const posAbbr = player.posicao === "Goleiro" ? "GOL" : player.posicao === "Zagueiro" ? "ZAG" : player.posicao === "Meio" ? "MEI" : "ATA";

    return `
        <article class="fut-card" id="card-${player.id}">
            <div class="card-top">
                <div class="card-ratings">
                    <span class="card-ovr">${ovr}</span>
                    <span class="card-pos">${posAbbr}</span>
                </div>
                <div class="card-badge-top"><i class="fa-solid fa-bolt"></i></div>
            </div>
            <div class="card-photo-box">
                <img src="${photoUrl}" alt="${player.nome}" onerror="this.src='${AVATAR_PRESETS.chico}'">
            </div>
            <div class="card-info">
                <div class="card-name">${player.apelido}</div>
                <div class="card-nickname">${player.nome.split(" ")[0]}</div>
                <div class="card-divider"></div>
                <div class="card-stats-grid">
                    <div class="stat-item"><span>VEL</span><span class="stat-val">${player.stats.vel * 10}</span></div>
                    <div class="stat-item"><span>CHU</span><span class="stat-val">${player.stats.chu * 10}</span></div>
                    <div class="stat-item"><span>PAS</span><span class="stat-val">${player.stats.pas * 10}</span></div>
                    <div class="stat-item"><span>DEF</span><span class="stat-val">${player.stats.def * 10}</span></div>
                </div>
                <div class="card-skill-badge" title="${player.skill}">
                    ⚡ ${player.skill}
                </div>
            </div>
            <div class="card-overlay-actions">
                <button class="card-action-btn btn-gold" onclick="abrirModalCard('${player.id}')"><i class="fa-solid fa-eye"></i> Detalhes</button>
                <button class="card-action-btn btn-secondary" onclick="prepararEdicaoAtleta('${player.id}')"><i class="fa-solid fa-pen"></i> Editar</button>
                <button class="card-action-btn btn-outline" style="color:#EF4444;" onclick="removerAtleta('${player.id}')"><i class="fa-solid fa-trash"></i> Excluir</button>
            </div>
        </article>
    `;
}

// RENDERIZAR E FILTRAR ELENCO DE CARTAS
function renderizarElenco() {
    const grid = document.getElementById("squad-cards-grid");
    const query = document.getElementById("input-search").value.toLowerCase();

    const filtered = squad.filter(p => {
        const matchPos = activePosFilter === "TODOS" || p.posicao === activePosFilter;
        const matchSearch = p.nome.toLowerCase().includes(query) || 
                            p.apelido.toLowerCase().includes(query) || 
                            p.skill.toLowerCase().includes(query);
        return matchPos && matchSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:#9CA3AF;">
            <i class="fa-solid fa-user-ninja" style="font-size:3rem; margin-bottom:1rem; color:var(--accent-gold);"></i>
            <p>Nenhum atleta encontrado com os filtros atuais.</p>
        </div>`;
        return;
    }

    grid.innerHTML = filtered.map(p => gerarHtmlCartaFUT(p)).join("");
}

function filtrarPosicao(pos, element) {
    activePosFilter = pos;
    document.querySelectorAll(".filter-pills .pill-btn").forEach(btn => btn.classList.remove("active"));
    element.classList.add("active");
    renderizarElenco();
}

function filtrarElenco() {
    renderizarElenco();
}

// MODAL DE DETALHES DA CARTA
function abrirModalCard(id) {
    const player = squad.find(p => p.id === id);
    if (!player) return;

    const ovr = calcularOverall(player.stats);
    const modalRender = document.getElementById("modal-card-render");
    
    modalRender.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; gap:1.5rem; background:var(--bg-card); padding:2rem; border-radius:var(--radius-lg); border:2px solid var(--accent-gold); max-width:400px;">
            ${gerarHtmlCartaFUT(player)}
            <div style="text-align:center; color:#D1D5DB;">
                <h3 style="color:#FFF; font-family:var(--font-heading); margin-bottom:0.4rem;">${player.nome}</h3>
                <p style="font-size:0.85rem; color:var(--accent-gold); font-weight:700; margin-bottom:0.8rem;">Perna: ${player.perna || "Direito"} | Posição: ${player.posicao}</p>
                <p style="font-size:0.9rem; font-style:italic;">"${player.bio}"</p>
            </div>
        </div>
    `;

    document.getElementById("card-modal").classList.remove("hidden");
}

function fecharModalCard(event) {
    document.getElementById("card-modal").classList.add("hidden");
}
