document.getElementById('tidsform').addEventListener('submit', function(event) {
    event.preventDefault(); // Forhindrer sideopdatering

    // Hent værdier
    const medarbejder = document.getElementById('medarbejder').value;
    const projekt = document.getElementById('projekt').value;
    const starttid = new Date(document.getElementById('starttid').value);
    const sluttid = new Date(document.getElementById('sluttid').value);
    const beskrivelse = document.getElementById('beskrivelse').value;

    // Valider tid
    if (sluttid <= starttid) {
        visBesked('Fejl: Sluttid skal være efter starttid.', 'error');
        return;
    }

    // Beregn timer
    const timer = ((sluttid - starttid) / (1000 * 60 * 60)).toFixed(2);

    // Simuler lagring (i reel version: Send til server via fetch/API)
    const registrering = `${medarbejder} på ${projekt}: ${timer} timer (${beskrivelse})`;
    tilfojTilListe(registrering);

    visBesked('Tid registreret succesfuldt!', 'success');

    // Ryd formular
    this.reset();
});

function visBesked(besked, type) {
    const resultat = document.getElementById('resultat');
    resultat.textContent = besked;
    resultat.classList.add(type === 'success' ? 'alert-success' : 'alert-danger');
    resultat.style.display = 'block';
    setTimeout(() => { resultat.style.display = 'none'; }, 3000);
}

function tilfojTilListe(item) {
    const liste = document.getElementById('timerliste');
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.textContent = item;
    liste.appendChild(li);
}