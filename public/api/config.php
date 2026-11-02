<?php
// Configuration de l'envoi des formulaires (hebergement mutualise, PHP + mail()).
return [
    // Adresse qui recoit TOUTES les demandes (devis et rappel).
    // Phase de test : a remplacer par l'adresse definitive de MIPE Habitat.
    'destinataire' => 'lulumed466@gmail.com',

    // Adresse d'expedition. Elle doit appartenir au domaine du site (sinon les
    // messages finissent en spam). Vide = "no-reply@" + nom de domaine du site.
    'expediteur' => '',

    // Anti-spam : nombre max d'envois par visiteur (IP) sur la fenetre ci-dessous.
    'limite_envois' => 5,
    'limite_fenetre_secondes' => 600,
];
