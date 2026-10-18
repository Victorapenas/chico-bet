/**
 * cartas.js — Renderização das cartas estilo EA Sports FC / FUTBIN
 *
 * Cada carta exibe:
 * - OVR e Posição no canto superior esquerdo
 * - Foto recortada (ou placeholder neutro com iniciais)
 * - Nome do atleta em caixa alta
 * - 6 atributos oficiais PT-BR: RIT, FIN, PAS, DRI, DEF, FIS
 * - Badges de Nacionalidade (Bandeira do Brasil ou Angola), Cidade de Origem e Escudo IFBA
 * - Barra meta no rodapé com Perna dominante e OVR
 */

var filtroPosicao = "TODOS";
var filtroBusca = "";

function iniciarCartas() {
  // Filtros por posição
  var pills = document.querySelectorAll(".filter-pill");
  for (var i = 0; i < pills.length; i++) {
    pills[i].addEventListener("click", function(e) {
      for (var j = 0; j < pills.length; j++) pills[j].classList.remove("active");
      e.target.classList.add("active");
      filtroPosicao = e.target.getAttribute("data-pos") || "TODOS";
      renderizarCartas();
    });
  }

  // Campo de busca
  var input = document.getElementById("busca-jogador");
  if (input) {
    input.addEventListener("input", function() {
      filtroBusca = input.value.toLowerCase().trim();
      renderizarCartas();
    });
  }

  renderizarCartas();
}

function renderizarCartas() {
  var grid = document.getElementById("grid-cartas");
  if (!grid) return;

  var jogadores = carregarJogadores();

  // Filtragem
  var lista = jogadores.filter(function(j) {
    var okPos = false;
    if (filtroPosicao === "TODOS") {
      okPos = true;
    } else if (filtroPosicao === "MENSALISTA") {
      okPos = (j.categoria || "mensalista") === "mensalista";
    } else if (filtroPosicao === "CONVIDADO") {
      okPos = j.categoria === "convidado";
    } else {
      okPos = j.posicao === filtroPosicao;
    }

    var okNome = filtroBusca === "" ||
      j.nome.toLowerCase().indexOf(filtroBusca) !== -1 ||
      (j.apelido && j.apelido.toLowerCase().indexOf(filtroBusca) !== -1);
    return okPos && okNome;
  });

  if (lista.length === 0) {
    grid.innerHTML = '<div class="empty-state"><h4>Nenhum jogador encontrado</h4><p>Altere os filtros ou cadastre um novo atleta.</p></div>';
    return;
  }

  var html = "";
  for (var i = 0; i < lista.length; i++) {
    html += montarCartaHTML(lista[i]);
  }
  grid.innerHTML = html;
}

function montarCartaHTML(j) {
  var tier = tierDaCarta(j.ovr);
  var temFoto = j.foto && j.foto.trim() !== "";
  var s = j.stats;

  var bandeira = htmlBandeira(j.bandeira);
  var escudo = htmlEscudoTime(j.time);
  var origem = j.origem || "Eunápolis";
  var pernaLabel = j.perna === "L" ? "L" : (j.perna === "LR" ? "LR" : "R");

  return '<div class="fut-card ' + tier + '">' +
    '<div class="card-actions">' +
      '<button class="card-act-btn" onclick="editarJogador(\'' + j.id + '\')" title="Editar">&#9998;</button>' +
      '<button class="card-act-btn act-del" onclick="excluirJogador(\'' + j.id + '\')" title="Excluir">&times;</button>' +
    '</div>' +
    '<div class="card-rating">' +
      '<div class="card-ovr">' + j.ovr + '</div>' +
      '<div class="card-pos">' + j.posicao + '</div>' +
    '</div>' +
    '<div class="card-photo' + (temFoto ? '' : ' no-photo') + '"' +
      (temFoto ? '' : ' data-initials="' + iniciais(j.nome) + '"') + '>' +
      (temFoto ? '<img src="' + j.foto + '" alt="' + j.nome + '" loading="lazy">' : '') +
    '</div>' +
    '<div class="card-name">' +
      '<div class="card-player-name">' + (j.apelido || j.nome) + '</div>' +
    '</div>' +
    '<div class="card-stats">' +
      '<div class="stat-item"><span class="stat-num">' + s.rit + '</span><span class="stat-abbr">RIT</span></div>' +
      '<div class="stat-item"><span class="stat-num">' + s.dri + '</span><span class="stat-abbr">DRI</span></div>' +
      '<div class="stat-item"><span class="stat-num">' + s.fin + '</span><span class="stat-abbr">FIN</span></div>' +
      '<div class="stat-item"><span class="stat-num">' + s.def + '</span><span class="stat-abbr">DEF</span></div>' +
      '<div class="stat-item"><span class="stat-num">' + s.pas + '</span><span class="stat-abbr">PAS</span></div>' +
      '<div class="stat-item"><span class="stat-num">' + s.fis + '</span><span class="stat-abbr">FIS</span></div>' +
    '</div>' +
    '<div class="card-badges-row">' +
      bandeira +
      '<span class="card-origin-tag" title="Origem: ' + origem + '">' + origem + '</span>' +
      escudo +
      '<span class="card-cat-badge cat-' + (j.categoria || 'mensalista') + '">' + (j.categoria === 'convidado' ? 'Conv.' : 'Mensal.') + '</span>' +
    '</div>' +
    '<div class="card-meta-pill">' +
      '<span class="meta-foot">' + pernaLabel + '</span>' +
      '<span>4★</span>' +
      '<span class="meta-ovr-tag">' + j.ovr + '</span>' +
    '</div>' +
  '</div>';
}

function excluirJogador(id) {
  if (!confirm("Remover este atleta do elenco?")) return;
  var lista = carregarJogadores().filter(function(j) { return j.id !== id; });
  guardarJogadores(lista);
  renderizarCartas();
  atualizarDashboard();
  notify("Atleta removido do elenco.");
}
