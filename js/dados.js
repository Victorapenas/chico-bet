/**
 * dados.js - Dados Iniciais dos Jogadores do Baba do IFBA Eunápolis
 * Chico B.E.T - Programação Web (ADS - 4º Semestre)
 * Equipe: Victor Hugo, Paulo Amaral, Kauan Bento, Francisco António e Yan Lacerda
 */

// Formato padrão do Baba da Quadra do IFBA:
// 1 Goleiro + 5 de Linha = 6 jogadores por equipe (Regra oficial do campus)
const CONFIG_BABA = {
  nomeCampus: "IFBA - Campus Eunápolis",
  jogadoresPorTime: 6, // 1 no gol + 5 na linha
  quadra: "Quadra Poliesportiva do IFBA",
  posicoesDisponiveis: [
    { id: "GOL", nome: "Goleiro" },
    { id: "ZAG", nome: "Zagueiro / Fixo" },
    { id: "ALA", nome: "Ala / Lateral" },
    { id: "MEI", nome: "Meio-Campo" },
    { id: "ATA", nome: "Atacante / Pivô" }
  ]
};

// Elenco real inicial com os integrantes do IFBA
// Quem tem foto usa o caminho local na pasta 'fotos/', quem não tem fica com string vazia ""
const ELENCO_INICIAL = [
  {
    id: "jog-1",
    nome: "Victor Hugo",
    apelido: "Victor",
    posicao: "MEI",
    perna: "Destro",
    foto: "fotos/foto_1.jpg",
    skills: { vel: 4.5, chu: 4.0, pas: 4.5, def: 3.5, fis: 4.0, dri: 4.5 },
    estrelas: 4.2
  },
  {
    id: "jog-2",
    nome: "Paulo Amaral",
    apelido: "Capitão Paulo",
    posicao: "GOL",
    perna: "Destro",
    foto: "fotos/foto_2.jpg",
    skills: { vel: 3.0, chu: 2.5, pas: 3.5, def: 5.0, fis: 4.5, dri: 2.5 },
    estrelas: 4.0
  },
  {
    id: "jog-3",
    nome: "Kauan Bento",
    apelido: "Bento Resenha",
    posicao: "ATA",
    perna: "Canhoto",
    foto: "fotos/foto_3.jpg",
    skills: { vel: 4.5, chu: 4.5, pas: 3.5, def: 2.5, fis: 4.0, dri: 4.0 },
    estrelas: 4.1
  },
  {
    id: "jog-4",
    nome: "Francisco António",
    apelido: "Chico Galáctico",
    posicao: "ZAG",
    perna: "Destro",
    foto: "fotos/foto_4.jpg",
    skills: { vel: 3.5, chu: 3.0, pas: 3.5, def: 4.5, fis: 4.5, dri: 3.0 },
    estrelas: 3.9
  },
  {
    id: "jog-5",
    nome: "Yan Lacerda",
    apelido: "Yan",
    posicao: "ALA",
    perna: "Ambidestro",
    foto: "", // Sem foto no momento (placeholder neutro)
    skills: { vel: 4.0, chu: 3.5, pas: 4.0, def: 3.5, fis: 3.5, dri: 4.0 },
    estrelas: 3.8
  },
  {
    id: "jog-6",
    nome: "Gabriel Goleiro",
    apelido: "Muralha IFBA",
    posicao: "GOL",
    perna: "Canhoto",
    foto: "",
    skills: { vel: 3.0, chu: 2.0, pas: 3.0, def: 4.5, fis: 4.0, dri: 2.0 },
    estrelas: 3.8
  },
  {
    id: "jog-7",
    nome: "Lucas Silva",
    apelido: "Luquinhas",
    posicao: "ZAG",
    perna: "Destro",
    foto: "",
    skills: { vel: 3.5, chu: 3.0, pas: 3.5, def: 4.0, fis: 4.5, dri: 3.0 },
    estrelas: 3.7
  },
  {
    id: "jog-8",
    nome: "Matheus Oliveira",
    apelido: "Theus",
    posicao: "ALA",
    perna: "Destro",
    foto: "",
    skills: { vel: 4.0, chu: 3.5, pas: 3.5, def: 3.0, fis: 3.5, dri: 4.0 },
    estrelas: 3.6
  },
  {
    id: "jog-9",
    nome: "Felipe Santos",
    apelido: "Felipão",
    posicao: "MEI",
    perna: "Destro",
    foto: "",
    skills: { vel: 3.5, chu: 4.0, pas: 4.5, def: 3.0, fis: 3.5, dri: 3.5 },
    estrelas: 3.7
  },
  {
    id: "jog-10",
    nome: "Bruno Costa",
    apelido: "Brunão",
    posicao: "ATA",
    perna: "Destro",
    foto: "",
    skills: { vel: 4.5, chu: 4.0, pas: 3.0, def: 2.5, fis: 4.0, dri: 3.5 },
    estrelas: 3.8
  },
  {
    id: "jog-11",
    nome: "Rodrigo Lima",
    apelido: "Flecha",
    posicao: "ALA",
    perna: "Canhoto",
    foto: "",
    skills: { vel: 4.5, chu: 3.5, pas: 3.0, def: 3.0, fis: 3.5, dri: 3.5 },
    estrelas: 3.6
  },
  {
    id: "jog-12",
    nome: "Diego Rocha",
    apelido: "Xerifinho",
    posicao: "ZAG",
    perna: "Destro",
    foto: "",
    skills: { vel: 3.0, chu: 2.5, pas: 3.0, def: 4.0, fis: 4.5, dri: 2.5 },
    estrelas: 3.5
  }
];

const CHAVE_STORAGE = "chico_bet_jogadores_ifba_v2";
