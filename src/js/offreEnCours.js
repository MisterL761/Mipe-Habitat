// Onglet "Offres en cours" (bord droit) + popup, avec compte a rebours en
// direct (jours/heures/min/sec) recalcule chaque seconde.
const tab = document.getElementById('offreTab');
const modal = document.getElementById('offreModal');
const scrim = document.getElementById('offreScrim');
const fermer = document.getElementById('offreClose');
const compteur = document.getElementById('offreCompteur');
const tabJours = document.getElementById('offreTabJours');

if (tab && modal && scrim && fermer) {
	function ouvrir() {
		modal.hidden = false;
		document.body.style.overflow = 'hidden';
		fermer.focus();
	}

	function fermerModal() {
		modal.hidden = true;
		document.body.style.overflow = '';
		tab.focus();
	}

	tab.addEventListener('click', ouvrir);
	fermer.addEventListener('click', fermerModal);
	scrim.addEventListener('click', fermerModal);
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && !modal.hidden) {
			fermerModal();
		}
	});

	// Ouverture automatique a l'arrivee sur le site : une seule fois par
	// session (pas a chaque navigation interne d'une page a l'autre), pour
	// rester visible sans devenir agacant si le visiteur circule sur le
	// site. Un leger delai laisse la page se charger avant d'afficher la
	// popup. Le marqueur est pose des le declenchement, donc meme si le
	// visiteur change de page avant la fin du delai, l'ouverture suivante
	// (sur cette nouvelle page) reste la seule de la session.
	const CLE_DEJA_VUE = 'offreEnCoursVue';
	try {
		if (!sessionStorage.getItem(CLE_DEJA_VUE)) {
			setTimeout(() => {
				sessionStorage.setItem(CLE_DEJA_VUE, '1');
				ouvrir();
			}, 1500);
		}
	} catch (erreur) {
		// sessionStorage indisponible (navigation privee tres restrictive,
		// etc.) : on renonce simplement a l'ouverture automatique, l'onglet
		// reste cliquable normalement.
	}
}

if (compteur) {
	const dateFin = new Date(compteur.dataset.fin).getTime();
	const cdJours = document.getElementById('cdJours');
	const cdHeures = document.getElementById('cdHeures');
	const cdMinutes = document.getElementById('cdMinutes');
	const cdSecondes = document.getElementById('cdSecondes');

	function deuxChiffres(n) {
		return String(n).padStart(2, '0');
	}

	function mettreAJour() {
		const diff = dateFin - Date.now();

		if (diff <= 0) {
			cdJours.textContent = '00';
			cdHeures.textContent = '00';
			cdMinutes.textContent = '00';
			cdSecondes.textContent = '00';
			if (tabJours) tabJours.textContent = '';
			return;
		}

		const jours = Math.floor(diff / 86400000);
		const heures = Math.floor((diff % 86400000) / 3600000);
		const minutes = Math.floor((diff % 3600000) / 60000);
		const secondes = Math.floor((diff % 60000) / 1000);

		cdJours.textContent = deuxChiffres(jours);
		cdHeures.textContent = deuxChiffres(heures);
		cdMinutes.textContent = deuxChiffres(minutes);
		cdSecondes.textContent = deuxChiffres(secondes);

		if (tabJours) tabJours.textContent = `J-${jours}`;
	}

	mettreAJour();
	setInterval(mettreAJour, 1000);
}
