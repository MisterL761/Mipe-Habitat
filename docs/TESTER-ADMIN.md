# Tester l'administration en local

Ce guide permet de tester le tableau de bord (`/admin`) sur ton ordinateur, sans hébergement ni vrai e-mail.

> `astro dev` (le serveur habituel du site) **ne fait pas tourner PHP** : l'admin ne s'y ouvre pas. Pour l'admin, on utilise le site construit (`dist/`) servi par le serveur PHP intégré.

## 1. Prérequis (une seule fois)

Vérifier que PHP est installé avec l'extension d'images GD (WebP) :

```bash
php -v
php -r 'echo function_exists("imagewebp") ? "GD WebP : OK\n" : "GD WebP : MANQUANT\n";'
```

Sur Mac : `brew install php` si la commande `php` n'existe pas.

## 2. Lancer le site avec l'admin

Depuis le dossier du projet (`site/`) :

```bash
npm run build
cd dist
php -S localhost:8000
```

Laisser ce terminal ouvert. Pour arrêter : `Ctrl + C`.

- Site : http://localhost:8000/
- Admin : http://localhost:8000/admin/

> Chaque `npm run build` **efface `dist/`**, donc aussi les données et photos ajoutées pendant les tests (voir « Repartir de zéro »). C'est voulu : le site retrouve son contenu de départ.

## 3. Première connexion

1. Ouvrir http://localhost:8000/admin/ : l'écran « Première connexion » s'affiche.
2. Le **code d'installation** se trouve dans le fichier `public/admin/config.php` (ligne `code_installation`). Le copier dans le champ.
3. Choisir un mot de passe de test (10 caractères minimum), le confirmer, valider.

Le code d'installation ne sert qu'à cette étape. Les fois suivantes, seul le mot de passe est demandé.

## 4. Parcours de test

### Promotions
1. Onglet **Promotions** → « + Nouvelle promotion ».
2. Remplir : titre, texte, quelques points (un par ligne), **une date de fin dans quelques jours**, choisir une photo, enregistrer.
3. Vérifier dans la liste : badges « Visible » et « Dans la popup » sur la nouvelle promotion.
4. Ouvrir le site (bouton « Voir le site ») :
   - la popup « Offres en cours » affiche la promo avec son compte à rebours (si elle ne s'ouvre pas : elle ne s'ouvre qu'une fois par session, ouvrir une fenêtre de navigation privée ou cliquer sur l'onglet vert « Offres en cours » à droite) ;
   - la page `/promotions` liste toutes les promos ;
   - le bouton « En savoir plus » de la popup mène à la bonne promo.
5. Retour dans l'admin : décocher « Promotion affichée sur le site » → elle disparaît du site. Tester aussi les flèches ↑ ↓ (la promo en haut de liste passe dans la popup).

### Réalisations
1. Onglet **Réalisations** → « + Nouvelle réalisation ».
2. Remplir ville, code postal, année, description, puis cliquer sur **« Placer sur la carte »** (position trouvée automatiquement ; sinon saisir latitude et longitude).
3. Ajouter 2 à 4 photos : la première est la photo principale. Les flèches ← → les réordonnent.
4. Enregistrer, puis ouvrir `/realisation` : le nouveau point est sur la carte et la carte apparaît en premier dans « Toutes nos réalisations ».
5. Tester « Modifier » (changer la ville, la position) et « Supprimer ».

### Blog
1. Onglet **Blog** → « + Nouvel article ».
2. Titre, catégorie, photo, et un texte de ce type :

   ```
   Une introduction avec du **gras**.

   ## Un sous-titre

   Un deuxième paragraphe.
   ```
3. Enregistrer, puis ouvrir l'accueil (section Blog) et `/blog` : la carte apparaît en premier, « Lire plus » ouvre l'article avec son sous-titre et son gras.

## 5. Contrôles de sécurité (facultatifs)

- Se déconnecter, puis ouvrir http://localhost:8000/admin/ : retour à l'écran de connexion.
- Saisir 6 fois un mauvais mot de passe : le message « Trop de tentatives » apparaît (blocage 15 minutes).
- Dans un titre, écrire `<b>test</b>` : il est enregistré sans balise.

## 6. Repartir de zéro

Effacer les données de test (sans reconstruire) :

```bash
cd dist
rm -rf data uploads admin/_prive
```

Le site revient à son contenu de départ et l'écran « Première connexion » réapparaît.

Débloquer les tentatives de connexion après un blocage :

```bash
rm "$(php -r 'echo sys_get_temp_dir();')"/mipe_admin_login_*
```

## 7. Problèmes fréquents

| Symptôme | Cause et solution |
|---|---|
| `/admin/` affiche du code PHP ou se télécharge | Le site est servi par `astro dev` ou un autre serveur. Utiliser `php -S localhost:8000` dans `dist/`. |
| « Address already in use » | Le port 8000 est pris. Arrêter l'autre serveur ou utiliser `php -S localhost:8001`. |
| « Installation impossible : le code d'installation… » | Le code de `public/admin/config.php` est trop court ou égal au modèle. Mettre un code aléatoire d'au moins 16 caractères, puis refaire `npm run build`. |
| « Écriture impossible : vérifiez les droits du dossier data » | Le dossier `dist/` n'est pas modifiable. Vérifier ses droits. |
| Les photos ne s'envoient pas | Extension GD/WebP absente (voir le prérequis) ou image de plus de 15 Mo. |
| Le site ne montre pas mon ajout | Recharger la page avec `Cmd + Maj + R`. Vérifier que l'ajout n'a pas été effacé par un nouveau `npm run build`. |
| Le bouton « Placer sur la carte » échoue | Il interroge OpenStreetMap : vérifier la connexion internet, ou saisir latitude et longitude à la main. |
| Mot de passe oublié (test) | Supprimer `dist/admin/_prive/identifiants.json` : l'écran de première connexion revient. |

## 8. Ce que ce test ne couvre pas

Le serveur PHP intégré ne lit pas le fichier `.htaccess` : le blocage de `config.php`, la protection du dossier `uploads/` et la redirection HTTPS ne se testent qu'une fois le site sur le vrai hébergement. Voir aussi `docs/ADMIN.md` (mise en ligne et sauvegarde).
