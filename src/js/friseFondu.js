// Fond de la frise : une seule zone photo, epinglee nativement en haut de
// l'ecran pendant qu'on scrolle toute la frise (position: sticky, voir
// TimeLine.css), avec un fondu enchaine entre 3 photos (ancien -> en
// travaux -> renove). Comme il n'y a jamais qu'une seule image affichee a
// l'ecran a la fois (jamais de repetition), ca donne l'impression d'une
// transformation continue plutot que de plusieurs photos qui s'enchainent.
//
// Seul le fondu est calcule ici en JS : l'epinglage lui-meme est delegue
// au navigateur (position: sticky), ce qui evite tout recalcul de mise en
// page a chaque frame de scroll - c'est ce recalcul manuel (un ancien
// "fond.style.top = ...") qui provoquait des saccades en scroll rapide.
const frise = document.getElementById('frise');
const image2 = document.getElementById('friseImage2');
const image3 = document.getElementById('friseImage3');
const reduitMouvement = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Le fond est cache en CSS sous 900px (TimeLine.css) : inutile de calculer
// le fondu a chaque scroll sur ces ecrans.
const ecranTropEtroit = window.matchMedia('(max-width: 900px)').matches;

if (frise && image2 && image3 && !ecranTropEtroit) {
	if (reduitMouvement) {
		// Pas d'animation liee au scroll : on montre directement la photo
		// finale (renovee).
		image2.style.opacity = 1;
		image3.style.opacity = 1;
	} else {
		let enAttente = false;

		function appliquer() {
			const rect = frise.getBoundingClientRect();
			const hauteurFenetre = window.innerHeight;

			// Fondu : 0 en haut de la frise, 1 en bas. De 0 a 0.5 on passe
			// de la photo 1 a la 2, de 0.5 a 1 on passe de la 2 a la 3.
			const distanceScrollable = rect.height - hauteurFenetre;
			let progression = distanceScrollable > 0 ? -rect.top / distanceScrollable : 1;
			progression = Math.min(Math.max(progression, 0), 1);

			if (progression <= 0.5) {
				image2.style.opacity = progression / 0.5;
				image3.style.opacity = 0;
			} else {
				image2.style.opacity = 1;
				image3.style.opacity = (progression - 0.5) / 0.5;
			}

			enAttente = false;
		}

		function surScroll() {
			if (!enAttente) {
				window.requestAnimationFrame(appliquer);
				enAttente = true;
			}
		}

		window.addEventListener('scroll', surScroll, { passive: true });
		window.addEventListener('resize', surScroll);
		appliquer();
	}
}
