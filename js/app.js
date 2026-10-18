/**
 * app.js - Inicialização da Aplicação SPA e Controle Global
 * Chico B.E.T - IFBA Eunápolis
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log("⚽ Chico B.E.T - Inicializando primeira versão funcional do front-end...");

  // 1. Inicializa o armazenamento de dados
  obterJogadores();

  // 2. Inicializa os módulos da aplicação
  Navegacao.init();
  CartasManager.init();
  CadastroManager.init();
  SorteioManager.init();

  // 3. Atualiza dados do Dashboard
  atualizarEstatisticasDashboard();

  // 4. Botão de reset para fábrica (se o usuário quiser restaurar o elenco inicial)
  const btnReset = document.getElementById('btn-reset-factory');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm("Deseja restaurar o elenco padrão com a equipe do IFBA? Todos os cadastros extras serão resetados.")) {
        resetarElencoPadrao();
        CartasManager.renderizarElenco();
        atualizarEstatisticasDashboard();
        mostrarToast("Elenco restaurado para as configurações padrão!", "info");
      }
    });
  }
});

// Atualiza os contadores na tela inicial (Dashboard)
function atualizarEstatisticasDashboard() {
  const jogadores = obterJogadores();
  const total = jogadores.length;

  const countTotal = document.getElementById('dash-count-total');
  const countMedia = document.getElementById('dash-count-media');
  const countGoleiros = document.getElementById('dash-count-goleiros');
  const countAtacantes = document.getElementById('dash-count-atacantes');

  if (countTotal) countTotal.textContent = total;

  if (countMedia) {
    if (total === 0) {
      countMedia.textContent = "0.0";
    } else {
      const soma = jogadores.reduce((acc, j) => acc + (j.overall || 0), 0);
      countMedia.textContent = (soma / total).toFixed(1);
    }
  }

  if (countGoleiros) {
    const totalGk = jogadores.filter(j => j.posicao === 'GOL').length;
    countGoleiros.textContent = totalGk;
  }

  if (countAtacantes) {
    const totalAta = jogadores.filter(j => j.posicao === 'ATA').length;
    countAtacantes.textContent = totalAta;
  }
}
