// Page /promotions : affiche toutes les promotions actives gérées dans l'admin.
import { chargerContenu, echapper, offresActives, dateLongue, icone } from './contenuAdmin.js';

const conteneur = document.getElementById('listeOffres');
const ic = (nom) => icone('promoIcones', nom);

function carte(o) {
	const fin = o.dateFin ? dateLongue(o.dateFin) : null;
	return `
<article class="carteOffre" id="${echapper(o.id)}">
	${o.image ? `<div class="photoOffre">
		<img src="${echapper(o.image)}" alt="${echapper(o.imageAlt || o.titre)}" width="720" height="480" loading="lazy" decoding="async">
		<span class="etiquetteOffre">${ic('gift')}${echapper(o.etiquette)}</span>
	</div>` : ''}
	<div class="contenuOffre">
		${o.image ? '' : `<span class="etiquetteOffre etiquetteSeule">${ic('gift')}${echapper(o.etiquette)}</span>`}
		<h2 class="titreCarteOffre">${echapper(o.titre)}</h2>
		<p class="introOffre">${echapper(o.intro)}</p>
		<ul class="pointsOffre">${(o.points || []).map((p) => `<li>${ic('check')}<span>${echapper(p)}</span></li>`).join('')}</ul>
		${o.mentions ? `<p class="mentionsOffre">${echapper(o.mentions)}</p>` : ''}
		<p class="validiteOffre">${ic('calendrier')}${fin ? `Offre valable jusqu’au ${echapper(fin)}.` : echapper(o.validite || '')}</p>
		<a class="boutonOffre" href="${echapper(o.cta?.lien || '/demander-un-devis')}">${ic('calendrier')}${echapper(o.cta?.texte || 'Prendre RDV')}</a>
	</div>
</article>`;
}

const aucune = `
<div class="aucuneOffre">
	${ic('gift32')}
	<h2>Pas d’offre en ce moment</h2>
	<p>De nouvelles offres arrivent régulièrement. En attendant, demandez un devis gratuit : nous vous indiquerons les aides et avantages auxquels vous avez droit.</p>
</div>`;

const offres = await chargerContenu('offres');
const actives = offres ? offresActives(offres) : [];
conteneur.innerHTML = actives.length ? actives.map(carte).join('') : aucune;

// Arrivée depuis la popup (/promotions#id) : on se place sur la bonne offre une fois affichée
if (location.hash) {
	document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ block: 'start' });
}
