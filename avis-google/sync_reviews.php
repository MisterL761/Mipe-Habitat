<?php
// À lancer à la main quand tu veux mettre les avis à jour (pas de cron) : récupère tous les avis Google de la fiche et les écrit dans src/data/avis-google.json (lu par le site au build).
// Usage : php avis-google/sync_reviews.php, puis commit de src/data/avis-google.json et redéploiement.
// Option : php sync_reviews.php --list-accounts  (affiche les comptes pour trouver account_id)
require __DIR__ . '/vendor/autoload.php';
$config = require __DIR__ . '/config.php';

const NOTES = ['ONE' => 1, 'TWO' => 2, 'THREE' => 3, 'FOUR' => 4, 'FIVE' => 5];

function clientGoogle(array $config): Google\Client
{
    $client = new Google\Client();
    $client->setClientId($config['client_id']);
    $client->setClientSecret($config['client_secret']);
    $client->addScope('https://www.googleapis.com/auth/business.manage');
    // Le SDK échange lui-même le refresh_token contre un access_token
    $token = $client->fetchAccessTokenWithRefreshToken($config['refresh_token']);
    if (isset($token['error'])) {
        throw new RuntimeException('Auth échouée : ' . ($token['error_description'] ?? $token['error']));
    }
    return $client;
}

/** Retourne l'ID du compte (sans le préfixe "accounts/") via le SDK. */
function trouverAccountId(Google\Client $client, bool $afficher = false): string
{
    $service = new Google\Service\MyBusinessAccountManagement($client);
    $comptes = $service->accounts->listAccounts()->getAccounts() ?? [];
    if ($afficher) {
        foreach ($comptes as $c) {
            echo $c->getName() . ' | ' . $c->getAccountName() . ' | ' . $c->getType() . PHP_EOL;
        }
    }
    if (!$comptes) {
        throw new RuntimeException('Aucun compte Business Profile trouvé.');
    }
    return str_replace('accounts/', '', $comptes[0]->getName());
}

/** @return array{avis: array, resume: array} */
function recupererAvis(Google\Client $client, string $accountId, string $locationId): array
{
    $http = $client->authorize();   // client Guzzle déjà authentifié par le SDK
    $url  = "https://mybusiness.googleapis.com/v4/accounts/{$accountId}/locations/{$locationId}/reviews";
    $avis = [];
    $pageToken = null;
    $resume = ['moyenne' => null, 'total' => null];

    do {
        $query = ['pageSize' => 50] + ($pageToken ? ['pageToken' => $pageToken] : []);
        $reponse = $http->get($url, ['query' => $query]);
        $data = json_decode((string) $reponse->getBody(), true);

        $resume['moyenne'] = $data['averageRating'] ?? $resume['moyenne'];
        $resume['total']   = $data['totalReviewCount'] ?? $resume['total'];

        foreach ($data['reviews'] ?? [] as $r) {
            $avis[] = [
                'id'          => basename($r['name'] ?? $r['reviewId']),
                'auteur'      => $r['reviewer']['displayName'] ?? 'Anonyme',
                'note'        => NOTES[$r['starRating'] ?? ''] ?? 0,
                'commentaire' => $r['comment'] ?? '',
                'date'        => $r['createTime'] ?? null,   // ISO 8601
                'reponse'     => $r['reviewReply']['comment'] ?? null,
            ];
        }
        $pageToken = $data['nextPageToken'] ?? null;
    } while ($pageToken);

    return ['avis' => $avis, 'resume' => $resume];
}

try {
    $client = clientGoogle($config);

    if (($argv[1] ?? '') === '--list-accounts') {
        trouverAccountId($client, true);
        exit;
    }

    $accountId = $config['account_id'] !== '' ? $config['account_id'] : trouverAccountId($client);
    $resultat = recupererAvis($client, $accountId, $config['location_id']);
    $avis = $resultat['avis'];
    if (!$avis) {
        throw new RuntimeException('Aucun avis reçu : fichier non modifié.');
    }

    // Le site Astro lit ce fichier JSON au build (src/data/avis-google.json).
    // Écriture atomique pour ne jamais laisser un fichier à moitié écrit.
    $sortie = $config['sortie'] ?? __DIR__ . '/../src/data/avis-google.json';
    $json = json_encode([
        'maj'     => date('c'),
        'moyenne' => $resultat['resume']['moyenne'],
        'total'   => $resultat['resume']['total'],
        'avis'    => $avis,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    file_put_contents($sortie . '.tmp', $json);
    rename($sortie . '.tmp', $sortie);

    echo count($avis) . " avis récupérés, écrits dans $sortie\n";
} catch (Throwable $e) {
    fwrite(STDERR, 'Erreur : ' . $e->getMessage() . PHP_EOL);
    exit(1);
}
