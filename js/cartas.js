/**
 * cartas.js - Renderização Dinâmica e Filtros do Catálogo de Cartas FUT
 * Chico B.E.T - IFBA Eunápolis
 */

const CartasManager = {
  filtroPosicao: 'TODOS',
  filtroBusca: '',

  init() {
    this.configurarFiltros();
    this.renderizarElenco();
  },

  configurarFiltros() {
    // Chips de posição
    const chips = document.querySelectorAll('.chip-btn');
    chips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        chips.forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        this.filtroPosicao = e.target.getAttribute('data-pos') || 'TODOS';
        this.renderizarElenco();
      });
    });

    // Campo de busca
    const inputBusca = document.getElementById('search-player-input');
    if (inputBusca) {
      inputBusca.addEventListener('input', (e) => {
        this.filtroBusca = e.target.value.trim().toLowerCase();
        this.renderizarElenco();
      });
    }
  },

  renderizarElenco() {
    const grid = document.getElementById('cards-grid-container');
    if (!grid) return;

    const jogadores = obterJogadores();

    // Aplica filtros de posição e texto
    const filtrados = jogadores.filter(jogador => {
      const matchPos = this.filtroPosicao === 'TODOS' || jogador.posicao === this.filtroPosicao;
      const matchNome = !this.filtroBusca || 
        jogador.nome.toLowerCase().includes(this.filtroBusca) || 
        (jogador.apelido && jogador.apelido.toLowerCase().includes(this.filtroBusca));

      return matchPos && matchNome;
    });

    if (filtrados.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px 16px; color: var(--text-muted);">
          <p style="font-size: 2.5rem; margin-bottom: 8px;">⚽</p>
          <h4>Nenhum atleta encontrado</h4>
          <p style="font-size: 0.9rem; margin-top: 4px;">Tente alterar os filtros ou cadastre um novo jogador para o baba!</p>
        </div>
      `;
      return;
    }

    // Renderiza cada carta FUT
    grid.innerHTML = filtrados.map(jogador => this.criarCardHTML(jogador)).join('');

    // Adiciona event listeners nas ações das cartas
    this.configurarAcoesCartas();
  },

  criarCardHTML(j) {
    const tier = obterTierCarta(j.overall);
    const footShort = j.perna ? j.perna.charAt(0).toUpperCase() : 'D';

    return `
      <div class="fut-card ${tier}" data-id="${j.id}">
        <!-- Ações Rápidas (Editar / Excluir) -->
        <div class="fut-card-actions">
          <button class="fut-action-btn edit-btn" title="Editar Atleta" data-id="${j.id}">✏️</button>
          <button class="fut-action-btn delete delete-btn" title="Excluir Atleta" data-id="${j.id}">🗑️</button>
        </div>

        <!-- Cabeçalho da Carta -->
        <div class="fut-header">
          <div class="fut-ovr">${j.overall.toFixed(1)}</div>
          <div class="fut-pos">${j.posicao}</div>
          <div class="fut-foot" title="Perna: ${j.perna}">${footShort}</div>
        </div>

        <!-- Foto ou Avatar do Atleta -->
        <div class="fut-photo-container">
          <img src="${j.foto || gerarAvatarSVG(j.nome)}" alt="${j.nome}" class="fut-photo" loading="lazy" />
        </div>

        <!-- Nome e Apelido -->
        <div class="fut-name-box">
          <div class="fut-name">${j.apelido || j.nome}</div>
          ${j.apelido ? `<span class="fut-nickname">${j.nome}</span>` : ''}
        </div>

        <!-- Atributos Chave (Notas 1 a 10) -->
        <div class="fut-stats">
          <div class="fut-stat-item">
            <span class="fut-stat-val">${j.atributos.vel.toFixed(1)}</span>
            <span class="fut-stat-lbl">VEL</span>
          </div>
          <div class="fut-stat-item">
            <span class="fut-stat-val">${j.atributos.chu.toFixed(1)}</span>
            <span class="fut-stat-lbl">CHU</span>
          </div>
          <div class="fut-stat-item">
            <span class="fut-stat-val">${j.atributos.pas.toFixed(1)}</span>
            <span class="fut-stat-lbl">PAS</span>
          </div>
          <div class="fut-stat-item">
            <span class="fut-stat-val">${j.atributos.def.toFixed(1)}</span>
            <span class="fut-stat-lbl">DEF</span>
          </div>
          <div class="fut-stat-item" style="grid-column: span 2; justify-content: center;">
            <span class="fut-stat-val">${j.atributos.fis.toFixed(1)}</span>
            <span class="fut-stat-lbl">FIS</span>
          </div>
        </div>
      </div>
    `;
  },

  configurarAcoesCartas() {
    // Editar atleta
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (typeof CadastroManager !== 'undefined') {
          CadastroManager.abrirModalEdicao(id);
        }
      });
    });

    // Excluir atleta
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (confirm("Tem certeza que deseja remover este atleta do elenco?")) {
          const jogadores = obterJogadores().filter(j => j.id !== id);
          salvarJogadores(jogadores);
          mostrarToast("Jogador removido do elenco", "warning");
          this.renderizarElenco();
          if (typeof atualizarEstatisticasDashboard === 'function') {
            atualizarEstatisticasDashboard();
          }
        }
      });
    });
  }
};
