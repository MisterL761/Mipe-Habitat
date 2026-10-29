// Popup "Voir le chantier" de la section Avant / Apres : <dialog> natif
// (Echap pour fermer, focus gere par le navigateur). Un clic sur le fond
// sombre ferme aussi la fenetre.
const bouton = document.getElementById('boutonVoirChantier');
const popup = document.getElementById('popupChantier');
const fermer = document.getElementById('fermerPopupChantier');

if (bouton && popup && typeof popup.showModal === 'function') {
	bouton.addEventListener('click', () => {
		popup.showModal();
		document.documentElement.classList.add('popupChantierOuverte');
	});
	fermer?.addEventListener('click', () => popup.close());
	// un clic sur le "backdrop" a pour cible le <dialog> lui-meme
	popup.addEventListener('click', (e) => { if (e.target === popup) popup.close(); });
	popup.addEventListener('close', () => {
		document.documentElement.classList.remove('popupChantierOuverte');
		bouton.focus();
	});
}
