<?php
// API de l'administration : lecture, ajout / modification, suppression, ordre, envoi d'images.
declare(strict_types=1);
require __DIR__ . '/lib.php';
entetes_securite();
header('Content-Type: application/json; charset=utf-8');

function sortie(int $code, array $corps): never
{
    http_response_code($code);
    echo json_encode($corps, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (!connecte()) {
    sortie(401, ['ok' => false, 'erreur' => 'Session expirée : reconnectez-vous.']);
}

// Texte sur une ligne / paragraphe nettoyés (pas de balises, longueur bornée)
function ligne($v, int $max): string
{
    $v = is_string($v) ? preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v) : '';
    return mb_substr(trim(strip_tags((string) $v)), 0, $max);
}
function paragraphe($v, int $max): string
{
    $v = is_string($v) ? str_replace("\r", '', $v) : '';
    $v = preg_replace('/[^\P{C}\n]+/u', '', strip_tags($v)) ?? '';
    return mb_substr(trim($v), 0, $max);
}
function url_image($v): string
{
    $v = is_string($v) ? trim($v) : '';
    return preg_match('#^/(uploads|media)/[A-Za-z0-9_./-]+\.(webp|jpg|jpeg|png)$#i', $v) && !str_contains($v, '..') ? $v : '';
}
function url_lien($v): string
{
    $v = is_string($v) ? trim($v) : '';
    if (preg_match('#^/[A-Za-z0-9_\-./?=&\#%]*$#', $v) && !str_starts_with($v, '//')) {
        return $v;
    }
    return preg_match('#^https://[^\s"<>]+$#i', $v) ? $v : '';
}

// --- Article : texte simple <-> liste de paragraphes HTML utilisée par le site ---
function texte_vers_contenu(string $texte): array
{
    $blocs = preg_split('/\n{2,}/', str_replace("\r", '', trim($texte))) ?: [];
    $contenu = [];
    foreach ($blocs as $bloc) {
        $bloc = trim($bloc);
        if ($bloc === '') {
            continue;
        }
        if (str_starts_with($bloc, '## ')) {
            $contenu[] = '<h2>' . htmlspecialchars(trim(substr($bloc, 3)), ENT_NOQUOTES) . '</h2>';
            continue;
        }
        $html = nl2br(htmlspecialchars($bloc, ENT_NOQUOTES), false);
        $contenu[] = preg_replace('/\*\*(.+?)\*\*/s', '<strong>$1</strong>', $html);
    }
    return $contenu;
}
function contenu_vers_texte(array $contenu): string
{
    $blocs = [];
    foreach ($contenu as $p) {
        $p = trim((string) $p);
        if (preg_match('#^<h2>(.*)</h2>$#s', $p, $m)) {
            $blocs[] = '## ' . html_entity_decode(strip_tags($m[1]));
            continue;
        }
        $p = preg_replace('#<br\s*/?>#i', "\n", $p);
        $p = preg_replace('#<strong>(.*?)</strong>#s', '**$1**', $p);
        $blocs[] = html_entity_decode(strip_tags($p));
    }
    return implode("\n\n", $blocs);
}

function nettoyer(string $type, array $in, ?array $ancien, array $tous): array|string
{
    switch ($type) {
        case 'offres':
            $titre = ligne($in['titre'] ?? '', 120);
            if ($titre === '') return 'Le titre est obligatoire.';
            $points = array_values(array_filter(array_map(fn ($p) => ligne($p, 200), array_slice((array) ($in['points'] ?? []), 0, 8))));
            $dateFin = ligne($in['dateFin'] ?? '', 10);
            if ($dateFin !== '' && !(preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateFin) && checkdate((int) substr($dateFin, 5, 2), (int) substr($dateFin, 8, 2), (int) substr($dateFin, 0, 4)))) {
                return 'Date de fin invalide.';
            }
            $lien = url_lien($in['cta']['lien'] ?? '/demander-un-devis') ?: '/demander-un-devis';
            if ($ancien) {
                $id = $ancien['id'];
            } else {
                $base = trim(preg_replace('/[^a-z0-9]+/', '-', strtolower(iconv('UTF-8', 'ASCII//TRANSLIT', $titre) ?: 'offre')), '-') ?: 'offre';
                $id = $base;
                $ids = array_column($tous, 'id');
                for ($i = 2; in_array($id, $ids, true); $i++) $id = "$base-$i";
            }
            return [
                'id' => $id,
                'actif' => !empty($in['actif']),
                'etiquette' => ligne($in['etiquette'] ?? '', 40) ?: 'Offre en cours',
                'titre' => $titre,
                'intro' => paragraphe($in['intro'] ?? '', 400),
                'points' => $points,
                'mentions' => paragraphe($in['mentions'] ?? '', 400),
                'dateFin' => $dateFin ?: null,
                'validite' => ligne($in['validite'] ?? '', 200),
                'image' => url_image($in['image'] ?? '') ?: null,
                'imageAlt' => ligne($in['imageAlt'] ?? '', 150),
                'cta' => ['texte' => ligne($in['cta']['texte'] ?? '', 40) ?: 'Prendre RDV', 'lien' => $lien],
            ];
        case 'realisations':
            $titre = ligne($in['titre'] ?? '', 100);
            $ville = ligne($in['ville'] ?? '', 80);
            if ($titre === '' || $ville === '') return 'Le titre et la ville sont obligatoires.';
            $cp = ligne($in['cp'] ?? '', 5);
            if (!preg_match('/^\d{2,5}$/', $cp)) return 'Code postal ou département invalide (2 à 5 chiffres).';
            $annee = ligne($in['annee'] ?? '', 4);
            if (!preg_match('/^(19|20)\d{2}$/', $annee)) return 'Année invalide.';
            $lat = filter_var($in['lat'] ?? null, FILTER_VALIDATE_FLOAT);
            $lng = filter_var($in['lng'] ?? null, FILTER_VALIDATE_FLOAT);
            if ($lat === false || $lng === false || abs($lat) > 90 || abs($lng) > 180) return "Position sur la carte manquante : utilisez « Placer sur la carte ».";
            $photos = array_values(array_filter(array_map('url_image', array_slice((array) ($in['photos'] ?? []), 0, 12))));
            return [
                'id' => $ancien['id'] ?? (max(array_merge([0], array_map('intval', array_column($tous, 'id')))) + 1),
                'titre' => $titre,
                'categorie' => ligne($in['categorie'] ?? '', 40) ?: 'Isolation',
                'annee' => $annee,
                'ville' => $ville,
                'cp' => $cp,
                'description' => paragraphe($in['description'] ?? '', 500),
                'lat' => round($lat, 5),
                'lng' => round($lng, 5),
                'photos' => $photos,
            ];
        case 'articles':
            $titre = ligne($in['titre'] ?? '', 160);
            $texte = paragraphe($in['texte'] ?? '', 20000);
            if ($titre === '' || $texte === '') return "Le titre et le texte de l'article sont obligatoires.";
            return [
                'id' => $ancien['id'] ?? (max(array_merge([0], array_map('intval', array_column($tous, 'id')))) + 1),
                'tag' => ligne($in['tag'] ?? '', 40) ?: 'Conseils',
                'titre' => $titre,
                'image' => url_image($in['image'] ?? ''),
                'contenu' => texte_vers_contenu($texte),
            ];
    }
    return 'Type inconnu.';
}

function images_de(array $element): array
{
    $liste = array_merge((array) ($element['photos'] ?? []), [$element['image'] ?? '']);
    return array_values(array_filter($liste, fn ($u) => is_string($u) && str_starts_with($u, '/uploads/')));
}

function pour_affichage(string $type, array $elements): array
{
    if ($type === 'articles') {
        foreach ($elements as &$e) {
            $e['texte'] = contenu_vers_texte((array) ($e['contenu'] ?? []));
        }
    }
    return $elements;
}

// ---------------------------------------------------------------------------
$methode = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';
$type = $_GET['type'] ?? '';

if ($methode === 'POST' && !verifier_csrf($_SERVER['HTTP_X_CSRF_TOKEN'] ?? null)) {
    sortie(403, ['ok' => false, 'erreur' => 'Session invalide : rechargez la page.']);
}

if ($action === 'liste') {
    sortie(200, ['ok' => true, 'elements' => pour_affichage($type, lire_contenu($type))]);
}
if ($methode !== 'POST') {
    sortie(405, ['ok' => false, 'erreur' => 'Méthode non autorisée.']);
}

if ($action === 'televerser') {
    $dossier = $_POST['dossier'] ?? '';
    $largeurs = ['realisations' => 1000, 'offres' => 800, 'blog' => 900];
    if (!isset($largeurs[$dossier]) || !isset($_FILES['image'])) {
        sortie(400, ['ok' => false, 'erreur' => 'Requête invalide.']);
    }
    [$ok, $resultat] = traiter_image($_FILES['image'], $dossier, $largeurs[$dossier]);
    sortie($ok ? 200 : 422, $ok ? ['ok' => true, 'url' => $resultat] : ['ok' => false, 'erreur' => $resultat]);
}

if (!in_array($type, TYPES_CONTENU, true)) {
    sortie(400, ['ok' => false, 'erreur' => 'Type inconnu.']);
}

// Verrou : deux enregistrements simultanés ne s'écrasent pas
if (!is_dir(dossier_donnees())) {
    @mkdir(dossier_donnees(), 0755, true);
}
$verrou = fopen(dossier_donnees() . '/.verrou', 'c');
if ($verrou === false || !flock($verrou, LOCK_EX)) {
    sortie(503, ['ok' => false, 'erreur' => 'Service occupé, réessayez.']);
}

$corps = json_decode((string) file_get_contents('php://input'), true);
$corps = is_array($corps) ? $corps : [];
$elements = lire_contenu($type);

if ($action === 'enregistrer') {
    $entree = (array) ($corps['element'] ?? []);
    $idRecu = $entree['id'] ?? null;
    $position = null;
    foreach ($elements as $i => $e) {
        if ($idRecu !== null && (string) $e['id'] === (string) $idRecu) $position = $i;
    }
    $ancien = $position !== null ? $elements[$position] : null;
    $propre = nettoyer($type, $entree, $ancien, $elements);
    if (is_string($propre)) {
        sortie(422, ['ok' => false, 'erreur' => $propre]);
    }
    if ($ancien) {
        foreach (array_diff(images_de($ancien), images_de($propre)) as $inutile) supprimer_televersement($inutile);
        $elements[$position] = $propre;
    } else {
        array_unshift($elements, $propre); // les nouveautés en premier
    }
} elseif ($action === 'supprimer') {
    $id = (string) ($corps['id'] ?? '');
    foreach ($elements as $i => $e) {
        if ((string) $e['id'] === $id) {
            foreach (images_de($e) as $img) supprimer_televersement($img);
            unset($elements[$i]);
        }
    }
} elseif ($action === 'ordre') {
    $ids = array_map('strval', (array) ($corps['ids'] ?? []));
    $parId = [];
    foreach ($elements as $e) $parId[(string) $e['id']] = $e;
    $nouveau = [];
    foreach ($ids as $id) if (isset($parId[$id])) { $nouveau[] = $parId[$id]; unset($parId[$id]); }
    $elements = array_merge($nouveau, array_values($parId));
} else {
    sortie(400, ['ok' => false, 'erreur' => 'Action inconnue.']);
}

if (!ecrire_contenu($type, $elements)) {
    sortie(500, ['ok' => false, 'erreur' => "Écriture impossible : vérifiez les droits du dossier « data »."]);
}
sortie(200, ['ok' => true, 'elements' => pour_affichage($type, array_values($elements))]);
