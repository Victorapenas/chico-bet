/**
 * utils.js - Funções Utilitárias, Cálculo de Overall e LocalStorage
 * Chico B.E.T - IFBA Eunápolis
 */

// Cálculo automático do Overall ponderado por posição (RF02)
function calcularOverall(posicao, { vel = 5, chu = 5, pas = 5, def = 5, fis = 5 }) {
  vel = parseFloat(vel) || 5;
  chu = parseFloat(chu) || 5;
  pas = parseFloat(pas) || 5;
  def = parseFloat(def) || 5;
  fis = parseFloat(fis) || 5;

  let ovr = 0;

  switch (posicao) {
    case 'GOL':
      // Goleiro prioriza Defesa e Físico
      ovr = (def * 0.45) + (fis * 0.30) + (pas * 0.15) + (vel * 0.10);
      break;

    case 'ZAG':
      // Zagueiro prioriza Defesa, Físico e Velocidade
      ovr = (def * 0.40) + (fis * 0.30) + (vel * 0.15) + (pas * 0.10) + (chu * 0.05);
      break;

    case 'MEI':
      // Meio-Campo prioriza Passe, Velocidade e Chute
      ovr = (pas * 0.35) + (vel * 0.20) + (chu * 0.20) + (fis * 0.15) + (def * 0.10);
      break;

    case 'ATA':
      // Atacante prioriza Chute, Velocidade e Físico
      ovr = (chu * 0.40) + (vel * 0.30) + (fis * 0.15) + (pas * 0.10) + (def * 0.05);
      break;

    default:
      // Média aritmética simples padrão
      ovr = (vel + chu + pas + def + fis) / 5;
  }

  // Retorna com 1 casa decimal (ex: 8.4)
  return Math.round(ovr * 10) / 10;
}

// Obter tier da carta com base no Overall para estilização FUT
function obterTierCarta(overall) {
  const ovr = parseFloat(overall);
  if (ovr >= 8.5) return 'tier-special';
  if (ovr >= 7.8) return 'tier-gold';
  if (ovr >= 6.8) return 'tier-silver';
  return 'tier-bronze';
}

// Gerenciamento de LocalStorage
function obterJogadores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOGADORES);
    if (!raw) {
      salvarJogadores(ELENCO_INICIAL);
      return [...ELENCO_INICIAL];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Erro ao ler do LocalStorage:", err);
    return [...ELENCO_INICIAL];
  }
}

function salvarJogadores(jogadores) {
  try {
    localStorage.setItem(STORAGE_KEYS.JOGADORES, JSON.stringify(jogadores));
  } catch (err) {
    console.error("Erro ao salvar no LocalStorage:", err);
  }
}

function resetarElencoPadrao() {
  salvarJogadores(ELENCO_INICIAL);
  return [...ELENCO_INICIAL];
}

// Gerador de ID único simples
function gerarId() {
  return 'jog-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
}

// Sistema de Notificações Toast
function mostrarToast(mensagem, tipo = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;

  const icon = tipo === 'success' ? '✅' : tipo === 'warning' ? '⚠️' : tipo === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${mensagem}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
