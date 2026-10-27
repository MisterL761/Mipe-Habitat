// Fait apparaître en douceur (fondu + léger glissement) chaque élément
// marqué .reveal, dès qu'il entre dans l'écran en scrollant.
const reduitMouvement = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduitMouvement && 'IntersectionObserver' in window) {
	const observateur = new IntersectionObserver(
		(entrees) => {
			entrees.forEach((entree) => {
				// Un element tres haut (ex: toute la frise) n'atteindra jamais 15% de
				// sa hauteur visible dans l'ecran : on regarde aussi la hauteur
				// visible en pixels (15% de l'element OU 15% de l'ecran, le plus petit).
				const hauteurVisible = entree.intersectionRect.height;
				const seuilPx = Math.min(entree.boundingClientRect.height * 0.15, window.innerHeight * 0.15);
				if (entree.isIntersecting && hauteurVisible >= seuilPx) {
					entree.target.classList.add('est-visible');
					observateur.unobserve(entree.target);
				}
			});
		},
		{ threshold: [0, 0.02, 0.05, 0.1, 0.15], rootMargin: '0px 0px -60px 0px' }
	);

	document.querySelectorAll('.reveal').forEach((element) => observateur.observe(element));
}
