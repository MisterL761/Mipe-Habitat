// Comparateur avant/apres, reutilisable partout ou il apparait sur le site
// (section dediee de la page d'accueil, hero plein fond des pages
// villes...) : on initialise chaque occurrence trouvee sur la page
// independamment, plutot que de viser un seul id fixe.
//
// Le glissement a la souris/au doigt est gere ici directement
// (pointerdown/move/up sur tout le conteneur), plutot que de compter
// uniquement sur le thumb natif de l'input range - celui-ci ne fait que
// quelques pixels de large et est difficile a attraper precisement, ce qui
// rendait le curseur peu pratique a utiliser.
function initialiserAvantApres(conteneur) {
	const curseur = conteneur.querySelector('.curseurAvantApres');
	if (!curseur) return;

	// Position de repos : 50% par defaut (section dediee de l'accueil), mais
	// peut etre decalee via data-pos-repos (hero plein fond des pages
	// villes, ou le texte occupe la partie gauche et ne doit pas cacher la
	// poignee une fois la demo terminee).
	const positionRepos = Number(conteneur.dataset.posRepos) || 50;

	function definirPosition(pourcentage) {
		const valeur = Math.min(100, Math.max(0, pourcentage));
		conteneur.style.setProperty('--pos', `${valeur}%`);
		curseur.value = valeur;
	}

	function pourcentageDepuisX(clientX) {
		const rect = conteneur.getBoundingClientRect();
		return ((clientX - rect.left) / rect.width) * 100;
	}

	let enTrainDeGlisser = false;

	function demarrer(event) {
		enTrainDeGlisser = true;
		conteneur.classList.add('enGlissement');
		conteneur.setPointerCapture(event.pointerId);
		definirPosition(pourcentageDepuisX(event.clientX));
	}

	function glisser(event) {
		if (!enTrainDeGlisser) return;
		definirPosition(pourcentageDepuisX(event.clientX));
	}

	function arreter() {
		enTrainDeGlisser = false;
		conteneur.classList.remove('enGlissement');
	}

	conteneur.addEventListener('pointerdown', demarrer);
	conteneur.addEventListener('pointermove', glisser);
	conteneur.addEventListener('pointerup', arreter);
	conteneur.addEventListener('pointercancel', arreter);

	// L'input range reste pilotable au clavier (fleches, apres un Tab) :
	// on garde les deux sens de synchronisation avec --pos.
	curseur.addEventListener('input', () => {
		conteneur.style.setProperty('--pos', `${curseur.value}%`);
	});

	// Petite demonstration automatique, une seule fois, quand le composant
	// entre dans l'ecran : un aller-retour du curseur autour de sa position
	// de repos, pour bien montrer que l'image se glisse.
	const observateur = new IntersectionObserver(
		(entrees) => {
			entrees.forEach((entree) => {
				if (!entree.isIntersecting) return;
				observateur.disconnect();
				const bas = Math.max(8, positionRepos - 25);
				const haut = Math.min(92, positionRepos + 25);
				setTimeout(() => definirPosition(bas), 500);
				setTimeout(() => definirPosition(haut), 1300);
				setTimeout(() => definirPosition(positionRepos), 2100);
			});
		},
		{ threshold: 0.5 },
	);
	observateur.observe(conteneur);
}

document.querySelectorAll('.imagesAvantApres').forEach(initialiserAvantApres);
