// Contenus gérés depuis l'admin (promotions, réalisations, articles du blog).
// Lus au chargement de la page : en production via api/contenu.php (contenu en
// ligne, ou contenu de départ s'il n'a jamais été modifié) ; en développement
// local (sans PHP), on retombe sur les fichiers de départ de admin/seed.
export async function chargerContenu(type) {
	for (const url of [`/api/contenu.php?type=${type}`, `/admin/seed/${type}.json`]) {
		try {
			const reponse = await fetch(url, { cache: 'no-cache' });
			if (!reponse.ok) continue;
			const donnees = await reponse.json();
			if (Array.isArray(donnees)) return donnees;
		} catch (erreur) {
			// on essaie la source suivante
		}
	}
	return null;
}

const ECHAPPEMENTS = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const echapper = (texte) => String(texte ?? '').replace(/[&<>"']/g, (c) => ECHAPPEMENTS[c]);

// Promotions visibles : actives, et dont la date de fin n'est pas dépassée.
export function offresActives(offres) {
	const aujourdhui = new Date();
	aujourdhui.setHours(0, 0, 0, 0);
	return offres.filter((o) => o.actif && (!o.dateFin || new Date(o.dateFin) >= aujourdhui));
}

export const dateLongue = (iso) =>
	new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

// Une icône (SVG) préparée côté Astro dans un <template> : data-i="nom"
export const icone = (idTemplate, nom) =>
	document.getElementById(idTemplate)?.content.querySelector(`[data-i="${nom}"]`)?.innerHTML ?? '';
