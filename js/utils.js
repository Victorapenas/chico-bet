/**
 * utils.js — Funções utilitárias (cálculo de OVR, storage, bandeiras e escudos)
 *
 * Padrão EA Sports FC / FUTBIN:
 * - OVR ponderado por posição
 * - Bandeiras de nacionalidade (Brasil e Angola)
 * - Escudo da equipe / campus (IFBA Eunápolis)
 */

// 1. Calcula o Overall (OVR) ponderado por posição (1 a 99)
function calcularOVR(posicao, stats) {
  var r = parseInt(stats.rit) || 60;
  var f = parseInt(stats.fin) || 60;
  var p = parseInt(stats.pas) || 60;
  var d = parseInt(stats.dri) || 60;
  var e = parseInt(stats.def) || 60;
  var s = parseInt(stats.fis) || 60;

  var media = 0;

  if (posicao === "GOL") {
    media = (e * 0.40) + (s * 0.30) + (p * 0.15) + (r * 0.15);
  } else if (posicao === "ZAG") {
    media = (e * 0.35) + (s * 0.25) + (r * 0.15) + (p * 0.15) + (d * 0.10);
  } else if (posicao === "ATA") {
    media = (f * 0.35) + (r * 0.25) + (d * 0.20) + (s * 0.10) + (p * 0.10);
  } else {
    // MEI ou ALA
    media = (p * 0.25) + (d * 0.25) + (r * 0.20) + (f * 0.15) + (e * 0.15);
  }

  return Math.round(media);
}

// 2. Tier da carta
function tierDaCarta(ovr) {
  if (ovr >= 75) return "";           // Gold Rare (padrão)
  if (ovr >= 65) return "card-silver";
  return "card-bronze";
}

// 3. Bandeiras vetoriais nítidas estilo FUTBIN (Brasil e Angola)
function htmlBandeira(codigoPais) {
  if (codigoPais === "AO") {
    // Bandeira de Angola: metade vermelha, metade preta com símbolo amarelo
    return '<span class="card-flag" title="Angola" style="background: linear-gradient(180deg, #c8102e 50%, #000 50%);"></span>';
  }
  // Padrão: Bandeira do Brasil
  return '<span class="card-flag" title="Brasil" style="background: #009c3b; position:relative;"><span style="position:absolute; inset:2px; background:#ffdf00; clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);"></span></span>';
}

// 4. Escudo da Equipe / IFBA estilo FUTBIN
function htmlEscudoTime(nomeTime) {
  return '<span class="card-club-badge" title="' + (nomeTime || 'IFBA') + '">IFBA</span>';
}

// 5. Carregar jogadores do LocalStorage
function carregarJogadores() {
  var json = localStorage.getItem(CHAVE_DADOS);
  if (!json) {
    guardarJogadores(ELENCO_PADRAO);
    return ELENCO_PADRAO.slice();
  }
  try {
    return JSON.parse(json);
  } catch (e) {
    return ELENCO_PADRAO.slice();
  }
}

// 6. Salvar jogadores no LocalStorage
function guardarJogadores(lista) {
  localStorage.setItem(CHAVE_DADOS, JSON.stringify(lista));
}

// 7. Retorna foto ou placeholder
function urlFoto(caminho) {
  if (caminho && caminho.trim() !== "") return caminho;
  return "";
}

// 8. Iniciais do nome
function iniciais(nome) {
  return nome.split(" ").map(function(p) { return p[0]; }).slice(0, 2).join("").toUpperCase();
}

// 9. Toast
function notify(texto) {
  var el = document.getElementById("toast");
  if (!el) return;
  el.textContent = texto;
  el.className = "toast show";
  setTimeout(function() { el.className = "toast"; }, 3000);
}
