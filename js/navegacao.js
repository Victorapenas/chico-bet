/**
 * navegacao.js - Troca Simples de Telas (SPA)
 * Chico B.E.T - IFBA Eunápolis
 */

function trocarTela(nomeTela) {
  // 1. Oculta todas as seções
  const secoes = document.querySelectorAll('.view-section');
  secoes.forEach(sec => sec.classList.remove('active'));

  // 2. Mostra a seção desejada
  const secaoDestino = document.getElementById(`view-${nomeTela}`);
  if (secaoDestino) {
    secaoDestino.classList.add('active');
  }

  // 3. Atualiza os botões ativos no menu
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    if (link.getAttribute('data-nav') === nomeTela) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 4. Executa atualizações específicas da tela aberta
  if (nomeTela === 'dashboard') {
    atualizarDashboard();
  } else if (nomeTela === 'elenco') {
    renderizarCatalogoCartas();
  } else if (nomeTela === 'sorteio-setup') {
    renderizarListaPresenca();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Inicializa os cliques de navegação
function inicializarNavegacao() {
  document.addEventListener('click', (e) => {
    const botaoNav = e.target.closest('[data-nav]');
    if (botaoNav) {
      e.preventDefault();
      const tela = botaoNav.getAttribute('data-nav');
      trocarTela(tela);
    }
  });
}
