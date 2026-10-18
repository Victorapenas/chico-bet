/**
 * sorteio.js - Algoritmo de Sorteio Balanceado e Renderização dos Resultados (RF03, RNF02)
 * Chico B.E.T - IFBA Eunápolis
 */

const SorteioManager = {
  jogadoresConfirmadosIds: new Set(),
  jogadoresPorTime: 6,
  timesSorteados: [],

  init() {
    this.configurarAcoesToolbar();
    this.configurarSeletorTamanho();
    this.configurarBotoesAcao();
  },

  iniciarSetup() {
    const jogadores = obterJogadores();

    // Se estiver vazio, seleciona os primeiros por padrão
    if (this.jogadoresConfirmadosIds.size === 0) {
      jogadores.forEach(j => this.jogadoresConfirmadosIds.add(j.id));
    }

    this.renderizarListaPresenca();
    this.atualizarContadorPresenca();
  },

  configurarAcoesToolbar() {
    const btnTodos = document.getElementById('btn-selecionar-todos');
    const btnNenhum = document.getElementById('btn-desmarcar-todos');

    if (btnTodos) {
      btnTodos.addEventListener('click', () => {
        const jogadores = obterJogadores();
        jogadores.forEach(j => this.jogadoresConfirmadosIds.add(j.id));
        this.renderizarListaPresenca();
        this.atualizarContadorPresenca();
      });
    }

    if (btnNenhum) {
      btnNenhum.addEventListener('click', () => {
        this.jogadoresConfirmadosIds.clear();
        this.renderizarListaPresenca();
        this.atualizarContadorPresenca();
      });
    }
  },

  configurarSeletorTamanho() {
    const pills = document.querySelectorAll('.size-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        pills.forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        this.jogadoresPorTime = parseInt(e.target.getAttribute('data-size')) || 6;
        this.atualizarContadorPresenca();
      });
    });
  },

  configurarBotoesAcao() {
    const btnSortear = document.getElementById('btn-executar-sorteio');
    const btnSortearDeNovo = document.getElementById('btn-refazer-sorteio');
    const btnCompartilhar = document.getElementById('btn-compartilhar-whatsapp');

    if (btnSortear) {
      btnSortear.addEventListener('click', () => this.executarSorteio());
    }

    if (btnSortearDeNovo) {
      btnSortearDeNovo.addEventListener('click', () => this.executarSorteio());
    }

    if (btnCompartilhar) {
      btnCompartilhar.addEventListener('click', () => this.compartilharWhatsApp());
    }
  },

  renderizarListaPresenca() {
    const container = document.getElementById('attendance-list-container');
    if (!container) return;

    const jogadores = obterJogadores();

    container.innerHTML = jogadores.map(j => {
      const isSelected = this.jogadoresConfirmadosIds.has(j.id);
      return `
        <div class="attendance-item ${isSelected ? 'selected' : ''}" data-id="${j.id}">
          <div class="attendee-left">
            <div class="checkbox-custom">✓</div>
            <img src="${j.foto || gerarAvatarSVG(j.nome)}" alt="${j.nome}" class="attendee-avatar" />
            <div class="attendee-details">
              <div class="attendee-name">${j.nome} ${j.apelido ? `(${j.apelido})` : ''}</div>
              <div class="attendee-meta">
                <span class="badge-pos pos-${j.posicao}">${j.posicao}</span>
                <span>Perna: ${j.perna}</span>
              </div>
            </div>
          </div>
          <div class="attendee-ovr-badge">${j.overall.toFixed(1)} OVR</div>
        </div>
      `;
    }).join('');

    // Adiciona evento de clique em cada item de presença
    container.querySelectorAll('.attendance-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        if (this.jogadoresConfirmadosIds.has(id)) {
          this.jogadoresConfirmadosIds.delete(id);
          item.classList.remove('selected');
        } else {
          this.jogadoresConfirmadosIds.add(id);
          item.classList.add('selected');
        }
        this.atualizarContadorPresenca();
      });
    });
  },

  atualizarContadorPresenca() {
    const totalConfirmados = this.jogadoresConfirmadosIds.size;
    const qtdTimes = Math.floor(totalConfirmados / this.jogadoresPorTime);
    const sobras = totalConfirmados % this.jogadoresPorTime;

    const displayConfirmados = document.getElementById('count-confirmados');
    const displayPrevisao = document.getElementById('count-previsao-times');

    if (displayConfirmados) {
      displayConfirmados.textContent = totalConfirmados;
    }

    if (displayPrevisao) {
      if (qtdTimes < 2) {
        displayPrevisao.innerHTML = `<span style="color: var(--accent-red)">Mínimo de ${this.jogadoresPorTime * 2} atletas para formar 2 equipes.</span>`;
      } else {
        displayPrevisao.innerHTML = `Formará <strong>${qtdTimes} equipes de ${this.jogadoresPorTime}</strong> ${sobras > 0 ? `(+ ${sobras} suplente/próximo)` : ''}`;
      }
    }
  },

  executarSorteio() {
    const todos = obterJogadores();
    const selecionados = todos.filter(j => this.jogadoresConfirmadosIds.has(j.id));

    const total = selecionados.length;
    const qtdTimes = Math.max(2, Math.floor(total / this.jogadoresPorTime));

    if (total < qtdTimes * 2 && total < 4) {
      mostrarToast("Selecione atletas suficientes para dividir pelo menos 2 times!", "warning");
      return;
    }

    // Separação de Goleiros e Jogadores de Linha (Requisito RF03)
    const goleiros = selecionados.filter(j => j.posicao === 'GOL');
    const linha = selecionados.filter(j => j.posicao !== 'GOL');

    // Inicializa as estruturas dos times
    const times = Array.from({ length: qtdTimes }, (_, i) => ({
      numero: i + 1,
      nome: `Time ${String.fromCharCode(65 + i)}`, // Time A, Time B, Time C...
      corClasse: `team-color-${(i % 4) + 1}`,
      jogadores: [],
      overallTotal: 0,
      overallMedio: 0
    }));

    // 1. Distribuição Balanceada de Goleiros
    // Ordena goleiros por overall decrescente
    goleiros.sort((a, b) => b.overall - a.overall);
    goleiros.forEach((gk, idx) => {
      const timeIndex = idx % qtdTimes;
      times[timeIndex].jogadores.push(gk);
      times[timeIndex].overallTotal += gk.overall;
    });

    // 2. Distribuição Equilibrada de Jogadores de Linha (Algoritmo Guloso de Mínimo Overall)
    // Embaralha levemente jogadores com mesmo overall para não ficar viciado
    linha.sort((a, b) => {
      if (Math.abs(b.overall - a.overall) < 0.2) {
        return Math.random() - 0.5;
      }
      return b.overall - a.overall;
    });

    // Para cada atleta de linha, aloca no time com menor pontuação total/média atual
    linha.forEach(jogador => {
      // Encontra o time com menos jogadores que ainda não atingiu a cota,
      // ou o time com menor soma de Overall
      times.sort((t1, t2) => {
        // Prioriza quem tem menos jogadores
        if (t1.jogadores.length !== t2.jogadores.length) {
          return t1.jogadores.length - t2.jogadores.length;
        }
        // Em empate de jogadores, entrega pro time com menor Overall acumulado
        return t1.overallTotal - t2.overallTotal;
      });

      times[0].jogadores.push(jogador);
      times[0].overallTotal += jogador.overall;
    });

    // Ordena os times de volta pelo nome/número
    times.sort((a, b) => a.numero - b.numero);

    // Calcula as médias finais
    times.forEach(t => {
      t.overallMedio = t.jogadores.length > 0 ? (t.overallTotal / t.jogadores.length) : 0;
    });

    this.timesSorteados = times;

    // Renderiza os resultados e transiciona para a view
    this.renderizarResultados();
    Navegacao.navegarPara('sorteio-resultado');
    mostrarToast("Equipes sorteadas e equilibradas com sucesso! ⚖️⚽", "success");
  },

  renderizarResultados() {
    const container = document.getElementById('teams-grid-container');
    const balanceText = document.getElementById('balance-summary-text');
    if (!container) return;

    // Calcula diferença entre maior e menor média
    const medias = this.timesSorteados.map(t => t.overallMedio);
    const maiorMedia = Math.max(...medias);
    const menorMedia = Math.min(...medias);
    const diferenca = Math.round((maiorMedia - menorMedia) * 10) / 10;

    if (balanceText) {
      balanceText.innerHTML = `
        <h4>⚖️ Equilíbrio Perfeito!</h4>
        <p>Diferença máxima entre os elencos: <strong>${diferenca.toFixed(1)} OVR</strong>. Partida 100% nivelada e sem choro!</p>
      `;
    }

    container.innerHTML = this.timesSorteados.map(team => {
      return `
        <div class="team-card ${team.corClasse}">
          <div class="team-header">
            <span class="team-title">${team.nome}</span>
            <div class="team-avg-ovr">
              <span>${team.overallMedio.toFixed(1)}</span> OVR
            </div>
          </div>
          <div class="team-roster">
            ${team.jogadores.map(j => `
              <div class="roster-player ${j.posicao === 'GOL' ? 'is-gk' : ''}">
                <div class="roster-player-info">
                  <span class="badge-pos pos-${j.posicao}">${j.posicao}</span>
                  <span class="roster-player-name">${j.nome} ${j.apelido ? `"${j.apelido}"` : ''}</span>
                </div>
                <div class="roster-player-ovr">${j.overall.toFixed(1)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Atualiza campinho tático 2D se houver pelo menos 2 times
    this.renderizarCampoTatico();
  },

  renderizarCampoTatico() {
    const field = document.getElementById('tactical-field-preview');
    if (!field || this.timesSorteados.length < 2) return;

    const time1 = this.timesSorteados[0];
    const time2 = this.timesSorteados[1];

    field.innerHTML = `
      <div class="field-half">
        <h5 style="color: #4ade80; margin-bottom: 8px;">${time1.nome} (${time1.overallMedio.toFixed(1)})</h5>
        ${time1.jogadores.slice(0, 5).map(j => `
          <div class="field-player-pin">
            <span>${j.posicao}</span> ${j.apelido || j.nome.split(' ')[0]}
          </div>
        `).join('')}
      </div>
      <div class="field-divider">
        <div class="field-center-circle"></div>
      </div>
      <div class="field-half">
        <h5 style="color: #fbbf24; margin-bottom: 8px;">${time2.nome} (${time2.overallMedio.toFixed(1)})</h5>
        ${time2.jogadores.slice(0, 5).map(j => `
          <div class="field-player-pin" style="border-color: var(--accent-gold);">
            <span>${j.posicao}</span> ${j.apelido || j.nome.split(' ')[0]}
          </div>
        `).join('')}
      </div>
    `;
  },

  compartilharWhatsApp() {
    if (this.timesSorteados.length === 0) return;

    let texto = `⚽ *ESCALAÇÃO OFICIAL - CHICO B.E.T* 🏆%0A`;
    texto += `_Sorteio equilibrado de baba/pelada_%0A%0A`;

    this.timesSorteados.forEach(team => {
      texto += `*${team.nome.toUpperCase()}* (Média: ${team.overallMedio.toFixed(1)} OVR)%0A`;
      team.jogadores.forEach(j => {
        const gkIcon = j.posicao === 'GOL' ? '🧤 ' : '🏃 ';
        texto += `${gkIcon}[${j.posicao}] ${j.nome}${j.apelido ? ` "${j.apelido}"` : ''} (${j.overall.toFixed(1)})%0A`;
      });
      texto += `%0A`;
    });

    texto += `🔥 _Que vença o melhor! Resenha garantida!_`;

    const url = `https://api.whatsapp.com/send?text=${texto}`;
    window.open(url, '_blank');
  }
};
