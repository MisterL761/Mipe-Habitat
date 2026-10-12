// Ouvre/ferme le menu mobile (navbar en dessous de 900px de large).
// On ajoute juste la classe "menuOuvert" sur le header : c'est le CSS
// (media query) qui decide quoi en faire.
const navbar = document.getElementById('navbar');
const burger = document.getElementById('burger');

burger.addEventListener('click', () => {
	const estOuvert = navbar.classList.toggle('menuOuvert');
	burger.setAttribute('aria-expanded', estOuvert ? 'true' : 'false');
});

// Ferme le menu si on clique en dehors de la navbar (ex: sur le contenu de la page).
document.addEventListener('click', (e) => {
	if (!navbar.contains(e.target)) {
		navbar.classList.remove('menuOuvert');
		burger.setAttribute('aria-expanded', 'false');
	}
});

// Ferme le menu quand on clique sur un vrai lien de navigation (on change de
// page). On exclut ".lienAvecMenu" : ce lien-la n'emmene nulle part, il sert
// juste a ouvrir/fermer le sous-menu "Nos metiers" (voir sousMenu.js).
document.querySelectorAll('#navbar nav a:not(.lienAvecMenu)').forEach((lien) => {
	lien.addEventListener('click', () => {
		navbar.classList.remove('menuOuvert');
		burger.setAttribute('aria-expanded', 'false');
	});
});
