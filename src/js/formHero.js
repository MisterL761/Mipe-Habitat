// Formulaire "Etre rappele" du hero : envoi vers le script PHP (public/api/envoyer.php).
const form = document.getElementById('formHero');

if (form) {
	const message = document.getElementById('messageFormHero');
	const bouton = form.querySelector('.boutonForm');
	const texteBouton = bouton.textContent;

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const donnees = new FormData(form);
		const payload = {
			type: 'rappel',
			site_web: donnees.get('site_web'),
			consentement: donnees.get('consentement') ? true : false,
			typeTravaux: donnees.get('typeTravaux'),
			nom: donnees.get('nom'),
			prenom: donnees.get('prenom'),
			telephone: donnees.get('telephone'),
			codePostal: donnees.get('codePostal'),
			email: donnees.get('email'),
		};

		bouton.disabled = true;
		bouton.textContent = 'Envoi en cours...';
		message.hidden = true;
		message.classList.remove('messageFormErreur');
		try {
			const reponse = await fetch(form.dataset.endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			if (!reponse.ok) throw new Error();
			form.reset();
			message.textContent = 'Merci ! Votre demande est bien envoyée, un chargé d\'affaire vous rappelle sous 48h ouvrées.';
		} catch {
			message.textContent = 'Une erreur est survenue. Réessayez ou appelez-nous au 03 75 19 01 60.';
			message.classList.add('messageFormErreur');
		}
		message.hidden = false;
		bouton.disabled = false;
		bouton.textContent = texteBouton;
	});
}
