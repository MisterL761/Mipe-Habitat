// La bulle "Faire une simulation" (fixed, en bas a droite) est masquee :
//  - tant qu'une zone marquee data-masque-bulle est a l'ecran : sur l'accueil,
//    c'est la hero section, qui a deja ses propres appels a l'action (bouton
//    "Prendre RDV" de la navbar, formulaire) et dont le bandeau de chiffres-cles
//    se termine pile au bord bas de l'ecran ;
//  - des que le pied de page (footer) apparait a l'ecran, sur toutes les pages :
//    la bulle ne doit pas masquer ses liens et ses coordonnees.
// Elle reapparait des qu'on quitte ces zones.
// La pastille Google (en bas a gauche) suit exactement les memes regles.
const bulle = document.querySelector('.bulleSimulation');
const pastille = document.querySelector('.pastilleGoogle');

if (bulle && 'IntersectionObserver' in window) {
	const zonesVisibles = new Set();
	const majBulle = () => {
		const cachee = zonesVisibles.size > 0;
		bulle.classList.toggle('bulleSimulationCachee', cachee);
		pastille?.classList.toggle('pastilleGoogleCachee', cachee);
	};

	const observer = (zones, seuil) => {
		if (!zones.length) return;
		const obs = new IntersectionObserver(
			(entrees) => {
				entrees.forEach((entree) => {
					if (entree.isIntersecting) zonesVisibles.add(entree.target);
					else zonesVisibles.delete(entree.target);
				});
				majBulle();
			},
			{ threshold: seuil }
		);
		zones.forEach((zone) => obs.observe(zone));
	};

	observer([...document.querySelectorAll('[data-masque-bulle]')], 0.55);
	// seuil 0 : des le premier pixel du footer qui entre dans l'ecran
	observer([...document.querySelectorAll('.footer-section')], 0);
}
