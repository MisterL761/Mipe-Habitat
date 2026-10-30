// Ouvre/ferme le menu mobile (navbar en dessous de 1180px de large).
// On ajoute juste la classe "menuOuvert" sur le header : c'est le CSS
// (media query) qui decide quoi en faire.
const navbar = document.getElementById('navbar');
const burger = document.getElementById('burger');
const voile = document.getElementById('voileMenu');

function definirMenu(ouvert) {
	navbar.classList.toggle('menuOuvert', ouvert);
	burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
	burger.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
}

burger.addEventListener('click', () => {
	definirMenu(!navbar.classList.contains('menuOuvert'));
});

// Ferme le menu si on clique en dehors de la navbar, ou sur le voile sombre.
document.addEventListener('click', (e) => {
	if (!navbar.contains(e.target) || e.target === voile) {
		definirMenu(false);
	}
});

// Echap ferme le menu et redonne le focus au bouton.
document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape' && navbar.classList.contains('menuOuvert')) {
		definirMenu(false);
		burger.focus();
	}
});

// Ferme le menu quand on clique sur un vrai lien de navigation (on change de
// page). On exclut ".lienAvecMenu" : ce lien-la n'emmene nulle part, il sert
// juste a ouvrir/fermer le sous-menu "Nos metiers" (voir sousMenu.js).
document.querySelectorAll('#navbar nav a:not(.lienAvecMenu), #navbar .contact a').forEach((lien) => {
	lien.addEventListener('click', () => definirMenu(false));
});
