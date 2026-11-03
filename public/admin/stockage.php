<?php
// Lecture / écriture des contenus gérés depuis l'admin (promotions, réalisations, articles).
// Partagé entre l'admin (écriture) et api/contenu.php (lecture publique).
declare(strict_types=1);

const TYPES_CONTENU = ['offres', 'realisations', 'articles'];

function racine_site(): string { return dirname(__DIR__); }
function dossier_donnees(): string { return racine_site() . '/data'; }
function dossier_televersements(): string { return racine_site() . '/uploads'; }

// Contenu en ligne s'il existe (data/<type>.json), sinon le contenu de départ
// livré avec le site (admin/seed/<type>.json).
function lire_contenu(string $type): array
{
    if (!in_array($type, TYPES_CONTENU, true)) {
        return [];
    }
    foreach ([dossier_donnees() . "/$type.json", __DIR__ . "/seed/$type.json"] as $fichier) {
        if (is_file($fichier)) {
            $donnees = json_decode((string) file_get_contents($fichier), true);
            if (is_array($donnees)) {
                return array_values($donnees);
            }
        }
    }
    return [];
}

// Écriture atomique (fichier temporaire puis renommage) : un visiteur ne lit
// jamais un fichier à moitié écrit.
function ecrire_contenu(string $type, array $elements): bool
{
    if (!in_array($type, TYPES_CONTENU, true)) {
        return false;
    }
    $dossier = dossier_donnees();
    if (!is_dir($dossier) && !mkdir($dossier, 0755, true) && !is_dir($dossier)) {
        return false;
    }
    $json = json_encode(array_values($elements), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false) {
        return false;
    }
    $temporaire = tempnam($dossier, 'tmp');
    if ($temporaire === false || file_put_contents($temporaire, $json) === false) {
        return false;
    }
    chmod($temporaire, 0644);
    return rename($temporaire, "$dossier/$type.json");
}
