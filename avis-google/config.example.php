<?php
// Copie ce fichier en "config.php" (ignoré par Git) et remplis les valeurs.
return [
    'client_id'     => 'COLLE_ICI_TON_CLIENT_ID',      // Google Cloud Console > Identifiants
    'client_secret' => 'COLLE_ICI_TON_CLIENT_SECRET',
    'refresh_token' => 'COLLE_ICI_TON_REFRESH_TOKEN',  // obtenu via setup.php
    'account_id'    => '',                             // ex. '123456789' (sans "accounts/") ; vide = 1er compte trouvé
    'location_id'   => '15214985110456022179',         // fiche MIPE Habitat
    // 'sortie'     => '/chemin/vers/src/data/avis-google.json',  // optionnel (défaut : ../src/data/avis-google.json)
];
