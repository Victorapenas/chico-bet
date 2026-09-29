// INICIALIZAÇÃO DA APLICAÇÃO E DASHBOARD
function atualizarDashboard() {
    const total = squad.length;
    document.getElementById("dash-total-players").textContent = total;

    const avgOvr = total > 0 
        ? (squad.reduce((acc, p) => acc + calcularOverall(p.stats), 0) / total).toFixed(1)
        : "0.0";
    document.getElementById("dash-avg-overall").textContent = avgOvr;

    const goleiros = squad.filter(p => p.posicao === "Goleiro").length;
    document.getElementById("dash-goleiros-count").textContent = goleiros;

    // Card Hero e Featured
    if (squad.length > 0) {
        // Pega o jogador com maior Overall como Destaque
        const sorted = [...squad].sort((a, b) => calcularOverall(b.stats) - calcularOverall(a.stats));
        const topPlayer = sorted[0];

        document.getElementById("dash-top-skill").textContent = topPlayer.apelido;
        document.getElementById("hero-card-container").innerHTML = gerarHtmlCartaFUT(topPlayer);

        // Featured grid (top 4)
        const featuredContainer = document.getElementById("featured-cards-container");
        featuredContainer.innerHTML = sorted.slice(0, 4).map(p => gerarHtmlCartaFUT(p)).join("");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    carregarElenco();
    configurarNavegacao();
    atualizarDashboard();
    renderizarElenco();
    renderizarPresencaList();
    atualizarLiveCard();
});
