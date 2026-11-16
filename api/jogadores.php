<?php
/**
 * api/jogadores.php — API REST em PHP para gestão do elenco do Chico B.E.T
 * IFBA Campus Eunápolis (ADS, 4º Semestre)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataFile = __DIR__ . '/../data/jogadores.json';

function carregarDados($caminho) {
    if (!file_exists($caminho)) {
        return [];
    }
    $conteudo = file_get_contents($caminho);
    $arr = json_decode($conteudo, true);
    return is_array($arr) ? $arr : [];
}

function salvarDados($caminho, $dados) {
    return file_put_contents($caminho, json_encode($dados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':
        $jogadores = carregarDados($dataFile);
        echo json_encode([
            'status' => 'sucesso',
            'origem' => 'php_backend',
            'total' => count($jogadores),
            'dados' => $jogadores
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            http_response_code(400);
            echo json_encode(['status' => 'erro', 'mensagem' => 'Dados JSON inválidos']);
            exit();
        }

        $jogadores = carregarDados($dataFile);

        // Se veio um array completo de jogadores (sincronização/fechar baba)
        if (isset($input['elencoCompleto']) && is_array($input['elencoCompleto'])) {
            salvarDados($dataFile, $input['elencoCompleto']);
            echo json_encode([
                'status' => 'sucesso',
                'mensagem' => 'Elenco completo sincronizado com sucesso',
                'total' => count($input['elencoCompleto'])
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }

        // Se veio um único jogador
        $id = $input['id'] ?? ('j_' . uniqid());
        $nome = trim($input['nome'] ?? 'Jogador');
        $posicao = strtoupper($input['posicao'] ?? 'MEI');
        $posicaoSec = !empty($input['posicaoSecundaria']) ? strtoupper($input['posicaoSecundaria']) : null;
        $ovr = isset($input['ovr']) ? intval($input['ovr']) : 70;

        $novoJogador = [
            'id' => $id,
            'nome' => $nome,
            'apelido' => trim($input['apelido'] ?? $nome),
            'posicao' => $posicao,
            'posicaoSecundaria' => $posicaoSec,
            'perna' => $input['perna'] ?? 'R',
            'status' => $input['status'] ?? ($input['categoria'] ?? 'mensalista'),
            'categoria' => $input['categoria'] ?? ($input['status'] ?? 'mensalista'),
            'origem' => trim($input['origem'] ?? 'Eunápolis'),
            'pais' => $input['pais'] ?? 'Brasil',
            'bandeira' => $input['bandeira'] ?? 'BR',
            'time' => $input['time'] ?? 'IFBA Eunápolis',
            'foto' => $input['foto'] ?? '',
            'stats' => $input['stats'] ?? [
                'rit' => 70, 'fin' => 70, 'pas' => 70, 'dri' => 70, 'def' => 70, 'fis' => 70
            ],
            'ovr' => $ovr,
            'jogosForaSeguidos' => intval($input['jogosForaSeguidos'] ?? 0),
            'vezesNoGol' => intval($input['vezesNoGol'] ?? 0)
        ];

        $encontrou = false;
        foreach ($jogadores as $key => $j) {
            if ($j['id'] === $id) {
                $jogadores[$key] = array_merge($j, $novoJogador);
                $encontrou = true;
                break;
            }
        }

        if (!$encontrou) {
            array_unshift($jogadores, $novoJogador);
        }

        salvarDados($dataFile, $jogadores);

        echo json_encode([
            'status' => 'sucesso',
            'mensagem' => $encontrou ? 'Atleta atualizado' : 'Atleta cadastrado',
            'jogador' => $novoJogador
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'] ?? null;
        }

        if (!$id) {
            http_response_code(400);
            echo json_encode(['status' => 'erro', 'mensagem' => 'ID do jogador não informado']);
            exit();
        }

        $jogadores = carregarDados($dataFile);
        $novoElenco = array_values(array_filter($jogadores, function ($j) use ($id) {
            return $j['id'] !== $id;
        }));

        salvarDados($dataFile, $novoElenco);

        echo json_encode([
            'status' => 'sucesso',
            'mensagem' => 'Atleta removido com sucesso',
            'total' => count($novoElenco)
        ], JSON_UNESCAPED_UNICODE);
        break;

    default:
        http_response_code(405);
        echo json_encode(['status' => 'erro', 'mensagem' => 'Método HTTP não permitido']);
        break;
}
