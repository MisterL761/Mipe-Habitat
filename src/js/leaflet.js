import L from 'leaflet';

const conteneurCarte = document.getElementById('carte');
const siege = JSON.parse(conteneurCarte.dataset.siege);
const chantiers = JSON.parse(conteneurCarte.dataset.chantiers);

// au lieu d'etre captee par la carte pour zoomer (ce qui bloquait le scroll).
// pour les remettre nous-meme a droite, car la carte flottante du chantier
// s'affiche justement dans le coin haut-gauche et les chevauchait.
const carte = L.map('carte', { scrollWheelZoom: false, zoomControl: false });
L.control.zoom({ position: 'topright' }).addTo(carte);

// On cadre la vue sur le siege + tous les chantiers plutot qu'un zoom fixe,
// pour que chaque point reste visible automatiquement meme quand de
// nouveaux chantiers s'ajoutent loin des precedents. maxZoom evite que la
// carte se retrouve trop "collee" si jamais les points sont tres proches.
const pointsCarte = [[siege.lat, siege.lng], ...chantiers.map((c) => [c.lat, c.lng])];
carte.fitBounds(pointsCarte, { padding: [40, 40], maxZoom: 11 });

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 18,
}).addTo(carte);

// Un petit "pin" en forme de goutte, dessiné en CSS (voir CarteRealisations.css),
// qu'on colore différemment selon le type de point.
function creerPin(couleur) {
    return L.divIcon({
        className: '',
        html: `<span class="pinCarte" style="background:${couleur}"></span>`,
        iconSize: [26, 34],
        iconAnchor: [13, 34],
    });
}

const pinSiege = creerPin('#16273B');
const pinChantier = creerPin('#6FBE2C');
const pinSelectionne = creerPin('#D64545');

L.marker([siege.lat, siege.lng], { icon: pinSiege })
    .addTo(carte)
    .bindTooltip(siege.nom);

const cardChantier = document.getElementById('cardChantier');
const fermerCard = document.getElementById('fermerCard');
const cardCategorie = document.getElementById('cardCategorie');
const cardAnnee = document.getElementById('cardAnnee');
const cardTitre = document.getElementById('cardTitre');
const cardLieu = document.getElementById('cardLieu');
const cardDesc = document.getElementById('cardDesc');

let marqueurActif = null;

// ---------- Galerie photo (plusieurs photos par chantier) ----------

// Pour la petite grille en bas de page : chaque carte est rendue une fois
// par Astro et ne change plus jamais, donc une seule initialisation au
// chargement suffit pour chacune.
function initGalerieStatique(galerie) {
    const track = galerie.querySelector('.galerieTrack');
    const photos = track.children;
    const boutonPrec = galerie.querySelector('.galeriePrec');
    const boutonSuiv = galerie.querySelector('.galerieSuiv');
    if (photos.length <= 1) return; // 0 ou 1 photo : pas besoin de fleches

    let index = 0;
    function allerA(nouvelIndex) {
        index = (nouvelIndex + photos.length) % photos.length;
        track.style.transform = `translateX(-${index * 100}%)`;
    }
    boutonPrec.addEventListener('click', () => allerA(index - 1));
    boutonSuiv.addEventListener('click', () => allerA(index + 1));
}
document.querySelectorAll('.grilleRealisations .galerieChantier').forEach(initGalerieStatique);

// Pour la carte flottante : une seule galerie dans la page, mais son
// contenu change a chaque clic sur un marqueur (chantier different). On
// garde son etat dans ces variables, mises a jour par afficherChantier().
const galerieCardTrack = document.getElementById('galerieCardTrack');
const galerieCardPrec = document.getElementById('galerieCardPrec');
const galerieCardSuiv = document.getElementById('galerieCardSuiv');
// On sauvegarde le HTML de depart (l'icone grise) pour pouvoir le remettre
// quand un chantier n'a pas de photo, sans avoir a le recrire a la main.
const iconePlaceholderHTML = galerieCardTrack.innerHTML;
let photosCardActuelles = [];
let indexCardActif = 0;

function allerAPhotoCard(nouvelIndex) {
    if (photosCardActuelles.length === 0) return;
    indexCardActif = (nouvelIndex + photosCardActuelles.length) % photosCardActuelles.length;
    galerieCardTrack.style.transform = `translateX(-${indexCardActif * 100}%)`;
}

galerieCardPrec.addEventListener('click', () => allerAPhotoCard(indexCardActif - 1));
galerieCardSuiv.addEventListener('click', () => allerAPhotoCard(indexCardActif + 1));

function afficherChantier(chantier, marqueur) {
    if (marqueurActif) marqueurActif.setIcon(pinChantier);
    marqueur.setIcon(pinSelectionne);
    marqueurActif = marqueur;

    cardCategorie.textContent = chantier.categorie;
    cardAnnee.textContent = chantier.annee;
    cardTitre.textContent = chantier.titre;
    cardLieu.textContent = `${chantier.ville} (${chantier.cp})`;
    cardDesc.textContent = chantier.description;

    // Galerie : on reconstruit le contenu a chaque clic, car chaque
    // chantier a ses propres photos (ou aucune).
    photosCardActuelles = chantier.photos || [];
    galerieCardTrack.style.transform = 'translateX(0)';
    indexCardActif = 0;

    if (photosCardActuelles.length === 0) {
        galerieCardTrack.innerHTML = iconePlaceholderHTML;
    } else {
        galerieCardTrack.innerHTML = '';
        photosCardActuelles.forEach((url) => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = chantier.titre;
            galerieCardTrack.appendChild(img);
        });
    }
    galerieCardPrec.hidden = photosCardActuelles.length <= 1;
    galerieCardSuiv.hidden = photosCardActuelles.length <= 1;

    cardChantier.hidden = false;
}

chantiers.forEach((chantier) => {
    const marqueur = L.marker([chantier.lat, chantier.lng], { icon: pinChantier }).addTo(carte);
    marqueur.on('click', () => afficherChantier(chantier, marqueur));
});

fermerCard.addEventListener('click', () => {
    cardChantier.hidden = true;
    if (marqueurActif) {
        marqueurActif.setIcon(pinChantier);
        marqueurActif = null;
    }
});

