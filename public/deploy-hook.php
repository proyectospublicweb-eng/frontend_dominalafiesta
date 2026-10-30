<?php
// Receptor seguro de despliegue automático desde GitHub Actions (HTTPS Puerto 443)
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// Hash SHA-256 de la clave de despliegue (Eventos2026Pass99)
$expectedHash = '86f3c5bf41c2bf53a4c51cd1d2bff017a250cea51581e33573f20eb834a4cc43';
$providedToken = isset($_SERVER['HTTP_X_DEPLOY_TOKEN']) ? trim($_SERVER['HTTP_X_DEPLOY_TOKEN']) : '';

if ($providedToken === '' || !hash_equals($expectedHash, hash('sha256', $providedToken))) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Forbidden: Invalid deploy token']);
    exit;
}

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);

if (!is_array($data) || empty($data['target']) || empty($data['files']) || !is_array($data['files'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid payload']);
    exit;
}

$target = $data['target'];
if ($target === 'frontend') {
    // __DIR__ es /home/finlexprimecom/public_html/recuerdalo.com.mx
    $baseDir = __DIR__;
} elseif ($target === 'backend') {
    // /home/finlexprimecom/backend_eventos
    $baseDir = dirname(__DIR__, 2) . '/backend_eventos';
} else {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Unknown target']);
    exit;
}

if (!is_dir($baseDir)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Target directory does not exist: ' . $baseDir]);
    exit;
}

$written = [];
foreach ($data['files'] as $relPath => $b64Content) {
    $cleanPath = ltrim(str_replace('\\', '/', $relPath), '/');
    if (
        $cleanPath === '' ||
        strpos($cleanPath, '..') !== false ||
        strpos($cleanPath, 'apiproyectoeventos/') === 0 ||
        (strpos($cleanPath, '.well-known/') === 0 && $cleanPath !== '.well-known/assetlinks.json') ||
        strpos($cleanPath, 'cgi-bin/') === 0 ||
        (strpos($cleanPath, 'node_modules/') === 0 && strpos($cleanPath, 'node_modules/nodemailer/') !== 0) ||
        $cleanPath === '.env' ||
        $cleanPath === '.user.ini' ||
        $cleanPath === 'php.ini'
    ) {
        continue;
    }

    $fullPath = $baseDir . '/' . $cleanPath;
    $dirPath = dirname($fullPath);
    if (!is_dir($dirPath)) {
        mkdir($dirPath, 0755, true);
    }

    $decoded = base64_decode($b64Content, true);
    if ($decoded !== false) {
        file_put_contents($fullPath, $decoded);
        $written[] = $cleanPath;
    }
}

if ($target === 'backend') {
    $tmpDir = $baseDir . '/tmp';
    if (!is_dir($tmpDir)) {
        @mkdir($tmpDir, 0755, true);
    }
    @touch($tmpDir . '/restart.txt');
}

echo json_encode([
    'ok' => true,
    'target' => $target,
    'updated_files' => count($written),
    'files' => $written
]);
