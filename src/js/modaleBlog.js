const boutons = document.querySelectorAll('.lirePlus');
const modale = document.getElementById('modaleArticle');
const modaleTag = document.getElementById('modaleTag');
const modaleTitre = document.getElementById('modaleTitre');
const modaleTexte = document.getElementById('modaleTexte');
const boutonFermer = document.getElementById('modaleFermer');

boutons.forEach((bouton) => {
	bouton.addEventListener('click', () => {
		modaleTag.textContent = bouton.dataset.tag;
		modaleTitre.textContent = bouton.dataset.titre;

		modaleTexte.innerHTML = '';
		const paragraphes = JSON.parse(bouton.dataset.contenu);
		paragraphes.forEach((texte) => {
			const p = document.createElement('p');
			p.textContent = texte;
			modaleTexte.appendChild(p);
		});

		modale.showModal();
	});
});

boutonFermer.addEventListener('click', () => modale.close());

// Ferme aussi en cliquant sur le fond sombre, en dehors du contenu.
modale.addEventListener('click', (evenement) => {
	if (evenement.target === modale) modale.close();
});
