/**
 * cadastro.js — Formulário e Modal de Criação e Edição de Atletas
 * Chico B.E.T — IFBA Eunápolis
 */

var idEmEdicao = null;
var fotoTempBase64 = "";

function iniciarCadastro() {
  var modal = document.getElementById("modal-cadastro");
  var btnNovo = document.getElementById("btn-novo-jogador");
  var btnNovoHero = document.getElementById("btn-novo-jogador-hero");
  var btnFechar = document.getElementById("modal-fechar");
  var btnCancelar = document.getElementById("btn-cancelar-modal");
  var form = document.getElementById("form-jogador");

  if (btnNovo) btnNovo.addEventListener("click", abrirModalNovo);
  if (btnNovoHero) btnNovoHero.addEventListener("click", abrirModalNovo);
  if (btnFechar) btnFechar.addEventListener("click", fecharModal);
  if (btnCancelar) btnCancelar.addEventListener("click", fecharModal);

  if (modal) {
    modal.addEventListener("click", function(e) {
      if (e.target === modal) fecharModal();
    });
  }

  // Sliders de atributos (escala 1 a 99)
  var attrs = ["rit", "fin", "pas", "dri", "def", "fis"];
  attrs.forEach(function(a) {
    var input = document.getElementById("attr-" + a);
    var display = document.getElementById("val-" + a);
    if (input && display) {
      input.addEventListener("input", function() {
        display.textContent = input.value;
        atualizarPrevisaoOVR();
      });
    }
  });

  var selectPos = document.getElementById("player-pos");
  if (selectPos) {
    selectPos.addEventListener("change", atualizarPrevisaoOVR);
  }

  // Upload de foto
  var inputFoto = document.getElementById("player-photo");
  if (inputFoto) {
    inputFoto.addEventListener("change", function(e) {
      var file = e.target.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = function(evt) {
          fotoTempBase64 = evt.target.result;
          document.getElementById("photo-preview").src = fotoTempBase64;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Submissão do formulário
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      salvarJogador();
    });
  }
}

function atualizarPrevisaoOVR() {
  var pos = document.getElementById("player-pos").value;
  var stats = {
    rit: parseInt(document.getElementById("attr-rit").value) || 60,
    fin: parseInt(document.getElementById("attr-fin").value) || 60,
    pas: parseInt(document.getElementById("attr-pas").value) || 60,
    dri: parseInt(document.getElementById("attr-dri").value) || 60,
    def: parseInt(document.getElementById("attr-def").value) || 60,
    fis: parseInt(document.getElementById("attr-fis").value) || 60
  };

  var ovr = calcularOVR(pos, stats);
  var display = document.getElementById("modal-ovr-live");
  if (display) display.textContent = ovr;
}

function abrirModalNovo() {
  idEmEdicao = null;
  fotoTempBase64 = "";

  document.getElementById("modal-titulo").textContent = "Cadastrar Atleta";
  document.getElementById("form-jogador").reset();
  document.getElementById("photo-preview").src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23555b66'><circle cx='50' cy='35' r='20'/><path d='M18 85 C18 60 82 60 82 85 Z'/></svg>";

  var attrs = ["rit", "fin", "pas", "dri", "def", "fis"];
  attrs.forEach(function(a) {
    document.getElementById("attr-" + a).value = 70;
    document.getElementById("val-" + a).textContent = "70";
  });

  atualizarPrevisaoOVR();
  document.getElementById("modal-cadastro").classList.add("active");
}

function editarJogador(id) {
  var lista = carregarJogadores();
  var j = lista.find(function(item) { return item.id === id; });
  if (!j) return;

  idEmEdicao = id;
  fotoTempBase64 = j.foto || "";

  document.getElementById("modal-titulo").textContent = "Editar: " + j.nome;
  document.getElementById("player-name-in").value = j.nome;
  document.getElementById("player-nick-in").value = j.apelido || "";
  document.getElementById("player-pos").value = j.posicao;
  document.getElementById("player-perna-in").value = j.perna || "R";
  document.getElementById("player-origem-in").value = j.origem || "Eunápolis";
  document.getElementById("player-pais-in").value = j.bandeira || "BR";
  var catInput = document.getElementById("player-cat-in");
  if (catInput) catInput.value = j.categoria || "mensalista";

  if (j.foto) {
    document.getElementById("photo-preview").src = j.foto;
  } else {
    document.getElementById("photo-preview").src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23555b66'><circle cx='50' cy='35' r='20'/><path d='M18 85 C18 60 82 60 82 85 Z'/></svg>";
  }

  var attrs = ["rit", "fin", "pas", "dri", "def", "fis"];
  attrs.forEach(function(a) {
    var val = j.stats[a] || 60;
    document.getElementById("attr-" + a).value = val;
    document.getElementById("val-" + a).textContent = val;
  });

  atualizarPrevisaoOVR();
  document.getElementById("modal-cadastro").classList.add("active");
}

function fecharModal() {
  document.getElementById("modal-cadastro").classList.remove("active");
  idEmEdicao = null;
  fotoTempBase64 = "";
}

function salvarJogador() {
  var nome = document.getElementById("player-name-in").value.trim();
  var apelido = document.getElementById("player-nick-in").value.trim();
  var posicao = document.getElementById("player-pos").value;
  var perna = document.getElementById("player-perna-in").value;
  var origem = document.getElementById("player-origem-in").value.trim() || "Eunápolis";
  var bandeira = document.getElementById("player-pais-in").value;
  var categoria = document.getElementById("player-cat-in") ? document.getElementById("player-cat-in").value : "mensalista";
  var pais = bandeira === "AO" ? "Angola" : "Brasil";

  if (!nome) {
    alert("Informe o nome do jogador!");
    return;
  }

  var stats = {
    rit: parseInt(document.getElementById("attr-rit").value) || 60,
    fin: parseInt(document.getElementById("attr-fin").value) || 60,
    pas: parseInt(document.getElementById("attr-pas").value) || 60,
    dri: parseInt(document.getElementById("attr-dri").value) || 60,
    def: parseInt(document.getElementById("attr-def").value) || 60,
    fis: parseInt(document.getElementById("attr-fis").value) || 60
  };

  var ovr = calcularOVR(posicao, stats);
  var lista = carregarJogadores();

  if (idEmEdicao) {
    var idx = lista.findIndex(function(j) { return j.id === idEmEdicao; });
    if (idx !== -1) {
      lista[idx].nome = nome;
      lista[idx].apelido = apelido;
      lista[idx].posicao = posicao;
      lista[idx].perna = perna;
      lista[idx].origem = origem;
      lista[idx].bandeira = bandeira;
      lista[idx].pais = pais;
      lista[idx].categoria = categoria;
      lista[idx].stats = stats;
      lista[idx].ovr = ovr;
      if (fotoTempBase64 !== "") {
        lista[idx].foto = fotoTempBase64;
      }
      notify("Atleta " + nome + " atualizado.");
    }
  } else {
    var novo = {
      id: "j-" + Date.now(),
      nome: nome,
      apelido: apelido,
      posicao: posicao,
      perna: perna,
      origem: origem,
      bandeira: bandeira,
      pais: pais,
      categoria: categoria,
      time: "IFBA Eunápolis",
      foto: fotoTempBase64,
      stats: stats,
      ovr: ovr
    };
    lista.unshift(novo);
    notify("Atleta " + nome + " cadastrado no elenco.");
  }

  guardarJogadores(lista);
  fecharModal();
  renderizarCartas();
  atualizarDashboard();
}
