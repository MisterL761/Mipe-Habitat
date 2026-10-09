const boutons = document.querySelectorAll('.lirePlus');
const modale = document.getElementById('modaleArticle');
const modaleTag = document.getElementById('modaleTag');
const modaleTitre = document.getElementById('modaleTitre');
const modaleTexte = document.getElementById('modaleTexte');
const boutonFermer = document.getElementById('modaleFermer');
const photoModale = document.getElementById('photoModale');
const iconeModalePlaceholder = document.getElementById('iconeModalePlaceholder');

boutons.forEach((bouton) => {
	bouton.addEventListener('click', () => {
		modaleTag.textContent = bouton.dataset.tag;
		modaleTitre.textContent = bouton.dataset.titre;

		// Si l'article a une vraie photo (data-image non vide), on l'affiche
		// et on cache l'icone. Sinon, on revient a l'icone par defaut.
		if (bouton.dataset.image) {
			photoModale.src = bouton.dataset.image;
			photoModale.alt = bouton.dataset.titre;
			photoModale.hidden = false;
			iconeModalePlaceholder.hidden = true;
		} else {
			photoModale.hidden = true;
			iconeModalePlaceholder.hidden = false;
		}

		modaleTexte.innerHTML = '';
		const paragraphes = JSON.parse(bouton.dataset.contenu);
		paragraphes.forEach((texte) => {
			// Un sous-titre (ecrit "<h2>...</h2>" dans le tableau) est insere
			// tel quel, sans l'envelopper dans un <p> (un <h2> dans un <p> n'a
			// pas de sens en HTML).
			if (texte.trim().startsWith('<h2>')) {
				modaleTexte.insertAdjacentHTML('beforeend', texte);
				return;
			}

			// Un paragraphe normal : on utilise innerHTML (et non textContent)
			// pour que des balises comme <strong> a l'interieur du texte
			// soient bien interpretees, et pas juste affichees telles quelles.
			const p = document.createElement('p');
			p.innerHTML = texte;
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
