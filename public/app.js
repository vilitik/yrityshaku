// Tukeeko selain serviceworkeria?
if ("serviceWorker" in navigator) {
    // Rekisteröidään service worker
    navigator.serviceWorker.register("worker.js", {
        scope: "./"
    })
    // Kirjaillaan vielä homma konsoliin
    .then(function (wrk) {
        console.log(`✔️ PWA Service worker on rekisteröity toimialueelle: ${wrk.scope}`);
    })
    // Poimitaan errorit
    .catch(function (err) {
        console.log(`🔥 Jokin meni pieleen serviceworkerin kanssa! Virheviesti: ${err}`)
    })
}

let app = {
    version: '1.13'
};

class Resultbox {
    constructor(container = document.getElementById('resultcontainer')) {
        this.renderContainer = container;
    }
    get container() {
        return this.renderContainer
    }
    render(data) {
        // Tyhjennetään renderContainer
        this.renderContainer.innerHTML = '';
        console.table(data);
        data.forEach(element => {
            // Alustetaan kortti
            let render = {
                container: this.renderContainer,
                card: document.createElement('div'),
                companyName: document.createElement('h3'),
                businessId: document.createElement('p'),
                registrationDate: document.createElement('p')
            }
            render.card.classList.add('card');
            // Lisätään data korttiin
            render.companyName.textContent = `${element.name}`;
            render.businessId.textContent = `Y-tunnus: ${element.businessId}`
            render.registrationDate.textContent = `Perustettu ${element.registrationDate}.`

            // Kootaan kaikki kasaan
            render.card.appendChild(render.companyName);
            render.card.appendChild(render.businessId);
            render.card.appendChild(render.registrationDate);
            // Lisätään valmis kortti sivulle
            render.container.appendChild(render.card)
        });
    }
    showOffline() {
        document.getElementById('offlinenotification').textContent = 'Olet offline-tilassa!';
    }
};

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

function showNewestCompanies() {
    const url = `https://avoindata.prh.fi/tr/v1?totalResults=true&maxResults=15&resultsFrom=0&registeredOffice=Kiuruvesi`;

    nr.container.innerHTML = '<div class="donutSpinner"></div>';
    fetch(url)
    .then((data) => data.json())
    .then(function(data) {
        nr.render(data.results);
    })
    .catch(function() {
        nr.showOffline();
    })
};

function showRandomCompanies() {
    let someRandomDate = randomDate(new Date(1950, 0, 1), new Date()).toISOString().split('T')[0];
    let url = `https://avoindata.prh.fi/tr/v1?totalResults=true&maxResults=15&resultsFrom=0&registeredOffice=Kiuruvesi&companyRegistrationTo=${someRandomDate}`;

    // Näytetään latausympyrä kunnes sivulle tulee dataa
    nr.container.innerHTML = '<div class="donutSpinner"></div>';
    fetch(url)
    .then((data) => data.json())
    .then((data) => {
        nr.render(data.results);
        nr.container.innerHTML = `<h3>Haettu ajalla: ${someRandomDate}</h3>` + nr.container.innerHTML;
    })
    .catch(() => {
        nr.showOffline();
    })
};

document.getElementById('versionstring').textContent = `Versio: ${app.version}`
nr = new Resultbox;
