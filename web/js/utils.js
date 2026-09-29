// CÁLCULO AUTOMÁTICO DE OVERALL
function calcularOverall(stats) {
    const sum = Number(stats.vel) + Number(stats.chu) + Number(stats.pas) + Number(stats.def) + Number(stats.fis);
    // Transforma a média das notas (1 a 10) em escala FIFA (10 a 99)
    const ovr = Math.round((sum / 50) * 100);
    return Math.min(99, Math.max(50, ovr));
}

// CARREGAR ELENCO (LOCALSTORAGE OU PADRÃO)
function carregarElenco() {
    const saved = localStorage.getItem("chico_bet_squad");
    if (saved) {
        try {
            squad = JSON.parse(saved);
        } catch (e) {
            squad = [...INITIAL_PLAYERS];
        }
    } else {
        squad = [...INITIAL_PLAYERS];
        salvarStorage();
    }
}

function salvarStorage() {
    localStorage.setItem("chico_bet_squad", JSON.stringify(squad));
}
