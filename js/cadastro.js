/**
 * cadastro.js - Cadastro e Edição de Jogadores com Avaliação por Estrelas
 * Chico B.E.T - IFBA Eunápolis
 */

let idJogadorEditando = null;
let fotoTempBase64 = "";

// Inicialização dos eventos do formulário e modal
function inicializarCadastro() {
  const modal = document.getElementById('player-modal');
  const btnNovo = document.getElementById('btn-novo-jogador');
  const btnNovoHero = document.getElementById('btn-novo-jogador-hero');
  const btnFechar = document.getElementById('modal-close-btn');
  const btnCancelar = document.getElementById('btn-cancelar-modal');
  const form = document.getElementById('player-form');

  if (btnNovo) btnNovo.addEventListener('click', abrirModalNovo);
  if (btnNovoHero) btnNovoHero.addEventListener('click', abrirModalNovo);
  if (btnFechar) btnFechar.addEventListener('click', fecharModal);
  if (btnCancelar) btnCancelar.addEventListener('click', fecharModal);

  // Fecha clicando no fundo escuro
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) fecharModal();
    });
  }

  // Atualização em tempo real das estrelas nos sliders
  const sliders = ['vel', 'chu', 'pas', 'dri', 'def', 'fis'];
  sliders.forEach(s => {
    const input = document.getElementById(`attr-${s}`);
    const display = document.getElementById(`val-${s}`);
    if (input && display) {
      input.addEventListener('input', () => {
        display.textContent = parseFloat(input.value).toFixed(1);
        atualizarPrevisaoEstrelas();
      });
    }
  });

  const selectPos = document.getElementById('player-posicao');
  if (selectPos) {
    selectPos.addEventListener('change', atualizarPrevisaoEstrelas);
  }

  // Upload simples de foto
  const inputFoto = document.getElementById('player-photo-input');
  if (inputFoto) {
    inputFoto.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const leitor = new FileReader();
        leitor.onload = (evento) => {
          fotoTempBase64 = evento.target.result;
          document.getElementById('player-photo-preview').src = fotoTempBase64;
        };
        leitor.readAsDataURL(file);
      }
    });
  }

  // Salvar formulário
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      salvarDadosJogador();
    });
  }
}

// Atualiza o display das estrelas no topo do modal
function atualizarPrevisaoEstrelas() {
  const pos = document.getElementById('player-posicao').value;
  const skills = {
    vel: parseFloat(document.getElementById('attr-vel').value) || 3,
    chu: parseFloat(document.getElementById('attr-chu').value) || 3,
    pas: parseFloat(document.getElementById('attr-pas').value) || 3,
    dri: parseFloat(document.getElementById('attr-dri').value) || 3,
    def: parseFloat(document.getElementById('attr-def').value) || 3,
    fis: parseFloat(document.getElementById('attr-fis').value) || 3,
  };

  const estrelas = calcularEstrelas(pos, skills);
  const display = document.getElementById('modal-overall-preview');
  if (display) {
    display.textContent = estrelas.toFixed(1) + " ⭐";
  }
}

// Abrir modal limpo para novo atleta
function abrirModalNovo() {
  idJogadorEditando = null;
  fotoTempBase64 = "";

  document.getElementById('modal-title').textContent = "Cadastrar Atleta do IFBA";
  document.getElementById('player-form').reset();
  document.getElementById('player-photo-preview').src = obterFotoJogador("");

  ['vel', 'chu', 'pas', 'dri', 'def', 'fis'].forEach(s => {
    document.getElementById(`attr-${s}`).value = 3.5;
    document.getElementById(`val-${s}`).textContent = "3.5";
  });

  atualizarPrevisaoEstrelas();
  document.getElementById('player-modal').classList.add('active');
}

// Abrir modal preenchido para edição
function abrirEdicaoJogador(id) {
  const lista = obterJogadores();
  const jogador = lista.find(j => j.id === id);
  if (!jogador) return;

  idJogadorEditando = id;
  fotoTempBase64 = jogador.foto || "";

  document.getElementById('modal-title').textContent = `Editar: ${jogador.nome}`;
  document.getElementById('player-nome').value = jogador.nome;
  document.getElementById('player-apelido').value = jogador.apelido || "";
  document.getElementById('player-posicao').value = jogador.posicao;
  document.getElementById('player-perna').value = jogador.perna || "Destro";
  document.getElementById('player-photo-preview').src = obterFotoJogador(jogador.foto);

  ['vel', 'chu', 'pas', 'dri', 'def', 'fis'].forEach(s => {
    const val = jogador.skills[s] || 3;
    document.getElementById(`attr-${s}`).value = val;
    document.getElementById(`val-${s}`).textContent = parseFloat(val).toFixed(1);
  });

  atualizarPrevisaoEstrelas();
  document.getElementById('player-modal').classList.add('active');
}

function fecharModal() {
  document.getElementById('player-modal').classList.remove('active');
  idJogadorEditando = null;
  fotoTempBase64 = "";
}

// Salva o atleta no LocalStorage
function salvarDadosJogador() {
  const nome = document.getElementById('player-nome').value.trim();
  const apelido = document.getElementById('player-apelido').value.trim();
  const posicao = document.getElementById('player-posicao').value;
  const perna = document.getElementById('player-perna').value;

  if (!nome) {
    alert("Por favor, digite o nome do jogador!");
    return;
  }

  const skills = {
    vel: parseFloat(document.getElementById('attr-vel').value) || 3,
    chu: parseFloat(document.getElementById('attr-chu').value) || 3,
    pas: parseFloat(document.getElementById('attr-pas').value) || 3,
    dri: parseFloat(document.getElementById('attr-dri').value) || 3,
    def: parseFloat(document.getElementById('attr-def').value) || 3,
    fis: parseFloat(document.getElementById('attr-fis').value) || 3,
  };

  const estrelas = calcularEstrelas(posicao, skills);
  let lista = obterJogadores();

  if (idJogadorEditando) {
    // Edição de jogador existente
    const index = lista.findIndex(j => j.id === idJogadorEditando);
    if (index !== -1) {
      lista[index].nome = nome;
      lista[index].apelido = apelido;
      lista[index].posicao = posicao;
      lista[index].perna = perna;
      lista[index].skills = skills;
      lista[index].estrelas = estrelas;
      if (fotoTempBase64 !== "") {
        lista[index].foto = fotoTempBase64;
      }
      mostrarNotificacao(`Atleta ${nome} atualizado!`);
    }
  } else {
    // Novo cadastro
    const novo = {
      id: "jog-" + Date.now(),
      nome: nome,
      apelido: apelido,
      posicao: posicao,
      perna: perna,
      foto: fotoTempBase64,
      skills: skills,
      estrelas: estrelas
    };
    lista.unshift(novo);
    mostrarNotificacao(`Atleta ${nome} cadastrado!`);
  }

  salvarJogadores(lista);
  fecharModal();
  renderizarCatalogoCartas();
  atualizarDashboard();
}
