/**
 * sorteio.js — Módulo de Sorteio de Times do Chico B.E.T
 * IFBA Campus Eunápolis (ADS, 4º Semestre)
 *
 * Módulo puro sem dependências externas.
 * Funciona tanto no Node.js quanto no Navegador.
 */

(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.Sorteio = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // Gerador de números pseudoaleatórios com suporte a Seed determinístico
  function criarRNG(seed) {
    if (seed === undefined || seed === null) {
      return Math.random;
    }
    var s = 0;
    if (typeof seed === 'number') {
      s = seed | 0;
    } else {
      var str = String(seed);
      for (var i = 0; i < str.length; i++) {
        s = (s * 31 + str.charCodeAt(i)) | 0;
      }
    }
    if (s === 0) s = 123456789;
    return function () {
      s |= 0;
      s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Clona objeto de jogador garantindo propriedades esperadas
  function normalizarJogador(j) {
    return {
      id: j.id !== undefined ? String(j.id) : ('j_' + Math.random().toString(36).substr(2, 6)),
      nome: j.nome || j.apelido || 'Jogador',
      apelido: j.apelido || j.nome || '',
      ovr: typeof j.ovr === 'number' ? j.ovr : (typeof j.overall === 'number' ? j.overall : 70),
      posicao: (j.posicao || 'MEI').toUpperCase(),
      posicaoSecundaria: j.posicaoSecundaria ? j.posicaoSecundaria.toUpperCase() : null,
      status: j.status || j.categoria || 'mensalista',
      jogosForaSeguidos: parseInt(j.jogosForaSeguidos, 10) || 0,
      vezesNoGol: parseInt(j.vezesNoGol, 10) || 0,
      foto: j.foto || '',
      origem: j.origem || '',
      bandeira: j.bandeira || 'BR',
      stats: j.stats || {}
    };
  }

  // Calcula a média de OVR de um grupo de jogadores
  function calcularMedia(lista) {
    if (!lista || lista.length === 0) return 0;
    var soma = 0;
    for (var i = 0; i < lista.length; i++) {
      soma += lista[i].ovr;
    }
    return Math.round((soma / lista.length) * 100) / 100;
  }

  /**
   * sortearTimes(jogadores, config)
   *
   * @param {Array} jogadores - Lista de jogadores confirmados
   * @param {Object} config - Configurações do sorteio
   * @returns {Object} Resultado do sorteio
   */
  function sortearTimes(jogadores, config) {
    config = config || {};
    var rng = criarRNG(config.seed);

    var tamanhoTime = config.tamanhoTime || 6;
    var limiteJogadores = config.limiteJogadores || 24;
    var excedente = config.excedente || 'reservas'; // 'reservas' | 'fila'
    var modoGoleiro = config.modoGoleiro || 'com'; // 'com' | 'sem-rodizio' | 'sem-externo'
    var goleirosDeFora = (config.goleirosDeFora || []).map(normalizarJogador);
    var fallbackSemGoleiro = config.fallbackSemGoleiro || null;
    var pesoPosicao = typeof config.pesoPosicao === 'number' ? config.pesoPosicao : 0.25;

    var avisos = [];
    var sugestoesGoleiroDeFora = [];

    // Clona e normaliza elenco
    var pool = (jogadores || []).map(normalizarJogador);

    // 1. Quantidade de times e limite de 24
    var numTimes = config.numTimes || 4;
    if (pool.length >= limiteJogadores) {
      numTimes = 4;
      avisos.push('Limite de 24 jogadores atingido: o sorteio formará sempre 4 times de 6 atletas em quadra.');
    }

    var totalVagasTitulares = numTimes * tamanhoTime;
    if (pool.length < totalVagasTitulares) {
      avisos.push('Quantidade de jogadores (' + pool.length + ') é inferior a ' + totalVagasTitulares + ' vagas. Alguns times terão menos atletas.');
    }

    // Separação entre titulares e fila de espera (se excedente === 'fila')
    var titularesPool = [];
    var espera = [];

    if (excedente === 'fila' && pool.length > totalVagasTitulares) {
      // Ordena quem tem prioridade para entrar nos times titulares:
      // 1º maior jogosForaSeguidos (quem ficou mais jogos de fora)
      // 2º mensalistas antes de convidados
      // 3º desempate por sorteio
      var poolOrdenado = pool.slice().sort(function (a, b) {
        if (b.jogosForaSeguidos !== a.jogosForaSeguidos) {
          return b.jogosForaSeguidos - a.jogosForaSeguidos;
        }
        var catA = (a.status === 'mensalista' || a.categoria === 'mensalista') ? 1 : 0;
        var catB = (b.status === 'mensalista' || b.categoria === 'mensalista') ? 1 : 0;
        if (catB !== catA) {
          return catB - catA;
        }
        return (rng() - 0.5);
      });

      titularesPool = poolOrdenado.slice(0, totalVagasTitulares);
      espera = poolOrdenado.slice(totalVagasTitulares);
      avisos.push(espera.length + ' jogador(es) excedente(s) alocado(s) na fila de espera.');
    } else {
      titularesPool = pool.slice();
      espera = [];
    }

    // Inicializa a estrutura dos times
    var times = [];
    for (var t = 0; t < numTimes; t++) {
      times.push({
        id: 'time_' + (t + 1),
        numero: t + 1,
        nome: 'Time ' + String.fromCharCode(65 + t),
        goleiro: null,
        jogadores: [], // titulares
        reservas: [],
        mediaTitulares: 0,
        mediaOVR: 0
      });
    }

    // 4. Tratamento de Goleiros
    var goleirosDefinidos = [];
    var jogadoresDeLinha = [];

    if (modoGoleiro === 'com') {
      var goleirosNaturais = titularesPool.filter(function (j) { return j.posicao === 'GOL'; });
      var jogadoresNaoGoleiros = titularesPool.filter(function (j) { return j.posicao !== 'GOL'; });

      // Se houver mais goleiros que times: excedentes vão para a linha!
      if (goleirosNaturais.length > numTimes) {
        avisos.push('Há mais goleiros que times (' + goleirosNaturais.length + ' para ' + numTimes + ' times). Goleiro(s) excedente(s) alocado(s) na linha.');
        // Quem tem outra posição de preferência é o primeiro a ir para a linha
        goleirosNaturais.sort(function (a, b) {
          var prefA = (a.posicaoSecundaria && a.posicaoSecundaria !== 'GOL') ? 1 : 0;
          var prefB = (b.posicaoSecundaria && b.posicaoSecundaria !== 'GOL') ? 1 : 0;
          if (prefB !== prefA) return prefB - prefA;
          return (rng() - 0.5);
        });

        // Os que têm preferência vão para a linha primeiro
        var qtdParaLinha = goleirosNaturais.length - numTimes;
        var goleirosExcedentesLinha = goleirosNaturais.splice(0, qtdParaLinha);

        goleirosExcedentesLinha.forEach(function (gk) {
          gk._goleiroParaLinha = true;
          jogadoresNaoGoleiros.push(gk);
        });
      }

      // Distribui os goleiros naturais pelos times
      goleirosNaturais.sort(function (a, b) { return b.ovr - a.ovr; });
      for (var gi = 0; gi < goleirosNaturais.length && gi < numTimes; gi++) {
        times[gi].goleiro = {
          tipo: 'fixo',
          jogador: goleirosNaturais[gi],
          nome: goleirosNaturais[gi].nome
        };
        goleirosDefinidos.push(times[gi]);
      }

      // Se faltarem goleiros:
      if (goleirosNaturais.length < numTimes) {
        var faltamGks = numTimes - goleirosNaturais.length;
        var fallback = fallbackSemGoleiro;
        if (!fallback) {
          fallback = goleirosDeFora.length > 0 ? 'externo' : 'rodizio';
        }

        if (fallback === 'externo' && goleirosDeFora.length > 0) {
          var foraIdx = 0;
          for (var fi = 0; fi < numTimes; fi++) {
            if (!times[fi].goleiro) {
              if (foraIdx < goleirosDeFora.length) {
                times[fi].goleiro = {
                  tipo: 'externo',
                  jogador: goleirosDeFora[foraIdx],
                  nome: goleirosDeFora[foraIdx].nome
                };
                avisos.push(times[fi].nome + ' usará goleiro de fora (' + goleirosDeFora[foraIdx].nome + ').');
                foraIdx++;
              } else {
                times[fi].goleiro = { tipo: 'rodizio', nome: 'Sorteado no time' };
                avisos.push(times[fi].nome + ' sem goleiro fixo; fará rodízio interno de goleiro.');
              }
            }
          }
        } else {
          for (var ri = 0; ri < numTimes; ri++) {
            if (!times[ri].goleiro) {
              times[ri].goleiro = { tipo: 'rodizio', nome: 'Sorteado no time' };
              avisos.push(times[ri].nome + ' sem goleiro fixo; fará rodízio interno entre seus atletas.');
            }
          }
        }
      }

      jogadoresDeLinha = jogadoresNaoGoleiros;

    } else if (modoGoleiro === 'sem-externo') {
      // Todos do elenco jogam na linha. Goleiros de fora assumem o gol
      jogadoresDeLinha = titularesPool.slice();

      var gExtIdx = 0;
      for (var ei = 0; ei < numTimes; ei++) {
        if (gExtIdx < goleirosDeFora.length) {
          times[ei].goleiro = {
            tipo: 'externo',
            jogador: goleirosDeFora[gExtIdx],
            nome: goleirosDeFora[gExtIdx].nome
          };
          gExtIdx++;
        } else {
          times[ei].goleiro = { tipo: 'rodizio', nome: 'Sorteado no time' };
          avisos.push(times[ei].nome + ' fará rodízio no gol por falta de goleiro de fora suficiente.');
        }
      }

      if (goleirosDeFora.length === 0) {
        // Sugere possíveis atletas que tenham GOL na principal ou secundária
        sugestoesGoleiroDeFora = pool.filter(function (j) {
          return j.posicao === 'GOL' || j.posicaoSecundaria === 'GOL';
        }).map(function (j) { return j.nome; });
        avisos.push('Nenhum goleiro de fora cadastrado para o modo "sem-externo".');
      }

    } else if (modoGoleiro === 'sem-rodizio') {
      // Sem goleiro fixo: todos na linha, gol revezado internamente
      jogadoresDeLinha = titularesPool.slice();
      for (var si = 0; si < numTimes; si++) {
        times[si].goleiro = { tipo: 'rodizio', nome: 'Sorteado no time' };
      }
      avisos.push('Modo sem goleiro: cada equipe fará rodízio interno de goleiro.');
    }

    // Calcula vagas titulares de linha necessárias por time
    // Se o time tem goleiro fixo que veio do próprio elenco, ele ocupa 1 vaga titular
    // Se tem goleiro de fora ou rodízio, todos os jogadores de linha completam as vagas
    var vagasLinhaPorTime = [];
    var totalVagasLinhaTitulares = 0;

    for (var vt = 0; vt < numTimes; vt++) {
      var timeGk = times[vt].goleiro;
      if (timeGk && timeGk.tipo === 'fixo' && timeGk.jogador) {
        // O goleiro natural já conta como 1 vaga titular no time
        vagasLinhaPorTime[vt] = tamanhoTime - 1;
      } else if (timeGk && timeGk.tipo === 'externo') {
        // Goleiro externo agarra no gol; a linha tem (tamanhoTime - 1) jogadores de linha jogando
        vagasLinhaPorTime[vt] = tamanhoTime - 1;
      } else {
        // Sem goleiro fixo / rodizio interno: o time precisa de tamanhoTime jogadores em quadra
        vagasLinhaPorTime[vt] = tamanhoTime;
      }
      totalVagasLinhaTitulares += vagasLinhaPorTime[vt];
    }

    // Separa os jogadores de linha entre Titulares e Reservas dos Times
    // Se excedente === 'reservas', o que passa das vagas titulares vira reserva
    var titularesLinha = [];
    var reservasLinha = [];

    // Ordena os jogadores de linha por OVR decrescente
    jogadoresDeLinha.sort(function (a, b) { return b.ovr - a.ovr; });

    if (excedente === 'reservas' && jogadoresDeLinha.length > totalVagasLinhaTitulares) {
      titularesLinha = jogadoresDeLinha.slice(0, totalVagasLinhaTitulares);
      reservasLinha = jogadoresDeLinha.slice(totalVagasLinhaTitulares);
      avisos.push(reservasLinha.length + ' atleta(s) excedente(s) distribuído(s) como reserva(s) nas equipes.');

      // Alerta quando há muitos reservas e goleiros de fora
      if (reservasLinha.length >= numTimes * 2 && (modoGoleiro === 'sem-externo' || (times.some(function(t){ return t.goleiro && t.goleiro.tipo === 'externo'; })))) {
        avisos.push('Com muitos reservas por time, o uso de goleiros de fora pode tornar o revezamento da linha mais demorado.');
      }
    } else {
      titularesLinha = jogadoresDeLinha.slice(0, totalVagasLinhaTitulares);
      reservasLinha = jogadoresDeLinha.slice(totalVagasLinhaTitulares);
    }

    // 2. Distribuição em Cobrinha (Snake Draft) dos Titulares de Linha
    // Cria buckets para titulares de cada time
    var bucketsTitulares = [];
    for (var b = 0; b < numTimes; b++) {
      bucketsTitulares.push([]);
    }

    var snakeIdx = 0;
    var snakeDir = 1;
    for (var li = 0; li < titularesLinha.length; li++) {
      // Encontra próximo time que ainda tenha vaga de titular de linha
      var tentou = 0;
      while (bucketsTitulares[snakeIdx].length >= vagasLinhaPorTime[snakeIdx] && tentou < numTimes) {
        snakeIdx += snakeDir;
        if (snakeIdx >= numTimes) {
          snakeIdx = numTimes - 1;
          snakeDir = -1;
        } else if (snakeIdx < 0) {
          snakeIdx = 0;
          snakeDir = 1;
        }
        tentou++;
      }

      bucketsTitulares[snakeIdx].push(titularesLinha[li]);

      snakeIdx += snakeDir;
      if (snakeIdx >= numTimes) {
        snakeIdx = numTimes - 1;
        snakeDir = -1;
      } else if (snakeIdx < 0) {
        snakeIdx = 0;
        snakeDir = 1;
      }
    }

    // 5. Distribuição dos Reservas entre os times (equilibrando quantidade e OVR)
    var bucketsReservas = [];
    for (var rb = 0; rb < numTimes; rb++) {
      bucketsReservas.push([]);
    }

    if (reservasLinha.length > 0) {
      // Ordena times pela menor quantidade de reservas, depois menor média de OVR
      reservasLinha.forEach(function (reserva) {
        var timeAlvo = 0;
        var minReservas = 999;
        var minMedia = 999;

        for (var tIdx = 0; tIdx < numTimes; tIdx++) {
          var qtdRes = bucketsReservas[tIdx].length;
          var somaAtual = 0;
          bucketsTitulares[tIdx].forEach(function(j) { somaAtual += j.ovr; });
          bucketsReservas[tIdx].forEach(function(j) { somaAtual += j.ovr; });
          var totJogadores = bucketsTitulares[tIdx].length + bucketsReservas[tIdx].length;
          var mediaAtual = totJogadores > 0 ? somaAtual / totJogadores : 0;

          if (qtdRes < minReservas || (qtdRes === minReservas && mediaAtual < minMedia)) {
            minReservas = qtdRes;
            minMedia = mediaAtual;
            timeAlvo = tIdx;
          }
        }

        bucketsReservas[timeAlvo].push(reserva);
      });
    }

    // Otimização por troca local (2-opt swaps) para minimizar diferença de OVR e respeitar posições
    // Função para calcular custo do estado
    function calcularCusto(titularesArr, reservasArr) {
      var mediasTit = [];
      var mediasTot = [];
      var penalidadePos = 0;

      for (var i = 0; i < numTimes; i++) {
        var tit = titularesArr[i].slice();
        if (times[i].goleiro && times[i].goleiro.tipo === 'fixo' && times[i].goleiro.jogador) {
          tit.push(times[i].goleiro.jogador);
        }
        var mTit = calcularMedia(tit);
        mediasTit.push(mTit);

        var todos = tit.concat(reservasArr[i]);
        var mTot = calcularMedia(todos);
        mediasTot.push(mTot);
      }

      var maxTit = Math.max.apply(null, mediasTit);
      var minTit = Math.min.apply(null, mediasTit);
      var difTit = maxTit - minTit;

      var maxTot = Math.max.apply(null, mediasTot);
      var minTot = Math.min.apply(null, mediasTot);
      var difTot = maxTot - minTot;

      return {
        difTitulares: difTit,
        difTotal: difTot,
        score: (difTit * 0.6) + (difTot * 0.4)
      };
    }

    // Executa trocas entre titulares para calibrar OVR
    var melhorEstadoTitulares = bucketsTitulares.map(function (b) { return b.slice(); });
    var melhorEstadoReservas = bucketsReservas.map(function (b) { return b.slice(); });
    var melhorCusto = calcularCusto(melhorEstadoTitulares, melhorEstadoReservas);

    var maxIter = 600;
    for (var iter = 0; iter < maxIter; iter++) {
      // Escolhe dois times aleatórios
      var tA = Math.floor(rng() * numTimes);
      var tB = Math.floor(rng() * numTimes);
      if (tA === tB) continue;

      // 1. Tenta troca entre dois titulares
      if (melhorEstadoTitulares[tA].length > 0 && melhorEstadoTitulares[tB].length > 0) {
        var idxA = Math.floor(rng() * melhorEstadoTitulares[tA].length);
        var idxB = Math.floor(rng() * melhorEstadoTitulares[tB].length);

        var temp = melhorEstadoTitulares[tA][idxA];
        melhorEstadoTitulares[tA][idxA] = melhorEstadoTitulares[tB][idxB];
        melhorEstadoTitulares[tB][idxB] = temp;

        var novoCusto = calcularCusto(melhorEstadoTitulares, melhorEstadoReservas);
        if (novoCusto.score < melhorCusto.score) {
          melhorCusto = novoCusto;
        } else {
          // Reverte
          temp = melhorEstadoTitulares[tA][idxA];
          melhorEstadoTitulares[tA][idxA] = melhorEstadoTitulares[tB][idxB];
          melhorEstadoTitulares[tB][idxB] = temp;
        }
      }

      // 2. Se houver reservas, tenta troca entre reservas
      if (melhorEstadoReservas[tA].length > 0 && melhorEstadoReservas[tB].length > 0) {
        var rIdxA = Math.floor(rng() * melhorEstadoReservas[tA].length);
        var rIdxB = Math.floor(rng() * melhorEstadoReservas[tB].length);

        var rTemp = melhorEstadoReservas[tA][rIdxA];
        melhorEstadoReservas[tA][rIdxA] = melhorEstadoReservas[tB][rIdxB];
        melhorEstadoReservas[tB][rIdxB] = rTemp;

        var rNovoCusto = calcularCusto(melhorEstadoTitulares, melhorEstadoReservas);
        if (rNovoCusto.score < melhorCusto.score) {
          melhorCusto = rNovoCusto;
        } else {
          rTemp = melhorEstadoReservas[tA][rIdxA];
          melhorEstadoReservas[tA][rIdxA] = melhorEstadoReservas[tB][rIdxB];
          melhorEstadoReservas[tB][rIdxB] = rTemp;
        }
      }
    }

    // 3. Atribuição de Posições (Papel e Encaixe) para cada time
    // Regra: escalado na principal; se não der, na secundária; só em último caso fora de posição.
    // OVR nunca decide posição.
    for (var ti = 0; ti < numTimes; ti++) {
      var timeObj = times[ti];
      var titularesFinais = [];

      // Se tiver goleiro fixo do elenco, inclui com papel GOL e encaixe principal
      if (timeObj.goleiro && timeObj.goleiro.tipo === 'fixo' && timeObj.goleiro.jogador) {
        var gkJogador = Object.assign({}, timeObj.goleiro.jogador, {
          papel: 'GOL',
          encaixe: 'principal'
        });
        titularesFinais.push(gkJogador);
      }

      var jogadoresLinhaTime = melhorEstadoTitulares[ti];

      // Define as vagas da linha disponíveis para a quadra
      // Padrão de 5 de linha: 2 ZAG, 2 ALA, 1 ATA (ou MEI)
      var vagasLinhaDisponiveis = [];
      var qtdVagasLinha = vagasLinhaPorTime[ti];

      if (qtdVagasLinha === 5) {
        vagasLinhaDisponiveis = ['ZAG', 'ZAG', 'ALA', 'ALA', 'ATA'];
      } else if (qtdVagasLinha === 4) {
        vagasLinhaDisponiveis = ['ZAG', 'ALA', 'ALA', 'ATA'];
      } else if (qtdVagasLinha === 6) {
        vagasLinhaDisponiveis = ['ZAG', 'ZAG', 'ALA', 'ALA', 'MEI', 'ATA'];
      } else {
        var base = ['ZAG', 'ALA', 'ALA', 'MEI', 'ATA', 'ZAG', 'ALA', 'MEI'];
        vagasLinhaDisponiveis = base.slice(0, qtdVagasLinha);
      }

      // Encaixe sem prioridade por OVR:
      // Embaralha ordem dos jogadores para que o OVR não decida a vaga
      var copiaLinha = jogadoresLinhaTime.map(function (j) { return Object.assign({}, j); });
      var vagasRestantes = vagasLinhaDisponiveis.slice();
      var escalados = [];

      // Passo 1: Tenta encaixar na posição principal
      for (var p1 = copiaLinha.length - 1; p1 >= 0; p1--) {
        var atleta1 = copiaLinha[p1];
        var matchIdx1 = vagasRestantes.indexOf(atleta1.posicao);
        if (matchIdx1 !== -1) {
          atleta1.papel = atleta1.posicao;
          atleta1.encaixe = 'principal';
          escalados.push(atleta1);
          vagasRestantes.splice(matchIdx1, 1);
          copiaLinha.splice(p1, 1);
        }
      }

      // Passo 2: Tenta encaixar na posição secundária
      for (var p2 = copiaLinha.length - 1; p2 >= 0; p2--) {
        var atleta2 = copiaLinha[p2];
        if (atleta2.posicaoSecundaria) {
          var matchIdx2 = vagasRestantes.indexOf(atleta2.posicaoSecundaria);
          if (matchIdx2 !== -1) {
            atleta2.papel = atleta2.posicaoSecundaria;
            atleta2.encaixe = 'secundaria';
            escalados.push(atleta2);
            vagasRestantes.splice(matchIdx2, 1);
            copiaLinha.splice(p2, 1);
          }
        }
      }

      // Passo 3: Encaixa os que sobraram nas vagas restantes (fora de posição)
      for (var p3 = 0; p3 < copiaLinha.length; p3++) {
        var atleta3 = copiaLinha[p3];
        var vagaSobra = vagasRestantes.shift() || atleta3.posicao;
        atleta3.papel = vagaSobra;
        atleta3.encaixe = (vagaSobra === atleta3.posicao) ? 'principal' : (vagaSobra === atleta3.posicaoSecundaria ? 'secundaria' : 'fora');
        escalados.push(atleta3);
      }

      titularesFinais = titularesFinais.concat(escalados);
      timeObj.jogadores = titularesFinais;

      // Reservas do time
      timeObj.reservas = melhorEstadoReservas[ti].map(function (r) {
        return Object.assign({}, r, {
          papel: r.posicao,
          encaixe: 'reserva'
        });
      });

      // Calcula médias
      timeObj.mediaTitulares = calcularMedia(timeObj.jogadores);
      var elencoCompletoTime = timeObj.jogadores.concat(timeObj.reservas);
      timeObj.mediaOVR = calcularMedia(elencoCompletoTime);
    }

    // Diferenças finais de OVR
    var mediasTitularesTodas = times.map(function (t) { return t.mediaTitulares; });
    var mediasGeraisTodas = times.map(function (t) { return t.mediaOVR; });

    var diferencaTitulares = Math.round((Math.max.apply(null, mediasTitularesTodas) - Math.min.apply(null, mediasTitularesTodas)) * 100) / 100;
    var diferencaOVR = Math.round((Math.max.apply(null, mediasGeraisTodas) - Math.min.apply(null, mediasGeraisTodas)) * 100) / 100;

    return {
      times: times,
      espera: espera,
      diferencaOVR: diferencaOVR,
      diferencaTitulares: diferencaTitulares,
      avisos: avisos,
      sugestoesGoleiroDeFora: sugestoesGoleiroDeFora
    };
  }

  /**
   * goleiroDaPartida(time, n)
   *
   * @param {Object} time - Time retornado pelo sorteio
   * @param {number} n - Índice da partida do time (0 é a primeira partida)
   * @returns {Object|string} Informação de quem agarra
   */
  function goleiroDaPartida(time, n) {
    if (!time) return 'Indefinido';
    n = parseInt(n, 10) || 0;

    if (time.goleiro && time.goleiro.tipo === 'fixo' && time.goleiro.jogador) {
      return time.goleiro.jogador;
    }

    if (time.goleiro && time.goleiro.tipo === 'externo' && time.goleiro.jogador) {
      return time.goleiro.jogador;
    }

    // Modo rodízio: cicla entre os jogadores do time
    var atletas = time.jogadores.concat(time.reservas || []);
    if (atletas.length === 0) return 'Goleiro Sorteado';

    // Ordena pelo número de vezes que foi ao gol, depois por ID estável
    var filaGol = atletas.slice().sort(function (a, b) {
      if (a.vezesNoGol !== b.vezesNoGol) {
        return a.vezesNoGol - b.vezesNoGol;
      }
      return String(a.id).localeCompare(String(b.id));
    });

    var idx = n % filaGol.length;
    return filaGol[idx];
  }

  /**
   * gerarPartidas(resultado, n)
   *
   * @param {Object} resultado - Retorno de sortearTimes
   * @param {number} n - Quantidade de partidas a gerar (padrão 8)
   * @returns {Array} Lista de partidas geradas
   */
  function gerarPartidas(resultado, n) {
    var times = (resultado && resultado.times) ? resultado.times : [];
    n = n || 8;

    if (times.length < 2) return [];

    var partidas = [];
    var numTimes = times.length;

    // Rastreamento do histórico de jogos de cada time
    var estadoTimes = {};
    times.forEach(function (t) {
      estadoTimes[t.nome] = {
        time: t,
        partidasJogadas: 0,
        jogosSemJogar: 0,
        jogouUltima: false
      };
    });

    for (var rodada = 1; rodada <= n; rodada++) {
      var timeA = null;
      var timeB = null;
      var jogamSeguidas = false;

      if (rodada === 1) {
        // Partida 1: Time A x Time B
        timeA = times[0];
        timeB = times[1];
        jogamSeguidas = false;
      } else {
        // Candidatos que NÃO jogaram a última partida
        var descansados = times.filter(function (t) {
          return !estadoTimes[t.nome].jogouUltima;
        });

        // Ordena descansados pelo maior tempo sem jogar
        descansados.sort(function (a, b) {
          return estadoTimes[b.nome].jogosSemJogar - estadoTimes[a.nome].jogosSemJogar;
        });

        if (descansados.length >= 2) {
          timeA = descansados[0];
          timeB = descansados[1];
          jogamSeguidas = false;
        } else if (descansados.length === 1) {
          // Ex: com 3 times, 1 descansa e 2 jogaram. O descansado entra obrigatoriamente
          timeA = descansados[0];

          // O segundo time será quem jogou a última, escolhendo quem jogou menos partidas no total
          var jogaramUltima = times.filter(function (t) {
            return estadoTimes[t.nome].jogouUltima;
          });

          jogaramUltima.sort(function (a, b) {
            return estadoTimes[a.nome].partidasJogadas - estadoTimes[b.nome].partidasJogadas;
          });

          timeB = jogaramUltima[0];
          jogamSeguidas = true; // Necessariamente repete partida
        } else {
          // Fallback seguro
          timeA = times[0];
          timeB = times[1];
          jogamSeguidas = true;
        }
      }

      // Identifica quem é o goleiro de cada time nessa partida
      var gkA = goleiroDaPartida(timeA, estadoTimes[timeA.nome].partidasJogadas);
      var gkB = goleiroDaPartida(timeB, estadoTimes[timeB.nome].partidasJogadas);

      var descansamLista = times.filter(function (t) {
        return t.nome !== timeA.nome && t.nome !== timeB.nome;
      }).map(function (t) { return t.nome; });

      partidas.push({
        numero: rodada,
        timeA: timeA.nome,
        timeB: timeB.nome,
        goleiroTimeA: gkA.nome || gkA,
        goleiroTimeB: gkB.nome || gkB,
        goleiroObjA: gkA,
        goleiroObjB: gkB,
        jogamSeguidas: jogamSeguidas,
        descansam: descansamLista
      });

      // Atualiza estado de descanso e partidas
      times.forEach(function (t) {
        if (t.nome === timeA.nome || t.nome === timeB.nome) {
          estadoTimes[t.nome].partidasJogadas++;
          estadoTimes[t.nome].jogosSemJogar = 0;
          estadoTimes[t.nome].jogouUltima = true;
        } else {
          estadoTimes[t.nome].jogosSemJogar++;
          estadoTimes[t.nome].jogouUltima = false;
        }
      });
    }

    return partidas;
  }

  /**
   * fecharBaba(jogadores, resultado, partidas)
   *
   * Atualiza os contadores da fila de espera e de atuação no gol
   *
   * @param {Array} jogadores - Elenco completo original
   * @param {Object} resultado - Resultado do sorteio
   * @param {Array} partidas - Partidas geradas/realizadas
   * @returns {Array} Elenco atualizado
   */
  function fecharBaba(jogadores, resultado, partidas) {
    var mapa = {};
    (jogadores || []).forEach(function (j) {
      mapa[String(j.id)] = Object.assign({}, j);
    });

    // Contabiliza vezes no gol ocorridas nas partidas
    if (partidas && Array.isArray(partidas)) {
      partidas.forEach(function (p) {
        if (p.goleiroObjA && p.goleiroObjA.id && mapa[p.goleiroObjA.id]) {
          mapa[p.goleiroObjA.id].vezesNoGol = (mapa[p.goleiroObjA.id].vezesNoGol || 0) + 1;
        }
        if (p.goleiroObjB && p.goleiroObjB.id && mapa[p.goleiroObjB.id]) {
          mapa[p.goleiroObjB.id].vezesNoGol = (mapa[p.goleiroObjB.id].vezesNoGol || 0) + 1;
        }
      });
    }

    // Fila de espera: quem ficou na espera incrementa jogosForaSeguidos
    if (resultado && resultado.espera && resultado.espera.length > 0) {
      resultado.espera.forEach(function (esp) {
        if (mapa[esp.id]) {
          mapa[esp.id].jogosForaSeguidos = (mapa[esp.id].jogosForaSeguidos || 0) + 1;
        }
      });
    }

    // Quem jogou ou ficou como reserva nos times tem jogosForaSeguidos zerado
    if (resultado && resultado.times) {
      resultado.times.forEach(function (t) {
        var ativos = (t.jogadores || []).concat(t.reservas || []);
        ativos.forEach(function (at) {
          if (mapa[at.id]) {
            mapa[at.id].jogosForaSeguidos = 0;
          }
        });
      });
    }

    return Object.values(mapa);
  }

  return {
    sortearTimes: sortearTimes,
    gerarPartidas: gerarPartidas,
    goleiroDaPartida: goleiroDaPartida,
    fecharBaba: fecharBaba
  };
}));
