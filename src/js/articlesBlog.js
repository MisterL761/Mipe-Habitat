// Affiche les articles du blog gérés dans l'admin : défilement de l'accueil
// (#listeArticles) ou grille de la page Blog (#grilleArticlesBlog).
import { chargerContenu, echapper, icone } from './contenuAdmin.js';

const accueil = document.getElementById('listeArticles');
const pageBlog = document.getElementById('grilleArticlesBlog');
const conteneur = accueil || pageBlog;

if (conteneur) {
	const ic = (nom) => icone('blogIcones', nom);
	const articles = (await chargerContenu('articles')) ?? [];

	conteneur.innerHTML = articles.map(({ tag, titre, image, contenu }) => {
		const visuel = image
			? `<div class="imageArticle"><img src="${echapper(image)}" alt="${echapper(titre)}" width="900" height="600" loading="lazy" decoding="async"></div>`
			: `<div class="imagePlaceholder">${ic('image')}</div>`;
		const bouton = `<button type="button" class="lirePlus" data-tag="${echapper(tag)}" data-titre="${echapper(titre)}" data-image="${echapper(image || '')}" data-contenu="${echapper(JSON.stringify(contenu || []))}">Lire plus ${ic('fleche')}</button>`;
		return pageBlog
			? `<article class="carteArticle carteArticleBlog">${visuel}<div class="contenuArticle"><p class="tagArticle">${echapper(tag)}</p><h2 class="titreArticle">${echapper(titre)}</h2>${bouton}</div></article>`
			: `<div class="carteArticle">${visuel}<div class="contenuArticle"><p class="tagArticle">${echapper(tag)}</p><p class="titreArticle">${echapper(titre)}</p>${bouton}</div></div>`;
	}).join('');
}
