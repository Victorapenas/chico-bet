/**
 * app.js — Inicialização e Dashboard
 * Chico B.E.T — IFBA Eunápolis
 */

document.addEventListener("DOMContentLoaded", function() {
  // 1. Carrega dados no LocalStorage
  carregarJogadores();

  // 2. Inicializa módulos
  iniciarNavegacao();
  iniciarCartas();
  iniciarCadastro();
  iniciarSorteio();

  // 3. Atualiza contadores
  atualizarDashboard();

  // 4. Restaurar elenco original
  var btnReset = document.getElementById("btn-reset-elenco");
  if (btnReset) {
    btnReset.addEventListener("click", function() {
      if (confirm("Deseja restaurar o elenco oficial com os integrantes do IFBA?")) {
        guardarJogadores(ELENCO_PADRAO);
        renderizarCartas();
        renderizarPresenca();
        atualizarDashboard();
        notify("Elenco oficial do IFBA restaurado.");
      }
    });
  }
});

function atualizarDashboard() {
  var lista = carregarJogadores();
  var total = lista.length;

  var countTotal = document.getElementById("dash-total");
  var countMedia = document.getElementById("dash-media");
  var countGoleiros = document.getElementById("dash-goleiros");
  var countLinha = document.getElementById("dash-linha");

  if (countTotal) countTotal.textContent = total;

  if (countMedia) {
    if (total === 0) {
      countMedia.textContent = "0";
    } else {
      var soma = lista.reduce(function(acc, j) { return acc + (j.ovr || 0); }, 0);
      countMedia.textContent = Math.round(soma / total);
    }
  }

  if (countGoleiros) {
    countGoleiros.textContent = lista.filter(function(j) { return j.posicao === "GOL"; }).length;
  }

  if (countLinha) {
    countLinha.textContent = lista.filter(function(j) { return j.posicao !== "GOL"; }).length;
  }
}
