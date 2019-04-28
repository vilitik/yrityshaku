// Koodia lainattu Microsoftilta (no-license)
// This is the service worker with the Cache-first network

const CACHE = "yrityshaku-v1";
const precacheFiles = [
    'index.html',
    'app.js',
    'external-vendor/colorffy.matgradient.css'
];

self.addEventListener("install", function (event) {
    console.log("🕐 Asentaa serviceworkeria...");

    console.log("✔️ Skipataan waiting-osio (kts. kommentti koodissa)");
    /*
        Yleensä skipWaiting ei ole hyvä idea, sillä jos käyttäjällä on
        esimerkiksi useampi välilehti auki, äppin eri versiot saattavat
        sotkea toisiaan.

        Mikäli tätä ei tehdä, selain päättää milloin on hyvä aika vaihtaa
        serviceworker uudempaan. Esimerkiksi chrome tekee tämän yleensä silloin,
        kun kaikki tämän verkkotunnuksen välilehdet suljetaan.
    */
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE).then(function (cache) {
            console.log("✔️ Ladataan data cacheen");
            /*
                Lataa precacheFilesin sisältämät tiedostot cacheen.
                Jos jokin noista tiedostoista heittää 404, koko tsydeemi
                menee tilttiin. Pitäisi keksiä jonkinlainen virheidenkäsittelijä
                tätä varten.
            */
            return cache.addAll(precacheFiles);
        })
    );
});

// Ottaa sivun hallintaan
self.addEventListener("activate", function (event) {
    console.log("🕐 Ottaa sivua haltuun...");
    event.waitUntil(self.clients.claim());
    console.log('✔️ Sivu otettu haltuun.')
});

/*
    Ottaa navigaattorin fetchin haltuun (kts. Chromen DevTools Network -välilehti).
    Yrittää tarjoilla pyydetyn tiedoston cachesta ja ladata uudemman version palvelimelta
    cacheen tämän jälkeen.
*/
self.addEventListener("fetch", function (event) { 
  if (event.request.method !== "GET") return;

  event.respondWith(
    fromCache(event.request).then(
      function (response) {
        /*
            Pyydetty tiedosto löytyi cachesta, joten palvellaan se.
            Ladataan palvelimelta uusin versio tästä tiedostosta ja tallennetaan se cacheen
            myöhempää käyttöä varten
        */
        event.waitUntil(
          fetch(event.request).then(function (response) {
            return updateCache(event.request, response);
          })
        );

        return response;
      },
      function () {
        // Pyydettyä responsea ei löytynyt cahcesta, joten se joudutaan imuroimaan palvelimelta
        return fetch(event.request)
          .then(function (response) {
            // Lisätään/päivitetään pyyntö cacheen myöhempää käyttöä varten
            event.waitUntil(updateCache(event.request, response.clone()));

            return response;
          })
          .catch(function (err) {
            console.log(`✔️ Ei internetyhteyttä tai cachea. (${err})`);
          });
      }
    )
  );
});

function fromCache(request) {
    /*
        Jos request löytyy cachesta, annetaan (return) se
        Jos ei, niin no-match :(
    */
    return caches.open(CACHE).then(function (cache) {
        return cache.match(request).then(function (matching) {
        if (!matching || matching.status === 404) {
            return Promise.reject("no-match");
        }

        return matching;
        });
    });
}

function updateCache(request, response) {
    /*
        Päivitetään dataa cacheen
    */
    return caches.open(CACHE).then(function (cache) {
        return cache.put(request, response);
    });
}
