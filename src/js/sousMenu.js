// Ouvre/ferme chaque sous-menu de la navbar (ex: "Nos métiers", "Ressources").
// Plusieurs sous-menus peuvent coexister : chacun s'ouvre/se ferme
// independamment, et en ouvrir un ferme les autres.
const sousMenus = document.querySelectorAll('.aSousMenu');

sousMenus.forEach((menu) => {
	const lien = menu.querySelector('.lienAvecMenu');
	if (!lien) return;

	lien.addEventListener('click', (e) => {
		e.preventDefault();
		sousMenus.forEach((autre) => {
			if (autre !== menu) autre.classList.remove('ouvert');
		});
		menu.classList.toggle('ouvert');
	});
});

document.addEventListener('click', (e) => {
	sousMenus.forEach((menu) => {
		if (!menu.contains(e.target)) {
			menu.classList.remove('ouvert');
		}
	});
});
