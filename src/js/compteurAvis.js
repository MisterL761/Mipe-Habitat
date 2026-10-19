// Fait monter la note moyenne (ex: 4,8) de 0 jusqu'a sa valeur, en meme
// temps que le remplissage des etoiles grandit en phase, des que le bloc
// entre dans l'ecran (une seule fois).
const noteEl = document.querySelector('.grandeNoteAvis');
const etoilesRemplies = document.querySelector('.etoilesRemplies');
const reduitMouvement = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (noteEl && etoilesRemplies) {
	const cible = parseFloat(noteEl.dataset.cible.replace(',', '.'));
	const largeurCible = parseFloat(etoilesRemplies.dataset.largeurCible);

	function afficher(valeur, largeur) {
		noteEl.textContent = valeur.toFixed(1).replace('.', ',');
		etoilesRemplies.style.width = `${largeur}%`;
	}

	if (reduitMouvement) {
		// Pas d'animation liee au scroll : on affiche directement les
		// valeurs finales.
		afficher(cible, largeurCible);
	} else if ('IntersectionObserver' in window) {
		const observateur = new IntersectionObserver(
			(entrees) => {
				entrees.forEach((entree) => {
					if (entree.isIntersecting) {
						animer();
						observateur.unobserve(entree.target);
					}
				});
			},
			{ threshold: 0.4 }
		);
		observateur.observe(noteEl);
	} else {
		afficher(cible, largeurCible);
	}

	function animer() {
		const duree = 1200; // ms
		const debut = performance.now();

		function etape(maintenant) {
			const avancement = Math.min((maintenant - debut) / duree, 1);
			// Easing "ease-out" : ca ralentit en approchant la cible.
			const adouci = 1 - Math.pow(1 - avancement, 3);
			afficher(adouci * cible, adouci * largeurCible);

			if (avancement < 1) {
				requestAnimationFrame(etape);
			}
		}

		requestAnimationFrame(etape);
	}
}
