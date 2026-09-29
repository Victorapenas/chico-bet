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

Como em todo bom time de várzea, aqui **todo mundo correu dobrado e fez a sua parte**, se ajudando no projeto inteiro. O foco principal de cada um foi:

- **Paulo Amaral:** Arquiteto da Lógica de Negócio e Algoritmos (JavaScript). Focou no coração do sistema para o sorteio funcionar redondinho.
- **Victor Hugo (Você):** Mestre da Estrutura HTML e colaboração fortíssima na Lógica JavaScript junto com o Paulo.
- **Kauan Bento:** O mago da Estilização, Design & UI/UX (CSS Modular), atuando junto com o Francisco para deixar tudo com cara de FIFA.
- **Francisco António:** Responsável pela Estilização (CSS) junto com o Bento e pela Documentação do projeto.
- **Yan Lacerda:** Trabalhou na Estrutura (HTML) junto com o Victor e cuidou da Documentação.
