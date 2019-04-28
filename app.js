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
  