# chico-bet

Plataforma interativa para automatizar o sorteio e equilibrar equipes de futebol amador (com aquela resenha garantida!). Isso resume o objetivo principal do sistema.

**Projeto de Programação Web - IFBA Eunápolis**  
**Profª:** Ana Cristina Linhares  
**Curso:** ADS - 4º Semestre  

## Estrutura do projeto:

Nesta nova versão, a arquitetura foi refatorada para uma **Single Page Application (SPA)** modular, separando as responsabilidades para manter o código limpo, profissional e fácil de dar manutenção.

```text
chico-bet/
│
├── index.html                  # Interface Única (SPA) com navegação dinâmica
│
├── css/                        # Estilos modulares (Arquitetura CSS)
│   ├── variaveis.css           # Design tokens (cores, fontes, sombras)
│   ├── base.css                # Reset, estilos da tag body, layout e header/footer
│   ├── componentes.css         # Estilos isolados (botões, formulários, badges)
│   ├── cartas-fut.css          # Design das Cartas estilo FIFA/FUT
│   ├── sorteio.css             # Estilos do campo tático 2D, pinos e confrontos
│   └── responsivo.css          # Media queries (adaptação para mobile e tablets)
│
├── js/                         # Lógica dividida por domínio
│   ├── app.js                  # Inicialização da aplicação (Start)
│   ├── dados.js                # Elenco inicial pré-cadastrado e configurações globais
│   ├── utils.js                # Funções utilitárias (cálculo de Overall e LocalStorage)
│   ├── navegacao.js            # Lógica para transição entre as telas (SPA)
│   ├── cartas.js               # Renderização dinâmica do elenco (Cartas FUT)
│   ├── cadastro.js             # Lógica de criação/edição de atletas e upload de fotos
│   └── sorteio.js              # Algoritmo de balanceamento de Overall e renderização tática
│
└── fotos/                      # Diretório destinado ao upload de imagens reais da galera (PNG)
```

## 👥 Divisão da Equipe e Papéis (Resenha FC):
- **Francisco António:** Responsável pela **Estrutura e HTML Semântico**. Garantiu que a fundação (o famoso "esqueleto" da aplicação) estivesse acessível, organizada e preparada para virar uma Single Page Application.
- **Kauan Bento:** O mago da **Estilização & UI/UX (CSS Modular)**. Trouxe o design premium, animações e a arquitetura de tokens visuais que faz o sistema parecer um jogo de videogame profissional.
- **Paulo Amaral:** Arquiteto da **Lógica de Negócio & Algoritmos (JavaScript)**. Desenvolveu toda a lógica modularizada, manipulando dados locais e garantindo que o algoritmo de balanceamento do Sorteio não deixe ninguém roubar no "Overall".
- **Victor Hugo Santana e Yan Lacerda:** Mestres da **Documentação, Elenco, UX Writing e Testes**. Garantiram a alma do "baba" com a resenha, validaram as funcionalidades para não bugar na hora da pelada, e documentaram o projeto (como você está lendo agora).
