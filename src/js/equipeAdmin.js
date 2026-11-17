// Affiche l'equipe geree dans l'admin (onglet « Equipe ») dans #listeEquipe.
// Le HTML genere par Astro reste en place tant que le contenu n'a pas pu etre
// charge (JavaScript desactive, erreur reseau) : la section n'est jamais vide.
import { chargerContenu, echapper } from './contenuAdmin.js';

const liste = document.getElementById('listeEquipe');

if (liste) {
	const membres = await chargerContenu('equipe');
	if (membres && membres.length) {
		liste.innerHTML = membres.map(({ nom, poste, photo }) => `<div class="cardEquipe">
			<img src="${echapper(photo)}" alt="Photo de ${echapper(nom)}" width="280" height="440" loading="lazy" decoding="async">
			<div class="containerInfo"><p class="nomPresonne">${echapper(nom)}</p><p class="poste">${echapper(poste)}</p></div>
		</div>`).join('');
	}
}
