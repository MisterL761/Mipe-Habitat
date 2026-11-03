<?php
// Réglages de l'admin.
return [
    // Code demandé UNE SEULE FOIS, à la première connexion, pour créer le mot de passe
    // administrateur. Il empêche un inconnu de s'emparer de l'admin avant vous.
    // Après la création du mot de passe, ce code ne sert plus.
    'code_installation' => 'CHANGEZ-MOI-PAR-UN-CODE-ALEATOIRE',
];
// Copiez ce fichier en config.php avant le build (il n'est pas versionné).
