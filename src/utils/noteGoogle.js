// Note moyenne et nombre d'avis Google : valeurs reelles ecrites par le cron
// avis-google/sync_reviews.php dans src/data/avis-google.json. Tant que ce
// fichier n'existe pas (ou qu'il est incomplet), on garde les valeurs d'avant.
const fichiers = import.meta.glob('../data/avis-google.json', { eager: true, import: 'default' });
const donnees = Object.values(fichiers)[0];

const moyenneReelle = Number(donnees?.moyenne);
const totalReel = Number(donnees?.total);

const moyenne = moyenneReelle >= 1 && moyenneReelle <= 5 ? Math.round(moyenneReelle * 10) / 10 : 4.8;
// "+ de N" : arrondi a la dizaine inferieure
const totalArrondi = totalReel > 0 ? Math.floor(totalReel / 10) * 10 : 250;

export const noteGoogle = {
	moyenne,
	moyenneTexte: moyenne.toFixed(1).replace('.', ','),
	largeurEtoiles: Math.round((moyenne / 5) * 100),
	libelle: `+ de ${totalArrondi} avis Google`,
};
