// Popup "Voir le chantier" de la section Avant / Apres : <dialog> natif
// (Echap pour fermer, focus gere par le navigateur). Un clic sur le fond
// sombre ferme aussi la fenetre. Les photos defilent (scroll-snap : glissement
// au doigt/trackpad) et se commandent aussi avec les fleches ou le clavier.
const bouton = document.getElementById('boutonVoirChantier');
const popup = document.getElementById('popupChantier');
const fermer = document.getElementById('fermerPopupChantier');
const piste = document.getElementById('pisteChantier');
const prec = document.getElementById('flechePrecChantier');
const suiv = document.getElementById('flecheSuivChantier');
const points = [...document.querySelectorAll('.pointChantier')];
const compteur = document.getElementById('compteurChantier');

if (bouton && popup && piste && typeof popup.showModal === 'function') {
	const photos = [...piste.children];
	const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const indexCourant = () => Math.round(piste.scrollLeft / piste.clientWidth);

	function majIndicateurs() {
		const i = Math.min(Math.max(indexCourant(), 0), photos.length - 1);
		points.forEach((p, k) => p.classList.toggle('actif', k === i));
		compteur.textContent = `${i + 1} / ${photos.length}`;
		prec.disabled = i === 0;
		suiv.disabled = i === photos.length - 1;
	}
	function aller(i, instantane = false) {
		const cible = Math.min(Math.max(i, 0), photos.length - 1);
		piste.scrollTo({ left: cible * piste.clientWidth, behavior: instantane || reduit ? 'auto' : 'smooth' });
	}

	piste.addEventListener('scroll', majIndicateurs, { passive: true });
	prec.addEventListener('click', () => aller(indexCourant() - 1));
	suiv.addEventListener('click', () => aller(indexCourant() + 1));
	points.forEach((p) => p.addEventListener('click', () => aller(Number(p.dataset.index))));
	popup.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowLeft') { aller(indexCourant() - 1); e.preventDefault(); }
		if (e.key === 'ArrowRight') { aller(indexCourant() + 1); e.preventDefault(); }
	});

	bouton.addEventListener('click', () => {
		popup.showModal();
		document.documentElement.classList.add('popupChantierOuverte');
		aller(0, true); // on repart toujours de la premiere photo (Avant)
		majIndicateurs();
	});
	fermer?.addEventListener('click', () => popup.close());
	// un clic sur le "backdrop" a pour cible le <dialog> lui-meme
	popup.addEventListener('click', (e) => { if (e.target === popup) popup.close(); });
	popup.addEventListener('close', () => {
		document.documentElement.classList.remove('popupChantierOuverte');
		bouton.focus();
	});
}
