# chico-bet

Plataforma interativa para automatizar o sorteio e equilibrar equipes de futebol amador." Isso resume o objetivo principal do sistema.

# Estrutura do projeto:

chico-bet/
│
├── index.html              # Tela Inicial (Dashboard)
├── elenco.html             # Tela de Elenco e Cartas
├── setup.html              # Tela de Setup e Sorteio
├── resultados.html         # Tela de Resultados
│
├── css/
│   └── style.css           # Arquivo central de estilos para todas as telas
│
├── js/
│   ├── app.js              # Funções gerais (navegação, menu)
│   ├── elenco.js           # Lógica para carregar os jogadores e filtrar posições
│   └── sorteio.js          # Algoritmo de cálculo do Overall e sorteio de times
│
└── assets/
    ├── img/                # Fotos dos jogadores e logo do sistema
    └── icons/              # Ícones (como as setinhas dos menus)
