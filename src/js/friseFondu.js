// Fond de la frise : une seule zone photo, "epinglee" a l'ecran pendant
// qu'on scrolle toute la frise (comme un calque fixe derriere un texte qui
// defile), avec un fondu enchaine entre 3 photos (ancien -> en travaux ->
// renove). Comme il n'y a jamais qu'une seule image affichee a l'ecran a la
// fois (jamais de repetition), ca donne l'impression d'une transformation
// continue plutot que de plusieurs photos qui s'enchainent.
const frise = document.getElementById('frise');
const fond = document.getElementById('friseFond');
const image2 = document.getElementById('friseImage2');
const image3 = document.getElementById('friseImage3');
const reduitMouvement = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (frise && fond && image2 && image3) {
	if (reduitMouvement) {
		// Pas d'animation liee au scroll : position normale (en haut de la
		// frise), et on montre directement la photo finale (renovee).
		image2.style.opacity = 1;
		image3.style.opacity = 1;
	} else {
		let enAttente = false;

		function appliquer() {
			const rect = frise.getBoundingClientRect();
			const hauteurFenetre = window.innerHeight;

			// -- 1) Position : epingler le fond en haut de l'ecran tant que la
			// frise occupe tout l'ecran (du moment ou son haut atteint le haut
			// de l'ecran jusqu'a ce que son bas atteigne le bas de l'ecran).
			// On reste en "position: absolute" tout le temps (jamais "fixed") :
			// la section ".reveal" qui englobe la frise applique un
			// "transform: translateY(0)" une fois apparue, et un ancetre avec
			// un transform redefinit le repere d'un position:fixed (il ne se
			// cale plus sur l'ecran mais sur cet ancetre). On simule donc
			// l'epinglage a la main, en recalculant le "top" a chaque scroll. --
			if (rect.top > 0) {
				// La frise n'a pas encore atteint le haut de l'ecran : le fond
				// reste cale sur le tout debut de la frise.
				fond.style.top = '0px';
			} else if (rect.bottom < hauteurFenetre) {
				// On a depasse la frise : le fond reste colle a l'endroit ou il
				// s'est arrete, et scrolle avec le reste du contenu.
				fond.style.top = `${frise.offsetHeight - hauteurFenetre}px`;
			} else {
				// Entre les deux : on recalcule le "top" a chaque scroll pour
				// que le fond reste visuellement a la meme place a l'ecran
				// (screen top = rect.top + top = 0).
				fond.style.top = `${-rect.top}px`;
			}

			// -- 2) Fondu : 0 en haut de la frise, 1 en bas. De 0 a 0.5 on passe
			// de la photo 1 a la 2, de 0.5 a 1 on passe de la 2 a la 3. --
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
