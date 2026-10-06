const lien = document.querySelector('.lienAvecMenu');
const menu = lien.closest('.aSousMenu');

lien.addEventListener('click', (e) => {
    e.preventDefault();
    menu.classList.toggle('ouvert');
});

document.addEventListener('click', (e) => {
    if (!menu.contains(e.target)) {
        menu.classList.remove('ouvert');
    }
});