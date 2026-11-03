# Administration du site (promotions, réalisations, blog)

Adresse : `/admin/` (connexion par mot de passe). Fonctionne sur un hébergement mutualisé avec PHP 8 et l'extension GD (WebP).

## Première mise en ligne
1. `public/admin/config.php` contient le **code d'installation** (non versionné ; modèle : `config.exemple.php`). Le générer avant le build.
2. `npm run build`, puis déposer **tout le contenu de `dist/`** sur l'hébergement.
3. Ouvrir `/admin/`, saisir le code d'installation et choisir le mot de passe (10 caractères minimum). Le code ne sert plus ensuite.

## Où sont les données
- `data/*.json` : promotions, réalisations, articles (créés à la première modification ; avant, le contenu de départ de `admin/seed/` est servi).
- `uploads/` : photos ajoutées depuis l'admin (redimensionnées et converties en WebP).
- `admin/_prive/identifiants.json` : mot de passe haché.

**Ces trois dossiers ne sont pas dans `dist/`** : redéposer le site ne les écrase pas, mais ne **pas supprimer** les fichiers distants qui ne figurent pas dans `dist/`. Sauvegardez-les régulièrement.

## Fonctionnement
- Le site lit les contenus via `api/contenu.php` au chargement des pages (popup d'offre, `/promotions`, carte et grille des réalisations, blog). En développement (`astro dev`, sans PHP), il lit `admin/seed/*.json`.
- La popup affiche la première promotion **active** de la liste ; `/promotions` les affiche toutes. Une promotion avec date de fin disparaît seule après cette date.
- Tester en local : `npm run build`, puis `cd dist && php -S localhost:8000` (`/admin/`).

## Mot de passe oublié
Supprimer `admin/_prive/identifiants.json` sur le serveur : l'écran de première connexion revient (il faut le code d'installation de `admin/config.php`).
