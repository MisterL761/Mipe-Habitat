import L from 'leaflet';

const conteneurCarte = document.getElementById('carteZone');
const agences = JSON.parse(conteneurCarte.dataset.agences);
const villes = JSON.parse(conteneurCarte.dataset.villes);

// scrollWheelZoom: false -> la molette fait defiler la page normalement.
// zoomControl: true (en haut a gauche, comportement par defaut de Leaflet)
// car rien d'autre ne s'affiche dans ce coin sur cette carte.
const carte = L.map('carteZone', { scrollWheelZoom: false });

// Memes tuiles OpenStreetMap que la carte "Nos realisations" : gratuites,
// sans cle API (contrairement a certains fonds de carte type CARTO qui en
// exigent une des que le volume de requetes depasse leur usage gratuit).
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; OpenStreetMap contributors',
	maxZoom: 18,
}).addTo(carte);

// Marqueur "agence" : gros point bleu marine + etiquette pleine, pour les
// deux implantations de MIPE Habitat.
function creerMarqueurAgence(nom) {
	return L.divIcon({
		className: '',
		html: `<span class="marqueurZone marqueurZone--agence"><span class="pointZone"></span><span class="labelZone">${nom}</span></span>`,
	});
}

// Marqueur "ville" : petit point vert + etiquette claire, pour les grandes
// villes citees autour de chaque zone de rayonnement.
function creerMarqueurVille(nom) {
	return L.divIcon({
		className: '',
		html: `<span class="marqueurZone marqueurZone--ville"><span class="pointZone"></span><span class="labelZone">${nom}</span></span>`,
	});
}

// Conversion approximative metres -> degres, pour estimer l'etendue d'un
// cercle sans dependre de Circle.getBounds() (qui a besoin que le cercle
// soit deja projete sur la carte, ce qui n'est pas encore garanti au
// moment du calcul du cadrage initial).
function etenduesDepuisRayon(rayon, lat) {
	const degLat = rayon / 111320;
	const degLng = rayon / (111320 * Math.cos((lat * Math.PI) / 180));
	return { degLat, degLng };
}

// Points utilises pour cadrer la vue (fitBounds) : le centre de chaque
// agence + les 4 extremites de son cercle, plus chaque ville citee.
const pointsCarte = [];

agences.forEach((agence) => {
	// Le fond OSM est tres charge en couleurs (foret, routes, zones
	// urbaines), donc un trait fin et clair s'y noie. On prend un trait
	// bleu marine epais (meme couleur que le point de l'agence, pour bien
	// associer le cercle a son agence) avec un halo blanc dessous pour
	// qu'il reste lisible quel que soit le fond de la tuile.
	L.circle([agence.lat, agence.lng], {
		radius: agence.rayon,
		color: '#fff',
		weight: 6,
		opacity: 0.9,
		fill: false,
	}).addTo(carte);
	L.circle([agence.lat, agence.lng], {
		radius: agence.rayon,
		color: '#16273B',
		weight: 3,
		dashArray: '10 8',
		fillColor: '#16273B',
		fillOpacity: 0.07,
	}).addTo(carte);

	L.marker([agence.lat, agence.lng], {
		icon: creerMarqueurAgence(agence.nom),
		interactive: false,
		zIndexOffset: 1000,
	}).addTo(carte);

	const { degLat, degLng } = etenduesDepuisRayon(agence.rayon, agence.lat);
	pointsCarte.push(
		[agence.lat, agence.lng],
		[agence.lat + degLat, agence.lng],
		[agence.lat - degLat, agence.lng],
		[agence.lat, agence.lng + degLng],
		[agence.lat, agence.lng - degLng],
	);
});

villes.forEach((ville) => {
	L.marker([ville.lat, ville.lng], {
		icon: creerMarqueurVille(ville.nom),
		interactive: false,
	}).addTo(carte);
	pointsCarte.push([ville.lat, ville.lng]);
});

carte.fitBounds(pointsCarte, { padding: [24, 24] });
