/**
 * sorteio.js - Algoritmo de Sorteio do Baba do IFBA & Campo Tático 7a0
 * Chico B.E.T - IFBA Eunápolis
 * Regra da Quadra: 1 no gol + 5 na linha = 6 jogadores por equipe
 */

let jogadoresPresentesIds = new Set();
let timesFormados = [];
let timeVisualizadoNoCampo = 0; // 0 = Time A, 1 = Time B

// Inicializa a tela de sorteio
function inicializarSorteio() {
  const btnMarcarTodos = document.getElementById('btn-selecionar-todos');
  const btnDesmarcarTodos = document.getElementById('btn-desmarcar-todos');
  const btnSortear = document.getElementById('btn-executar-sorteio');
  const btnSortearDeNovo = document.getElementById('btn-refazer-sorteio');
  const btnWhatsapp = document.getElementById('btn-compartilhar-whatsapp');

  if (btnMarcarTodos) {
    btnMarcarTodos.addEventListener('click', () => {
      const todos = obterJogadores();
      todos.forEach(j => jogadoresPresentesIds.add(j.id));
      renderizarListaPresenca();
    });
  }

  if (btnDesmarcarTodos) {
    btnDesmarcarTodos.addEventListener('click', () => {
      jogadoresPresentesIds.clear();
      renderizarListaPresenca();
    });
  }

  if (btnSortear) btnSortear.addEventListener('click', sortearEquipesIFBA);
  if (btnSortearDeNovo) btnSortearDeNovo.addEventListener('click', sortearEquipesIFBA);
  if (btnWhatsapp) btnWhatsapp.addEventListener('click', compartilharNoWhatsApp);

  // Marca todos os jogadores por padrão na primeira carga
  const lista = obterJogadores();
  lista.forEach(j => jogadoresPresentesIds.add(j.id));
  renderizarListaPresenca();
}

// Renderiza a lista de presença com checkboxes
function renderizarListaPresenca() {
  const container = document.getElementById('attendance-list-container');
  const displayContador = document.getElementById('count-confirmados');
  const displayPrevisao = document.getElementById('count-previsao-times');
  if (!container) return;

  const jogadores = obterJogadores();
  const totalMarcados = jogadoresPresentesIds.size;

  if (displayContador) displayContador.textContent = totalMarcados;
  if (displayPrevisao) {
    const qtdTimes = Math.floor(totalMarcados / 6);
    displayPrevisao.innerHTML = `(Regra da Quadra: 1 Goleiro + 5 Linha) • Formará <strong>${qtdTimes} equipes completas</strong>`;
  }

  container.innerHTML = jogadores.map(j => {
    const selecionado = jogadoresPresentesIds.has(j.id);
    const fotoSrc = obterFotoJogador(j.foto);

    return `
      <div class="attendance-item ${selecionado ? 'selected' : ''}" onclick="alternarPresenca('${j.id}')">
        <div class="attendee-left">
          <div class="checkbox-custom">${selecionado ? '✓' : ''}</div>
          <img src="${fotoSrc}" class="attendee-avatar" alt="${j.nome}">
          <div class="attendee-details">
            <div class="attendee-name">${j.nome} ${j.apelido ? `(${j.apelido})` : ''}</div>
            <div class="attendee-meta">
              <span class="pos-tag pos-${j.posicao}">${j.posicao}</span>
              <span>Perna: ${j.perna || 'Destro'}</span>
            </div>
          </div>
        </div>
        <div class="attendee-stars">${j.estrelas.toFixed(1)} ⭐</div>
      </div>
    `;
  }).join('');
}

// Alterna presença do jogador ao clicar na linha
function alternarPresenca(id) {
  if (jogadoresPresentesIds.has(id)) {
    jogadoresPresentesIds.delete(id);
  } else {
    jogadoresPresentesIds.add(id);
  }
  renderizarListaPresenca();
}

// Lógica de Sorteio Balanceado por Estrelas e Goleiros
function sortearEquipesIFBA() {
  const todos = obterJogadores();
  const presentes = todos.filter(j => jogadoresPresentesIds.has(j.id));

  // Precisa de pelo menos 10 pessoas para fazer 2 times de baba
  if (presentes.length < 10) {
    alert("Selecione pelo menos 10 atletas para sortear 2 equipes!");
    return;
  }

  // Quantidade de times (mínimo 2)
  const qtdTimes = Math.max(2, Math.floor(presentes.length / 6));

  // 1. Separa Goleiros e Linha
  const goleiros = presentes.filter(j => j.posicao === 'GOL');
  const linha = presentes.filter(j => j.posicao !== 'GOL');

  // Cria estrutura dos times
  const times = Array.from({ length: qtdTimes }, (_, i) => ({
    nome: `Time ${String.fromCharCode(65 + i)}`,
    jogadores: [],
    estrelasTotal: 0,
    estrelasMedia: 0
  }));

  // 2. Distribui os Goleiros proporcionalmente (1 para cada time)
  goleiros.sort((a, b) => b.estrelas - a.estrelas);
  goleiros.forEach((gk, index) => {
    const timeIdx = index % qtdTimes;
    times[timeIdx].jogadores.push(gk);
    times[timeIdx].estrelasTotal += gk.estrelas;
  });

  // 3. Distribui os Jogadores de Linha para equilibrar o nível (Estrelas)
  // Ordena do melhor para o pior nível
  linha.sort((a, b) => b.estrelas - a.estrelas);

  // Para cada atleta, aloca no time que estiver com menos jogadores ou menor média de estrelas
  linha.forEach(jogador => {
    // Escolhe o time com menor número de jogadores ou menor total de estrelas
    times.sort((t1, t2) => {
      if (t1.jogadores.length !== t2.jogadores.length) {
        return t1.jogadores.length - t2.jogadores.length;
      }
      return t1.estrelasTotal - t2.estrelasTotal;
    });

    times[0].jogadores.push(jogador);
    times[0].estrelasTotal += jogador.estrelas;
  });

  // 4. Calcula a média final de estrelas de cada time
  times.forEach(t => {
    t.estrelasMedia = t.jogadores.length > 0 ? (t.estrelasTotal / t.jogadores.length) : 0;
  });

  // Restaura ordem padrão (Time A, Time B...)
  times.sort((a, b) => a.nome.localeCompare(b.nome));

  timesFormados = times;
  timeVisualizadoNoCampo = 0;

  // Renderiza e navega para resultados
  renderizarResultados();
  trocarTela('sorteio-resultado');
  mostrarNotificacao("Times do IFBA sorteados com sucesso! ⚽");
}

// Renderiza a Tela de Resultados com o Campo 7a0 e os Cards
function renderizarResultados() {
  const containerAbas = document.getElementById('field-team-tabs-container');
  const containerCards = document.getElementById('teams-cards-summary-container');
  const bannerEquilibrio = document.getElementById('balance-summary-text');

  if (timesFormados.length === 0) return;

  // Calcula a diferença entre os times
  const medias = timesFormados.map(t => t.estrelasMedia);
  const diff = (Math.max(...medias) - Math.min(...medias)).toFixed(1);

  if (bannerEquilibrio) {
    bannerEquilibrio.innerHTML = `
      <h4>⚖️ Baba 100% Equilibrado!</h4>
      <p>Diferença média entre as equipes: <strong>${diff} estrelas</strong>. Sem favoritismo na quadra do IFBA!</p>
    `;
  }

  // Abas para selecionar qual time ver no Campo 7a0
  if (containerAbas) {
    containerAbas.innerHTML = timesFormados.map((time, idx) => `
      <button class="field-tab-btn ${idx === timeVisualizadoNoCampo ? 'active' : ''}" onclick="trocarTimeVisualizadoNoCampo(${idx})">
        <span>${idx === 0 ? '🟢' : idx === 1 ? '🟡' : '🔵'}</span>
        ${time.nome} (${time.estrelasMedia.toFixed(1)} ⭐)
      </button>
    `).join('');
  }

  // Renderiza o campo tático estilo 7a0 para o time ativo
  desenharCampoTatico7a0(timesFormados[timeVisualizadoNoCampo]);

  // Renderiza os cards comparativos dos times abaixo do campo
  if (containerCards) {
    containerCards.innerHTML = timesFormados.map(time => `
      <div class="team-summary-box">
        <div class="team-summary-header">
          <span class="team-summary-title">${time.nome}</span>
          <span class="team-summary-stars">${time.estrelasMedia.toFixed(1)} ⭐</span>
        </div>
        <div class="team-roster-list">
          ${time.jogadores.map(j => `
            <div class="team-player-row ${j.posicao === 'GOL' ? 'is-gol' : ''}">
              <div>
                <span class="pos-tag pos-${j.posicao}" style="font-size:0.65rem; padding: 2px 4px;">${j.posicao}</span>
                <strong>${j.nome}</strong> ${j.apelido ? `"${j.apelido}"` : ''}
              </div>
              <span style="color:#facc15; font-weight:700;">${j.estrelas.toFixed(1)} ⭐</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }
}

// Alternar time exibido no campo
function trocarTimeVisualizadoNoCampo(indice) {
  timeVisualizadoNoCampo = indice;
  renderizarResultados();
}

// Desenha a formação tática de 6 jogadores (1 GOL + 5 Linha) no campo estilo 7a0
function desenharCampoTatico7a0(time) {
  const pitch = document.getElementById('field-pitch-slots');
  if (!pitch || !time) return;

  const jogadores = [...time.jogadores];

  // Separação dos 6 jogadores da formação padrão do IFBA:
  // 1 Goleiro, 2 Zagueiros/Fixos, 2 Alas/Laterais, 1 Atacante/Pivô
  let goleiro = jogadores.find(j => j.posicao === 'GOL');
  let zagueiros = jogadores.filter(j => j.posicao === 'ZAG');
  let alas = jogadores.filter(j => j.posicao === 'ALA' || j.posicao === 'MEI');
  let atacantes = jogadores.filter(j => j.posicao === 'ATA');

  // Jogadores que sobram para preencher eventuais posições faltantes
  let sobram = jogadores.filter(j => j !== goleiro && !zagueiros.includes(j) && !alas.includes(j) && !atacantes.includes(j));

  // Preenchimento de segurança caso falte alguma posição específica
  const getProximo = () => {
    return sobram.shift() || atacantes.pop() || alas.pop() || zagueiros.pop() || null;
  };

  const pGol = goleiro || getProximo();
  const pZag1 = zagueiros.shift() || getProximo();
  const pZag2 = zagueiros.shift() || getProximo();
  const pAla1 = alas.shift() || getProximo();
  const pAla2 = alas.shift() || getProximo();
  const pAta = atacantes.shift() || getProximo();

  const posicoesTaticas = [
    { atleta: pGol, classePos: 'slot-pos-gol', labelPadrao: 'GOL' },
    { atleta: pZag1, classePos: 'slot-pos-zag-esq', labelPadrao: 'ZAG E' },
    { atleta: pZag2, classePos: 'slot-pos-zag-dir', labelPadrao: 'ZAG D' },
    { atleta: pAla1, classePos: 'slot-pos-ala-esq', labelPadrao: 'ALA E' },
    { atleta: pAla2, classePos: 'slot-pos-ala-dir', labelPadrao: 'ALA D' },
    { atleta: pAta, classePos: 'slot-pos-ataque', labelPadrao: 'PIVÔ' },
  ];

  pitch.innerHTML = posicoesTaticas.map(slot => {
    const a = slot.atleta;
    if (!a) {
      return `
        <div class="pitch-slot ${slot.classePos}">
          <div class="slot-badge-photo dashed-empty">${slot.labelPadrao}</div>
          <div class="slot-name-tag">Vago</div>
        </div>
      `;
    }

    const foto = obterFotoJogador(a.foto);

    return `
      <div class="pitch-slot ${slot.classePos}" title="${a.nome} (${a.posicao})">
        <div class="slot-badge-photo">
          <img src="${foto}" alt="${a.nome}">
        </div>
        <div class="slot-name-tag">
          ${a.apelido || a.nome.split(' ')[0]}
          <span class="slot-star-tag">★ ${a.estrelas.toFixed(1)}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Compartilhamento no WhatsApp
function compartilharNoWhatsApp() {
  if (timesFormados.length === 0) return;

  let msg = `⚽ *ESCALAÇÃO OFICIAL DO BABA - IFBA EUNÁPOLIS* 🏟️%0A`;
  msg += `_Sorteio equilibrado na quadra (1 Goleiro + 5 Linha)_%0A%0A`;

  timesFormados.forEach(time => {
    msg += `*${time.nome.toUpperCase()}* (${time.estrelasMedia.toFixed(1)} ⭐)%0A`;
    time.jogadores.forEach(j => {
      const icone = j.posicao === 'GOL' ? '🧤' : '🏃';
      msg += `${icone} [${j.posicao}] ${j.nome}${j.apelido ? ` "${j.apelido}"` : ''} - ${j.estrelas.toFixed(1)}⭐%0A`;
    });
    msg += `%0A`;
  });

  msg += `📍 *Local:* Quadra Poliesportiva do IFBA%0A`;
  msg += `🔥 _Resenha garantida!_`;

  window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
}
