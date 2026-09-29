// SETUP E ALGORITMO DE SORTEIO EQUILIBRADO (RF03)
function renderizarPresencaList() {
    const grid = document.getElementById("presence-list-grid");
    if (!grid) return;

    grid.innerHTML = squad.map(p => {
        const ovr = calcularOverall(p.stats);
        return `
            <label class="presence-checkbox-card checked" id="pres-card-${p.id}">
                <input type="checkbox" value="${p.id}" checked onchange="togglePresencaCard('${p.id}', this.checked)">
                <img src="${p.foto || AVATAR_PRESETS.chico}" class="presence-avatar" alt="${p.nome}" onerror="this.src='${AVATAR_PRESETS.chico}'">
                <div class="presence-info">
                    <span class="presence-name">${p.apelido} (${ovr})</span>
                    <span class="presence-sub">${p.posicao} • ${p.skill}</span>
                </div>
            </label>
        `;
    }).join("");

    atualizarMetaPresenca();
}

function togglePresencaCard(id, isChecked) {
    const card = document.getElementById(`pres-card-${id}`);
    if (card) card.classList.toggle("checked", isChecked);
    atualizarMetaPresenca();
}

function marcarTodos(status) {
    document.querySelectorAll(".presence-checkbox-card input[type=checkbox]").forEach(cb => {
        cb.checked = status;
        const card = document.getElementById(`pres-card-${cb.value}`);
        if (card) card.classList.toggle("checked", status);
    });
    atualizarMetaPresenca();
}

function atualizarMetaPresenca() {
    const selected = document.querySelectorAll(".presence-checkbox-card input[type=checkbox]:checked").length;
    const perTeam = Number(document.getElementById("num-jogadores-time").value);
    const ideal = perTeam * 2;
    document.getElementById("presenca-counter").textContent = `${selected} / ${ideal} Atletas (${perTeam} vs ${perTeam})`;
}

// ALGORITMO DE SORTEIO MULTI-TIMES EQUILIBRADO
function executarSorteioEquilibrado() {
    const checkedBoxes = document.querySelectorAll(".presence-checkbox-card input[type=checkbox]:checked");
    const selectedIds = Array.from(checkedBoxes).map(cb => cb.value);

    if (selectedIds.length < 2) {
        alert("Selecione pelo menos 2 atletas para realizar o sorteio!");
        return;
    }

    const presentPlayers = squad.filter(p => selectedIds.includes(p.id));
    const perTeamLimit = Number(document.getElementById("num-jogadores-time").value);

    // Separar goleiros de linha
    const goleiros = presentPlayers.filter(p => p.posicao === "Goleiro");
    const linha = presentPlayers.filter(p => p.posicao !== "Goleiro");

    // Ordenar por Overall
    goleiros.sort((a, b) => calcularOverall(b.stats) - calcularOverall(a.stats));
    linha.sort((a, b) => calcularOverall(b.stats) - calcularOverall(a.stats));

    // Determinar a quantidade de times a formar
    let totalCount = presentPlayers.length;
    let numTeams = Math.max(2, Math.floor(totalCount / perTeamLimit));
    if (numTeams > TEAM_CONFIGS.length) numTeams = TEAM_CONFIGS.length;

    // Criar a estrutura dos N times
    const teams = [];
    for (let i = 0; i < numTeams; i++) {
        const config = TEAM_CONFIGS[i % TEAM_CONFIGS.length];
        teams.push({
            id: config.id,
            name: config.name,
            color: config.color,
            tagClass: config.tagClass,
            badgeText: config.badgeText,
            icon: config.icon,
            players: []
        });
    }

    const reserves = [];

    // Distribuir goleiros (1 para cada time se disponível)
    goleiros.forEach((gk, idx) => {
        if (idx < numTeams) {
            teams[idx].players.push(gk);
        } else {
            linha.push(gk);
        }
    });

    // Reordenar linha após sobras de goleiros
    linha.sort((a, b) => calcularOverall(b.stats) - calcularOverall(a.stats));

    // Snake / Greedy Draft para equilibrar a média de Overall entre os N times
    linha.forEach((player) => {
        const eligibleTeams = teams.filter(t => t.players.length < perTeamLimit);
        
        if (eligibleTeams.length > 0) {
            eligibleTeams.sort((t1, t2) => {
                const ovr1 = t1.players.reduce((acc, p) => acc + calcularOverall(p.stats), 0);
                const ovr2 = t2.players.reduce((acc, p) => acc + calcularOverall(p.stats), 0);
                return ovr1 - ovr2;
            });
            eligibleTeams[0].players.push(player);
        } else {
            reserves.push(player);
        }
    });

    generatedTeams = teams;
    currentReserves = reserves;
    activeTeamTabIndex = 0;

    gerarOrdemConfrontos(teams);
    renderizarResultadoSorteio();
}

function setDrawViewMode(mode) {
    currentDrawViewMode = mode;
    document.getElementById("btn-view-tactical").classList.toggle("active", mode === 'tactical');
    document.getElementById("btn-view-list").classList.toggle("active", mode === 'list');
    
    document.getElementById("draw-tactical-view").classList.toggle("hidden", mode !== 'tactical');
    document.getElementById("draw-list-view").classList.toggle("hidden", mode !== 'list');
}

function renderizarResultadoSorteio() {
    const resultArea = document.getElementById("result-draw-area");
    resultArea.classList.remove("hidden");

    // 1. Renderizar Tabs de Times
    const tabsContainer = document.getElementById("team-tabs-container");
    tabsContainer.innerHTML = generatedTeams.map((team, idx) => {
        const avgOvr = team.players.length > 0 
            ? (team.players.reduce((acc, p) => acc + calcularOverall(p.stats), 0) / team.players.length).toFixed(1)
            : "0.0";

        return `
            <button class="team-tab-btn ${idx === activeTeamTabIndex ? 'active' : ''} ${team.tagClass}" onclick="selecionarTabTime(${idx})">
                <i class="fa-solid ${team.icon}"></i> ${team.name.split(" ")[0]} ${team.name.split(" ")[1] || ''} 
                <span class="tab-ovr-pill">OVR ${avgOvr}</span>
            </button>
        `;
    }).join("");

    // 2. Renderizar Campo Tático para time ativo
    renderizarCampoTatico(activeTeamTabIndex);

    // 3. Renderizar Visualização em Lista
    renderizarListasTimes();

    // 4. Renderizar Reservas
    renderizarReservas();

    // 5. Renderizar Confrontos
    renderizarTabelaConfrontos();

    resultArea.scrollIntoView({ behavior: 'smooth' });
}

function selecionarTabTime(index) {
    activeTeamTabIndex = index;
    renderizarResultadoSorteio();
}

// RENDERIZADOR DO CAMPO TÁTICO VISUAL DE TV (2D PINS)
function renderizarCampoTatico(teamIndex) {
    const team = generatedTeams[teamIndex];
    if (!team) return;

    const avgOvr = team.players.length > 0 
        ? (team.players.reduce((acc, p) => acc + calcularOverall(p.stats), 0) / team.players.length).toFixed(1)
        : "0.0";

    const titleEl = document.getElementById("pitch-current-team-title");
    titleEl.innerHTML = `
        <span class="badge-tag ${team.tagClass}"><i class="fa-solid ${team.icon}"></i> ${team.name}</span>
        <span class="team-overall-badge">OVR MÉDIA: ${avgOvr}</span>
    `;

    const pitchNodesContainer = document.getElementById("pitch-tactical-nodes");

    const goleiros = team.players.filter(p => p.posicao === "Goleiro");
    const zagueiros = team.players.filter(p => p.posicao === "Zagueiro");
    const meios = team.players.filter(p => p.posicao === "Meio");
    const atacantes = team.players.filter(p => p.posicao === "Atacante");

    const pinsHTML = [];

    // Goleiros (Linha de Fundo / Gol)
    goleiros.forEach((p, idx) => {
        const x = 50 + (idx * 20 - (goleiros.length - 1) * 10);
        pinsHTML.push(gerarPinJogadorHtml(p, x, 85));
    });

    // Zagueiros / Defesa
    zagueiros.forEach((p, idx) => {
        const count = zagueiros.length;
        const startX = count === 1 ? 50 : count === 2 ? 30 : 20;
        const step = count > 1 ? (60 / (count - 1)) : 0;
        const x = count === 1 ? 50 : startX + idx * step;
        pinsHTML.push(gerarPinJogadorHtml(p, x, 65));
    });

    // Meio-Campo
    meios.forEach((p, idx) => {
        const count = meios.length;
        const startX = count === 1 ? 50 : count === 2 ? 32 : 22;
        const step = count > 1 ? (56 / (count - 1)) : 0;
        const x = count === 1 ? 50 : startX + idx * step;
        pinsHTML.push(gerarPinJogadorHtml(p, x, 42));
    });

    // Atacantes (Ataque)
    atacantes.forEach((p, idx) => {
        const count = atacantes.length;
        const startX = count === 1 ? 50 : count === 2 ? 35 : 25;
        const step = count > 1 ? (50 / (count - 1)) : 0;
        const x = count === 1 ? 50 : startX + idx * step;
        pinsHTML.push(gerarPinJogadorHtml(p, x, 18));
    });

    pitchNodesContainer.innerHTML = pinsHTML.join("");
}

function gerarPinJogadorHtml(player, x, y) {
    const ovr = calcularOverall(player.stats);
    const photoUrl = player.foto || AVATAR_PRESETS.chico;
    const posAbbr = player.posicao === "Goleiro" ? "GOL" : player.posicao === "Zagueiro" ? "ZAG" : player.posicao === "Meio" ? "MEI" : "ATA";

    return `
        <div class="tactical-player-pin" style="left: ${x}%; top: ${y}%;" onclick="abrirModalCard('${player.id}')">
            <div class="pin-avatar-frame">
                <img src="${photoUrl}" alt="${player.nome}" onerror="this.src='${AVATAR_PRESETS.chico}'">
                <span class="pin-ovr-tag">${ovr}</span>
            </div>
            <div class="pin-info-plate">
                <span class="pin-name">${player.apelido}</span>
                <span class="pin-pos-badge pos-${posAbbr}">${posAbbr}</span>
            </div>
        </div>
    `;
}

function renderizarListasTimes() {
    const grid = document.getElementById("teams-list-grid");
    
    grid.innerHTML = generatedTeams.map((team) => {
        const avgOvr = team.players.length > 0 
            ? (team.players.reduce((acc, p) => acc + calcularOverall(p.stats), 0) / team.players.length).toFixed(1)
            : "0.0";

        const playersRows = team.players.map(p => `
            <div class="pitch-player-row">
                <img src="${p.foto || AVATAR_PRESETS.chico}" class="row-avatar" alt="${p.nome}" onerror="this.src='${AVATAR_PRESETS.chico}'">
                <span class="pitch-player-ovr">${calcularOverall(p.stats)}</span>
                <span class="pitch-player-name">${p.apelido}</span>
                <span class="pitch-player-pos">${p.posicao}</span>
            </div>
        `).join("");

        return `
            <div class="team-column ${team.tagClass}">
                <div class="team-badge-header">
                    <span class="badge-tag ${team.tagClass}"><i class="fa-solid ${team.icon}"></i> ${team.name}</span>
                    <span class="team-overall-badge">OVR ${avgOvr}</span>
                </div>
                <div class="pitch-players-list">
                    ${playersRows}
                </div>
            </div>
        `;
    }).join("");
}

function renderizarReservas() {
    const reservesBox = document.getElementById("reserves-box");
    if (currentReserves.length > 0) {
        reservesBox.classList.remove("hidden");
        document.getElementById("reserves-list-container").innerHTML = currentReserves.map(p => `
            <div class="pitch-player-row reserve-row">
                <img src="${p.foto || AVATAR_PRESETS.chico}" class="row-avatar" alt="${p.nome}" onerror="this.src='${AVATAR_PRESETS.chico}'">
                <span class="pitch-player-ovr">${calcularOverall(p.stats)}</span>
                <span class="pitch-player-name">${p.apelido} (${p.nome.split(" ")[0]})</span>
                <span class="pitch-player-pos">${p.posicao}</span>
            </div>
        `).join("");
    } else {
        reservesBox.classList.add("hidden");
    }
}

function gerarOrdemConfrontos(teams) {
    if (teams.length < 2) return;
    
    currentMatchFixtures = [];
    if (teams.length === 2) {
        currentMatchFixtures.push({
            num: 1,
            title: "JOGO 1 (GRANDE FINAL DO BABA)",
            home: teams[0],
            away: teams[1],
            waiting: null
        });
    } else {
        currentMatchFixtures.push({
            num: 1,
            title: "JOGO 1 (ABERTURA DA RODADA)",
            home: teams[0],
            away: teams[1],
            waiting: teams.slice(2)
        });
        currentMatchFixtures.push({
            num: 2,
            title: "JOGO 2 (PRÓXIMA PARTIDA)",
            home: { name: "Vencedor do Jogo 1" },
            away: teams[2],
            waiting: teams.length > 3 ? teams.slice(3) : null
        });
    }
}

function sortearOrdemConfrontos() {
    if (!generatedTeams || generatedTeams.length < 2) return;
    const shuffled = [...generatedTeams].sort(() => Math.random() - 0.5);
    generatedTeams = shuffled;
    gerarOrdemConfrontos(generatedTeams);
    renderizarResultadoSorteio();
}

function renderizarTabelaConfrontos() {
    const container = document.getElementById("fixtures-list-container");
    if (!container || currentMatchFixtures.length === 0) return;

    container.innerHTML = currentMatchFixtures.map(f => {
        const homeName = f.home.name || f.home;
        const awayName = f.away.name || f.away;
        const waitingText = f.waiting && f.waiting.length > 0 
            ? `<div class="fixture-waiting"><i class="fa-solid fa-chair"></i> Esperando no Banco: <strong>${f.waiting.map(t => t.name).join(", ")}</strong></div>`
            : '';

        return `
            <div class="fixture-card">
                <div class="fixture-title">${f.title}</div>
                <div class="fixture-versus">
                    <span class="fixture-team home">${homeName}</span>
                    <span class="fixture-vs-badge">VS</span>
                    <span class="fixture-team away">${awayName}</span>
                </div>
                ${waitingText}
            </div>
        `;
    }).join("");
}

// COMPARTILHAMENTO NO WHATSAPP
function compartilharWhatsApp() {
    if (!generatedTeams || generatedTeams.length === 0) return;

    let text = `*🔥 CHICO B.E.T - SORTEIO DO BABA IFBA EUNÁPOLIS 🔥*\n\n`;

    generatedTeams.forEach(team => {
        const avgOvr = (team.players.reduce((acc, p) => acc + calcularOverall(p.stats), 0) / (team.players.length || 1)).toFixed(1);
        text += `👕 *${team.name}* (OVR Média: ${avgOvr})\n`;
        team.players.forEach((p, i) => {
            text += `  ${i + 1}. ${p.apelido} (${p.posicao}) - OVR ${calcularOverall(p.stats)} ⚡ ${p.skill}\n`;
        });
        text += `\n`;
    });

    if (currentReserves.length > 0) {
        text += `⏳ *BANCO DE RESERVAS DA 1ª RODADA*\n`;
        currentReserves.forEach((p, i) => {
            text += `  - ${p.apelido} (${p.posicao}) - OVR ${calcularOverall(p.stats)}\n`;
        });
        text += `\n`;
    }

    if (currentMatchFixtures.length > 0) {
        text += `🏆 *ORDEM DOS CONFRONTOS DO BABA*\n`;
        currentMatchFixtures.forEach(f => {
            const h = f.home.name || f.home;
            const a = f.away.name || f.away;
            text += `  ⚔️ ${f.title}: ${h} VS ${a}\n`;
        });
    }

    text += `\n_Gerado automaticamente pelo Chico B.E.T (Profª Ana Cristina Linhares - ADS IFBA)_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
}
