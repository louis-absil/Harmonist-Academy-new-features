const CACHE_NAME = 'harmonist-v8.0-offline'; // Nouvelle version pour forcer la mise à jour
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './app.js',
  './ui.js',
  './audio.js',
  './data.js',
  './challenges.js',
  './firebase.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',

  // --- 1. DEPENDANCES FIREBASE (CRUCIAL POUR LE MODE AVION) ---
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js',

  // --- 2. BANQUE DE SONS SALAMANDER (PIANO) ---
  // On met en cache les samples clés utilisés par le moteur audio Tone.js
  'https://tonejs.github.io/audio/salamander/A0.mp3',
  'https://tonejs.github.io/audio/salamander/C1.mp3',
  'https://tonejs.github.io/audio/salamander/Ds1.mp3',
  'https://tonejs.github.io/audio/salamander/Fs1.mp3',
  'https://tonejs.github.io/audio/salamander/A1.mp3',
  'https://tonejs.github.io/audio/salamander/C2.mp3',
  'https://tonejs.github.io/audio/salamander/Ds2.mp3',
  'https://tonejs.github.io/audio/salamander/Fs2.mp3',
  'https://tonejs.github.io/audio/salamander/A2.mp3',
  'https://tonejs.github.io/audio/salamander/C3.mp3',
  'https://tonejs.github.io/audio/salamander/Ds3.mp3',
  'https://tonejs.github.io/audio/salamander/Fs3.mp3',
  'https://tonejs.github.io/audio/salamander/A3.mp3',
  'https://tonejs.github.io/audio/salamander/C4.mp3',
  'https://tonejs.github.io/audio/salamander/Ds4.mp3',
  'https://tonejs.github.io/audio/salamander/Fs4.mp3',
  'https://tonejs.github.io/audio/salamander/A4.mp3',
  'https://tonejs.github.io/audio/salamander/C5.mp3',
  'https://tonejs.github.io/audio/salamander/Ds5.mp3',
  'https://tonejs.github.io/audio/salamander/Fs5.mp3',
  'https://tonejs.github.io/audio/salamander/A5.mp3',
  'https://tonejs.github.io/audio/salamander/C6.mp3',
  'https://tonejs.github.io/audio/salamander/Ds6.mp3',
  'https://tonejs.github.io/audio/salamander/Fs6.mp3',
  'https://tonejs.github.io/audio/salamander/A6.mp3',
  'https://tonejs.github.io/audio/salamander/C7.mp3',
  'https://tonejs.github.io/audio/salamander/Ds7.mp3',
  'https://tonejs.github.io/audio/salamander/Fs7.mp3',
  'https://tonejs.github.io/audio/salamander/A7.mp3',
  'https://tonejs.github.io/audio/salamander/C8.mp3'
];

// 1. Installation : On met tout en cache
self.addEventListener('install', (e) => {
  self.skipWaiting(); // (Force l'installation immédiate)
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mise en cache globale');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Interception des requêtes (Mode "Cache First")
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Si c'est dans le cache, on le rend direct (Ultra rapide)
      // Sinon, on va le chercher sur internet
      return response || fetch(e.request);
    })
  );
});

// 3. Activation (Nettoyage des vieux caches si tu changes de version)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim(); // (Prend le contrôle de la page active)
});