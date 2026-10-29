// Parcours de demande de devis en 3 etapes : produits -> delai -> coordonnees.
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

	function etapeValide(i) {
		if (i === 0) return form.querySelectorAll('input[name="travaux"]:checked').length > 0;
		if (i === 1) return !!form.querySelector('input[name="delai"]:checked');
		return true;
	}

	function afficher() {
		etapes.forEach((e, i) => { e.hidden = i !== courante; });
		texteEtape.textContent = `Étape ${courante + 1} sur ${etapes.length}`;
		barre.style.width = `${((courante + 1) / etapes.length) * 100}%`;
		const derniere = courante === etapes.length - 1;
		retour.hidden = courante === 0;
		suivant.hidden = derniere;
		envoyer.hidden = !derniere;
		suivant.disabled = !etapeValide(courante);
		message.hidden = true;
		form.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	form.addEventListener('change', () => { suivant.disabled = !etapeValide(courante); });
	suivant.addEventListener('click', () => { if (etapeValide(courante)) { courante++; afficher(); } });
	retour.addEventListener('click', () => { courante--; afficher(); });

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		if (!form.reportValidity()) return;

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

	afficher();
	window.scrollTo(0, window.scrollY); // evite le saut de page au chargement
}
