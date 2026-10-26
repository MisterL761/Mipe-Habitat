// La bulle "Faire une simulation" (fixed, en bas a droite) reste cachee
// tant qu'une zone marquee data-masque-bulle est a l'ecran - sur l'accueil,
// c'est la hero section, qui a deja ses propres appels a l'action (bouton
// "Prendre RDV" de la navbar, formulaire) et dont le bandeau de chiffres-cles
// se termine pile au bord bas de l'ecran : la bulle flottante le cacherait
// sinon en permanence des l'arrivee sur le site. Des que l'utilisateur
// scrolle au-dela, la bulle reapparait normalement. N'a aucun effet sur les
// pages sans zone marquee.
const bulle = document.querySelector('.bulleSimulation');
const zonesMasquantes = document.querySelectorAll('[data-masque-bulle]');

if (bulle && zonesMasquantes.length > 0 && 'IntersectionObserver' in window) {
	const observateur = new IntersectionObserver(
		(entrees) => {
			entrees.forEach((entree) => {
				bulle.classList.toggle('bulleSimulationCachee', entree.isIntersecting);
			});
		},
		{ threshold: 0.55 }
	);
	zonesMasquantes.forEach((zone) => observateur.observe(zone));
}
