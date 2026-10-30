// Toutes les offres du moment. Pour en ajouter une : copier un bloc ci-dessous.
// Pour en retirer une : mettre "actif: false" (ou supprimer le bloc).
//  - dateFin : 'AAAA-MM-JJ' pour une offre limitee dans le temps (elle disparait
//    toute seule une fois la date passee, au prochain build du site),
//    ou null si elle est limitee par le stock / sans date precise.
//  - image : nom du fichier dans src/assets/image (sans chemin), ou null.
export const offres = [
	{
		id: 'kit-solaire',
		actif: true,
		etiquette: 'Offre en cours',
		titre: 'Un kit solaire offert avec vos travaux',
		intro: 'Pour tout dossier de rénovation signé à partir de 9 000 €, nous vous offrons un kit solaire Plug & Play 410 W.',
		points: [
			'Valable pour vos projets ITE, ravalement de façade et menuiseries',
			'Jusqu’à 670 kWh produits par an*',
			'Jusqu’à 120 € d’économies par an*',
			'Installation simple : au sol, en terrasse, sur un balcon ou un mur',
		],
		mentions: '*Production et économies estimées, variables selon l’exposition, la localisation et les conditions d’utilisation.',
		dateFin: null,
		validite: 'Offre valable dans la limite des stocks disponibles.',
		image: 'offre-panneau.webp',
		imageAlt: 'Kit solaire Plug & Play installé sur une terrasse',
		cta: { texte: 'Prendre RDV', lien: '/demander-un-devis' },
	},
];
