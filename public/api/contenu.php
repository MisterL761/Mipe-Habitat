<?php
// Lecture publique des contenus gérés par l'admin (promotions, réalisations, articles).
declare(strict_types=1);
require __DIR__ . '/../admin/stockage.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache');
header('X-Content-Type-Options: nosniff');

$type = $_GET['type'] ?? '';
if (!in_array($type, TYPES_CONTENU, true)) {
    http_response_code(400);
    echo '[]';
    exit;
}
echo json_encode(lire_contenu($type), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
