// CADASTRO E EDIÇÃO DE ATLETAS (RF01 & RF02)
function atualizarLiveCard() {
    const nome = document.getElementById("atleta-nome").value || "Nome Atleta";
    const apelido = document.getElementById("atleta-apelido").value || "Apelido";
    const posicao = document.getElementById("atleta-posicao").value;
    const skill = document.getElementById("atleta-skill").value || "Skill Lendária";
    const foto = document.getElementById("atleta-foto").value || AVATAR_PRESETS.chico;

    const vel = Number(document.getElementById("stat-vel").value);
    const chu = Number(document.getElementById("stat-chu").value);
    const pas = Number(document.getElementById("stat-pas").value);
    const def = Number(document.getElementById("stat-def").value);
    const fis = Number(document.getElementById("stat-fis").value);

    document.getElementById("val-vel").textContent = vel;
    document.getElementById("val-chu").textContent = chu;
    document.getElementById("val-pas").textContent = pas;
    document.getElementById("val-def").textContent = def;
    document.getElementById("val-fis").textContent = fis;

    const stats = { vel, chu, pas, def, fis };
    const ovr = calcularOverall(stats);
    document.getElementById("live-overall-value").textContent = ovr;

    const tempPlayer = {
        id: "live-temp",
        nome, apelido, posicao, skill, foto, stats
    };

    document.getElementById("live-card-preview").innerHTML = gerarHtmlCartaFUT(tempPlayer);
}

function selecionarPresetAvatar(key) {
    if (key && AVATAR_PRESETS[key]) {
        document.getElementById("atleta-foto").value = AVATAR_PRESETS[key];
        atualizarLiveCard();
    }
}

function handleFotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const fileNameEl = document.getElementById("foto-file-name");
        if (fileNameEl) fileNameEl.textContent = file.name;
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("atleta-foto").value = e.target.result;
            atualizarLiveCard();
        };
        reader.readAsDataURL(file);
    }
}

function salvarAtleta(event) {
    event.preventDefault();

    const editId = document.getElementById("atleta-id").value;
    const nome = document.getElementById("atleta-nome").value.trim();
    const apelido = document.getElementById("atleta-apelido").value.trim();
    const posicao = document.getElementById("atleta-posicao").value;
    const perna = document.getElementById("atleta-perna").value;
    const skill = document.getElementById("atleta-skill").value.trim();
    const bio = document.getElementById("atleta-bio").value.trim() || "Atleta de elite do baba do IFBA Eunápolis.";
    const foto = document.getElementById("atleta-foto").value.trim() || AVATAR_PRESETS.chico;

    const stats = {
        vel: Number(document.getElementById("stat-vel").value),
        chu: Number(document.getElementById("stat-chu").value),
        pas: Number(document.getElementById("stat-pas").value),
        def: Number(document.getElementById("stat-def").value),
        fis: Number(document.getElementById("stat-fis").value)
    };

    if (editId) {
        // Atualizar existente
        const index = squad.findIndex(p => p.id === editId);
        if (index !== -1) {
            squad[index] = { id: editId, nome, apelido, posicao, perna, skill, bio, foto, stats };
        }
    } else {
        // Criar novo
        const newPlayer = {
            id: "p_" + Date.now(),
            nome, apelido, posicao, perna, skill, bio, foto, stats
        };
        squad.unshift(newPlayer);
    }

    salvarStorage();
    limparFormulario();
    atualizarDashboard();
    renderizarElenco();
    renderizarPresencaList();
    switchSection("sec-elenco");

    alert("Atleta salvo com sucesso no Chico B.E.T!");
}

function prepararEdicaoAtleta(id) {
    const player = squad.find(p => p.id === id);
    if (!player) return;

    document.getElementById("atleta-id").value = player.id;
    document.getElementById("atleta-nome").value = player.nome;
    document.getElementById("atleta-apelido").value = player.apelido;
    document.getElementById("atleta-posicao").value = player.posicao;
    document.getElementById("atleta-perna").value = player.perna || "Direito";
    document.getElementById("atleta-skill").value = player.skill;
    document.getElementById("atleta-bio").value = player.bio || "";
    document.getElementById("atleta-foto").value = player.foto || "";

    document.getElementById("stat-vel").value = player.stats.vel;
    document.getElementById("stat-chu").value = player.stats.chu;
    document.getElementById("stat-pas").value = player.stats.pas;
    document.getElementById("stat-def").value = player.stats.def;
    document.getElementById("stat-fis").value = player.stats.fis;

    atualizarLiveCard();
    switchSection("sec-cadastro");
}

function removerAtleta(id) {
    if (confirm("Tem certeza que deseja remover este atleta do elenco do Baba?")) {
        squad = squad.filter(p => p.id !== id);
        salvarStorage();
        atualizarDashboard();
        renderizarElenco();
        renderizarPresencaList();
    }
}

function limparFormulario() {
    document.getElementById("atleta-id").value = "";
    document.getElementById("form-atleta").reset();
    document.getElementById("stat-vel").value = 8;
    document.getElementById("stat-chu").value = 7;
    document.getElementById("stat-pas").value = 8;
    document.getElementById("stat-def").value = 6;
    document.getElementById("stat-fis").value = 7;
    atualizarLiveCard();
}
