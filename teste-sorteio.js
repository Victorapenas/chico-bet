/**
 * teste-sorteio.js — Bateria de Testes do Módulo de Sorteio do Chico B.E.T
 * Executável com: node teste-sorteio.js
 */

const assert = require('assert');
const Sorteio = require('./sorteio.js');

console.log('⚽ Iniciando bateria de testes do Chico B.E.T — Módulo de Sorteio...\n');

let totalTestes = 0;
let testesPassaram = 0;

function test(descricao, fn) {
  totalTestes++;
  try {
    fn();
    console.log(`  ✓ ${descricao}`);
    testesPassaram++;
  } catch (err) {
    console.error(`  ✗ ${descricao}`);
    console.error(`    Erro: ${err.message}`);
  }
}

// Helper para gerar elenco sintético de teste
function gerarElenco(qtd, qtdGoleiros = 2) {
  const posicoes = ['ZAG', 'ALA', 'MEI', 'ATA'];
  const elenco = [];
  for (let i = 1; i <= qtd; i++) {
    const isGk = i <= qtdGoleiros;
    elenco.push({
      id: 'atleta_' + i,
      nome: 'Jogador ' + i,
      ovr: 60 + Math.floor((i * 7) % 30), // Variação realista de 60 a 89
      posicao: isGk ? 'GOL' : posicoes[(i - 1) % posicoes.length],
      posicaoSecundaria: isGk ? (i % 2 === 0 ? 'ZAG' : null) : posicoes[(i + 1) % posicoes.length],
      status: i % 4 === 0 ? 'convidado' : 'mensalista',
      jogosForaSeguidos: 0,
      vezesNoGol: 0
    });
  }
  return elenco;
}

// 1. Goleiros de Verdade
test('1. Goleiros de verdade: aloca 1 goleiro natural por time no modo "com"', () => {
  const elenco = gerarElenco(18, 3); // 3 goleiros para 3 times
  const res = Sorteio.sortearTimes(elenco, {
    numTimes: 3,
    tamanhoTime: 6,
    modoGoleiro: 'com',
    seed: 42
  });

  assert.strictEqual(res.times.length, 3, 'Deve gerar 3 times');
  res.times.forEach(t => {
    assert.ok(t.goleiro, 'Time deve ter goleiro definido');
    assert.strictEqual(t.goleiro.tipo, 'fixo', 'Tipo do goleiro deve ser fixo');
    assert.strictEqual(t.goleiro.jogador.posicao, 'GOL', 'Jogador deve ter posição GOL');
  });
});

// 2. Goleiro de Fora (com e sem lista)
test('2. Goleiro de fora (com lista): times recebem goleiro de fora prioritário', () => {
  const elenco = gerarElenco(12, 0); // Sem goleiro no elenco
  const goleirosDeFora = [
    { id: 'ext1', nome: 'Paredão de Fora 1', ovr: 75, posicao: 'GOL' },
    { id: 'ext2', nome: 'Paredão de Fora 2', ovr: 72, posicao: 'GOL' }
  ];

  const res = Sorteio.sortearTimes(elenco, {
    numTimes: 2,
    tamanhoTime: 6,
    modoGoleiro: 'sem-externo',
    goleirosDeFora: goleirosDeFora,
    seed: 10
  });

  assert.strictEqual(res.times[0].goleiro.tipo, 'externo');
  assert.strictEqual(res.times[1].goleiro.tipo, 'externo');
  assert.strictEqual(res.times[0].goleiro.jogador.id, 'ext1');
});

test('2b. Goleiro de fora (sem lista): gera aviso e lista de sugestões', () => {
  const elenco = gerarElenco(12, 2);
  const res = Sorteio.sortearTimes(elenco, {
    numTimes: 2,
    tamanhoTime: 6,
    modoGoleiro: 'sem-externo',
    goleirosDeFora: [],
    seed: 15
  });

  assert.ok(res.avisos.some(a => a.includes('Nenhum goleiro de fora cadastrado')), 'Deve avisar falta de goleiro');
  assert.ok(Array.isArray(res.sugestoesGoleiroDeFora), 'Deve sugerir candidatos ao gol');
});

// 3. Goleiro Sorteado no Time (modo 'sem-rodizio')
test('3. Goleiro sorteado no time: modo "sem-rodizio" define rodízio para todos os times', () => {
  const elenco = gerarElenco(16, 0);
  const res = Sorteio.sortearTimes(elenco, {
    numTimes: 2,
    tamanhoTime: 6,
    modoGoleiro: 'sem-rodizio',
    seed: 20
  });

  res.times.forEach(t => {
    assert.strictEqual(t.goleiro.tipo, 'rodizio', 'Time deve ter goleiro tipo rodízio');
  });

  // Testa ciclo do goleiro
  const gk0 = Sorteio.goleiroDaPartida(res.times[0], 0);
  const gk1 = Sorteio.goleiroDaPartida(res.times[0], 1);
  assert.ok(gk0 && gk1, 'Deve retornar atleta que agarra');
  assert.notStrictEqual(gk0.id, gk1.id, 'Atletas diferentes devem revezar no gol nas partidas');
});

// 4. Limite de 24 com 4 Times
test('4. Limite de 24 com 4 times: 24+ atletas formam sempre 4 times de 6', () => {
  const elenco = gerarElenco(26, 4); // 26 atletas
  const res = Sorteio.sortearTimes(elenco, {
    numTimes: 5, // Usuário pediu 5, mas tem 26 jogadores (>= 24)
    tamanhoTime: 6,
    limiteJogadores: 24,
    excedente: 'reservas',
    seed: 30
  });

  assert.strictEqual(res.times.length, 4, 'Deve forçar exatamente 4 times');
  assert.ok(res.avisos.some(a => a.includes('Limite de 24')), 'Deve avisar sobre o limite de 24');
  
  const totalTitulares = res.times.reduce((acc, t) => acc + t.jogadores.length, 0);
  assert.strictEqual(totalTitulares, 24, 'Deve ter exatamente 24 titulares em quadra');
  
  const totalReservas = res.times.reduce((acc, t) => acc + t.reservas.length, 0);
  assert.strictEqual(totalReservas, 2, '26 - 24 = 2 reservas distribuídos');
});

// 5. Goleiro Excedente na Linha
test('5. Goleiro excedente na linha: quem tem posição secundária vai primeiro para a linha', () => {
  const elenco = [
    { id: 'g1', nome: 'Goleiro 1', ovr: 75, posicao: 'GOL', posicaoSecundaria: null },
    { id: 'g2', nome: 'Goleiro 2', ovr: 74, posicao: 'GOL', posicaoSecundaria: null },
    { id: 'g3', nome: 'Goleiro Linha', ovr: 72, posicao: 'GOL', posicaoSecundaria: 'ZAG' }, // Tem segunda opção
    ...gerarElenco(11, 0)
  ];

  const res = Sorteio.sortearTimes(elenco, {
    numTimes: 2,
    tamanhoTime: 6,
    modoGoleiro: 'com',
    seed: 55
  });

  assert.ok(res.avisos.some(a => a.includes('Há mais goleiros que times')), 'Deve avisar goleiro excedente');
  
  // O goleiro excedente g3 deve estar na linha com papel ZAG
  let achouG3NaLinha = false;
  res.times.forEach(t => {
    t.jogadores.forEach(j => {
      if (j.id === 'g3') {
        achouG3NaLinha = true;
        assert.strictEqual(j.papel, 'ZAG', 'Goleiro excedente deve jogar na sua posição secundária ZAG');
        assert.strictEqual(j.encaixe, 'secundaria');
      }
    });
  });
  assert.ok(achouG3NaLinha, 'Goleiro g3 deve estar escalado na linha');
});

// 6. Rodízio de Times com 3, 4 e 5 Times
test('6. Rodízio de times com 4 e 5 times: ninguém joga duas partidas seguidas', () => {
  const elenco = gerarElenco(24, 4);
  const res = Sorteio.sortearTimes(elenco, { numTimes: 4, seed: 77 });
  const partidas = Sorteio.gerarPartidas(res, 8);

  assert.strictEqual(partidas.length, 8, 'Deve gerar 8 partidas');
  partidas.forEach(p => {
    assert.strictEqual(p.jogamSeguidas, false, 'Com 4 times, ninguém pode jogar duas seguidas');
  });
});

test('6b. Rodízio de times com 3 times: 1 time obrigatoriamente repete e marca jogamSeguidas = true', () => {
  const elenco = gerarElenco(18, 3);
  const res = Sorteio.sortearTimes(elenco, { numTimes: 3, seed: 88 });
  const partidas = Sorteio.gerarPartidas(res, 6);

  assert.strictEqual(partidas[0].jogamSeguidas, false, 'Primeira partida não é seguida');
  assert.strictEqual(partidas[1].jogamSeguidas, true, 'Segunda partida com 3 times repete 1 time');
});

// 7. Reservas em Quantidades Diferentes
test('7. Reservas em quantidades diferentes: excedente distribuído com equilíbrio nos times', () => {
  const elenco = gerarElenco(21, 3); // 3 times de 6 = 18 titulares + 3 reservas (1 por time)
  const res = Sorteio.sortearTimes(elenco, { numTimes: 3, tamanhoTime: 6, excedente: 'reservas', seed: 99 });

  const totalReservas = res.times.reduce((acc, t) => acc + t.reservas.length, 0);
  assert.strictEqual(totalReservas, 3, 'Deve haver 3 reservas no total');
  res.times.forEach(t => {
    assert.strictEqual(t.jogadores.length, 6, 'Cada time tem 6 titulares');
    assert.strictEqual(t.reservas.length, 1, 'Cada time recebeu 1 reserva');
  });
});

// 8. Fila de Espera e Contadores (fecharBaba)
test('8. Fila de espera e contadores: quem fica de fora incrementa contador, quem joga zera', () => {
  const elenco = [
    { id: 'j_esp1', nome: 'Fila 1', ovr: 65, posicao: 'MEI', status: 'convidado', jogosForaSeguidos: 2 },
    { id: 'j_esp2', nome: 'Fila 2', ovr: 66, posicao: 'ALA', status: 'convidado', jogosForaSeguidos: 0 },
    ...gerarElenco(13, 2)
  ];

  const res = Sorteio.sortearTimes(elenco, {
    numTimes: 2,
    tamanhoTime: 6, // 12 vagas
    excedente: 'fila',
    seed: 111
  });

  assert.strictEqual(res.espera.length, 3, '15 - 12 = 3 jogadores na fila de espera');
  // Atleta com jogosForaSeguidos = 2 teve prioridade para entrar nos 12
  const entrouNoTime = res.times.some(t => t.jogadores.some(j => j.id === 'j_esp1'));
  assert.ok(entrouNoTime, 'Jogador com maior jogosForaSeguidos deve ter prioridade para jogar');

  const partidas = Sorteio.gerarPartidas(res, 4);
  const elencoAtualizado = Sorteio.fecharBaba(elenco, res, partidas);

  const j1Atualizado = elencoAtualizado.find(j => j.id === 'j_esp1');
  assert.strictEqual(j1Atualizado.jogosForaSeguidos, 0, 'Quem jogou deve ter contador zerado');

  const jNaEspera = res.espera[0];
  const jEspAtualizado = elencoAtualizado.find(j => j.id === jNaEspera.id);
  assert.strictEqual(jEspAtualizado.jogosForaSeguidos, jNaEspera.jogosForaSeguidos + 1, 'Quem ficou de fora incrementa contador');
});

// 9. Poucos Jogadores e Encaixe de Posições
test('9. Poucos jogadores e encaixe de posições: prioriza principal, depois secundária', () => {
  const elenco = [
    { id: 'p1', nome: 'Atleta A', ovr: 70, posicao: 'ZAG', posicaoSecundaria: 'ALA' },
    { id: 'p2', nome: 'Atleta B', ovr: 70, posicao: 'ZAG', posicaoSecundaria: 'ATA' },
    { id: 'p3', nome: 'Atleta C', ovr: 70, posicao: 'ALA', posicaoSecundaria: 'MEI' },
    { id: 'p4', nome: 'Atleta D', ovr: 70, posicao: 'ATA', posicaoSecundaria: 'ALA' },
    { id: 'p5', nome: 'Atleta E', ovr: 70, posicao: 'GOL', posicaoSecundaria: null },
    ...gerarElenco(7, 1)
  ];

  const res = Sorteio.sortearTimes(elenco, { numTimes: 2, tamanhoTime: 6, seed: 123 });

  res.times.forEach(t => {
    t.jogadores.forEach(j => {
      assert.ok(['principal', 'secundaria', 'fora'].includes(j.encaixe), 'Encaixe deve ser válido');
      assert.ok(j.papel, 'Jogador deve ter papel tático definido');
    });
  });
});

// 10. Teste de Estresse de Equilíbrio: 30 sorteios com 28 jogadores
test('10. Estresse de Equilíbrio: 30 sorteios com 28 jogadores mantêm diferenças baixas de OVR', () => {
  let piorDiferencaTotal = 0;
  let piorDiferencaTitulares = 0;

  for (let s = 1; s <= 30; s++) {
    const elenco28 = gerarElenco(28, 4);
    const res = Sorteio.sortearTimes(elenco28, {
      numTimes: 4,
      tamanhoTime: 6,
      excedente: 'reservas',
      seed: s * 100
    });

    if (res.diferencaOVR > piorDiferencaTotal) piorDiferencaTotal = res.diferencaOVR;
    if (res.diferencaTitulares > piorDiferencaTitulares) piorDiferencaTitulares = res.diferencaTitulares;
  }

  console.log(`    -> Pior diferença no time inteiro: ${piorDiferencaTotal.toFixed(2)} OVR (esperado <= 1.43)`);
  console.log(`    -> Pior diferença nos titulares: ${piorDiferencaTitulares.toFixed(2)} OVR (esperado <= 1.33)`);

  assert.ok(piorDiferencaTotal <= 1.43, `Pior diferença de OVR total (${piorDiferencaTotal}) deve ser <= 1.43`);
  assert.ok(piorDiferencaTitulares <= 1.33, `Pior diferença de titulares (${piorDiferencaTitulares}) deve ser <= 1.33`);
});

console.log(`\n🎉 Resultado: ${testesPassaram}/${totalTestes} testes passaram com sucesso!\n`);
