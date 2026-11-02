<?php
// Reception des formulaires du site (devis en 4 etapes + "etre rappele").
// Envoie un e-mail a l'adresse definie dans config.php. Rien n'est stocke.
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$config = require __DIR__ . '/config.php';

function repondre(int $code, array $corps): void
{
    http_response_code($code);
    echo json_encode($corps, JSON_UNESCAPED_UNICODE);
    exit;
}

// Texte sur une ligne : sans retour a la ligne ni caractere de controle
// (empeche l'injection d'en-tetes dans l'e-mail), longueur bornee.
function ligne($valeur, int $max = 150): string
{
    if (!is_string($valeur)) {
        return '';
    }
    $valeur = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $valeur) ?? '';
    return mb_substr(trim($valeur), 0, $max);
}

// Texte libre (message) : on garde les retours a la ligne.
function paragraphe($valeur, int $max = 2000): string
{
    if (!is_string($valeur)) {
        return '';
    }
    $valeur = preg_replace('/[^\P{C}\n]+/u', '', str_replace("\r", '', $valeur)) ?? '';
    return mb_substr(trim($valeur), 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    repondre(405, ['ok' => false, 'erreur' => 'Methode non autorisee.']);
}

// Le formulaire doit venir de ce meme site.
$origine = $_SERVER['HTTP_ORIGIN'] ?? '';
$hote = preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? '');
if ($origine !== '' && parse_url($origine, PHP_URL_HOST) !== $hote) {
    repondre(403, ['ok' => false, 'erreur' => 'Origine refusee.']);
}

// Donnees : JSON (parcours devis) ou formulaire classique.
$brut = file_get_contents('php://input') ?: '';
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
    $donnees = json_decode($brut, true);
    if (!is_array($donnees)) {
        repondre(400, ['ok' => false, 'erreur' => 'Donnees illisibles.']);
    }
} else {
    $donnees = $_POST;
}
if (strlen($brut) > 20000) {
    repondre(413, ['ok' => false, 'erreur' => 'Demande trop volumineuse.']);
}

// Piege a robots : ce champ est cache aux visiteurs, seuls les robots le remplissent.
// On repond "ok" pour ne rien leur apprendre, sans envoyer d'e-mail.
if (ligne($donnees['site_web'] ?? '') !== '') {
    repondre(200, ['ok' => true]);
}

// Limite d'envois par IP (fichiers dans le dossier temporaire du serveur).
$ip = $_SERVER['REMOTE_ADDR'] ?? 'inconnue';
$fichierLimite = sys_get_temp_dir() . '/mipe_form_' . hash('sha256', $ip);
$maintenant = time();
$horodatages = [];
if (is_file($fichierLimite)) {
    $horodatages = array_filter(
        array_map('intval', explode(',', (string) file_get_contents($fichierLimite))),
        fn ($t) => $t > $maintenant - $config['limite_fenetre_secondes']
    );
}
if (count($horodatages) >= $config['limite_envois']) {
    repondre(429, ['ok' => false, 'erreur' => 'Trop de demandes. Reessayez dans quelques minutes.']);
}

// Validation commune
$type = ligne($donnees['type'] ?? '');
$nom = ligne($donnees['nom'] ?? '', 80);
$prenom = ligne($donnees['prenom'] ?? '', 80);
$email = ligne($donnees['email'] ?? '', 150);
$telephone = ligne($donnees['telephone'] ?? '', 25);
$codePostal = ligne($donnees['codePostal'] ?? '', 10);
$message = paragraphe($donnees['message'] ?? '');

$erreurs = [];
if ($nom === '') $erreurs[] = 'nom';
if ($prenom === '') $erreurs[] = 'prenom';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $erreurs[] = 'email';
if (!preg_match('/^\+?[0-9 .\-()]{9,20}$/', $telephone)) $erreurs[] = 'telephone';
if (!preg_match('/^[0-9]{5}$/', $codePostal)) $erreurs[] = 'codePostal';

$lignes = [];
if ($type === 'devis') {
    $travaux = array_filter(array_map(fn ($t) => ligne($t, 100), is_array($donnees['travaux'] ?? null) ? array_slice($donnees['travaux'], 0, 20) : []));
    $delai = ligne($donnees['delai'] ?? '', 100);
    if (!$travaux) $erreurs[] = 'travaux';
    if ($delai === '') $erreurs[] = 'delai';
    $sujet = 'Nouvelle demande de devis : ' . $prenom . ' ' . $nom;
    $lignes[] = 'Travaux : ' . implode(', ', $travaux);
    $lignes[] = 'Delai : ' . $delai;
} elseif ($type === 'rappel') {
    $typeTravaux = ligne($donnees['typeTravaux'] ?? '', 100);
    if ($typeTravaux === '') $erreurs[] = 'typeTravaux';
    $sujet = 'Demande de rappel : ' . $prenom . ' ' . $nom;
    $lignes[] = 'Type de travaux : ' . $typeTravaux;
} else {
    repondre(400, ['ok' => false, 'erreur' => 'Formulaire inconnu.']);
}

if (empty($donnees['consentement'])) $erreurs[] = 'consentement';

if ($erreurs) {
    repondre(422, ['ok' => false, 'erreur' => 'Champs invalides.', 'champs' => $erreurs]);
}

// Construction de l'e-mail
$lignes[] = 'Nom : ' . $prenom . ' ' . $nom;
$lignes[] = 'Telephone : ' . $telephone;
$lignes[] = 'Email : ' . $email;
$lignes[] = 'Code postal : ' . $codePostal;
if ($message !== '') {
    $lignes[] = '';
    $lignes[] = 'Message :';
    $lignes[] = $message;
}
$lignes[] = '';
$lignes[] = '--';
$lignes[] = 'Envoye depuis le site le ' . date('d/m/Y H:i') . ' (IP ' . $ip . ')';
$corps = implode("\n", $lignes);

$domaine = preg_replace('/^www\./', '', preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? 'localhost'));
$expediteur = $config['expediteur'] !== '' ? $config['expediteur'] : 'no-reply@' . $domaine;

$entetes = [
    'From: MIPE Habitat <' . $expediteur . '>',
    'Reply-To: ' . $prenom . ' ' . $nom . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: PHP/' . PHP_VERSION,
];
$sujetEncode = '=?UTF-8?B?' . base64_encode($sujet) . '?=';

if (getenv('MIPE_SIMULER')) {
    // Mode test local (php -S) : on ecrit le message dans un fichier au lieu de l'envoyer.
    file_put_contents(sys_get_temp_dir() . '/mipe_mail_simule.txt', "To: {$config['destinataire']}\nSubject: $sujet\n" . implode("\n", $entetes) . "\n\n$corps\n\n=====\n", FILE_APPEND);
    $envoye = true;
} else {
    $envoye = mail($config['destinataire'], $sujetEncode, $corps, implode("\r\n", $entetes));
}

if (!$envoye) {
    error_log('[mipe-habitat] Echec de mail() pour la demande ' . $type);
    repondre(500, ['ok' => false, 'erreur' => "L'envoi a echoue."]);
}

$horodatages[] = $maintenant;
file_put_contents($fichierLimite, implode(',', $horodatages), LOCK_EX);

repondre(200, ['ok' => true]);
