/**
 * dados.js — Elenco Oficial do Baba do IFBA Eunápolis
 *
 * Referência visual: FUTBIN (futbin.com) e EA Sports FC
 * Atributos oficiais PT-BR:
 * - RIT: Ritmo (Pace)
 * - FIN: Finalização (Shooting)
 * - PAS: Passe (Passing)
 * - DRI: Drible (Dribbling)
 * - DEF: Defesa (Defending)
 * - FIS: Físico (Physicality)
 *
 * Nacionalidade, Origem e Equipe (ex: Porto Seguro -> Eunápolis / Angola -> IFBA)
 */

var ELENCO_PADRAO = [
  {
    id: "j1",
    nome: "Victor Hugo",
    apelido: "Victor",
    posicao: "MEI",
    perna: "R", // Right / Destro
    origem: "Porto Seguro",
    pais: "Brasil",
    bandeira: "BR",
    time: "IFBA Eunápolis",
    foto: "fotos/foto_1.jpg",
    stats: { rit: 78, fin: 72, pas: 82, dri: 80, def: 64, fis: 70 },
    ovr: 0
  },
  {
    id: "j2",
    nome: "Paulo Amaral",
    apelido: "Capitão Paulo",
    posicao: "GOL",
    perna: "R",
    origem: "Eunápolis",
    pais: "Brasil",
    bandeira: "BR",
    time: "IFBA Eunápolis",
    foto: "fotos/foto_2.jpg",
    stats: { rit: 58, fin: 45, pas: 65, dri: 52, def: 84, fis: 80 },
    ovr: 0
  },
  {
    id: "j3",
    nome: "Kauan Bento",
    apelido: "Bento",
    posicao: "ATA",
    perna: "L", // Left / Canhoto
    origem: "Eunápolis",
    pais: "Brasil",
    bandeira: "BR",
    time: "IFBA Eunápolis",
    foto: "fotos/foto_3.jpg",
    stats: { rit: 84, fin: 82, pas: 68, dri: 79, def: 48, fis: 74 },
    ovr: 0
  },
  {
    id: "j4",
    nome: "Francisco António",
    apelido: "Chico",
    posicao: "ZAG",
    perna: "R",
    origem: "Luanda",
    pais: "Angola",
    bandeira: "AO", // Angola
    time: "IFBA Eunápolis",
    foto: "fotos/foto_4.jpg",
    stats: { rit: 68, fin: 52, pas: 66, dri: 60, def: 83, fis: 85 },
    ovr: 0
  },
  {
    id: "j5",
    nome: "Yan Lacerda",
    apelido: "Yan",
    posicao: "ALA",
    perna: "LR", // Ambidestro
    origem: "Eunápolis",
    pais: "Brasil",
    bandeira: "BR",
    time: "IFBA Eunápolis",
    foto: "",
    stats: { rit: 76, fin: 65, pas: 74, dri: 77, def: 66, fis: 70 },
    ovr: 0
  },
  {
    id: "j6",
    nome: "Gabriel Oliveira",
    apelido: "Muralha",
    posicao: "GOL",
    perna: "L",
    origem: "Porto Seguro",
    pais: "Brasil",
    bandeira: "BR",
    time: "IFBA Eunápolis",
    foto: "",
    stats: { rit: 54, fin: 40, pas: 60, dri: 48, def: 82, fis: 78 },
    ovr: 0
  },
  {
    id: "j7",
    nome: "Lucas Santos",
    apelido: "Luquinhas",
    posicao: "ZAG",
    perna: "R",
    origem: "Itabela",
    pais: "Brasil",
    bandeira: "BR",
    time: "IFBA Eunápolis",
    foto: "",
    stats: { rit: 65, fin: 50, pas: 64, dri: 58, def: 78, fis: 80 },
    ovr: 0
  },
  {
    id: "j8",
    nome: "Matheus Lima",
    apelido: "Theus",
    posicao: "ALA",
    perna: "R",
    origem: "Eunápolis",
    pais: "Brasil",
    bandeira: "BR",
    time: "IFBA Eunápolis",
    foto: "",
    stats: { rit: 74, fin: 66, pas: 70, dri: 75, def: 60, fis: 68 },
    ovr: 0
  },
  {
    id: "j9",
    nome: "Felipe Souza",
    apelido: "Felipão",
    posicao: "MEI",
    perna: "R",
    origem: "Arraial d'Ajuda",
    pais: "Brasil",
    bandeira: "BR",
    time: "IFBA Eunápolis",
    foto: "",
    stats: { rit: 70, fin: 74, pas: 80, dri: 72, def: 62, fis: 66 },
    ovr: 0
  },
  {
    id: "j10",
    nome: "Bruno Costa",
    apelido: "Brunão",
    posicao: "ATA",
    perna: "R",
    origem: "Eunápolis",
    pais: "Brasil",
    bandeira: "BR",
    time: "IFBA Eunápolis",
    foto: "",
    stats: { rit: 80, fin: 76, pas: 62, dri: 70, def: 46, fis: 78 },
    ovr: 0
  },
  {
    id: "j11",
    nome: "Rodrigo Lima",
    apelido: "Flecha",
    posicao: "ALA",
    perna: "L",
    origem: "Trancoso",
    pais: "Brasil",
    bandeira: "BR",
    time: "IFBA Eunápolis",
    foto: "",
    stats: { rit: 82, fin: 64, pas: 60, dri: 74, def: 56, fis: 66 },
    ovr: 0
  },
  {
    id: "j12",
    nome: "Diego Rocha",
    apelido: "Xerifinho",
    posicao: "ZAG",
    perna: "R",
    origem: "Eunápolis",
    pais: "Brasil",
    bandeira: "BR",
    time: "IFBA Eunápolis",
    foto: "",
    stats: { rit: 60, fin: 48, pas: 62, dri: 54, def: 76, fis: 82 },
    ovr: 0
  }
];

// Calcula o OVR de cada jogador do elenco padrão
ELENCO_PADRAO.forEach(function(j) {
  j.ovr = calcularOVR(j.posicao, j.stats);
});

var CHAVE_DADOS = "chicobet_jogadores_v4";
