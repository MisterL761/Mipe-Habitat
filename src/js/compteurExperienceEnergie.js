// Fait monter "X ans d'experience" (section partenaire BT2C) de 0 jusqu'a
// sa valeur, une seule fois, des que le chiffre entre dans l'ecran. Meme
// mecanique que src/js/compteurBandeau.js (hero de l'accueil).
const chiffre = document.getElementById('chiffreExperienceBT2C');
const reduitMouvement = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (chiffre) {
	const cible = parseInt(chiffre.dataset.cible, 10);

	if (reduitMouvement) {
		chiffre.textContent = cible;
	} else if ('IntersectionObserver' in window) {
		const observateur = new IntersectionObserver(
			(entrees) => {
				entrees.forEach((entree) => {
					if (entree.isIntersecting) {
						compter(chiffre, cible);
						observateur.unobserve(entree.target);
					}
				});
			},
			{ threshold: 0.4 }
		);
		observateur.observe(chiffre);
	} else {
		chiffre.textContent = cible;
	}
}

function compter(element, cible) {
	const duree = 1200; // ms
	const debut = performance.now();

	function etape(maintenant) {
		const avancement = Math.min((maintenant - debut) / duree, 1);
		const avancementAdouci = 1 - Math.pow(1 - avancement, 3);
		element.textContent = Math.round(avancementAdouci * cible);

		if (avancement < 1) {
			requestAnimationFrame(etape);
		}
	}

	requestAnimationFrame(etape);
}
