const listeEquipe = document.getElementById('listeEquipe');

// Largeur mesuree dans le DOM (plutot que codee en dur) car la taille des
// cartes change selon la taille d'ecran (voir Equipe.css).
function largeurDefilement() {
	const premiereCarte = listeEquipe.querySelector('.cardEquipe');
	if (!premiereCarte) return 296;
	const style = getComputedStyle(listeEquipe);
	return premiereCarte.getBoundingClientRect().width + parseFloat(style.gap || 0);
}

document.getElementById('precedent').addEventListener('click'
	, () => {
		listeEquipe.scrollBy({ left: largeurDefilement(), behavior: 'smooth' });
	});

document.getElementById('suivant').addEventListener('click'
	, () => {
		listeEquipe.scrollBy({ left: -largeurDefilement(), behavior: 'smooth' });
	});
