// Logo 3D de MIPE Habitat : un petit cube qui tourne lentement et que l'on peut
// faire pivoter a la souris / au doigt. Chaque emplacement est un
// <div class="logo3d" data-modele="..."> (voir Logo3D.astro).
//
// Performance : la librairie (~900 Ko) et le modele ne sont charges que
// lorsqu'un emplacement approche de l'ecran ; le rendu WebGL n'existe que tant
// que l'emplacement est visible (un contexte WebGL par cube, on les libere en
// sortie d'ecran). Aucun cube sur mobile/tablette etroite ni en mode
// "reduire les animations" (l'emplacement reste vide).
const emplacements = [...document.querySelectorAll('.logo3d')];
const peutAfficher = !window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(min-width: 901px)').matches;

if (emplacements.length && peutAfficher && 'IntersectionObserver' in window) {
	let chargement = null;
	const charger = () => (chargement ??= import('@google/model-viewer'));

	const observateur = new IntersectionObserver(
		(entrees) => {
			entrees.forEach(async (entree) => {
				const zone = entree.target;
				if (entree.isIntersecting) {
					await charger();
					if (zone.querySelector('model-viewer')) return;
					const viewer = document.createElement('model-viewer');
					viewer.setAttribute('src', zone.dataset.modele);
					viewer.setAttribute('alt', 'Logo MIPE Habitat en 3D');
					viewer.setAttribute('auto-rotate', '');
					viewer.setAttribute('rotation-per-second', '24deg');
					viewer.setAttribute('camera-controls', '');
					viewer.setAttribute('disable-zoom', '');
					viewer.setAttribute('disable-pan', '');
					viewer.setAttribute('interaction-prompt', 'none');
					viewer.setAttribute('shadow-intensity', '0');
					viewer.setAttribute('exposure', '1.3');
					viewer.setAttribute('environment-image', 'neutral');
					viewer.setAttribute('camera-orbit', '30deg 70deg auto');
					viewer.setAttribute('min-camera-orbit', 'auto 40deg auto');
					viewer.setAttribute('max-camera-orbit', 'auto 100deg auto');
					viewer.setAttribute('touch-action', 'pan-y');
					zone.appendChild(viewer);
				} else {
					zone.querySelector('model-viewer')?.remove();
				}
			});
		},
		{ rootMargin: '200px 0px' }
	);
	emplacements.forEach((zone) => observateur.observe(zone));
}
