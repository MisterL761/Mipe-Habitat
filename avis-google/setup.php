<?php
// À lancer une seule fois : php -S localhost:8080 puis ouvrir http://localhost:8080/setup.php
// (ajouter cette URL dans les URI de redirection autorisés du client OAuth). Supprimer ensuite ce script du serveur.
require __DIR__ . '/vendor/autoload.php';
$config = require __DIR__ . '/config.php';

$client = new Google\Client();
$client->setClientId($config['client_id']);
$client->setClientSecret($config['client_secret']);
$client->setRedirectUri('http://localhost:8080/setup.php');
$client->addScope('https://www.googleapis.com/auth/business.manage');
$client->setAccessType('offline');   // indispensable pour obtenir un refresh_token
$client->setPrompt('consent');       // force Google à renvoyer le refresh_token

if (!isset($_GET['code'])) {
    echo '<a href="' . htmlspecialchars($client->createAuthUrl()) . '">Autoriser l\'accès à Google Business Profile</a>';
    exit;
}

$token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
if (isset($token['error'])) {
    exit('Erreur : ' . htmlspecialchars($token['error_description'] ?? $token['error']));
}

echo '<h3>Ton REFRESH_TOKEN (à copier dans config.php, à garder secret) :</h3><pre>'
   . htmlspecialchars($token['refresh_token'] ?? 'ABSENT : révoque l\'accès sur myaccount.google.com/permissions puis recommence')
   . '</pre>';
