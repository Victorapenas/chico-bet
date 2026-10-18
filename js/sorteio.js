/**
 * sorteio.js — Algoritmo de Sorteio Inteligente do Baba do IFBA
 *
 * Resolve as dores reais da pelada:
 * 1. Prioridade para Mensalistas na titularidade; Convidados entram no revezamento.
 * 2. Correção da distorção do áudio: balanceamento por OVR MÉDIO por atleta (e não soma),
 *    evitando que equipes menores fiquem desproporcionalmente fortes ao receber reforço.
 * 3. Ordem de revezamento automática numerada (1º a sair/entrar, 2º a sair/entrar).
 * 4. Campo tático 7a0 ([7a0.com.br](https://7a0.com.br/)) com fotos e slots táticos.
 */

var confirmadosIds = new Set();
var times = [];
var bancoRevezamento = [];
var timeAtivoCampo = 0;
var tamanhoTimeDesejado = 6; // 6 = 1 Gol + 5 Linha; 5 = 1 Gol + 4 Linha

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

  // Modos de tamanho (6 ou 5 por time)
  var btnModo6 = document.getElementById("modo-6");
  var btnModo5 = document.getElementById("modo-5");

  if (btnModo6) {
    btnModo6.addEventListener("click", function() {
      tamanhoTimeDesejado = 6;
      btnModo6.classList.add("active");
      if (btnModo5) btnModo5.classList.remove("active");
      renderizarPresenca();
    });
  }

  if (btnModo5) {
    btnModo5.addEventListener("click", function() {
      tamanhoTimeDesejado = 5;
      btnModo5.classList.add("active");
      if (btnModo6) btnModo6.classList.remove("active");
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
    var qtdTimes = Math.floor(total / tamanhoTimeDesejado);
    var sobra = total % tamanhoTimeDesejado;
    var infoSobra = sobra > 0 ? " &bull; <span style='color:var(--gold);'>+" + sobra + " atleta(s) no revezamento</span>" : "";
    prevEl.innerHTML = "Times de " + tamanhoTimeDesejado + " &bull; <strong>" + qtdTimes + " equipes</strong>" + infoSobra;
  }

  var html = "";
  for (var i = 0; i < jogadores.length; i++) {
    var j = jogadores[i];
    var sel = confirmadosIds.has(j.id);
    var foto = urlFoto(j.foto);
    var cat = j.categoria || "mensalista";
    var catLabel = cat === "mensalista" ? "Mensalista" : "Convidado";

    html += '<div class="check-item ' + (sel ? 'on' : '') + '" onclick="togglePresenca(\'' + j.id + '\')">' +
      '<div class="check-left">' +
        '<div class="check-box">' + (sel ? '&#10003;' : '') + '</div>' +
        '<img src="' + (foto || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\' fill=\'%23555b66\'><circle cx=\'50\' cy=\'35\' r=\'20\'/><path d=\'M18 85 C18 60 82 60 82 85 Z\'/></svg>') + '" class="check-avatar" alt="' + j.nome + '">' +
        '<div class="check-info">' +
          '<div class="check-name">' + j.nome + (j.apelido ? ' (' + j.apelido + ')' : '') + '</div>' +
          '<div class="check-meta">' +
            '<span class="pos-badge pos-' + j.posicao + '">' + j.posicao + '</span>' +
            '<span class="badge-' + cat + '">' + catLabel + '</span>' +
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

/**
 * Algoritmo de Sorteio com Resolução das Dores do Baba
 */
function sortearEquipes() {
  var todos = carregarJogadores();
  var selecionados = todos.filter(function(j) { return confirmadosIds.has(j.id); });

  if (selecionados.length < (tamanhoTimeDesejado * 2 - 2)) {
    alert("Selecione pelo menos " + (tamanhoTimeDesejado * 2 - 2) + " atletas para dividir duas equipes!");
    return;
  }

  // 1. Quantidade de equipes completas
  var qtdTimes = Math.max(2, Math.floor(selecionados.length / tamanhoTimeDesejado));
  var totalTitularesVagas = qtdTimes * tamanhoTimeDesejado;

  // 2. Ordenação por Prioridade de Vaga:
  //    Mensalistas têm prioridade de titularidade em relação a Convidados
  selecionados.sort(function(a, b) {
    var catA = (a.categoria || "mensalista") === "mensalista" ? 1 : 0;
    var catB = (b.categoria || "mensalista") === "mensalista" ? 1 : 0;
    if (catA !== catB) return catB - catA; // Mensalista primeiro
    return b.ovr - a.ovr;
  });

  // Separação entre titulares das vagas e banco de revezamento geral (se houver excesso)
  var poolTitulares = selecionados.slice(0, totalTitularesVagas);
  var poolRevezamento = selecionados.slice(totalTitularesVagas);

  // 3. Separa Goleiros e Jogadores de Linha dos Titulares
  var goleiros = poolTitulares.filter(function(j) { return j.posicao === "GOL"; });
  var linha = poolTitulares.filter(function(j) { return j.posicao !== "GOL"; });

  // Inicializa os times
  var novosTimes = [];
  for (var i = 0; i < qtdTimes; i++) {
    novosTimes.push({
      nome: "Time " + String.fromCharCode(65 + i),
      jogadores: [],
      somaOvr: 0,
      mediaOvr: 0
    });
  }

  // 4. Distribuição Proporcional de Goleiros (1 por time)
  goleiros.sort(function(a, b) { return b.ovr - a.ovr; });
  goleiros.forEach(function(gk, idx) {
    var tIdx = idx % qtdTimes;
    novosTimes[tIdx].jogadores.push(gk);
    novosTimes[tIdx].somaOvr += gk.ovr;
  });

  // 5. Balanceamento Matemático por OVR MÉDIO (Resolve a dor do áudio)
  //    Ordena atletas de linha pelo OVR
  linha.sort(function(a, b) { return b.ovr - a.ovr; });

  linha.forEach(function(atleta) {
    // Aloca no time com menos jogadores ou, em empate, no time com menor média de OVR
    novosTimes.sort(function(t1, t2) {
      if (t1.jogadores.length !== t2.jogadores.length) {
        return t1.jogadores.length - t2.jogadores.length;
      }
      var m1 = t1.jogadores.length > 0 ? (t1.somaOvr / t1.jogadores.length) : 0;
      var m2 = t2.jogadores.length > 0 ? (t2.somaOvr / t2.jogadores.length) : 0;
      return m1 - m2;
    });

    novosTimes[0].jogadores.push(atleta);
    novosTimes[0].somaOvr += atleta.ovr;
  });

  // 6. Calcula a média final de OVR por time
  novosTimes.forEach(function(t) {
    t.mediaOvr = t.jogadores.length > 0 ? Math.round(t.somaOvr / t.jogadores.length) : 0;
  });

  novosTimes.sort(function(a, b) { return a.nome.localeCompare(b.nome); });

  times = novosTimes;
  bancoRevezamento = poolRevezamento;
  timeAtivoCampo = 0;

  renderizarResultados();
  irPara("resultado");
  notify("Equipes sorteadas com balanceamento por OVR Médio!");
}

function renderizarResultados() {
  var tabsContainer = document.getElementById("field-tabs-wrap");
  var cardsContainer = document.getElementById("teams-grid-wrap");
  var benchContainer = document.getElementById("bench-wrap");
  var statusText = document.getElementById("balance-status-text");

  if (times.length === 0) return;

  var medias = times.map(function(t) { return t.mediaOvr; });
  var diff = Math.max.apply(null, medias) - Math.min.apply(null, medias);

  if (statusText) {
    statusText.innerHTML = "<strong>Equilíbrio Técnico Calibrado:</strong> Diferença média de apenas <strong>" + diff + " OVR</strong> entre as equipes. Sem apelação em caso de reforço!";
  }

  // Abas do Campo
  if (tabsContainer) {
    var tabsHtml = "";
    for (var i = 0; i < times.length; i++) {
      tabsHtml += '<button class="field-tab ' + (i === timeAtivoCampo ? 'active' : '') + '" onclick="selecionarTimeCampo(' + i + ')">' +
        times[i].nome + ' (' + times[i].mediaOvr + ' OVR)' +
      '</button>';
    }
    tabsContainer.innerHTML = tabsHtml;
  }

  // Campo 7a0
  desenharCampo7a0(times[timeAtivoCampo]);

  // Cards dos Times
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
        var cat = p.categoria || "mensalista";
        var catTag = cat === "convidado" ? '<span class="badge-convidado" style="margin-left:4px;">Conv.</span>' : '';

        html += '<div class="team-row ' + (p.posicao === 'GOL' ? 'gk' : '') + '">' +
          '<div>' +
            '<span class="pos-badge pos-' + p.posicao + '" style="font-size:0.65rem; margin-right:6px;">' + p.posicao + '</span>' +
            '<strong>' + p.nome + '</strong>' + catTag +
          '</div>' +
          '<span class="team-row-ovr">' + p.ovr + '</span>' +
        '</div>';
      }
      html += '</div></div>';
    }
    cardsContainer.innerHTML = html;
  }

  // Fila de Revezamento / Suplentes (Se houver sobras)
  if (benchContainer) {
    if (bancoRevezamento.length === 0) {
      benchContainer.style.display = "none";
    } else {
      benchContainer.style.display = "block";
      var benchHtml = '<div class="bench-head">' +
        '<h4>Fila Oficial de Revezamento (' + bancoRevezamento.length + ' Atletas)</h4>' +
        '<span style="font-size:0.8rem; color:var(--text-gray);">Ordem automática de entrada nos times</span>' +
      '</div><div class="bench-grid">';

      for (var k = 0; k < bancoRevezamento.length; k++) {
        var sub = bancoRevezamento[k];
        benchHtml += '<div class="bench-item">' +
          '<div style="display:flex; align-items:center;">' +
            '<div class="bench-order">' + (k + 1) + '</div>' +
            '<div>' +
              '<strong>' + sub.nome + '</strong>' +
              '<div style="font-size:0.75rem; color:var(--text-dark);">' + sub.posicao + ' &bull; ' + (sub.categoria || 'convidado') + '</div>' +
            '</div>' +
          '</div>' +
          '<span style="font-family:var(--font-display); font-weight:800; color:var(--gold);">' + sub.ovr + ' OVR</span>' +
        '</div>';
      }
      benchHtml += '</div>';
      benchContainer.innerHTML = benchHtml;
    }
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

  var slots = [];
  if (tamanhoTimeDesejado === 6) {
    // 1 Gol + 5 Linha
    slots = [
      { a: gol || pegarUm(), c: "pos-gol", lbl: "GOL" },
      { a: zags.shift() || pegarUm(), c: "pos-zag-e", lbl: "ZAG" },
      { a: zags.shift() || pegarUm(), c: "pos-zag-d", lbl: "ZAG" },
      { a: alas.shift() || pegarUm(), c: "pos-ala-e", lbl: "ALA" },
      { a: alas.shift() || pegarUm(), c: "pos-ala-d", lbl: "ALA" },
      { a: atas.shift() || pegarUm(), c: "pos-pivo", lbl: "PIVÔ" }
    ];
  } else {
    // 1 Gol + 4 Linha
    slots = [
      { a: gol || pegarUm(), c: "pos-gol", lbl: "GOL" },
      { a: zags.shift() || pegarUm(), c: "pos-zag-e", lbl: "ZAG" },
      { a: alas.shift() || pegarUm(), c: "pos-ala-e", lbl: "ALA" },
      { a: alas.shift() || pegarUm(), c: "pos-ala-d", lbl: "ALA" },
      { a: atas.shift() || pegarUm(), c: "pos-pivo", lbl: "PIVÔ" }
    ];
  }

  var html = "";
  for (var i = 0; i < slots.length; i++) {
    var s = slots[i];
    var atleta = s.a;

    if (!atleta) {
      html += '<div class="slot " ' + s.c + '">' +
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
  msg += "Sorteio balanceado por OVR Médio (Times de " + tamanhoTimeDesejado + ")%0A%0A";

  for (var i = 0; i < times.length; i++) {
    var t = times[i];
    msg += "*" + t.nome.toUpperCase() + "* (Média: " + t.mediaOvr + " OVR)%0A";
    for (var j = 0; j < t.jogadores.length; j++) {
      var p = t.jogadores[j];
      var cat = p.categoria === "convidado" ? " [Conv]" : "";
      var tag = p.posicao === "GOL" ? "[GOL]" : "[" + p.posicao + "]";
      msg += tag + " " + p.nome + (p.apelido ? ' "' + p.apelido + '"' : '') + cat + " — " + p.ovr + " OVR%0A";
    }
    msg += "%0A";
  }

  if (bancoRevezamento.length > 0) {
    msg += "*FILA DE REVEZAMENTO AUTOMÁTICA:*%0A";
    for (var k = 0; k < bancoRevezamento.length; k++) {
      msg += (k + 1) + "º a entrar: " + bancoRevezamento[k].nome + " (" + bancoRevezamento[k].ovr + " OVR)%0A";
    }
    msg += "%0A";
  }

  msg += "Local: Quadra Poliesportiva do IFBA Eunápolis";
  window.open("https://api.whatsapp.com/send?text=" + msg, "_blank");
}
