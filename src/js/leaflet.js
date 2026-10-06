import L from 'leaflet';

const conteneurCarte = document.getElementById('carte');
const siege = JSON.parse(conteneurCarte.dataset.siege);
const chantiers = JSON.parse(conteneurCarte.dataset.chantiers);

// scrollWheelZoom: false -> la molette fait defiler la page normalement,
// au lieu d'etre captee par la carte pour zoomer (ce qui bloquait le scroll).
// zoomControl: false -> on retire les boutons +/- par defaut (coin haut-gauche)
// pour les remettre nous-meme a droite, car la carte flottante du chantier
// s'affiche justement dans le coin haut-gauche et les chevauchait.
const carte = L.map('carte', { scrollWheelZoom: false, zoomControl: false }).setView([siege.lat, siege.lng], 10);
L.control.zoom({ position: 'topright' }).addTo(carte);

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

function afficherChantier(chantier, marqueur) {
    if (marqueurActif) marqueurActif.setIcon(pinChantier);
    marqueur.setIcon(pinSelectionne);
    marqueurActif = marqueur;

    cardCategorie.textContent = chantier.categorie;
    cardAnnee.textContent = chantier.annee;
    cardTitre.textContent = chantier.titre;
    cardLieu.textContent = `${chantier.ville} (${chantier.cp})`;
    cardDesc.textContent = chantier.description;
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