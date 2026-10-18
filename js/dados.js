/**
 * dados.js - Elenco Inicial Pré-cadastrado e Configurações Globais
 * Chico B.E.T - IFBA Eunápolis
 */

// Helper para gerar avatares SVG estilizados com iniciais e gradientes de futebol
function gerarAvatarSVG(nome, corFundo = '#1e3a8a', corTexto = '#ffffff') {
  const iniciais = nome
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
    <defs>
      <linearGradient id="grad-${iniciais}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${corFundo}" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
    </defs>
    <rect width="160" height="160" rx="20" fill="url(#grad-${iniciais})" />
    <circle cx="80" cy="65" r="32" fill="rgba(255,255,255,0.15)" />
    <path d="M40 140 C40 105, 120 105, 120 140 Z" fill="rgba(255,255,255,0.2)" />
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="34" fill="${corTexto}">${iniciais}</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Elenco Padrão com os Integrantes do Grupo e Convidados
const ELENCO_INICIAL = [
  {
    id: "jog-1",
    nome: "Victor Hugo",
    apelido: "Camisa 10",
    posicao: "MEI",
    perna: "Destro",
    atributos: { vel: 8.5, chu: 8.0, pas: 9.0, def: 6.5, fis: 7.5 },
    overall: 8.2,
    foto: gerarAvatarSVG("Victor Hugo", "#10b981")
  },
  {
    id: "jog-2",
    nome: "Paulo Amaral",
    apelido: "Paredão",
    posicao: "GOL",
    perna: "Destro",
    atributos: { vel: 6.0, chu: 5.5, pas: 7.0, def: 9.2, fis: 8.8 },
    overall: 8.1,
    foto: gerarAvatarSVG("Paulo Amaral", "#ef4444")
  },
  {
    id: "jog-3",
    nome: "Kauan Bento",
    apelido: "Artilheiro",
    posicao: "ATA",
    perna: "Canhoto",
    atributos: { vel: 9.2, chu: 8.8, pas: 7.5, def: 5.0, fis: 8.0 },
    overall: 8.3,
    foto: gerarAvatarSVG("Kauan Bento", "#f59e0b")
  },
  {
    id: "jog-4",
    nome: "Francisco António",
    apelido: "Xerife",
    posicao: "ZAG",
    perna: "Destro",
    atributos: { vel: 7.2, chu: 6.0, pas: 7.0, def: 9.0, fis: 8.5 },
    overall: 8.0,
    foto: gerarAvatarSVG("Francisco António", "#0ea5e9")
  },
  {
    id: "jog-5",
    nome: "Yan Lacerda",
    apelido: "Motorzinho",
    posicao: "MEI",
    perna: "Ambidestro",
    atributos: { vel: 8.0, chu: 7.5, pas: 8.5, def: 7.0, fis: 8.0 },
    overall: 7.9,
    foto: gerarAvatarSVG("Yan Lacerda", "#8b5cf6")
  },
  {
    id: "jog-6",
    nome: "Chico Bet",
    apelido: "O Mito",
    posicao: "ATA",
    perna: "Destro",
    atributos: { vel: 8.8, chu: 9.5, pas: 8.0, def: 5.5, fis: 7.8 },
    overall: 8.4,
    foto: gerarAvatarSVG("Chico Bet", "#00e676")
  },
  {
    id: "jog-7",
    nome: "Matheus Goleiro",
    apelido: "Muralha",
    posicao: "GOL",
    perna: "Canhoto",
    atributos: { vel: 6.2, chu: 5.0, pas: 6.8, def: 8.9, fis: 8.5 },
    overall: 7.8,
    foto: gerarAvatarSVG("Matheus Goleiro", "#dc2626")
  },
  {
    id: "jog-8",
    nome: "Gabriel Silva",
    apelido: "Pitbull",
    posicao: "ZAG",
    perna: "Destro",
    atributos: { vel: 7.0, chu: 5.8, pas: 6.5, def: 8.7, fis: 8.9 },
    overall: 7.8,
    foto: gerarAvatarSVG("Gabriel Silva", "#0284c7")
  },
  {
    id: "jog-9",
    nome: "Lucas Mendes",
    apelido: "Mago",
    posicao: "MEI",
    perna: "Canhoto",
    atributos: { vel: 7.8, chu: 8.2, pas: 8.8, def: 5.8, fis: 6.5 },
    overall: 7.7,
    foto: gerarAvatarSVG("Lucas Mendes", "#d97706")
  },
  {
    id: "jog-10",
    nome: "Rodrigo Costa",
    apelido: "Flecha",
    posicao: "ATA",
    perna: "Destro",
    atributos: { vel: 9.5, chu: 7.8, pas: 6.8, def: 4.5, fis: 7.0 },
    overall: 7.6,
    foto: gerarAvatarSVG("Rodrigo Costa", "#10b981")
  },
  {
    id: "jog-11",
    nome: "Bruno Rocha",
    apelido: "Trator",
    posicao: "ZAG",
    perna: "Destro",
    atributos: { vel: 6.5, chu: 6.0, pas: 6.2, def: 8.4, fis: 9.1 },
    overall: 7.5,
    foto: gerarAvatarSVG("Bruno Rocha", "#334155")
  },
  {
    id: "jog-12",
    nome: "Felipe Nunes",
    apelido: "Garçom",
    posicao: "MEI",
    perna: "Destro",
    atributos: { vel: 7.2, chu: 6.8, pas: 8.4, def: 6.8, fis: 7.0 },
    overall: 7.4,
    foto: gerarAvatarSVG("Felipe Nunes", "#6366f1")
  }
];

// Chaves de armazenamento
const STORAGE_KEYS = {
  JOGADORES: 'chico_bet_jogadores_v1',
  CONFIG: 'chico_bet_config_v1'
};
