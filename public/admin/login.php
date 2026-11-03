<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';
entetes_securite();
demarrer_session();

if (connecte()) {
    header('Location: index.php');
    exit;
}

$hash = hash_motdepasse();
$premiere = $hash === null;
$erreur = '';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    usleep(300000); // ralentit les essais automatisés
    if (!verifier_csrf($_POST['csrf'] ?? null)) {
        $erreur = 'Session expirée, rechargez la page.';
    } elseif (!reserver_tentative()) {
        $erreur = 'Trop de tentatives. Réessayez dans 15 minutes.';
    } elseif ($premiere) {
        $code = (string) ($_POST['code'] ?? '');
        $mdp = (string) ($_POST['motdepasse'] ?? '');
        if (!code_installation_valide()) {
            $erreur = "Installation impossible : le code d'installation de admin/config.php est trop court ou n'a pas été personnalisé (16 caractères minimum).";
        } elseif (!hash_equals((string) config_admin()['code_installation'], $code)) {
            $erreur = "Code d'installation incorrect.";
        } elseif (mb_strlen($mdp) < 10) {
            $erreur = 'Le mot de passe doit faire au moins 10 caractères.';
        } elseif ($mdp !== (string) ($_POST['confirmation'] ?? '')) {
            $erreur = 'Les deux mots de passe ne sont pas identiques.';
        } elseif (!enregistrer_motdepasse($mdp)) {
            $erreur = "Impossible d'enregistrer le mot de passe (droits d'écriture du dossier admin).";
        } else {
            oublier_tentatives();
            session_regenerate_id(true);
            $_SESSION['admin'] = true;
            $_SESSION['activite'] = time();
            header('Location: index.php');
            exit;
        }
    } elseif (password_verify((string) ($_POST['motdepasse'] ?? ''), $hash)) {
        oublier_tentatives();
        session_regenerate_id(true);
        $_SESSION['admin'] = true;
        $_SESSION['activite'] = time();
        header('Location: index.php');
        exit;
    } else {
        $erreur = 'Mot de passe incorrect.';
    }
}
$jeton = jeton_csrf();
?><!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Connexion | Administration MIPE Habitat</title>
<link rel="stylesheet" href="admin.css">
</head>
<body class="pageConnexion">
<main class="boiteConnexion">
  <h1>Administration</h1>
  <p class="sousTitre">MIPE Habitat</p>
  <?php if ($erreur): ?><p class="alerte alerteErreur" role="alert"><?= htmlspecialchars($erreur) ?></p><?php endif; ?>
  <form method="post" autocomplete="off">
    <input type="hidden" name="csrf" value="<?= htmlspecialchars($jeton) ?>">
    <?php if ($premiere): ?>
      <p class="aide">Première connexion : créez votre mot de passe administrateur. Le code d'installation se trouve dans le fichier <code>admin/config.php</code>.</p>
      <label>Code d'installation<input type="text" name="code" required></label>
      <label>Nouveau mot de passe (10 caractères minimum)<input type="password" name="motdepasse" minlength="10" required autocomplete="new-password"></label>
      <label>Confirmer le mot de passe<input type="password" name="confirmation" minlength="10" required autocomplete="new-password"></label>
      <button class="bouton boutonPlein" type="submit">Créer le mot de passe et entrer</button>
    <?php else: ?>
      <label>Mot de passe<input type="password" name="motdepasse" required autofocus autocomplete="current-password"></label>
      <button class="bouton boutonPlein" type="submit">Se connecter</button>
    <?php endif; ?>
  </form>
</main>
</body>
</html>
