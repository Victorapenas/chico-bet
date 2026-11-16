<?php
/**
 * api/baba.php — API REST em PHP para gestão dos babas e histórico de partidas
 * IFBA Campus Eunápolis (ADS, 4º Semestre)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$babasFile = __DIR__ . '/../data/babas.json';
$jogadoresFile = __DIR__ . '/../data/jogadores.json';

function carregarDados($caminho) {
    if (!file_exists($caminho)) return [];
    $conteudo = file_get_contents($caminho);
    $arr = json_decode($conteudo, true);
    return is_array($arr) ? $arr : [];
}

function salvarDados($caminho, $dados) {
    return file_put_contents($caminho, json_encode($dados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $babas = carregarDados($babasFile);
    echo json_encode([
        'status' => 'sucesso',
        'total' => count($babas),
        'historico' => $babas
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

if ($metodo === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['status' => 'erro', 'mensagem' => 'Dados JSON inválidos']);
        exit();
    }

    $babas = carregarDados($babasFile);

    $novoRegistro = [
        'id' => 'baba_' . date('Ymd_His'),
        'data' => date('d/m/Y H:i'),
        'times' => $input['times'] ?? [],
        'partidas' => $input['partidas'] ?? [],
        'diferencaOVR' => $input['diferencaOVR'] ?? 0,
        'diferencaTitulares' => $input['diferencaTitulares'] ?? 0,
        'espera' => $input['espera'] ?? []
    ];

    array_unshift($babas, $novoRegistro);
    salvarDados($babasFile, $babas);

    // Se veio elenco atualizado após fechar baba, persiste em jogadores.json
    if (!empty($input['elencoAtualizado']) && is_array($input['elencoAtualizado'])) {
        salvarDados($jogadoresFile, $input['elencoAtualizado']);
    }

    echo json_encode([
        'status' => 'sucesso',
        'mensagem' => 'Baba encerrado e salvo no histórico com sucesso!',
        'baba' => $novoRegistro
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

http_response_code(405);
echo json_encode(['status' => 'erro', 'mensagem' => 'Método não permitido']);
