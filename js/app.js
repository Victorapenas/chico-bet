/**
 * app.js - Inicialização Geral da Aplicação
 * Chico B.E.T - IFBA Eunápolis
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log("⚽ Chico B.E.T - Inicializando Baba da Quadra do IFBA Eunápolis...");

  // Garante que o storage possui os dados iniciais
  obterJogadores();

  // Inicializa os módulos
  inicializarNavegacao();
  inicializarCartas();
  inicializarCadastro();
  inicializarSorteio();

  // Atualiza contadores da tela inicial
  atualizarDashboard();

  // Botão para restaurar elenco original do IFBA
  const btnReset = document.getElementById('btn-reset-factory');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm("Deseja restaurar o elenco original com os dados e fotos da turma do IFBA?")) {
        salvarJogadores(ELENCO_INICIAL);
        renderizarCatalogoCartas();
        renderizarListaPresenca();
        atualizarDashboard();
        mostrarNotificacao("Elenco original do IFBA restaurado!");
      }
    });
  }
});

// Atualiza os contadores na tela inicial (Dashboard)
function atualizarDashboard() {
  const lista = obterJogadores();
  const total = lista.length;

  const countTotal = document.getElementById('dash-count-total');
  const countMedia = document.getElementById('dash-count-media');
  const countGoleiros = document.getElementById('dash-count-goleiros');
  const countLinha = document.getElementById('dash-count-atacantes');

  if (countTotal) countTotal.textContent = total;

  if (countMedia) {
    if (total === 0) {
      countMedia.textContent = "0.0 ⭐";
    } else {
      const soma = lista.reduce((acc, j) => acc + (j.estrelas || 0), 0);
      countMedia.textContent = (soma / total).toFixed(1) + " ⭐";
    }
  }

  if (countGoleiros) {
    const totalGk = lista.filter(j => j.posicao === 'GOL').length;
    countGoleiros.textContent = totalGk;
  }

  if (countLinha) {
    const totalLinha = lista.filter(j => j.posicao !== 'GOL').length;
    countLinha.textContent = totalLinha;
  }
}
