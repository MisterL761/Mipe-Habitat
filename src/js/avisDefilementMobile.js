// Avis en version mobile : la bande de cartes defile toute seule vers la gauche,
// en boucle, et se laisse reprendre au doigt (elle se met en pause pendant le
// geste, puis repart apres quelques secondes). Sur grand ecran, c'est le CSS
// (colonnes verticales) qui anime : ce script ne fait rien.
const mobile = window.matchMedia('(max-width: 600px)');
const reduitMouvement = window.matchMedia('(prefers-reduced-motion: reduce)');
const bande = document.querySelector('.avisColonnes');

if (bande && mobile.matches) {
	// On duplique les cartes pour boucler sans coupure (les doublons du CSS
	// vertical, eux, restent masques).
	const originales = [...bande.querySelectorAll('.carteAvis:not(.carteAvisDoublon)')];
	originales.forEach((carte) => {
		const clone = carte.cloneNode(true);
		clone.classList.add('carteAvisClone');
		clone.setAttribute('aria-hidden', 'true');
		bande.appendChild(clone);
	});

	const VITESSE = 28; // pixels par seconde
	let position = 0;
	let dernier = 0;
	let enPause = reduitMouvement.matches;
	let visible = false;
	let reprise = null;

	const largeurBoucle = () => {
		const premiereClone = bande.querySelector('.carteAvisClone');
		return premiereClone ? premiereClone.offsetLeft - originales[0].offsetLeft : 0;
	};

	function pause() {
		enPause = true;
		clearTimeout(reprise);
	}
	function repriseApres(delai) {
		clearTimeout(reprise);
		reprise = setTimeout(() => {
			position = bande.scrollLeft;
			enPause = reduitMouvement.matches;
		}, delai);
	}

	// Le doigt (ou la molette) reprend la main : pause, puis reprise automatique
	bande.addEventListener('touchstart', pause, { passive: true });
	bande.addEventListener('touchend', () => repriseApres(3000), { passive: true });
	bande.addEventListener('touchcancel', () => repriseApres(3000), { passive: true });
	bande.addEventListener('wheel', () => { pause(); repriseApres(3000); }, { passive: true });
	bande.addEventListener('focusin', pause);
	bande.addEventListener('focusout', () => repriseApres(3000));

	// On ne fait tourner l'animation que si la bande est a l'ecran
	new IntersectionObserver(([entree]) => { visible = entree.isIntersecting; }).observe(bande);

	function etape(maintenant) {
		const ecoule = dernier ? Math.min(maintenant - dernier, 100) : 0;
		dernier = maintenant;

		if (!enPause && visible) {
			const boucle = largeurBoucle();
			position += (VITESSE * ecoule) / 1000;
			if (boucle > 0 && position >= boucle) position -= boucle;
			bande.scrollLeft = position;
		}
		requestAnimationFrame(etape);
	}
	requestAnimationFrame(etape);
}
