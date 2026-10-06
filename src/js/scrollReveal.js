// Fait apparaître en douceur (fondu + léger glissement) chaque élément
// marqué .reveal, dès qu'il entre dans l'écran en scrollant.
const reduitMouvement = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduitMouvement && 'IntersectionObserver' in window) {
	const observateur = new IntersectionObserver(
		(entrees) => {
			entrees.forEach((entree) => {
				if (entree.isIntersecting) {
					entree.target.classList.add('est-visible');
					observateur.unobserve(entree.target);
				}
			});
		},
		{ threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
	);

	document.querySelectorAll('.reveal').forEach((element) => observateur.observe(element));
}
