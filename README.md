
# 🎼 Harmonist Academy V5.1 (Studio Update)

> **L'application ultime d'entraînement auditif pour l'harmonie, le jazz et l'acoustique.**

![Version](https://img.shields.io/badge/version-7.0-studio.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Tech](https://img.shields.io/badge/Made%20With-Vanilla%20JS-yellow.svg)

Harmonist Academy est une **Single Page Application (SPA)** gamifiée conçue pour aider les musiciens à reconnaître les accords, les renversements, les voicings jazz et les structures harmoniques complexes à l'oreille.

---

# 🎹 Harmonist Academy V7.0 : Connected Identity

**Mise à jour majeure - Décembre 2025**

Cette version marque un tournant dans l'architecture de l'application, introduisant une synchronisation Cloud robuste et une gestion intelligente des identités pour garantir que plus aucun élève ne perde sa progression.

### ✨ Nouveautés Principales

* **☁️ Synchronisation Cloud Hybride :**
    * Transition fluide du mode "Invité" (Local) vers le mode "Membre Certifié" (Google).
    * Fusion intelligente des scores : on garde toujours le meilleur de vos deux profils (Local vs Cloud).
    * **Smart Save :** Sauvegarde automatique déclenchée lors de la minimisation de l'app ou du changement d'onglet.

* **🆔 Gestion Dynamique des Identités (Anti-Zombie) :**
    * Nouveau système de "Bail" (Leasing) pour les pseudos.
    * Mécanisme de libération automatique du pseudo invité lors de la connexion Google pour éviter les doublons et nettoyer la base de données.
    * Attribution garantie : Si la connexion échoue, le pseudo est immédiatement récupéré.

* **🎓 Tutoriel Interactif V8 :**
    * Mise à jour complète du guide de bienvenue.
    * Détection automatique de l'état de connexion pour adapter les conseils (Invité vs Connecté).

### 🛠️ Correctifs & Optimisations

* **Stabilité UI :** Correction des crashs d'affichage lors de la connexion (`updateXP` / `renderBadges`).
* **Firebase Transaction :** Réécriture de la logique de Login pour respecter strictement l'ordre Lecture/Écriture de Firestore.
* **Performance :** Optimisation des appels réseaux et suppression des écritures inutiles pour les utilisateurs non connectés.

---

## v6.0 - Update "Identity" (Sauvegarde & Profils) ☁️

Cette mise à jour majeure introduit la persistance des données et la protection de votre identité de musicien.

### ✨ Nouveautés
* **Système d'Identité Unique :** Chaque pseudo est désormais unique. Premier arrivé, premier servi !
* **Sauvegarde Cloud (Google) :** Vous pouvez désormais lier votre compte pour ne jamais perdre votre progression (XP, Badges, Scores), même en changeant de téléphone.
* **Protection Anti-Zombie :** Les pseudos réservés par des comptes "Invités" inactifs depuis plus de 90 jours sont automatiquement libérés pour les nouveaux élèves.
* **Gestion des Conflits :** Résolution automatique des doublons de pseudos existants lors de la migration.

---

## v5.4 - Update "Pocket Academy" (Mobile & PWA) 📱

Cette mise à jour majeure transforme Harmonist Academy en une application installable (PWA) et améliore considérablement l'expérience mobile.

### ✨ Nouveautés
* **Application Mobile (PWA) :** Vous pouvez désormais installer l'app sur votre écran d'accueil (iOS/Android).
    * *Fonctionnement hors-ligne (Offline-ready).*
    * *Mode plein écran immersif (plus de barre de navigateur).*
    * *Chargement instantané grâce au nouveau système de cache.*
* **Smart Settings (Paramètres Intelligents) :** Modifier la difficulté (ajouter/retirer des accords) ne réinitialise plus systématiquement votre série de victoires (Streak). Le jeu s'adapte dynamiquement.

### 🎨 Interface & UX
* **Optimisation Mobile de l'Arène :** Refonte complète de la barre de navigation de l'Arène pour les petits écrans (Grille tactile).
* **Scrollbars Modernes :** Suppression des barres de défilement disgracieuses. Navigation fluide et invisible sur mobile, minimaliste sur Desktop.
* **Correctifs Tuto :** Amélioration de la stabilité du tutoriel d'accueil.

---

## v5.3 - Update "Orientation Day" (Interactive Tuto) 🎓

Cette mise à jour s'est concentrée sur l'expérience utilisateur (UX) et l'accueil des nouveaux élèves, rendant l'interface riche de l'Académie plus accessible.

### ✨ Nouveautés
* **Tutoriel Interactif (Walkthrough Engine) :** Implémentation d'un système de visite guidée dynamique.
    * *Spotlight System :* Un projecteur met en surbrillance les éléments actifs de l'interface (Zone d'écoute, Contrôles, Arène).
    * *Bulle Contextuelle :* Des explications précises s'affichent à côté de chaque élément, s'adaptant intelligemment à la position de l'écran.
* **Navigation Guidée :** Le tutoriel prend le contrôle de la navigation pour ouvrir les menus (Paramètres, Arène) et montrer à l'utilisateur où se trouvent les fonctionnalités clés sans qu'il se perde.

---

## 🎹 NOUVEAU DANS LA V5.1 : LE STUDIO DE CRÉATION

Cette mise à jour introduit un outil de composition pédagogique permettant aux professeurs et aux élèves de créer leurs propres dictées musicales.

### 1. Le Studio Harmonique
Un séquenceur visuel intégré pour construire des progressions d'accords sur mesure.
*   **Timeline Visuelle :** Ajoutez, supprimez et réorganisez vos accords sur une frise chronologique.
*   **Contrôle Total :** Choisissez la qualité, le renversement et la note de basse précise grâce au clavier virtuel.
*   **Piano Interactif :** Visualisez les notes en temps réel.

### 2. Exportation de Défis (Custom Seeds)
Transformez vos créations du Studio en défis jouables.
*   **Génération de Code :** Exportez votre séquence sous forme de code unique (ex: `JAZZ-EXAM-1`).
*   **Partage :** Donnez ce code à vos élèves ou amis. Ils joueront *exactement* la séquence que vous avez composée (Mêmes accords, mêmes basses, mêmes renversements).

### 3. Ergonomie & Raccourcis
Le mode Studio est optimisé pour une saisie rapide au clavier (Mapping AZERTY/QWERTY physique) :
*   **Notes (Basses) :** `W` à `N` (Rangée du bas) + `,` pour le Si.
*   **Octaves :** Flèches `Haut` / `Bas`.

---

## ⚔️ L'ARÈNE DES DÉFIS (V5.0)

L'expérience d'apprentissage transformée en compétition e-sportive musicale.

### 🔥 Le Défi du Jour (Daily Challenge)
Chaque jour, une **séquence unique de 20 accords** est générée.
*   **Seed Unique :** Tout le monde joue exactement la même séquence (basée sur la date).
*   **Classement Journalier :** Comparez votre score avec la communauté.
*   **Rapport Détaillé :** Analyse précise de vos erreurs (Accords ET Renversements) en fin de session.

### 👻 Les Maîtres Fantômes (Ghost Players)
Mesurez-vous aux légendes de la musique qui peuplent les classements :
*   **Erik Satie & Bach** (Mode Chrono).
*   **Mozart & Paganini** (Mode Sprint).
*   **John Cage & Beethoven** (Mode Inverse).

---

## ✨ Fonctionnalités Principales

### 🎮 Modes de Jeu
*   **🧘 Mode Zen :** Entraînement sans stress, feedback immédiat.
*   **⚡ Mode Chrono :** 60 secondes pour faire le meilleur score.
*   **🏃 Mode Sprint :** Le temps diminue à chaque réponse. Réservé aux experts.
*   **🎧 Mode Inverse :** Quiz à l'aveugle (QCM). On vous donne le nom, trouvez le son.

### 📚 Contenu Harmonique (Sets)
1.  **🏛️ L'Académie (Classique) :** Accords de base (Maj7, min7, Dom7, Dim7) et gestion des 4 renversements.
2.  **🎷 Le Club (Jazz) :** Extensions (9ème, 13ème, Altérés, Sus) et Voicings (Close, Drop-2, Shell, Rootless).
3.  **🧪 Le Laboratoire (Acoustique) :** Structures intervalliques, Trichordes (Clusters), Accords Suspendus et variations de densité (Contracté/Dilaté).

### 🏆 Gamification & Lore
*   **Système de Maîtrise :** Progressez de *Novice* à *Virtuose* à travers des matériaux nobles (Cristal, Marbre, Or, Obsidienne...).
*   **Badges & Trophées :** +30 succès, dont des badges secrets liés au "Lore" du jeu.
*   **Coach IA :** Analyse vos faiblesses en temps réel pour donner des conseils contextuels.

---

## 💻 Architecture Technique

Le projet a été entièrement migré vers du **JavaScript Pur (ES Modules)** pour une performance maximale et une maintenance simplifiée.

*   **Frontend :** HTML5 / CSS3 (Grid, Flexbox, Glassmorphism).
*   **Logique :** Vanilla JS (ES6+ Modules). Aucune étape de build complexe requise.
*   **Audio :** Web Audio API (Piano samplé + Synthèse SFX).
*   **Backend (Firebase) :**
    *   **Firestore :** Stockage des Leaderboards, des Défis et des Profils.
    *   **Auth :** Authentification anonyme transparente.

### Structure des Fichiers

```bash
/
├── index.html      # Point d'entrée DOM
├── styles.css      # Design System & Thèmes
├── main.js         # Point d'entrée JS & Event Listeners
├── app.js          # État global (State) & Boucle de jeu
├── ui.js           # Gestion de l'interface & Rendu DOM
├── audio.js        # Moteur Audio & Piano Virtuel
├── data.js         # Base de données (Accords, Badges, Ghosts, Textes)
├── challenges.js   # Gestionnaire des Seeds, RNG & Mode Examen
└── firebase.js     # Connecteur Cloud (Firestore/Auth)
```

---

## 🚀 Installation & Démarrage

L'application utilise des **Modules ES6**, elle nécessite un serveur local pour contourner les politiques CORS (Cross-Origin Resource Sharing).

### Méthode 1 : Avec Node.js & NPM

1.  Installez les dépendances :
    ```bash
    npm install
    ```
2.  Lancez le serveur de développement :
    ```bash
    npm run dev
    ```

### Méthode 2 : Python

Si Python est installé sur votre machine :

```bash
python -m http.server 8000
```
Puis ouvrez `http://localhost:8000` dans votre navigateur.

---

**© 2025 Harmonist Academy** - *Fait par Louis Absil avec ❤️ et beaucoup de café.*
