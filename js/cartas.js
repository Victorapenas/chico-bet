/**
 * cartas.js - Renderização do Catálogo de Atletas por Estrelas
 * Chico B.E.T - IFBA Eunápolis
 */

let filtroPosicaoAtual = 'TODOS';
let termoBuscaAtual = '';

// Inicialização dos eventos do catálogo de cartas
function inicializarCartas() {
  // Filtros por botões (chips)
  const botoesFiltro = document.querySelectorAll('.chip-btn');
  botoesFiltro.forEach(btn => {
    btn.addEventListener('click', () => {
      botoesFiltro.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filtroPosicaoAtual = btn.getAttribute('data-pos') || 'TODOS';
      renderizarCatalogoCartas();
    });
  });

  // Campo de busca por texto
  const campoBusca = document.getElementById('search-player-input');
  if (campoBusca) {
    campoBusca.addEventListener('input', (e) => {
      termoBuscaAtual = e.target.value.toLowerCase().trim();
      renderizarCatalogoCartas();
    });
  }

  renderizarCatalogoCartas();
}

// Renderiza a lista de cartas dos jogadores na tela
function renderizarCatalogoCartas() {
  const container = document.getElementById('cards-grid-container');
  if (!container) return;

  const jogadores = obterJogadores();

  // Filtra por posição e busca de texto
  const filtrados = jogadores.filter(j => {
    const atendePosicao = (filtroPosicaoAtual === 'TODOS') || (j.posicao === filtroPosicaoAtual);
    const atendeNome = termoBuscaAtual === '' || 
      j.nome.toLowerCase().includes(termoBuscaAtual) || 
      (j.apelido && j.apelido.toLowerCase().includes(termoBuscaAtual));
    return atendePosicao && atendeNome;
  });

  if (filtrados.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
        <p style="font-size: 2rem;">⚽</p>
        <p>Nenhum atleta encontrado com esses filtros.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtrados.map(j => {
    const fotoSrc = obterFotoJogador(j.foto);
    const estrelasHtml = renderizarEstrelasVisual(j.estrelas);

    return `
      <div class="player-card ${j.estrelas >= 4.0 ? 'tier-destaque' : ''}">
        <!-- Cabeçalho com Estrelas e Posição -->
        <div class="card-header-stars">
          <div class="stars-rating-badge">
            <span>⭐</span>
            <span>${j.estrelas.toFixed(1)}</span>
          </div>
          <span class="pos-tag pos-${j.posicao}">${j.posicao}</span>
        </div>

        <!-- Foto Real ou Silhueta Neutra -->
        <div class="card-photo-wrapper">
          <img src="${fotoSrc}" alt="${j.nome}" loading="lazy">
        </div>

        <!-- Nome e Apelido -->
        <div class="card-name-section">
          <div class="card-nickname">${j.apelido || j.nome}</div>
          <div class="card-realname">${j.nome} • Perna: ${j.perna || 'Destro'}</div>
        </div>

        <!-- As 6 Skills da Pelada (1 a 5) -->
        <div class="skills-grid">
          <div class="skill-row">
            <span class="skill-lbl">⚡ Velocidade</span>
            <span class="skill-num">${(j.skills.vel || 3).toFixed(1)}</span>
          </div>
          <div class="skill-row">
            <span class="skill-lbl">🎯 Finalização</span>
            <span class="skill-num">${(j.skills.chu || 3).toFixed(1)}</span>
          </div>
          <div class="skill-row">
            <span class="skill-lbl">👟 Passe</span>
            <span class="skill-num">${(j.skills.pas || 3).toFixed(1)}</span>
          </div>
          <div class="skill-row">
            <span class="skill-lbl">🌀 Drible</span>
            <span class="skill-num">${(j.skills.dri || 3).toFixed(1)}</span>
          </div>
          <div class="skill-row">
            <span class="skill-lbl">🛡️ Marcação</span>
            <span class="skill-num">${(j.skills.def || 3).toFixed(1)}</span>
          </div>
          <div class="skill-row">
            <span class="skill-lbl">💪 Força</span>
            <span class="skill-num">${(j.skills.fis || 3).toFixed(1)}</span>
          </div>
        </div>

        <!-- Botões de Ação -->
        <div class="card-actions-bar">
          <button class="card-action-btn" onclick="abrirEdicaoJogador('${j.id}')">✏️ Editar</button>
          <button class="card-action-btn del" onclick="removerJogador('${j.id}')">🗑️ Excluir</button>
        </div>
      </div>
    `;
  }).join('');
}

// Remover jogador
function removerJogador(id) {
  if (confirm("Deseja remover este atleta do baba?")) {
    let lista = obterJogadores();
    lista = lista.filter(j => j.id !== id);
    salvarJogadores(lista);
    renderizarCatalogoCartas();
    atualizarDashboard();
    mostrarNotificacao("Atleta removido com sucesso!");
  }
}
