/**
 * navegacao.js — Troca de telas simples (SPA)
 */

function irPara(tela) {
  // Oculta todas as views
  var views = document.querySelectorAll(".view");
  for (var i = 0; i < views.length; i++) {
    views[i].classList.remove("active");
  }

  // Mostra a view pedida
  var destino = document.getElementById("v-" + tela);
  if (destino) destino.classList.add("active");

  // Marca o botão ativo na nav
  var btns = document.querySelectorAll(".nav-btn");
  for (var i = 0; i < btns.length; i++) {
    if (btns[i].getAttribute("data-tela") === tela) {
      btns[i].classList.add("active");
    } else {
      btns[i].classList.remove("active");
    }
  }

  // Atualiza dados se necessário
  if (tela === "inicio") atualizarDashboard();
  if (tela === "elenco") renderizarCartas();
  if (tela === "setup") renderizarPresenca();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function iniciarNavegacao() {
  document.addEventListener("click", function(e) {
    var btn = e.target.closest("[data-tela]");
    if (btn) {
      e.preventDefault();
      irPara(btn.getAttribute("data-tela"));
    }
  });
}
