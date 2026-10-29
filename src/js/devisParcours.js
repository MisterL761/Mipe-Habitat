// Parcours de demande de devis en 4 etapes : produits -> delai -> coordonnees -> confirmation.
const form = document.getElementById('parcoursDevis');

if (form) {
	const etapes = [...form.querySelectorAll('.etapeParcours')];
	const texteEtape = document.getElementById('etapeDevis');
	const barre = document.getElementById('barreDevis');
	const retour = document.getElementById('retourDevis');
	const suivant = document.getElementById('suivantDevis');
	const envoyer = document.getElementById('envoyerDevis');
	const message = document.getElementById('messageDevis');
	let courante = 0;
	const listeEtapes = [...document.querySelectorAll('.etapeListeDevis')];
	const blocProjet = document.getElementById('votreProjetDevis');
	const listeProjet = document.getElementById('listeVotreProjet');
	const delaiProjet = document.getElementById('delaiVotreProjet');

	// "Votre projet" (panneau de gauche) : se remplit au fil des choix
	function majPanneau() {
		const choisis = [...form.querySelectorAll('input[name="travaux"]:checked')];
		const delai = form.querySelector('input[name="delai"]:checked');
		listeProjet.replaceChildren(...choisis.map((c) => {
			const li = document.createElement('li');
			if (c.dataset.miniature) {
				const img = document.createElement('img');
				img.src = c.dataset.miniature; img.alt = ''; img.width = 28; img.height = 28;
				li.append(img);
			}
			li.append(document.createTextNode(c.value));
			return li;
		}));
		delaiProjet.hidden = !delai;
		delaiProjet.textContent = delai ? `Délai : ${delai.value}` : '';
		blocProjet.hidden = choisis.length === 0;
	}

	function etapeValide(i) {
		if (i === 0) return form.querySelectorAll('input[name="travaux"]:checked').length > 0;
		if (i === 1) return !!form.querySelector('input[name="delai"]:checked');
		if (i === 2) return [...etapes[2].querySelectorAll('input, textarea')].every((c) => c.checkValidity());
		return true;
	}

	function remplirRecap() {
		const donnees = new FormData(form);
		const texte = (id, valeur) => { document.getElementById(id).textContent = valeur; };
		texte('recapTravaux', donnees.getAll('travaux').join(', '));
		texte('recapDelai', donnees.get('delai'));
		texte('recapContact', `${donnees.get('prenom')} ${donnees.get('nom')} · ${donnees.get('codePostal')} · ${donnees.get('telephone')} · ${donnees.get('email')}`);
		const msg = (donnees.get('message') || '').trim();
		document.getElementById('ligneRecapMessage').hidden = !msg;
		texte('recapMessage', msg);
	}

	function afficher(defiler = true) {
		etapes.forEach((e, i) => { e.hidden = i !== courante; });
		texteEtape.textContent = `Étape ${courante + 1} sur ${etapes.length}`;
		barre.style.width = `${((courante + 1) / etapes.length) * 100}%`;
		const derniere = courante === etapes.length - 1;
		listeEtapes.forEach((li, i) => {
			li.classList.toggle('en-cours', i === courante);
			li.classList.toggle('fait', i < courante);
		});
		retour.hidden = courante === 0;
		suivant.hidden = derniere;
		envoyer.hidden = !derniere;
		suivant.disabled = courante === 2 ? false : !etapeValide(courante);
		message.hidden = true;
		if (derniere) remplirRecap();
		if (defiler) document.querySelector('.parcoursDevisWrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	form.addEventListener('change', () => { majPanneau(); suivant.disabled = courante === 2 ? false : !etapeValide(courante); });
	suivant.addEventListener('click', () => {
		if (courante === 2) {
			// Etape coordonnees : on affiche les messages d'erreur natifs des champs invalides
			const invalide = [...etapes[2].querySelectorAll('input, textarea')].find((c) => !c.checkValidity());
			if (invalide) { invalide.reportValidity(); return; }
		}
		if (etapeValide(courante)) { courante++; afficher(); }
	});
	form.querySelectorAll('.modifierRecapDevis').forEach((b) => b.addEventListener('click', () => { courante = Number(b.dataset.aller) - 1; afficher(); }));
	retour.addEventListener('click', () => { courante--; afficher(); });

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		const donnees = new FormData(form);
		const payload = {
			travaux: donnees.getAll('travaux'),
			delai: donnees.get('delai'),
			nom: donnees.get('nom'),
			prenom: donnees.get('prenom'),
			codePostal: donnees.get('codePostal'),
			telephone: donnees.get('telephone'),
			email: donnees.get('email'),
			message: donnees.get('message'),
		};

		const endpoint = form.dataset.endpoint;
		message.hidden = false;
		if (!endpoint) {
			// Aucun service d'envoi branche : on ne fait pas croire que c'est parti.
			message.textContent = "L'envoi en ligne n'est pas encore actif. Appelez-nous au 03 75 19 01 60 pour votre devis.";
			return;
		}
		try {
			const reponse = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
			if (!reponse.ok) throw new Error();
			form.innerHTML = '<p class="messageDevis messageDevisOk">Merci, votre demande est bien envoyée. Un conseiller vous recontacte sous 48h ouvrées.</p>';
		} catch {
			message.textContent = "Une erreur est survenue. Réessayez ou appelez-nous au 03 75 19 01 60.";
		}
	});

	afficher(false);
}
