// 1. DADOS INICIAIS DA TURMA E ELENCO DO BABA
const INITIAL_PLAYERS = [
    {
        id: "p1",
        nome: "Kauan Bento",
        apelido: "Chico Bento",
        posicao: "Atacante",
        perna: "Direito",
        skill: "Laço Caipira & Sola de Boi",
        bio: "Artilheiro oficial da roça e mestre das embaixadinhas com bota de couro.",
        foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        stats: { vel: 9, chu: 9, pas: 7, def: 6, fis: 9 }
    },
    {
        id: "p2",
        nome: "Francisco António",
        apelido: "Angolano do Meio",
        posicao: "Meio",
        perna: "Canhoto",
        skill: "Ginga Kuduro Tática",
        bio: "Diretamente de Luanda pro IFBA. Distribui canetas e organiza o meio-campo.",
        foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        stats: { vel: 8, chu: 8, pas: 10, def: 7, fis: 8 }
    },
    {
        id: "p3",
        nome: "Isaac Santos",
        apelido: "Isaac LCA Dobrada",
        posicao: "Zagueiro",
        perna: "Ambidestro",
        skill: "Duas LCA Operadas",
        bio: "O joelho estala a cada passada, mas não deixa nenhum atacante passar limpo.",
        foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        stats: { vel: 6, chu: 6, pas: 7, def: 9, fis: 7 }
    },
    {
        id: "p4",
        nome: "Paulo Amaral",
        apelido: "Paulo JS",
        posicao: "Meio",
        perna: "Direito",
        skill: "Algoritmo de Passe Perfeito",
        bio: "Calcula a trajetória do passe em milissegundos e organiza a zueira.",
        foto: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
        stats: { vel: 8, chu: 8, pas: 9, def: 8, fis: 8 }
    },
    {
        id: "p5",
        nome: "Victor Hugo",
        apelido: "Vitinho Bico",
        posicao: "Atacante",
        perna: "Direito",
        skill: "Chute de Bico Furador",
        bio: "SÓ chuta de bico na gaveta. Se pedir pra recompor a zaga ele finge câimbra.",
        foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
        stats: { vel: 9, chu: 9, pas: 6, def: 4, fis: 8 }
    },
    {
        id: "p6",
        nome: "Yan Lacerda",
        apelido: "Yan Paredão",
        posicao: "Goleiro",
        perna: "Direito",
        skill: "Mão de Alface Recheada",
        bio: "Defende chute à queima-roupa e espalma pra escanteio com categoria.",
        foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
        stats: { vel: 7, chu: 5, pas: 7, def: 9, fis: 9 }
    },
    {
        id: "p7",
        nome: "Ana Cristina Linhares",
        apelido: "Profª Nota 10",
        posicao: "Goleiro",
        perna: "Canhoto",
        skill: "Veto de Nota e Carrinho Semântico",
        bio: "Comandante do IFBA Eunápolis. Dar carrinho nela desconta 2 pontos na média.",
        foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
        stats: { vel: 10, chu: 10, pas: 10, def: 10, fis: 10 }
    },
    {
        id: "p8",
        nome: "Zé Carlos",
        apelido: "Zé Estressado",
        posicao: "Zagueiro",
        perna: "Ambidestro",
        skill: "Cartão Vermelho aos 2 min",
        bio: "Briga com o juiz, com a trave e com o companheiro antes da partida começar.",
        foto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
        stats: { vel: 7, chu: 6, pas: 5, def: 9, fis: 9 }
    },
    {
        id: "p9",
        nome: "Pedro Silva",
        apelido: "Pedrinho Finta",
        posicao: "Atacante",
        perna: "Canhoto",
        skill: "Drible de Vento",
        bio: "Dribla 3 defensores e perde o gol sem goleiro na linha de fundo.",
        foto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
        stats: { vel: 9, chu: 7, pas: 6, def: 5, fis: 7 }
    },
    {
        id: "p10",
        nome: "Gabriel Ramos",
        apelido: "Gabi Caipira",
        posicao: "Meio",
        perna: "Direito",
        skill: "Passe de Calcanhar Cego",
        bio: "Tenta passe de letra e toca pro técnico no banco de reservas.",
        foto: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80",
        stats: { vel: 7, chu: 7, pas: 8, def: 7, fis: 8 }
    },
    {
        id: "p11",
        nome: "Matheus Oliveira",
        apelido: "Matheus Caneta",
        posicao: "Meio",
        perna: "Direito",
        skill: "Caneta da Resenha",
        bio: "Só joga pra dar uma caneta. Depois de conseguir, pede pra substituir.",
        foto: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
        stats: { vel: 8, chu: 7, pas: 8, def: 6, fis: 7 }
    },
    {
        id: "p12",
        nome: "Lucas Mendes",
        apelido: "Lucas Paredão",
        posicao: "Goleiro",
        perna: "Direito",
        skill: "Defesa com o Nariz",
        bio: "Mete a cara na bola pra não deixar a rede balançar.",
        foto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
        stats: { vel: 6, chu: 4, pas: 6, def: 8, fis: 9 }
    }
];

// PRESETS DE AVATARES DE ZUEIRA
const AVATAR_PRESETS = {
    chico: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    angola: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    lca: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    dev: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
    prof: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    estressado: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"
};

// CONFIGURAÇÕES DE COLETES E CORES DOS TIMES
const TEAM_CONFIGS = [
    { id: 'team_a', name: "TIME A (COLETE VERDE)", color: "#10B981", tagClass: "tag-a", badgeText: "COLETE VERDE", icon: "fa-shirt" },
    { id: 'team_b', name: "TIME B (COLETE AZUL)", color: "#3B82F6", tagClass: "tag-b", badgeText: "COLETE AZUL", icon: "fa-shirt" },
    { id: 'team_c', name: "TIME C (COLETE AMARELO)", color: "#F59E0B", tagClass: "tag-c", badgeText: "COLETE AMARELO", icon: "fa-shirt" },
    { id: 'team_d', name: "TIME D (COLETE VERMELHO)", color: "#EF4444", tagClass: "tag-d", badgeText: "COLETE VERMELHO", icon: "fa-shirt" },
    { id: 'team_e', name: "TIME E (COLETE ROXO)", color: "#8B5CF6", tagClass: "tag-e", badgeText: "COLETE ROXO", icon: "fa-shirt" }
];

// ESTADOS GLOBAIS DA APLICAÇÃO
let squad = [];
let activePosFilter = "TODOS";
let currentDraftResult = null;
let generatedTeams = [];
let currentReserves = [];
let activeTeamTabIndex = 0;
let currentDrawViewMode = 'tactical';
let currentMatchFixtures = [];
