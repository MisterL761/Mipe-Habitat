const listeEquipe = document.getElementById('listeEquipe');
const largeurCarte = 280+16;

document.getElementById('precedent').addEventListener('click'
    , () => {
        listeEquipe.scrollBy({ left: largeurCarte, behavior: 'smooth' });
    });

document.getElementById('suivant').addEventListener('click'
    , () => {
        listeEquipe.scrollBy({ left: -largeurCarte, behavior: 'smooth' });
    });
