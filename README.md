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

Chico B.E.T — Melhorias do Sorteio de Times
Módulo de sorteio do Chico B.E.T (baba da quadra do IFBA Campus Eunápolis). Forma times equilibrados pelo OVR, respeita a posição principal e secundária de cada jogador, lida com goleiro de três maneiras, divide os jogadores que passam do limite em reservas por time e organiza o rodízio de times inteiros durante o baba.

Arquivo do módulo: sorteio.js (sem dependências; funciona no navegador e no Node)
Testes: teste-sorteio.js
O que mudou
Antes	Agora
Formato fixo (1 goleiro + 5 na linha)	Quantidade de times configurável (3, 4, 5...)
Goleiro sempre obrigatório	Três modos de goleiro: com goleiro, sorteado no time ou de fora
Uma posição por jogador	Posição principal e posição secundária
Sem regra para excesso de jogadores	Limite de 24 em quadra; o excedente vira reserva dos times
Sem regra de rodízio	Rodízio de times inteiros, ganhando ou perdendo
Regras
1. Quantidade de times e limite de 24
O usuário escolhe o número de times (numTimes).
Com 24 jogadores ou mais, o sorteio forma sempre 4 times de 6 e avisa que o limite é 24.
Com menos jogadores que vagas, os times ficam com tamanhos diferentes e o sistema avisa.
2. Equilíbrio por OVR
Os jogadores são distribuídos em "cobrinha" (do melhor para o pior e de volta) e depois trocados entre times até a diferença de média de OVR ficar mínima.
O equilíbrio é medido no time inteiro (titulares + reservas) e também só nos titulares.
O OVR nunca decide a posição de ninguém: jogador de OVR alto não tem prioridade para ocupar posição.
3. Posição principal e secundária
Cada jogador tem uma posição principal e, se quiser, uma segunda opção (quem não é atacante pode escolher outra posição e cair nela).
O sistema escala cada um na principal; se não der, na secundária; só em último caso fica fora de posição.
4. Goleiro: três modos
Modo (modoGoleiro)	Como funciona
'com'	Um goleiro de verdade por time (1 goleiro + 5 na linha)
'sem-rodizio'	Sem goleiro: o goleiro é sorteado entre os jogadores do time, em ciclo (cada um agarra uma vez antes de alguém repetir)
'sem-externo'	Sem goleiro: alguém de fora agarra; o time joga com 5 na linha + o goleiro de fora, e o resto vira reserva
Detalhes:

Pessoas de fora que sabem agarrar (goleirosDeFora) têm prioridade para o gol sobre quem foi sorteado no time.
Se faltarem goleiros de fora, os demais times sorteiam o goleiro entre os próprios jogadores.
No modo 'com', o time que ficar sem goleiro usa uma dessas duas opções (fallbackSemGoleiro).
Se houver mais goleiros que times, o goleiro excedente vai para a linha e joga. Quem tem outra posição de preferência é o primeiro a ir; quem só quer o gol fica no gol.
Com muitos reservas, goleiros de fora deixam de fazer sentido, porque tornam o revezamento mais demorado.
5. Reservas por time
Quem passa das vagas em quadra vira reserva de um time, em quantidades diferentes (por exemplo, 2 num time e 3 noutro).
Todos estão em algum time, então todos jogam no revezamento do baba.
Como os reservas entram durante o baba, quem começa em quadra e quem começa no banco também entra no equilíbrio por OVR.
Opção alternativa: excedente: 'fila' manda o excedente para uma fila de espera. Nesse caso, quem ficou de fora no baba anterior entra primeiro no seguinte; entre empatados, goleiro excedente e mensalista vêm antes de convidado, e depois decide o sorteio.
6. Rodízio de times inteiros
Durante o baba os times revezam inteiros, ganhando ou perdendo: quem jogou uma partida descansa a seguinte, e joga quem está há mais tempo sem jogar.
Com 4 ou 5 times, ninguém joga duas partidas seguidas. Com 3 times, um deles repete a partida, e o sistema marca isso em jogamSeguidas.
Como usar
Inclua o arquivo na página:

<script src="sorteio.js"></script>
Ou, no Node:

const Sorteio = require('./sorteio.js');
Exemplo:

// 1) Sorteia os times
const res = Sorteio.sortearTimes(elencoConfirmado, {
  numTimes: 4,
  modoGoleiro: 'sem-externo',
  goleirosDeFora: [{ id: 'f1', nome: 'Convidado A', ovr: 70, posicao: 'GOL' }]
});

// 2) Gera as próximas partidas (rodízio de times e quem agarra)
const partidas = Sorteio.gerarPartidas(res, 8);

// 3) Ao encerrar o baba, atualiza os contadores e salva o elenco
elenco = Sorteio.fecharBaba(elenco, res, partidas);
localStorage.setItem('elenco', JSON.stringify(elenco));
Campos do jogador
Campo	Uso
id	Identificador único
ovr	Overall de 0 a 99
posicao	Principal: GOL, ZAG, ALA, MEI ou ATA
posicaoSecundaria	Segunda opção (opcional)
status	mensalista ou convidado
jogosForaSeguidos	Contador da fila de espera (opção 'fila'); começa em 0
vezesNoGol	Contador do ciclo do gol no time; começa em 0
Configuração
Opção	Padrão	Significado
numTimes	4	Quantidade de times; com 24 jogadores ou mais vira sempre 4
tamanhoTime	6	Jogadores em quadra por time, goleiro incluído
limiteJogadores	24	Jogadores em quadra por baba
excedente	'reservas'	'reservas': o excedente vira reserva dos times. 'fila': fica numa fila de espera
modoGoleiro	'com'	'com', 'sem-rodizio' ou 'sem-externo'
goleirosDeFora	[]	Pessoas de fora que agarram; têm prioridade no gol
fallbackSemGoleiro	automático	No modo 'com', o que fazer com time sem goleiro: 'externo' ou 'rodizio'
pesoPosicao	0.25	Peso de respeitar posições frente ao equilíbrio de OVR
seed	nenhum	Torna o resultado repetível (útil em testes)
O que sortearTimes devolve
Campo	Conteúdo
times	Lista de times, cada um com nome, mediaOVR, mediaTitulares, goleiro, jogadores (com papel e encaixe) e reservas
espera	Fila de espera (só na opção 'fila')
diferencaOVR	Diferença entre a maior e a menor média de OVR do time inteiro
diferencaTitulares	O mesmo, só com os titulares
avisos	Mensagens para mostrar na tela (limite de 24, falta de goleiros, reservas por time etc.)
sugestoesGoleiroDeFora	Candidatos ao gol quando o goleiro de fora ainda não foi definido
Funções
Função	O que faz
sortearTimes(jogadores, config)	Forma os times
gerarPartidas(resultado, n)	Gera as n próximas partidas com o rodízio de times e o goleiro de cada lado
goleiroDaPartida(time, n)	Quem agarra na n-ésima partida do time (0 é a primeira)
fecharBaba(jogadores, resultado, partidas)	Atualiza os contadores da fila e do gol; reservas contam como quem jogou
Testes
node teste-sorteio.js
Os testes cobrem: goleiros de verdade, goleiro de fora (com e sem lista), goleiro sorteado no time, limite de 24 com 4 times, goleiro excedente na linha, rodízio de times com 3, 4 e 5 times, reservas em quantidades diferentes, fila de espera e contadores, poucos jogadores e encaixe de posições. Em 30 sorteios com 28 jogadores, a pior diferença entre os times foi de 1,43 ponto de OVR no time inteiro e 1,33 nos titulares.

Para integrar ao site
Adicionar o campo Posição secundária no cadastro de atleta.
Incluir na tela de sorteio o modo de goleiro, a lista de goleiros de fora e a opção de excedente (reservas ou fila).
Mostrar o resultado com os titulares e os reservas de cada time, os avisos e as partidas em rodízio.
Chamar fecharBaba ao encerrar cada baba e salvar o elenco.
Melhorias futuras
Backend compartilhado (Supabase ou Firebase), porque o LocalStorage é por navegador.
Exportar e importar o elenco em JSON.
Atributos próprios para goleiro (reflexo, posicionamento, jogo com os pés).
Histórico de sorteios e babas, placar e ranking.
Regra de "quem perde sai" e travar jogadores no mesmo time ou em times opostos.
PWA para uso offline na quadra e escalação compartilhada como imagem.
Projeto de Programação Web — IFBA Campus Eunápolis (ADS, 4º semestre)
