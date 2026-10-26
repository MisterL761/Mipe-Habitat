// Fait compter chaque chiffre-cle du bandeau (15 ans d'experience, 2
// agences) de 0 jusqu'a sa valeur cible, une seule fois chacun, des qu'il
// entre dans l'ecran.
const reduitMouvement = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.chiffreAnime').forEach((chiffre) => {
	const cible = parseInt(chiffre.dataset.cible, 10);

	if (reduitMouvement) {
		// Pas d'animation : on affiche directement le chiffre final.
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
});

function compter(element, cible) {
	const duree = 1200; // ms
	const debut = performance.now();

	function etape(maintenant) {
		const avancement = Math.min((maintenant - debut) / duree, 1);
		// Easing "ease-out" (ralentit en approchant la cible), pour que le
		// compteur ne s'arrete pas sec.
		const avancementAdouci = 1 - Math.pow(1 - avancement, 3);
		element.textContent = Math.round(avancementAdouci * cible);

		if (avancement < 1) {
			requestAnimationFrame(etape);
		}
	}

	requestAnimationFrame(etape);
}
