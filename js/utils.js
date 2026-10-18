/**
 * utils.js - Funções de Apoio Simples e Diretas
 * Chico B.E.T - IFBA Eunápolis
 */

// 1. Cálculo da nota geral em Estrelas (1.0 a 5.0)
function calcularEstrelas(posicao, skills) {
  const vel = parseFloat(skills.vel) || 3;
  const chu = parseFloat(skills.chu) || 3;
  const pas = parseFloat(skills.pas) || 3;
  const def = parseFloat(skills.def) || 3;
  const fis = parseFloat(skills.fis) || 3;
  const dri = parseFloat(skills.dri) || 3;

  let media = 0;

  // Leve ponderação de acordo com a posição da quadra
  if (posicao === 'GOL') {
    media = (def * 0.4) + (fis * 0.3) + (pas * 0.15) + (vel * 0.15);
  } else if (posicao === 'ZAG') {
    media = (def * 0.35) + (fis * 0.25) + (pas * 0.15) + (vel * 0.15) + (dri * 0.1);
  } else if (posicao === 'ATA') {
    media = (chu * 0.35) + (vel * 0.25) + (dri * 0.2) + (fis * 0.1) + (pas * 0.1);
  } else {
    // Meio-Campo e Ala
    media = (pas * 0.25) + (dri * 0.25) + (vel * 0.2) + (chu * 0.15) + (def * 0.15);
  }

  // Limita entre 1.0 e 5.0 com 1 casa decimal
  const finalScore = Math.max(1, Math.min(5, media));
  return Math.round(finalScore * 10) / 10;
}

// 2. Renderização visual das estrelinhas (ex: ⭐⭐⭐⭐☆)
function renderizarEstrelasVisual(nota) {
  const notaNum = parseFloat(nota) || 0;
  const estrelasCheias = Math.floor(notaNum);
  const temMeia = (notaNum - estrelasCheias) >= 0.4;
  let html = '';

  for (let i = 0; i < estrelasCheias; i++) {
    html += '<span class="star filled">★</span>';
  }
  if (temMeia && estrelasCheias < 5) {
    html += '<span class="star half">★</span>';
  }
  const vazias = 5 - estrelasCheias - (temMeia ? 1 : 0);
  for (let i = 0; i < vazias; i++) {
    html += '<span class="star empty">☆</span>';
  }

  return html;
}

// 3. Obter jogadores do LocalStorage
function obterJogadores() {
  const dados = localStorage.getItem(CHAVE_STORAGE);
  if (!dados) {
    salvarJogadores(ELENCO_INICIAL);
    return [...ELENCO_INICIAL];
  }
  try {
    return JSON.parse(dados);
  } catch (e) {
    return [...ELENCO_INICIAL];
  }
}

// 4. Salvar jogadores no LocalStorage
function salvarJogadores(lista) {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
}

// 5. Placeholder neutro para quem está sem foto
function obterFotoJogador(caminhoFoto) {
  if (caminhoFoto && caminhoFoto.trim() !== "") {
    return caminhoFoto;
  }
  // Silhueta simples e neutra em SVG inline
  return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%2394a3b8"><circle cx="50" cy="35" r="22"/><path d="M15 88 C15 62 85 62 85 88 Z"/></svg>';
}

// 6. Mensagem rápida na tela (Toast)
function mostrarNotificacao(texto) {
  let box = document.getElementById('notificacao-toast');
  if (!box) {
    box = document.createElement('div');
    box.id = 'notificacao-toast';
    document.body.appendChild(box);
  }
  box.textContent = texto;
  box.className = 'toast show';
  setTimeout(() => {
    box.className = 'toast';
  }, 3000);
}
