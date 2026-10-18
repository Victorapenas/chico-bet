/**
 * navegacao.js - Gerenciamento de Transição de Telas SPA
 * Chico B.E.T - IFBA Eunápolis
 */

const Navegacao = {
  telaAtual: 'dashboard',

  init() {
    // Escuta cliques em links com data-nav
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-nav]');
      if (link) {
        e.preventDefault();
        const targetView = link.getAttribute('data-nav');
        this.navegarPara(targetView);
      }
    });

    // Suporte ao histórico do navegador (hash)
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      this.navegarPara(hash, false);
    });

    // Rota inicial
    const hashInicial = window.location.hash.replace('#', '') || 'dashboard';
    this.navegarPara(hashInicial, false);
  },

  navegarPara(nomeTela, atualizarHash = true) {
    const sections = document.querySelectorAll('.view-section');
    const targetSection = document.getElementById(`view-${nomeTela}`);

    if (!targetSection) {
      console.warn(`Tela "${nomeTela}" não encontrada. Redirecionando para Dashboard.`);
      nomeTela = 'dashboard';
    }

    // Oculta todas as views
    sections.forEach(sec => sec.classList.remove('active'));

    // Ativa a tela desejada
    const activeSection = document.getElementById(`view-${nomeTela}`);
    if (activeSection) {
      activeSection.classList.add('active');
      this.telaAtual = nomeTela;
    }

    // Atualiza links de navegação
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-nav') === nomeTela) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    if (atualizarHash) {
      window.location.hash = nomeTela;
    }

    // Dispara gatilhos de atualização específicos de cada tela
    this.aoTrocarDeTela(nomeTela);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  aoTrocarDeTela(nomeTela) {
    if (nomeTela === 'dashboard') {
      if (typeof atualizarEstatisticasDashboard === 'function') {
        atualizarEstatisticasDashboard();
      }
    } else if (nomeTela === 'elenco') {
      if (typeof CartasManager !== 'undefined' && CartasManager.renderizarElenco) {
        CartasManager.renderizarElenco();
      }
    } else if (nomeTela === 'sorteio-setup') {
      if (typeof SorteioManager !== 'undefined' && SorteioManager.iniciarSetup) {
        SorteioManager.iniciarSetup();
      }
    }
  }
};
