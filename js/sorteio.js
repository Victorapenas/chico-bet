/**
 * sorteio.js — Algoritmo de Sorteio e Campo Tático estilo 7a0.com.br
 * Chico B.E.T — IFBA Eunápolis
 *
 * Regra da Quadra: 1 Goleiro + 5 Linha (6 por equipe)
 * Posições táticas: GOL, ZAG E, ZAG D, ALA E, ALA D, PIVÔ
 */

var confirmadosIds = new Set();
var times = [];
var timeAtivoCampo = 0; // 0 = Time A, 1 = Time B

function iniciarSorteio() {
  var btnTodos = document.getElementById("btn-marcar-todos");
  var btnNenhum = document.getElementById("btn-desmarcar-todos");
  var btnSortear = document.getElementById("btn-executar-sorteio");
  var btnRefazer = document.getElementById("btn-refazer-sorteio");
  var btnWhats = document.getElementById("btn-whats");

  if (btnTodos) {
    btnTodos.addEventListener("click", function() {
      carregarJogadores().forEach(function(j) { confirmadosIds.add(j.id); });
      renderizarPresenca();
    });
  }

  if (btnNenhum) {
    btnNenhum.addEventListener("click", function() {
      confirmadosIds.clear();
      renderizarPresenca();
    });
  }

  if (btnSortear) btnSortear.addEventListener("click", sortearEquipes);
  if (btnRefazer) btnRefazer.addEventListener("click", sortearEquipes);
  if (btnWhats) btnWhats.addEventListener("click", compartilharWhatsApp);

  // Inicializa marcando todos
  carregarJogadores().forEach(function(j) { confirmadosIds.add(j.id); });
  renderizarPresenca();
}

function renderizarPresenca() {
  var container = document.getElementById("lista-presenca");
  var countEl = document.getElementById("count-presentes");
  var prevEl = document.getElementById("count-previsao");
  if (!container) return;

  var jogadores = carregarJogadores();
  var total = confirmadosIds.size;

  if (countEl) countEl.textContent = total;
  if (prevEl) {
    var qtdTimes = Math.floor(total / 6);
    prevEl.innerHTML = "Regra da Quadra: 1 Goleiro + 5 Linha &bull; <strong>" + qtdTimes + " equipes</strong> de 6 atletas";
  }

  var html = "";
  for (var i = 0; i < jogadores.length; i++) {
    var j = jogadores[i];
    var sel = confirmadosIds.has(j.id);
    var foto = urlFoto(j.foto);

    html += '<div class="check-item ' + (sel ? 'on' : '') + '" onclick="togglePresenca(\'' + j.id + '\')">' +
      '<div class="check-left">' +
        '<div class="check-box">' + (sel ? '&#10003;' : '') + '</div>' +
        '<img src="' + (foto || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\' fill=\'%23555b66\'><circle cx=\'50\' cy=\'35\' r=\'20\'/><path d=\'M18 85 C18 60 82 60 82 85 Z\'/></svg>') + '" class="check-avatar" alt="' + j.nome + '">' +
        '<div class="check-info">' +
          '<div class="check-name">' + j.nome + (j.apelido ? ' (' + j.apelido + ')' : '') + '</div>' +
          '<div class="check-meta">' +
            '<span class="pos-badge pos-' + j.posicao + '">' + j.posicao + '</span>' +
            '<span>' + (j.origem || 'Eunápolis') + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="check-ovr">' + j.ovr + '</div>' +
    '</div>';
  }
  container.innerHTML = html;
}

function togglePresenca(id) {
  if (confirmadosIds.has(id)) {
    confirmadosIds.delete(id);
  } else {
    confirmadosIds.add(id);
  }
  renderizarPresenca();
}

function sortearEquipes() {
  var todos = carregarJogadores();
  var selecionados = todos.filter(function(j) { return confirmadosIds.has(j.id); });

  if (selecionados.length < 10) {
    alert("Selecione pelo menos 10 atletas para dividir 2 equipes!");
    return;
  }

  var qtdTimes = Math.max(2, Math.floor(selecionados.length / 6));

  var goleiros = selecionados.filter(function(j) { return j.posicao === "GOL"; });
  var linha = selecionados.filter(function(j) { return j.posicao !== "GOL"; });

  var novosTimes = [];
  for (var i = 0; i < qtdTimes; i++) {
    novosTimes.push({
      nome: "Time " + String.fromCharCode(65 + i),
      jogadores: [],
      somaOvr: 0,
      mediaOvr: 0
    });
  }

  // 1. Distribui goleiros proporcionalmente (1 para cada time)
  goleiros.sort(function(a, b) { return b.ovr - a.ovr; });
  goleiros.forEach(function(gk, idx) {
    var tIdx = idx % qtdTimes;
    novosTimes[tIdx].jogadores.push(gk);
    novosTimes[tIdx].somaOvr += gk.ovr;
  });

  // 2. Distribui linha equilibrando o OVR
  linha.sort(function(a, b) { return b.ovr - a.ovr; });

  linha.forEach(function(atleta) {
    novosTimes.sort(function(t1, t2) {
      if (t1.jogadores.length !== t2.jogadores.length) {
        return t1.jogadores.length - t2.jogadores.length;
      }
      return t1.somaOvr - t2.somaOvr;
    });

    novosTimes[0].jogadores.push(atleta);
    novosTimes[0].somaOvr += atleta.ovr;
  });

  // 3. Calcula médias
  novosTimes.forEach(function(t) {
    t.mediaOvr = t.jogadores.length > 0 ? Math.round(t.somaOvr / t.jogadores.length) : 0;
  });

  novosTimes.sort(function(a, b) { return a.nome.localeCompare(b.nome); });

  times = novosTimes;
  timeAtivoCampo = 0;

  renderizarResultados();
  irPara("resultado");
  notify("Equipes sorteadas com equilíbrio de Overall.");
}

function renderizarResultados() {
  var tabsContainer = document.getElementById("field-tabs-wrap");
  var cardsContainer = document.getElementById("teams-grid-wrap");
  var statusText = document.getElementById("balance-status-text");

  if (times.length === 0) return;

  var medias = times.map(function(t) { return t.mediaOvr; });
  var diff = Math.max.apply(null, medias) - Math.min.apply(null, medias);

  if (statusText) {
    statusText.innerHTML = "<strong>Equilíbrio Técnico:</strong> Diferença entre as equipes de <strong>" + diff + " OVR</strong> na quadra do IFBA.";
  }

  // Abas dos times
  if (tabsContainer) {
    var tabsHtml = "";
    for (var i = 0; i < times.length; i++) {
      tabsHtml += '<button class="field-tab ' + (i === timeAtivoCampo ? 'active' : '') + '" onclick="selecionarTimeCampo(' + i + ')">' +
        times[i].nome + ' (' + times[i].mediaOvr + ' OVR)' +
      '</button>';
    }
    tabsContainer.innerHTML = tabsHtml;
  }

  // Desenha no campo 7a0
  desenharCampo7a0(times[timeAtivoCampo]);

  // Cards dos times
  if (cardsContainer) {
    var html = "";
    for (var i = 0; i < times.length; i++) {
      var t = times[i];
      html += '<div class="team-box">' +
        '<div class="team-head">' +
          '<h4>' + t.nome + '</h4>' +
          '<span class="team-ovr">Média: ' + t.mediaOvr + ' OVR</span>' +
        '</div>' +
        '<div class="team-list">';
      for (var j = 0; j < t.jogadores.length; j++) {
        var p = t.jogadores[j];
        html += '<div class="team-row ' + (p.posicao === 'GOL' ? 'gk' : '') + '">' +
          '<div>' +
            '<span class="pos-badge pos-' + p.posicao + '" style="font-size:0.65rem; margin-right:6px;">' + p.posicao + '</span>' +
            '<strong>' + p.nome + '</strong>' +
          '</div>' +
          '<span class="team-row-ovr">' + p.ovr + '</span>' +
        '</div>';
      }
      html += '</div></div>';
    }
    cardsContainer.innerHTML = html;
  }
}

function selecionarTimeCampo(indice) {
  timeAtivoCampo = indice;
  renderizarResultados();
}

function desenharCampo7a0(time) {
  var pitch = document.getElementById("pitch-slots");
  if (!pitch || !time) return;

  var lista = time.jogadores.slice();

  var gol = lista.find(function(j) { return j.posicao === "GOL"; });
  var zags = lista.filter(function(j) { return j.posicao === "ZAG"; });
  var alas = lista.filter(function(j) { return j.posicao === "ALA" || j.posicao === "MEI"; });
  var atas = lista.filter(function(j) { return j.posicao === "ATA"; });

  var outros = lista.filter(function(j) {
    return j !== gol && zags.indexOf(j) === -1 && alas.indexOf(j) === -1 && atas.indexOf(j) === -1;
  });

  function pegarUm() {
    return outros.shift() || atas.pop() || alas.pop() || zags.pop() || null;
  }

  var slots = [
    { a: gol || pegarUm(), c: "pos-gol", lbl: "GOL" },
    { a: zags.shift() || pegarUm(), c: "pos-zag-e", lbl: "ZAG" },
    { a: zags.shift() || pegarUm(), c: "pos-zag-d", lbl: "ZAG" },
    { a: alas.shift() || pegarUm(), c: "pos-ala-e", lbl: "ALA" },
    { a: alas.shift() || pegarUm(), c: "pos-ala-d", lbl: "ALA" },
    { a: atas.shift() || pegarUm(), c: "pos-pivo", lbl: "PIVÔ" }
  ];

  var html = "";
  for (var i = 0; i < slots.length; i++) {
    var s = slots[i];
    var atleta = s.a;

    if (!atleta) {
      html += '<div class="slot ' + s.c + '">' +
        '<div class="slot-photo empty"></div>' +
        '<div class="slot-tag">' + s.lbl + '</div>' +
      '</div>';
    } else {
      var foto = urlFoto(atleta.foto);
      html += '<div class="slot ' + s.c + '">' +
        '<div class="slot-photo">' +
          (foto ? '<img src="' + foto + '" alt="' + atleta.nome + '">' : '<span style="color:#fff; font-size:0.7rem; font-weight:800; display:flex; align-items:center; justify-content:center; height:100%;">' + atleta.posicao + '</span>') +
        '</div>' +
        '<div class="slot-tag">' +
          (atleta.apelido || atleta.nome.split(" ")[0]) +
          '<span class="tag-ovr">' + atleta.ovr + '</span>' +
        '</div>' +
      '</div>';
    }
  }
  pitch.innerHTML = html;
}

function compartilharWhatsApp() {
  if (times.length === 0) return;

  var msg = "*ESCALAÇÃO OFICIAL DO BABA — IFBA EUNÁPOLIS*%0A";
  msg += "Sorteio balanceado na quadra poliesportiva (1 Goleiro + 5 Linha)%0A%0A";

  for (var i = 0; i < times.length; i++) {
    var t = times[i];
    msg += "*" + t.nome.toUpperCase() + "* (Média: " + t.mediaOvr + " OVR)%0A";
    for (var j = 0; j < t.jogadores.length; j++) {
      var p = t.jogadores[j];
      var tag = p.posicao === "GOL" ? "[GOL]" : "[" + p.posicao + "]";
      msg += tag + " " + p.nome + (p.apelido ? ' "' + p.apelido + '"' : '') + " — " + p.ovr + " OVR%0A";
    }
    msg += "%0A";
  }

  msg += "Local: Quadra Poliesportiva do IFBA Eunápolis";
  window.open("https://api.whatsapp.com/send?text=" + msg, "_blank");
}
