// Fait monter chaque note moyenne (ex: 4,8 pour Google, 4,0 pour PagesJaunes)
// de 0 jusqu'a sa valeur, en meme temps que le remplissage des etoiles grandit
// en phase, des que le bloc entre dans l'ecran (une seule fois par bloc).
const blocs = [...document.querySelectorAll('.sourceAvis')];
const reduitMouvement = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

blocs.forEach((bloc) => {
	const noteEl = bloc.querySelector('.grandeNoteAvis');
	const etoilesRemplies = bloc.querySelector('.etoilesRemplies');
	if (!noteEl || !etoilesRemplies || !noteEl.dataset.cible) return;

	const cible = parseFloat(noteEl.dataset.cible.replace(',', '.'));
	const largeurCible = parseFloat(etoilesRemplies.dataset.largeurCible);

	function afficher(valeur, largeur) {
		noteEl.textContent = valeur.toFixed(1).replace('.', ',');
		etoilesRemplies.style.width = `${largeur}%`;
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

	if (reduitMouvement || !('IntersectionObserver' in window)) {
		// Pas d'animation liee au scroll : on affiche directement les valeurs finales.
		afficher(cible, largeurCible);
		return;
	}

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
});
