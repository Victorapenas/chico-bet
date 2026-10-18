/**
 * cadastro.js - Gerenciamento de Cadastro e Edição de Jogadores (RF01, RF02)
 * Chico B.E.T - IFBA Eunápolis
 */

const CadastroManager = {
  jogadorEmEdicaoId: null,
  fotoBase64Temp: null,

  init() {
    this.configurarEventosModal();
    this.configurarSliders();
    this.configurarUploadFoto();
  },

  configurarEventosModal() {
    const modal = document.getElementById('player-modal');
    const btnNovo = document.getElementById('btn-novo-jogador');
    const btnNovoHero = document.getElementById('btn-novo-jogador-hero');
    const btnFechar = document.getElementById('modal-close-btn');
    const btnCancelar = document.getElementById('btn-cancelar-modal');
    const form = document.getElementById('player-form');

    const abrir = () => this.abrirModalCadastro();
    if (btnNovo) btnNovo.addEventListener('click', abrir);
    if (btnNovoHero) btnNovoHero.addEventListener('click', abrir);

    const fechar = () => this.fecharModal();
    if (btnFechar) btnFechar.addEventListener('click', fechar);
    if (btnCancelar) btnCancelar.addEventListener('click', fechar);

    // Fechar ao clicar fora
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) fechar();
      });
    }

    // Submissão do formulário
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.salvarJogador();
      });
    }
  },

  configurarSliders() {
    const attrs = ['vel', 'chu', 'pas', 'def', 'fis'];
    const posicaoSelect = document.getElementById('player-posicao');

    attrs.forEach(attr => {
      const slider = document.getElementById(`attr-${attr}`);
      const valDisplay = document.getElementById(`val-${attr}`);

      if (slider && valDisplay) {
        slider.addEventListener('input', () => {
          valDisplay.textContent = parseFloat(slider.value).toFixed(1);
          this.atualizarPrevisaoOverall();
        });
      }
    });

    if (posicaoSelect) {
      posicaoSelect.addEventListener('change', () => {
        this.atualizarPrevisaoOverall();
      });
    }
  },

  configurarUploadFoto() {
    const inputFoto = document.getElementById('player-photo-input');
    const imgPreview = document.getElementById('player-photo-preview');

    if (inputFoto && imgPreview) {
      inputFoto.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Limita o tamanho do arquivo a 2MB
        if (file.size > 2 * 1024 * 1024) {
          mostrarToast("A imagem deve ter menos de 2MB!", "warning");
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          this.fotoBase64Temp = event.target.result;
          imgPreview.src = this.fotoBase64Temp;
        };
        reader.readAsDataURL(file);
      });
    }
  },

  atualizarPrevisaoOverall() {
    const posicao = document.getElementById('player-posicao').value;
    const attrs = {
      vel: parseFloat(document.getElementById('attr-vel').value),
      chu: parseFloat(document.getElementById('attr-chu').value),
      pas: parseFloat(document.getElementById('attr-pas').value),
      def: parseFloat(document.getElementById('attr-def').value),
      fis: parseFloat(document.getElementById('attr-fis').value),
    };

    const ovr = calcularOverall(posicao, attrs);
    const ovrDisplay = document.getElementById('modal-overall-preview');
    if (ovrDisplay) {
      ovrDisplay.textContent = ovr.toFixed(1);
    }
  },

  abrirModalCadastro() {
    this.jogadorEmEdicaoId = null;
    this.fotoBase64Temp = null;

    document.getElementById('modal-title').textContent = "Cadastrar Novo Atleta";
    document.getElementById('player-form').reset();

    // Valores padrão médios
    ['vel', 'chu', 'pas', 'def', 'fis'].forEach(attr => {
      document.getElementById(`attr-${attr}`).value = 7.0;
      document.getElementById(`val-${attr}`).textContent = "7.0";
    });

    document.getElementById('player-photo-preview').src = gerarAvatarSVG("Novo Jogador");
    this.atualizarPrevisaoOverall();

    document.getElementById('player-modal').classList.add('active');
  },

  abrirModalEdicao(id) {
    const jogador = obterJogadores().find(j => j.id === id);
    if (!jogador) return;

    this.jogadorEmEdicaoId = id;
    this.fotoBase64Temp = jogador.foto || null;

    document.getElementById('modal-title').textContent = `Editar: ${jogador.nome}`;
    document.getElementById('player-nome').value = jogador.nome;
    document.getElementById('player-apelido').value = jogador.apelido || '';
    document.getElementById('player-posicao').value = jogador.posicao;
    document.getElementById('player-perna').value = jogador.perna || 'Destro';

    ['vel', 'chu', 'pas', 'def', 'fis'].forEach(attr => {
      const val = jogador.atributos[attr] || 5;
      document.getElementById(`attr-${attr}`).value = val;
      document.getElementById(`val-${attr}`).textContent = parseFloat(val).toFixed(1);
    });

    document.getElementById('player-photo-preview').src = jogador.foto || gerarAvatarSVG(jogador.nome);
    this.atualizarPrevisaoOverall();

    document.getElementById('player-modal').classList.add('active');
  },

  fecharModal() {
    document.getElementById('player-modal').classList.remove('active');
    this.jogadorEmEdicaoId = null;
    this.fotoBase64Temp = null;
  },

  salvarJogador() {
    const nome = document.getElementById('player-nome').value.trim();
    if (!nome) {
      mostrarToast("Informe o nome do jogador!", "warning");
      return;
    }

    const apelido = document.getElementById('player-apelido').value.trim();
    const posicao = document.getElementById('player-posicao').value;
    const perna = document.getElementById('player-perna').value;

    const atributos = {
      vel: parseFloat(document.getElementById('attr-vel').value),
      chu: parseFloat(document.getElementById('attr-chu').value),
      pas: parseFloat(document.getElementById('attr-pas').value),
      def: parseFloat(document.getElementById('attr-def').value),
      fis: parseFloat(document.getElementById('attr-fis').value),
    };

    const overall = calcularOverall(posicao, atributos);
    const foto = this.fotoBase64Temp || gerarAvatarSVG(apelido || nome);

    const jogadores = obterJogadores();

    if (this.jogadorEmEdicaoId) {
      // Edição
      const index = jogadores.findIndex(j => j.id === this.jogadorEmEdicaoId);
      if (index !== -1) {
        jogadores[index] = {
          ...jogadores[index],
          nome,
          apelido,
          posicao,
          perna,
          atributos,
          overall,
          foto: this.fotoBase64Temp || jogadores[index].foto || foto
        };
        salvarJogadores(jogadores);
        mostrarToast(`Atleta ${nome} atualizado com sucesso!`, "success");
      }
    } else {
      // Criação de novo atleta
      const novo = {
        id: gerarId(),
        nome,
        apelido,
        posicao,
        perna,
        atributos,
        overall,
        foto
      };
      jogadores.unshift(novo);
      salvarJogadores(jogadores);
      mostrarToast(`Atleta ${nome} convocado para o elenco!`, "success");
    }

    this.fecharModal();

    // Atualiza elenco e dashboard
    if (typeof CartasManager !== 'undefined') {
      CartasManager.renderizarElenco();
    }
    if (typeof atualizarEstatisticasDashboard === 'function') {
      atualizarEstatisticasDashboard();
    }
  }
};
