// Mesure la hauteur reelle de la barre de navigation (sticky, en haut de
// page) et la pose dans une variable CSS : la hero section (desktop) s'en
// sert pour occuper exactement le reste de l'ecran, bandeau de chiffres-cles
// compris, sans qu'il faille scroller pour le voir. Une valeur par defaut
// (85px, mesuree sur la navbar actuelle) est utilisee par le CSS tant que
// ce script n'a pas encore tourne, pour eviter tout saut visuel.
function ajusterHauteurHero() {
	const navbar = document.querySelector('.navbar');
	if (!navbar) return;
	const hauteur = navbar.getBoundingClientRect().height;
	document.documentElement.style.setProperty('--hauteur-navbar', `${hauteur}px`);
}

ajusterHauteurHero();
window.addEventListener('resize', ajusterHauteurHero);
