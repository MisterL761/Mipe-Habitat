// Meme mecanique que le slider de l'equipe (sliderEquipe.js) : un simple
// defilement horizontal natif, avance/recule d'une largeur de carte a
// chaque clic. La largeur de la carte est mesuree dans le DOM (plutot que
// codee en dur) car elle change selon la taille d'ecran (voir Blog.css).
const listeArticles = document.getElementById('listeArticles');

function largeurDefilement() {
	const premiereCarte = listeArticles.querySelector('.carteArticle');
	if (!premiereCarte) return 380;
	const style = getComputedStyle(listeArticles);
	return premiereCarte.getBoundingClientRect().width + parseFloat(style.gap || 0);
}

document.getElementById('precedentBlog').addEventListener('click', () => {
	listeArticles.scrollBy({ left: -largeurDefilement(), behavior: 'smooth' });
});

document.getElementById('suivantBlog').addEventListener('click', () => {
	listeArticles.scrollBy({ left: largeurDefilement(), behavior: 'smooth' });
});
