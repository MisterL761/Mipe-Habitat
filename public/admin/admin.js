// Tableau de bord : promotions, réalisations, articles du blog.
const csrf = document.querySelector('meta[name=csrf]').content;
const annee = new Date().getFullYear();

const SECTIONS = {
	offres: {
		titre: 'Promotions',
		aide: "La popup « Offres en cours » du site affiche la première promotion active de la liste. La page Promotions les affiche toutes.",
		dossier: 'offres',
		nouveau: () => ({ actif: true, etiquette: 'Offre en cours', points: [], cta: { texte: 'Prendre RDV', lien: '/demander-un-devis' } }),
		libelleNouveau: 'Nouvelle promotion',
		champs: [
			{ k: 'actif', t: 'interrupteur', l: 'Promotion affichée sur le site' },
			{ k: 'titre', t: 'texte', l: 'Titre', req: true, max: 120 },
			{ k: 'etiquette', t: 'texte', l: 'Étiquette (petit texte au-dessus du titre)', max: 40 },
			{ k: 'intro', t: 'zone', l: 'Texte de présentation', max: 400 },
			{ k: 'points', t: 'lignes', l: 'Points clés', aide: 'Un point par ligne (8 maximum).' },
			{ k: 'dateFin', t: 'date', l: 'Date de fin (facultative)', aide: "Avec une date, un compte à rebours s'affiche et la promotion disparaît toute seule après cette date." },
			{ k: 'validite', t: 'texte', l: 'Mention de validité', aide: 'Affichée quand il n’y a pas de date de fin. Exemple : « Offre valable dans la limite des stocks disponibles. »', max: 200 },
			{ k: 'mentions', t: 'zone', l: 'Mentions légales / astérisque', max: 400 },
			{ k: 'image', t: 'image', l: 'Photo' },
			{ k: 'imageAlt', t: 'texte', l: 'Description de la photo (pour les malvoyants)', max: 150 },
			{ k: 'cta.texte', t: 'texte', l: 'Texte du bouton', max: 40, demi: true },
			{ k: 'cta.lien', t: 'texte', l: 'Lien du bouton', aide: 'Exemple : /demander-un-devis', max: 200, demi: true },
		],
		sousTitre: (e) => (e.dateFin ? `Jusqu'au ${new Date(e.dateFin).toLocaleDateString('fr-FR')}` : 'Sans date de fin'),
		vignette: (e) => e.image,
	},
	realisations: {
		titre: 'Réalisations',
		aide: "Elles apparaissent sur la carte et dans « Toutes nos réalisations », dans l'ordre de cette liste. La première photo est la photo principale (l'« après »).",
		dossier: 'realisations',
		nouveau: () => ({ categorie: 'Isolation', annee: String(annee), photos: [], titre: 'Isolation thermique extérieure' }),
		libelleNouveau: 'Nouvelle réalisation',
		champs: [
			{ k: 'titre', t: 'texte', l: 'Titre du chantier', req: true, max: 100, aide: 'Exemple : Isolation thermique extérieure' },
			{ k: 'categorie', t: 'choix', l: 'Catégorie', choix: ['Isolation', 'Ravalement', 'Menuiseries', 'Toiture', 'Combles', 'Chauffage'], demi: true },
			{ k: 'annee', t: 'nombre', l: 'Année', req: true, demi: true },
			{ k: 'ville', t: 'texte', l: 'Ville', req: true, max: 80, demi: true },
			{ k: 'cp', t: 'texte', l: 'Code postal ou département', req: true, max: 5, demi: true, aide: 'Exemple : 77100 ou 77' },
			{ k: 'description', t: 'zone', l: 'Description', max: 500 },
			{ k: 'position', t: 'position', l: 'Position sur la carte' },
			{ k: 'photos', t: 'photos', l: 'Photos' },
		],
		sousTitre: (e) => `${e.ville} (${e.cp}) · ${e.annee} · ${(e.photos || []).length} photo(s)`,
		vignette: (e) => (e.photos || [])[0],
	},
	articles: {
		titre: 'Blog',
		aide: "Les articles s'affichent sur l'accueil (défilement) et sur la page Blog, du plus récent (en haut de la liste) au plus ancien.",
		dossier: 'blog',
		nouveau: () => ({ tag: 'Conseils' }),
		libelleNouveau: 'Nouvel article',
		champs: [
			{ k: 'titre', t: 'texte', l: "Titre de l'article", req: true, max: 160 },
			{ k: 'tag', t: 'texte', l: 'Catégorie (petite étiquette)', max: 40, aide: 'Exemple : MaPrimeRénov, Entretien toiture…' },
			{ k: 'image', t: 'image', l: "Photo de l'article" },
			{ k: 'texte', t: 'zone', l: "Texte de l'article", req: true, lignes: 14, max: 20000,
				aide: 'Séparez les paragraphes par une ligne vide. Un sous-titre commence par « ## » (exemple : ## Mon sous-titre). Le gras s’écrit **comme ceci**.' },
		],
		sousTitre: (e) => e.tag,
		vignette: (e) => e.image,
	},
};

let type = 'offres';
let elements = [];
let edition = null; // élément en cours de modification (null = nouveau)

const $ = (s) => document.querySelector(s);
const el = (tag, attrs = {}, ...enfants) => {
	const n = document.createElement(tag);
	for (const [k, v] of Object.entries(attrs)) {
		if (k === 'class') n.className = v;
		else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
		else if (v !== false && v != null) n.setAttribute(k, v === true ? '' : v);
	}
	enfants.flat().forEach((c) => n.append(c instanceof Node ? c : document.createTextNode(c ?? '')));
	return n;
};

async function api(action, { methode = 'GET', corps, t = type } = {}) {
	const r = await fetch(`api.php?action=${action}&type=${t}`, {
		method: methode,
		headers: methode === 'POST' ? { 'X-CSRF-Token': csrf, 'Content-Type': 'application/json' } : {},
		body: corps ? JSON.stringify(corps) : undefined,
	});
	if (r.status === 401) { location.href = 'login.php'; throw new Error('session'); }
	const d = await r.json().catch(() => ({ ok: false, erreur: 'Réponse inattendue du serveur.' }));
	if (!d.ok) throw new Error(d.erreur || 'Erreur');
	return d;
}

function message(texte, erreur = false) {
	const m = $('#message');
	m.textContent = texte;
	m.className = 'alerte' + (erreur ? ' alerteErreur' : '');
	m.hidden = false;
	clearTimeout(message.t);
	if (!erreur) message.t = setTimeout(() => (m.hidden = true), 3500);
}

// ---------------- Liste ----------------
function badges(e) {
	const b = [];
	if (type === 'offres') {
		const expiree = e.dateFin && new Date(e.dateFin) < new Date(new Date().toDateString());
		const premiere = elements.find((x) => x.actif && !(x.dateFin && new Date(x.dateFin) < new Date(new Date().toDateString())));
		if (expiree) b.push(['Expirée', 'badgeOrange']);
		else if (!e.actif) b.push(['Masquée', '']);
		else b.push(['Visible', 'badgeVert']);
		if (premiere && premiere.id === e.id) b.push(['Dans la popup', 'badgeVert']);
	}
	if (type === 'realisations') b.push([e.categorie, '']);
	return b;
}

function afficherListe() {
	const s = SECTIONS[type];
	$('#titreSection').textContent = s.titre;
	$('#aideSection').textContent = s.aide;
	$('#ajouter').textContent = '+ ' + s.libelleNouveau;
	const q = $('#recherche').value.trim().toLowerCase();
	const liste = $('#liste');
	liste.replaceChildren();
	const visibles = elements.filter((e) => !q || JSON.stringify([e.titre, e.ville, e.tag, e.cp]).toLowerCase().includes(q));
	if (!visibles.length) {
		liste.append(el('div', { class: 'vide' }, q ? 'Aucun résultat.' : `Rien pour le moment. Cliquez sur « ${s.libelleNouveau} » pour commencer.`));
		return;
	}
	visibles.forEach((e) => {
		const idx = elements.indexOf(e);
		const v = s.vignette(e);
		liste.append(el('div', { class: 'ligneElement' },
			el('div', { class: 'vignette', style: v ? `background-image:url('${v}')` : '' }),
			el('div', { class: 'infosElement' },
				el('strong', {}, e.titre),
				el('span', {}, s.sousTitre(e)),
				el('div', { class: 'badges' }, badges(e).map(([t, c]) => el('span', { class: 'badge ' + c }, t)))),
			el('div', { class: 'actionsElement' },
				el('button', { class: 'boutonIcone', title: 'Monter', 'aria-label': 'Monter', disabled: idx === 0 || !!q, onclick: () => deplacer(idx, -1) }, '↑'),
				el('button', { class: 'boutonIcone', title: 'Descendre', 'aria-label': 'Descendre', disabled: idx === elements.length - 1 || !!q, onclick: () => deplacer(idx, 1) }, '↓'),
				el('button', { class: 'bouton boutonPetit', onclick: () => ouvrirFormulaire(e) }, 'Modifier'),
				el('button', { class: 'bouton boutonPetit boutonDanger', onclick: () => supprimer(e) }, 'Supprimer'))));
	});
}

async function charger() {
	$('#liste').replaceChildren(el('div', { class: 'vide' }, 'Chargement…'));
	try { elements = (await api('liste')).elements; afficherListe(); }
	catch (e) { $('#liste').replaceChildren(el('div', { class: 'vide' }, e.message)); }
}

async function deplacer(i, delta) {
	const j = i + delta;
	if (j < 0 || j >= elements.length) return;
	const copie = [...elements];
	[copie[i], copie[j]] = [copie[j], copie[i]];
	try { elements = (await api('ordre', { methode: 'POST', corps: { ids: copie.map((e) => e.id) } })).elements; afficherListe(); }
	catch (e) { message(e.message, true); }
}

async function supprimer(e) {
	if (!confirm(`Supprimer « ${e.titre} » ? Cette action est définitive.`)) return;
	try { elements = (await api('supprimer', { methode: 'POST', corps: { id: e.id } })).elements; afficherListe(); message('Supprimé.'); }
	catch (err) { message(err.message, true); }
}

// ---------------- Formulaire ----------------
const lire = (o, chemin) => chemin.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const ecrire = (o, chemin, v) => { const ks = chemin.split('.'); const d = ks.pop(); const c = ks.reduce((a, k) => (a[k] ??= {}), o); c[d] = v; };

let donnees = {}; // valeurs en cours d'édition (photos, image, position y sont tenues à jour)

async function envoyerImage(fichier, dossier) {
	const f = new FormData();
	f.append('image', fichier);
	f.append('dossier', dossier);
	const r = await fetch('api.php?action=televerser', { method: 'POST', headers: { 'X-CSRF-Token': csrf }, body: f });
	const d = await r.json().catch(() => ({ ok: false, erreur: 'Envoi impossible.' }));
	if (!d.ok) throw new Error(d.erreur);
	return d.url;
}

function champ(c) {
	const s = SECTIONS[type];
	const valeur = lire(donnees, c.k);
	const aide = c.aide ? el('span', { class: 'petitAide' }, c.aide) : null;
	const etiquette = c.l + (c.req ? ' *' : '');
	switch (c.t) {
		case 'interrupteur': {
			const i = el('input', { type: 'checkbox', checked: !!valeur, 'data-k': c.k });
			return el('label', { class: 'interrupteur' }, i, c.l);
		}
		case 'zone':
			return el('label', {}, etiquette, el('textarea', { 'data-k': c.k, rows: c.lignes || 3, maxlength: c.max }, valeur || ''), aide);
		case 'lignes':
			return el('label', {}, etiquette, el('textarea', { 'data-k': c.k, 'data-lignes': '1', rows: 4 }, (valeur || []).join('\n')), aide);
		case 'date':
			return el('label', {}, etiquette, el('input', { type: 'date', 'data-k': c.k, value: valeur || '' }), aide);
		case 'nombre':
			return el('label', {}, etiquette, el('input', { type: 'number', 'data-k': c.k, value: valeur ?? '', min: 1990, max: 2100 }), aide);
		case 'choix': {
			const id = 'dl-' + c.k;
			return el('label', {}, etiquette, el('input', { type: 'text', 'data-k': c.k, value: valeur || '', list: id, maxlength: 40 }), el('datalist', { id }, c.choix.map((x) => el('option', { value: x }))), aide);
		}
		case 'image': return champImage(c);
		case 'photos': return champPhotos(c);
		case 'position': return champPosition(c);
		default:
			return el('label', {}, etiquette, el('input', { type: 'text', 'data-k': c.k, value: valeur ?? '', maxlength: c.max, required: false }), aide);
	}
}

function champImage(c) {
	const zone = el('div', { class: 'zoneImage' });
	const rendre = () => {
		zone.replaceChildren();
		const url = lire(donnees, c.k);
		zone.append(el('div', { class: 'apercu', style: url ? `background-image:url('${url}')` : '' }));
		const entree = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', hidden: true, onchange: async (ev) => {
			const f = ev.target.files[0]; if (!f) return;
			bouton.textContent = 'Envoi…'; bouton.disabled = true;
			try { ecrire(donnees, c.k, await envoyerImage(f, SECTIONS[type].dossier)); rendre(); }
			catch (e) { erreurFormulaire(e.message); bouton.textContent = 'Choisir une photo'; bouton.disabled = false; }
		} });
		const bouton = el('button', { type: 'button', class: 'bouton boutonPetit', onclick: () => entree.click() }, url ? 'Changer la photo' : 'Choisir une photo');
		zone.append(entree, bouton);
		if (url) zone.append(el('button', { type: 'button', class: 'bouton boutonPetit boutonDanger', onclick: () => { ecrire(donnees, c.k, ''); rendre(); } }, 'Retirer'));
	};
	rendre();
	return el('div', { style: 'margin-top:.9rem' }, el('strong', {}, c.l), zone, el('span', { class: 'petitAide' }, 'JPG, PNG ou WebP. L’image est redimensionnée automatiquement.'));
}

function champPhotos(c) {
	const grille = el('div', { class: 'grillePhotos' });
	const info = el('span', { class: 'petitAide' });
	const rendre = () => {
		const photos = (donnees.photos ||= []);
		grille.replaceChildren(...photos.map((url, i) => el('div', { class: 'photo' },
			i === 0 ? el('span', { class: 'principale' }, 'Principale') : '',
			el('div', { class: 'apercu', style: `background-image:url('${url}')` }),
			el('div', { class: 'outilsPhoto' },
				el('button', { type: 'button', class: 'boutonIcone', 'aria-label': 'Reculer', disabled: i === 0, onclick: () => { [photos[i - 1], photos[i]] = [photos[i], photos[i - 1]]; rendre(); } }, '←'),
				el('button', { type: 'button', class: 'boutonIcone', 'aria-label': 'Supprimer la photo', onclick: () => { photos.splice(i, 1); rendre(); } }, '✕'),
				el('button', { type: 'button', class: 'boutonIcone', 'aria-label': 'Avancer', disabled: i === photos.length - 1, onclick: () => { [photos[i + 1], photos[i]] = [photos[i], photos[i + 1]]; rendre(); } }, '→')))));
		info.textContent = photos.length ? `${photos.length} photo(s). Ordre conseillé : l'après, puis l'avant, puis pendant les travaux.` : 'Aucune photo pour le moment.';
	};
	const entree = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', multiple: true, hidden: true, onchange: async (ev) => {
		const fichiers = [...ev.target.files];
		bouton.disabled = true;
		for (const [n, f] of fichiers.entries()) {
			bouton.textContent = `Envoi ${n + 1}/${fichiers.length}…`;
			try { (donnees.photos ||= []).push(await envoyerImage(f, SECTIONS[type].dossier)); rendre(); }
			catch (e) { erreurFormulaire(`${f.name} : ${e.message}`); }
		}
		bouton.textContent = '+ Ajouter des photos'; bouton.disabled = false; ev.target.value = '';
	} });
	const bouton = el('button', { type: 'button', class: 'bouton boutonPetit', onclick: () => entree.click() }, '+ Ajouter des photos');
	rendre();
	return el('div', { style: 'margin-top:.9rem' }, el('strong', {}, c.l), el('div', { style: 'margin-top:.4rem' }, bouton, entree), grille, info);
}

function champPosition() {
	const lat = el('input', { type: 'text', inputmode: 'decimal', 'data-k': 'lat', value: donnees.lat ?? '' });
	const lng = el('input', { type: 'text', inputmode: 'decimal', 'data-k': 'lng', value: donnees.lng ?? '' });
	const etat = el('span', { class: 'petitAide' }, donnees.lat != null ? 'Position enregistrée. Vous pouvez la corriger à la main.' : "Cliquez sur le bouton : la position est cherchée d'après la ville et le code postal.");
	const bouton = el('button', { type: 'button', class: 'bouton boutonPetit', onclick: async () => {
		const ville = document.querySelector('[data-k=ville]').value.trim();
		const cp = document.querySelector('[data-k=cp]').value.trim();
		if (!ville) { etat.textContent = "Renseignez d'abord la ville."; return; }
		bouton.disabled = true; etat.textContent = 'Recherche…';
		try {
			const p = new URLSearchParams({ format: 'jsonv2', limit: '1', country: 'France', city: ville });
			if (/^\d{5}$/.test(cp)) p.set('postalcode', cp);
			let r = await (await fetch('https://nominatim.openstreetmap.org/search?' + p)).json();
			if (!r.length) r = await (await fetch('https://nominatim.openstreetmap.org/search?' + new URLSearchParams({ format: 'jsonv2', limit: '1', countrycodes: 'fr', q: `${ville} ${cp}` }))).json();
			if (!r.length) throw new Error('introuvable');
			lat.value = (+r[0].lat).toFixed(5); lng.value = (+r[0].lon).toFixed(5);
			etat.textContent = `Trouvé : ${r[0].display_name.split(',').slice(0, 3).join(',')}`;
		} catch { etat.textContent = 'Ville introuvable : saisissez la latitude et la longitude à la main (clic droit sur Google Maps).'; }
		bouton.disabled = false;
	} }, 'Placer sur la carte');
	return el('div', { style: 'margin-top:.9rem' }, el('strong', {}, 'Position sur la carte *'),
		el('div', { class: 'deuxColonnes' }, el('label', {}, 'Latitude', lat), el('label', {}, 'Longitude', lng)),
		el('div', { style: 'margin-top:.4rem' }, bouton), etat);
}

function erreurFormulaire(t) { const e = $('#erreurFormulaire'); e.textContent = t; e.hidden = !t; }

function ouvrirFormulaire(e) {
	const s = SECTIONS[type];
	edition = e;
	donnees = JSON.parse(JSON.stringify(e || s.nouveau()));
	$('#titreDialogue').textContent = e ? 'Modifier' : s.libelleNouveau;
	erreurFormulaire('');
	const zone = $('#champs');
	zone.replaceChildren();
	let rangee = null;
	s.champs.forEach((c) => {
		const n = champ(c);
		if (c.demi) {
			if (!rangee) { rangee = el('div', { class: 'deuxColonnes' }); zone.append(rangee); }
			rangee.append(n);
			if (rangee.children.length === 2) rangee = null;
		} else { rangee = null; zone.append(n); }
	});
	$('#dialogue').showModal();
}

function collecter() {
	const s = SECTIONS[type];
	const sortie = { ...donnees };
	document.querySelectorAll('#champs [data-k]').forEach((n) => {
		const k = n.dataset.k;
		let v = n.type === 'checkbox' ? n.checked : n.value;
		if (n.dataset.lignes) v = v.split('\n').map((x) => x.trim()).filter(Boolean);
		ecrire(sortie, k, v);
	});
	if (edition) sortie.id = edition.id;
	return sortie;
}

$('#formulaire').addEventListener('submit', async (ev) => {
	ev.preventDefault();
	const s = SECTIONS[type];
	const element = collecter();
	for (const c of s.champs) if (c.req && !String(lire(element, c.k) ?? '').trim()) return erreurFormulaire(`« ${c.l} » est obligatoire.`);
	erreurFormulaire('');
	const b = $('#enregistrer'); b.disabled = true; b.textContent = 'Enregistrement…';
	try {
		elements = (await api('enregistrer', { methode: 'POST', corps: { element } })).elements;
		$('#dialogue').close();
		afficherListe();
		message('Enregistré : le site est à jour.');
	} catch (e) { erreurFormulaire(e.message); }
	b.disabled = false; b.textContent = 'Enregistrer';
});

$('#ajouter').addEventListener('click', () => ouvrirFormulaire(null));
$('#fermerDialogue').addEventListener('click', () => $('#dialogue').close());
$('#annuler').addEventListener('click', () => $('#dialogue').close());
$('#recherche').addEventListener('input', afficherListe);
$('#onglets').addEventListener('click', (ev) => {
	const b = ev.target.closest('button[data-type]');
	if (!b) return;
	type = b.dataset.type;
	document.querySelectorAll('#onglets button').forEach((x) => x.classList.toggle('actif', x === b));
	$('#recherche').value = '';
	$('#message').hidden = true;
	charger();
});

charger();
