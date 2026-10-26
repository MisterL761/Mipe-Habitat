// Revele les cartes de realisations restantes par lots, au clic sur
// "Voir plus de realisations". Le nombre de cartes deja visibles au
// chargement (et donc la taille d'un lot) est lu directement sur le
// bouton, pour rester en phase avec NB_REALISATIONS_INITIAL cote Astro
// sans avoir a dupliquer la valeur ici.
const boutonVoirPlus = document.getElementById('btnVoirPlusRealisations');

if (boutonVoirPlus) {
	const parLot = Number(boutonVoirPlus.dataset.parLot) || 12;

	boutonVoirPlus.addEventListener('click', () => {
		const cartesCachees = document.querySelectorAll('.carteRealisation[hidden]');
		Array.from(cartesCachees)
			.slice(0, parLot)
			.forEach((carte) => {
				carte.hidden = false;
			});

		if (document.querySelectorAll('.carteRealisation[hidden]').length === 0) {
			boutonVoirPlus.hidden = true;
		}
	});
}
