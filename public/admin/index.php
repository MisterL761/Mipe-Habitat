<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';
entetes_securite();
if (!connecte()) {
    header('Location: login.php');
    exit;
}
$jeton = jeton_csrf();
?><!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="csrf" content="<?= htmlspecialchars($jeton) ?>">
<title>Tableau de bord | Administration MIPE Habitat</title>
<link rel="stylesheet" href="admin.css">
</head>
<body>
<header class="barreHaut">
  <div class="marque"><strong>MIPE Habitat</strong><span>Administration</span></div>
  <nav class="onglets" id="onglets" aria-label="Sections">
    <button type="button" data-type="offres" class="actif">Promotions</button>
    <button type="button" data-type="realisations">Réalisations</button>
    <button type="button" data-type="articles">Blog</button>
  </nav>
  <div class="actionsHaut">
    <a class="bouton boutonLien" href="/" target="_blank" rel="noopener">Voir le site</a>
    <form method="post" action="logout.php"><input type="hidden" name="csrf" value="<?= htmlspecialchars($jeton) ?>"><button class="bouton" type="submit">Se déconnecter</button></form>
  </div>
</header>

<main class="contenu">
  <div class="enteteSection">
    <div>
      <h1 id="titreSection"></h1>
      <p class="aide" id="aideSection"></p>
    </div>
    <div class="outilsSection">
      <input type="search" id="recherche" placeholder="Rechercher…" aria-label="Rechercher">
      <button type="button" class="bouton boutonPlein" id="ajouter">+ Ajouter</button>
    </div>
  </div>
  <p class="alerte" id="message" role="status" hidden></p>
  <div class="liste" id="liste"></div>
</main>

<dialog id="dialogue" class="dialogue">
  <form id="formulaire" class="formulaire" novalidate>
    <div class="enteteDialogue">
      <h2 id="titreDialogue"></h2>
      <button type="button" class="fermer" id="fermerDialogue" aria-label="Fermer">×</button>
    </div>
    <div class="corpsDialogue" id="champs"></div>
    <p class="alerte alerteErreur" id="erreurFormulaire" role="alert" hidden></p>
    <div class="piedDialogue">
      <button type="button" class="bouton" id="annuler">Annuler</button>
      <button type="submit" class="bouton boutonPlein" id="enregistrer">Enregistrer</button>
    </div>
  </form>
</dialog>

<script src="admin.js"></script>
</body>
</html>
