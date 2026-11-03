<?php
// Outils de l'admin : session, protection CSRF, mot de passe, limite de tentatives, images.
declare(strict_types=1);

require_once __DIR__ . '/stockage.php';

function config_admin(): array
{
    static $config = null;
    return $config ??= require __DIR__ . '/config.php';
}

function est_https(): bool
{
    return ($_SERVER['HTTPS'] ?? '') === 'on' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
}

function entetes_securite(): void
{
    header('X-Robots-Tag: noindex, nofollow');
    header('Cache-Control: no-store');
    header('X-Frame-Options: DENY');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: same-origin');
}

function demarrer_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_name('mipe_admin');
    ini_set('session.use_strict_mode', '1');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/admin/index.php'), '/') ?: '/',
        'httponly' => true,
        'samesite' => 'Strict',
        'secure' => est_https(),
    ]);
    session_start();
}

function connecte(): bool
{
    demarrer_session();
    if (empty($_SESSION['admin'])) {
        return false;
    }
    // Déconnexion automatique après 2 h d'inactivité
    if (time() - ($_SESSION['activite'] ?? 0) > 7200) {
        $_SESSION = [];
        return false;
    }
    $_SESSION['activite'] = time();
    return true;
}

function jeton_csrf(): string
{
    demarrer_session();
    return $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}

function verifier_csrf(?string $jeton): bool
{
    demarrer_session();
    return is_string($jeton) && isset($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $jeton);
}

// --- Mot de passe (haché, stocké dans un dossier interdit d'accès web) ---
function fichier_identifiants(): string { return __DIR__ . '/_prive/identifiants.json'; }

function hash_motdepasse(): ?string
{
    $f = fichier_identifiants();
    if (!is_file($f)) {
        return null;
    }
    $d = json_decode((string) file_get_contents($f), true);
    return is_array($d) && !empty($d['hash']) ? (string) $d['hash'] : null;
}

function enregistrer_motdepasse(string $motdepasse): bool
{
    $dossier = dirname(fichier_identifiants());
    if (!is_dir($dossier) && !mkdir($dossier, 0700, true) && !is_dir($dossier)) {
        return false;
    }
    file_put_contents($dossier . '/.htaccess', "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Deny from all\n</IfModule>\n");
    return file_put_contents(fichier_identifiants(), json_encode(['hash' => password_hash($motdepasse, PASSWORD_DEFAULT)]), LOCK_EX) !== false;
}

// --- Limite de tentatives de connexion : 5 échecs / 15 minutes par adresse IP ---
function tentatives_connexion(string $action = 'lire'): int
{
    $f = sys_get_temp_dir() . '/mipe_admin_login_' . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'x');
    $h = fopen($f, 'c+');
    if ($h === false) {
        return 0;
    }
    flock($h, LOCK_EX);
    $limite = time() - 900;
    $t = array_values(array_filter(array_map('intval', explode(',', (string) stream_get_contents($h))), fn ($x) => $x > $limite));
    if ($action === 'echec') {
        $t[] = time();
    } elseif ($action === 'reussite') {
        $t = [];
    }
    ftruncate($h, 0);
    rewind($h);
    fwrite($h, implode(',', $t));
    flock($h, LOCK_UN);
    fclose($h);
    return count($t);
}

// --- Images : vérification, correction d'orientation, redimensionnement, conversion en WebP ---
function traiter_image(array $fichier, string $sousDossier, int $largeurMax): array
{
    if (($fichier['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        return [false, "L'envoi a échoué (fichier trop lourd ?)."];
    }
    if ($fichier['size'] > 15 * 1024 * 1024) {
        return [false, 'Image trop lourde (15 Mo maximum).'];
    }
    $info = @getimagesize($fichier['tmp_name']);
    if (!$info || $info[0] * $info[1] > 50_000_000) {
        return [false, "Ce fichier n'est pas une image valide."];
    }
    @ini_set('memory_limit', '512M');
    $image = match ($info[2]) {
        IMAGETYPE_JPEG => @imagecreatefromjpeg($fichier['tmp_name']),
        IMAGETYPE_PNG => @imagecreatefrompng($fichier['tmp_name']),
        IMAGETYPE_WEBP => @imagecreatefromwebp($fichier['tmp_name']),
        default => false,
    };
    if (!$image) {
        return [false, 'Format accepté : JPG, PNG ou WebP.'];
    }
    if ($info[2] === IMAGETYPE_JPEG && function_exists('exif_read_data')) {
        $exif = @exif_read_data($fichier['tmp_name']);
        $rotation = [3 => 180, 6 => -90, 8 => 90][$exif['Orientation'] ?? 0] ?? 0;
        if ($rotation) {
            $image = imagerotate($image, $rotation, 0) ?: $image;
        }
    }
    imagepalettetotruecolor($image);
    $largeur = imagesx($image);
    if ($largeur > $largeurMax) {
        // imagecopyresampled : disponible sur tous les hébergements (imagescale échoue selon les versions de GD)
        $hauteur = (int) round(imagesy($image) * $largeurMax / $largeur);
        $reduite = imagecreatetruecolor($largeurMax, $hauteur);
        imagealphablending($reduite, false);
        imagesavealpha($reduite, true);
        imagecopyresampled($reduite, $image, 0, 0, 0, 0, $largeurMax, $hauteur, $largeur, imagesy($image));
        $image = $reduite;
    }
    $dossier = dossier_televersements() . '/' . $sousDossier;
    if (!is_dir($dossier) && !mkdir($dossier, 0755, true) && !is_dir($dossier)) {
        return [false, "Impossible d'enregistrer l'image."];
    }
    // Les images sont ré-encodées : un fichier piégé (script caché dans une image) ne survit pas.
    $htaccess = dossier_televersements() . '/.htaccess';
    if (!is_file($htaccess)) {
        file_put_contents($htaccess, "<FilesMatch \"\\.(php|phtml|phar|pl|cgi)$\">\n  Require all denied\n</FilesMatch>\nOptions -Indexes -ExecCGI\n");
    }
    $nom = bin2hex(random_bytes(10)) . '.webp';
    if (!imagewebp($image, "$dossier/$nom", 80)) {
        return [false, "Impossible d'enregistrer l'image."];
    }
    return [true, "/uploads/$sousDossier/$nom"];
}

// Supprime un fichier téléversé (jamais un fichier du site : seulement sous /uploads/).
function supprimer_televersement(string $url): void
{
    if (!preg_match('#^/uploads/[A-Za-z0-9_-]+/[A-Za-z0-9_-]+\.webp$#', $url)) {
        return;
    }
    $chemin = racine_site() . $url;
    if (is_file($chemin)) {
        @unlink($chemin);
    }
}
