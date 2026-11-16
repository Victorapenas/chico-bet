/**
 * js/sorteio-ui.js — Interface do Usuário do Sorteio do Chico B.E.T
 * Conecta os controles visuais ao motor de sorteio puro (sorteio.js)
 * IFBA Campus Eunápolis (ADS - 4º Semestre)
 */

var confirmadosIds = new Set();
var goleirosDeForaList = [];
var resultadoAtual = null;
var partidasAtuais = [];
var timeAtivoCampo = 0;

function iniciarSorteio() {
  var btnTodos = document.getElementById("btn-marcar-todos");
  var btnNenhum = document.getElementById("btn-desmarcar-todos");
  var btnSortear = document.getElementById("btn-executar-sorteio");
  var btnRefazer = document.getElementById("btn-refazer-sorteio");
  var btnWhats = document.getElementById("btn-whats");
  var btnFecharBaba = document.getElementById("btn-fechar-baba");
  var btnAddGkFora = document.getElementById("btn-add-gk-fora");

  var cfgModoGoleiro = document.getElementById("cfg-modo-goleiro");
  var cfgNumTimes = document.getElementById("cfg-num-times");
  var cfgTamanho = document.getElementById("cfg-tamanho-time");
  var cfgExcedente = document.getElementById("cfg-excedente");

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

  if (btnAddGkFora) {
    btnAddGkFora.addEventListener("click", adicionarGoleiroDeFora);
  }

  if (cfgModoGoleiro) {
    cfgModoGoleiro.addEventListener("change", function() {
      var box = document.getElementById("box-goleiros-fora");
      if (box) {
        if (cfgModoGoleiro.value === "sem-externo") {
          box.style.border = "1px solid #3b82f6";
          box.style.padding = "10px";
          box.style.borderRadius = "6px";
        } else {
          box.style.border = "none";
          box.style.borderTop = "1px solid var(--border)";
          box.style.padding = "12px 0 0 0";
        }
      }
      renderizarPresenca();
    });
  }

  if (cfgNumTimes) cfgNumTimes.addEventListener("change", renderizarPresenca);
  if (cfgTamanho) cfgTamanho.addEventListener("change", renderizarPresenca);
  if (cfgExcedente) cfgExcedente.addEventListener("change", renderizarPresenca);

  if (btnSortear) btnSortear.addEventListener("click", executarSorteio);
  if (btnRefazer) btnRefazer.addEventListener("click", executarSorteio);
  if (btnWhats) btnWhats.addEventListener("click", compartilharWhatsApp);
  if (btnFecharBaba) btnFecharBaba.addEventListener("click", fecharBabaAtual);

  // Inicializa marcando todos os atletas presentes
  carregarJogadores().forEach(function(j) { confirmadosIds.add(j.id); });
  renderizarPresenca();
  renderizarTagsGoleirosFora();
}

function renderizarPresenca() {
  var container = document.getElementById("lista-presenca");
  var countEl = document.getElementById("count-presentes");
  var prevEl = document.getElementById("count-previsao");
  if (!container) return;

  var jogadores = carregarJogadores();
  var total = confirmadosIds.size;

  var numTimes = parseInt(document.getElementById("cfg-num-times")?.value, 10) || 4;
  var tamanhoTime = parseInt(document.getElementById("cfg-tamanho-time")?.value, 10) || 6;
  var vagasTitulares = numTimes * tamanhoTime;
  var excedente = total > vagasTitulares ? (total - vagasTitulares) : 0;

  if (countEl) countEl.textContent = total;
  if (prevEl) {
    var infoExcedente = excedente > 0
      ? " &bull; <span style='color:var(--gold);'>+" + excedente + " excedente(s)</span>"
      : "";
    prevEl.innerHTML = numTimes + " Times de " + tamanhoTime + " (Vagas: " + vagasTitulares + ")" + infoExcedente;
  }

  var html = "";
  for (var i = 0; i < jogadores.length; i++) {
    var j = jogadores[i];
    var sel = confirmadosIds.has(j.id);
    var foto = urlFoto(j.foto);
    var cat = j.status || j.categoria || "mensalista";
    var catLabel = cat === "mensalista" ? "Mensalista" : "Convidado";
    var posSecLabel = j.posicaoSecundaria ? " / " + j.posicaoSecundaria : "";

    html += '<div class="check-item ' + (sel ? 'on' : '') + '" onclick="togglePresenca(\'' + j.id + '\')">' +
      '<div class="check-left">' +
        '<div class="check-box">' + (sel ? '&#10003;' : '') + '</div>' +
        '<img src="' + (foto || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\' fill=\'%23555b66\'><circle cx=\'50\' cy=\'35\' r=\'20\'/><path d=\'M18 85 C18 60 82 60 82 85 Z\'/></svg>') + '" class="check-avatar" alt="' + j.nome + '">' +
        '<div class="check-info">' +
          '<div class="check-name">' + j.nome + (j.apelido ? ' (' + j.apelido + ')' : '') + '</div>' +
          '<div class="check-meta">' +
            '<span class="pos-badge pos-' + j.posicao + '">' + j.posicao + posSecLabel + '</span>' +
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

function adicionarGoleiroDeFora() {
  var nomeEl = document.getElementById("input-gk-fora-nome");
  var ovrEl = document.getElementById("input-gk-fora-ovr");
  if (!nomeEl) return;

  var nome = nomeEl.value.trim();
  var ovr = parseInt(ovrEl?.value, 10) || 70;

  if (!nome) {
    alert("Informe o nome do goleiro convidado de fora.");
    return;
  }

  goleirosDeForaList.push({
    id: "gk_fora_" + Date.now(),
    nome: nome,
    apelido: nome,
    ovr: ovr,
    posicao: "GOL",
    posicaoSecundaria: null,
    status: "convidado"
  });

  nomeEl.value = "";
  renderizarTagsGoleirosFora();
  notify("Goleiro de fora adicionado: " + nome);
}

function removerGoleiroDeFora(index) {
  goleirosDeForaList.splice(index, 1);
  renderizarTagsGoleirosFora();
}

function renderizarTagsGoleirosFora() {
  var container = document.getElementById("lista-gks-fora-tags");
  if (!container) return;

  if (goleirosDeForaList.length === 0) {
    container.innerHTML = "<span style='font-size:0.75rem; color:var(--text-dark);'>Nenhum goleiro de fora adicionado.</span>";
    return;
  }

  var html = "";
  for (var i = 0; i < goleirosDeForaList.length; i++) {
    var gk = goleirosDeForaList[i];
    html += '<span class="gk-fora-tag">' +
      '🧤 ' + gk.nome + ' (' + gk.ovr + ' OVR)' +
      '<button type="button" onclick="removerGoleiroDeFora(' + i + ')" title="Remover">&times;</button>' +
    '</span>';
  }
  container.innerHTML = html;
}

/**
 * Executa o Sorteio chamando o módulo sorteio.js
 */
function executarSorteio() {
  var todos = carregarJogadores();
  var selecionados = todos.filter(function(j) { return confirmadosIds.has(j.id); });

  if (selecionados.length < 4) {
    alert("Selecione pelo menos 4 atletas para sortear as equipes!");
    return;
  }

  var numTimes = parseInt(document.getElementById("cfg-num-times")?.value, 10) || 4;
  var tamanhoTime = parseInt(document.getElementById("cfg-tamanho-time")?.value, 10) || 6;
  var modoGoleiro = document.getElementById("cfg-modo-goleiro")?.value || "com";
  var excedente = document.getElementById("cfg-excedente")?.value || "reservas";

  var config = {
    numTimes: numTimes,
    tamanhoTime: tamanhoTime,
    modoGoleiro: modoGoleiro,
    excedente: excedente,
    goleirosDeFora: goleirosDeForaList.slice()
  };

  try {
    resultadoAtual = Sorteio.sortearTimes(selecionados, config);
    partidasAtuais = Sorteio.gerarPartidas(resultadoAtual, 8);
    timeAtivoCampo = 0;

    renderizarResultados();
    irPara("resultado");
    notify("Baba sorteado com sucesso e rodízio gerado!");
  } catch (err) {
    console.error("Erro ao sortear times:", err);
    alert("Erro ao realizar o sorteio: " + err.message);
  }
}

function renderizarResultados() {
  if (!resultadoAtual) return;

  var statusText = document.getElementById("balance-status-text");
  var avisosContainer = document.getElementById("avisos-sorteio-wrap");
  var tabsContainer = document.getElementById("field-tabs-wrap");
  var cardsContainer = document.getElementById("teams-grid-wrap");
  var filaContainer = document.getElementById("fila-espera-wrap");
  var partidasContainer = document.getElementById("grid-partidas-geradas");

  // 1. Resumo do Equilíbrio
  if (statusText) {
    var diffGeral = resultadoAtual.equilibrio ? resultadoAtual.equilibrio.diferencaGeral.toFixed(2) : "0.00";
    var diffTitulares = resultadoAtual.equilibrio ? resultadoAtual.equilibrio.diferencaTitulares.toFixed(2) : "0.00";
    statusText.innerHTML = "<strong>Equilíbrio Técnico de OVR:</strong> Diferença geral de apenas <strong>" + diffGeral + " OVR</strong> (Titulares: " + diffTitulares + " OVR).";
  }

  // 2. Avisos do Sorteio
  if (avisosContainer) {
    if (resultadoAtual.avisos && resultadoAtual.avisos.length > 0) {
      var avHtml = '<div class="avisos-box">';
      resultadoAtual.avisos.forEach(function(av) {
        var tipo = "warn";
        var icone = "⚠️";
        if (av.indexOf("Limite") !== -1 || av.indexOf("24") !== -1) {
          tipo = "warn";
          icone = "🏟️";
        } else if (av.indexOf("Goleiro") !== -1 || av.indexOf("goleiro") !== -1) {
          tipo = "info";
          icone = "🧤";
        }
        avHtml += '<div class="aviso-item ' + tipo + '">' +
          '<span class="aviso-icone">' + icone + '</span>' +
          '<div>' + av + '</div>' +
        '</div>';
      });
      avHtml += '</div>';
      avisosContainer.innerHTML = avHtml;
    } else {
      avisosContainer.innerHTML = "";
    }
  }

  // 3. Abas do Campo Tático
  if (tabsContainer) {
    var tabsHtml = "";
    for (var i = 0; i < resultadoAtual.times.length; i++) {
      var t = resultadoAtual.times[i];
      var isActive = (i === timeAtivoCampo);
      tabsHtml += '<button class="field-tab ' + (isActive ? 'active' : '') + '" onclick="selecionarTimeCampo(' + i + ')">' +
        t.nome + ' (' + t.mediaGeral + ' OVR)' +
      '</button>';
    }
    tabsContainer.innerHTML = tabsHtml;
  }

  // 4. Desenha Campo 7a0
  desenharCampo7a0(resultadoAtual.times[timeAtivoCampo]);

  // 5. Grid de Times e Reservas
  if (cardsContainer) {
    var html = "";
    for (var j = 0; j < resultadoAtual.times.length; j++) {
      var time = resultadoAtual.times[j];
      html += '<div class="team-box">' +
        '<div class="team-head">' +
          '<div>' +
            '<h4>' + time.nome + '</h4>' +
            '<div style="font-size:0.75rem; color:var(--text-gray);">' + (time.goleiroTipo || 'Goleiro escalado') + '</div>' +
          '</div>' +
          '<div style="text-align:right;">' +
            '<span class="team-ovr">' + time.mediaGeral + ' OVR</span>' +
            '<div style="font-size:0.7rem; color:var(--text-dark);">Titulares: ' + time.mediaTitulares + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="team-list">';

      // Titulares
      (time.titulares || []).forEach(function(atleta) {
        var encaixeClass = "encaixe-" + (atleta.encaixe || "principal");
        var encaixeText = atleta.encaixe === "secundaria" ? "Sec" : (atleta.encaixe === "fora" ? "Fora" : "Princ");
        var isGk = atleta.papel === "GOL";

        html += '<div class="team-row ' + (isGk ? 'gk' : '') + '">' +
          '<div>' +
            '<span class="pos-badge pos-' + (atleta.papel || atleta.posicao) + '" style="font-size:0.65rem; margin-right:6px;">' + (atleta.papel || atleta.posicao) + '</span>' +
            '<strong>' + atleta.nome + '</strong>' +
            '<span class="encaixe-badge ' + encaixeClass + '">' + encaixeText + '</span>' +
          '</div>' +
          '<span class="team-row-ovr">' + atleta.ovr + '</span>' +
        '</div>';
      });

      html += '</div>';

      // Reservas do Time (se houver)
      if (time.reservas && time.reservas.length > 0) {
        html += '<div class="team-reservas-section">' +
          '<div class="team-reservas-title">Reservas do Time (' + time.reservas.length + ')</div>';
        time.reservas.forEach(function(res, idx) {
          html += '<div class="team-row" style="font-size:0.8rem; opacity:0.9;">' +
            '<div>' +
              '<span style="color:var(--gold); font-weight:bold; margin-right:4px;">' + (idx + 1) + 'º</span>' +
              '<span>' + res.nome + ' (' + res.posicao + ')</span>' +
            '</div>' +
            '<span style="font-weight:700; color:var(--gold);">' + res.ovr + '</span>' +
          '</div>';
        });
        html += '</div>';
      }

      html += '</div>';
    }
    cardsContainer.innerHTML = html;
  }

  // 6. Fila de Espera (quando excedente = 'fila')
  if (filaContainer) {
    if (resultadoAtual.espera && resultadoAtual.espera.length > 0) {
      filaContainer.style.display = "block";
      var filaHtml = '<div class="bench-section">' +
        '<div class="bench-head">' +
          '<h4>Fila de Espera Oficial (' + resultadoAtual.espera.length + ' Atletas)</h4>' +
          '<span style="font-size:0.8rem; color:var(--text-gray);">Entram primeiro no próximo baba</span>' +
        '</div><div class="bench-grid">';
      resultadoAtual.espera.forEach(function(esp, k) {
        filaHtml += '<div class="bench-item">' +
          '<div style="display:flex; align-items:center;">' +
            '<div class="bench-order">' + (k + 1) + '</div>' +
            '<div>' +
              '<strong>' + esp.nome + '</strong>' +
              '<div style="font-size:0.75rem; color:var(--text-dark);">' + esp.posicao + ' &bull; ' + (esp.status || 'convidado') + '</div>' +
            '</div>' +
          '</div>' +
          '<span style="font-family:var(--font-display); font-weight:800; color:var(--gold);">' + esp.ovr + ' OVR</span>' +
        '</div>';
      });
      filaHtml += '</div></div>';
      filaContainer.innerHTML = filaHtml;
    } else {
      filaContainer.style.display = "none";
      filaContainer.innerHTML = "";
    }
  }

  // 7. Rodízio de Partidas
  if (partidasContainer && partidasAtuais && partidasAtuais.length > 0) {
    var pGridHtml = "";
    partidasAtuais.forEach(function(p) {
      var seguidasA = p.jogamSeguidas && p.jogamSeguidas.indexOf(p.timeA) !== -1;
      var seguidasB = p.jogamSeguidas && p.jogamSeguidas.indexOf(p.timeB) !== -1;

      pGridHtml += '<div class="partida-card">' +
        '<div class="partida-head">' +
          '<span class="partida-numero">Partida #' + p.numero + '</span>' +
          '<span>Rodada de Rodízio</span>' +
        '</div>' +
        '<div class="partida-confronto">' +
          '<div class="partida-time-nome">' + p.timeA + (seguidasA ? ' <span class="badge-seguidas">2ª seguida</span>' : '') + '</div>' +
          '<span class="partida-vs">VS</span>' +
          '<div class="partida-time-nome">' + p.timeB + (seguidasB ? ' <span class="badge-seguidas">2ª seguida</span>' : '') + '</div>' +
        '</div>' +
        '<div class="partida-gk-info">' +
          '<div>🧤 <strong>' + p.timeA + ':</strong> ' + p.goleiroA + '</div>' +
          '<div>🧤 <strong>' + p.timeB + ':</strong> ' + p.goleiroB + '</div>' +
        '</div>' +
      '</div>';
    });
    partidasContainer.innerHTML = pGridHtml;
  }
}

function selecionarTimeCampo(indice) {
  timeAtivoCampo = indice;
  renderizarResultados();
}

/**
 * Desenha os atletas do time no Campo Tático Estilo 7a0
 */
function desenharCampo7a0(time) {
  var pitch = document.getElementById("pitch-slots");
  if (!pitch || !time) return;

  var titulares = (time.titulares || []).slice();

  // Localiza cada papel tático
  var gol = titulares.find(function(j) { return j.papel === "GOL"; });
  var zags = titulares.filter(function(j) { return j.papel === "ZAG"; });
  var alas = titulares.filter(function(j) { return j.papel === "ALA" || j.papel === "MEI"; });
  var pivo = titulares.find(function(j) { return j.papel === "PIVO" || j.papel === "ATA"; });

  var outros = titulares.filter(function(j) {
    return j !== gol && zags.indexOf(j) === -1 && alas.indexOf(j) === -1 && j !== pivo;
  });

  function pegarUm() {
    return outros.shift() || alas.pop() || zags.pop() || null;
  }

  var slots = [];
  var tamanhoTime = resultadoAtual?.config?.tamanhoTime || 6;

  if (tamanhoTime === 6) {
    // 1 GOL + 5 LINHA (Padrão Quadra IFBA)
    slots = [
      { a: gol || pegarUm(), c: "pos-gol", lbl: "GOL" },
      { a: zags.shift() || pegarUm(), c: "pos-zag-e", lbl: "ZAG" },
      { a: zags.shift() || pegarUm(), c: "pos-zag-d", lbl: "ZAG" },
      { a: alas.shift() || pegarUm(), c: "pos-ala-e", lbl: "ALA" },
      { a: alas.shift() || pegarUm(), c: "pos-ala-d", lbl: "ALA" },
      { a: pivo || pegarUm(), c: "pos-pivo", lbl: "PIVÔ" }
    ];
  } else {
    // 1 GOL + 4 LINHA
    slots = [
      { a: gol || pegarUm(), c: "pos-gol", lbl: "GOL" },
      { a: zags.shift() || pegarUm(), c: "pos-zag-e", lbl: "ZAG" },
      { a: alas.shift() || pegarUm(), c: "pos-ala-e", lbl: "ALA" },
      { a: alas.shift() || pegarUm(), c: "pos-ala-d", lbl: "ALA" },
      { a: pivo || pegarUm(), c: "pos-pivo", lbl: "PIVÔ" }
    ];
  }

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
      var encaixeClass = "encaixe-" + (atleta.encaixe || "principal");

      html += '<div class="slot ' + s.c + '">' +
        '<div class="slot-photo">' +
          (foto ? '<img src="' + foto + '" alt="' + atleta.nome + '">' : '<span style="color:#fff; font-size:0.75rem; font-weight:800; display:flex; align-items:center; justify-content:center; height:100%;">' + (atleta.posicao || s.lbl) + '</span>') +
        '</div>' +
        '<div class="slot-tag">' +
          (atleta.apelido || atleta.nome.split(" ")[0]) +
          '<span class="tag-ovr">' + atleta.ovr + '</span>' +
          '<span class="encaixe-badge ' + encaixeClass + '">' + (atleta.papel || s.lbl) + '</span>' +
        '</div>' +
      '</div>';
    }
  }
  pitch.innerHTML = html;
}

/**
 * Encerra o baba, atualiza contadores (vezesNoGol, jogosForaSeguidos) e salva no PHP / LocalStorage
 */
function fecharBabaAtual() {
  if (!resultadoAtual) {
    alert("Nenhum sorteio ativo para encerrar.");
    return;
  }

  if (!confirm("Deseja encerrar o baba de hoje? O sistema irá contabilizar quem agarrou no gol, quem jogou e salvar o histórico.")) {
    return;
  }

  var elencoCompleto = carregarJogadores();
  var elencoAtualizado = Sorteio.fecharBaba(elencoCompleto, resultadoAtual, partidasAtuais);

  guardarJogadores(elencoAtualizado);

  // Envia histórico para a API do PHP caso disponível
  try {
    fetch("api/baba.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: new Date().toISOString(),
        resultado: resultadoAtual,
        partidas: partidasAtuais
      })
    }).catch(function() {});
  } catch (e) {}

  notify("Baba encerrado e histórico de partidas registrado com sucesso!");
  renderizarPresenca();
  atualizarDashboard();
}

/**
 * Compartilhar Escalação Completa no WhatsApp
 */
function compartilharWhatsApp() {
  if (!resultadoAtual || !resultadoAtual.times || resultadoAtual.times.length === 0) return;

  var msg = "*CHICO B.E.T — ESCALAÇÃO DO BABA DO IFBA EUNÁPOLIS*%0A";
  msg += "Módulo Inteligente por OVR & Posições%0A%0A";

  resultadoAtual.times.forEach(function(t) {
    msg += "*" + t.nome.toUpperCase() + "* (Média: " + t.mediaGeral + " OVR)%0A";
    (t.titulares || []).forEach(function(at) {
      var tag = "[" + (at.papel || at.posicao) + "]";
      msg += tag + " " + at.nome + " — " + at.ovr + " OVR%0A";
    });
    if (t.reservas && t.reservas.length > 0) {
      msg += "_Reservas: " + t.reservas.map(function(r) { return r.nome; }).join(", ") + "_%0A";
    }
    msg += "%0A";
  });

  if (partidasAtuais && partidasAtuais.length > 0) {
    msg += "*RODÍZIO DAS PRIMEIRAS PARTIDAS:*%0A";
    for (var i = 0; i < Math.min(4, partidasAtuais.length); i++) {
      var p = partidasAtuais[i];
      msg += "Jogo " + p.numero + ": " + p.timeA + " (" + p.goleiroA + ") x " + p.timeB + " (" + p.goleiroB + ")%0A";
    }
    msg += "%0A";
  }

  msg += "Local: Quadra Poliesportiva do IFBA Eunápolis";
  window.open("https://api.whatsapp.com/send?text=" + msg, "_blank");
}
