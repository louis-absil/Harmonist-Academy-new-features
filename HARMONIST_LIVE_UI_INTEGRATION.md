# Intégration UI : Harmonist Live 🎓

## Vue d'ensemble

Le mode classe nécessite deux interfaces distinctes mais cohérentes avec le design existant :
- **Interface Professeur** : Dashboard de contrôle avec outils pédagogiques
- **Interface Élève** : Mode épuré, focus sur les réponses

---

## 1. Accès au Mode Classe

### A. Côté Professeur

#### Option 1 : Nouvel onglet dans l'Arène (Recommandé)
**Emplacement** : Dans `challengeHubModal`, ajouter un 5ème onglet "🎓 Classe"

```html
<!-- Dans challengeHubModal -->
<div class="lb-sub-nav">
    <button class="lb-period-btn challenge-tab-btn" onclick="window.UI.switchChallengeTab('arcade')">Classements</button>
    <button class="lb-period-btn challenge-tab-btn" onclick="window.UI.switchChallengeTab('global')">Défi du Jour</button>
    <button class="lb-period-btn challenge-tab-btn" onclick="window.UI.switchChallengeTab('join')">Rejoindre</button>
    <button class="lb-period-btn challenge-tab-btn" onclick="window.UI.switchChallengeTab('create')">Créer</button>
    <button class="lb-period-btn challenge-tab-btn" onclick="window.UI.switchChallengeTab('live')">🎓 Classe</button>
</div>
```

**Avantages** :
- Cohérent avec l'architecture existante
- Accessible depuis le bouton Arène déjà présent
- Pas de changement majeur de navigation

#### Option 2 : Bouton dédié dans le header
**Emplacement** : Ajouter un bouton dans `header-actions` (à côté de Codex, Arène, Stats, Settings)

```html
<button class="icon-btn" id="btnLive" onclick="window.UI.showLiveHub()" style="color:var(--primary); border:1px solid rgba(99, 102, 241, 0.3);">🎓</button>
```

**Avantages** :
- Accès direct et visible
- Indique que c'est une fonctionnalité principale

**Recommandation** : **Option 1** (onglet dans l'Arène) pour garder la cohérence

### B. Côté Élève

#### Accès via Code de Session
**Flux** :
1. Élève ouvre l'application (mode normal)
2. Nouveau bouton "🎓 Rejoindre une Classe" dans le header (ou dans l'Arène)
3. Modal de saisie du code (4 lettres)
4. Après validation → Bascule automatique en mode "élève"

**Alternative** : URL directe avec code
- `harmonist-academy.com/live/ABCD`
- Redirection automatique vers mode élève

---

## 2. Interface Professeur (Le Cockpit)

### A. Architecture Multi-Écrans

Le mode classe supporte **deux interfaces distinctes** pour le professeur :

1. **Interface Desktop (Projection)** : Affichage public pour la classe
   - Vue projetée sur écran/projecteur
   - Graphiques, statistiques, progression
   - Pas de contrôles sensibles (pas de réponses visibles)

2. **Interface Mobile (Télécommande)** : Contrôle privé du professeur
   - Vue sur téléphone/tablette
   - Accords à jouer au piano (si mode live)
   - Contrôles (jouer son, révéler, question suivante)
   - Statistiques détaillées

**Synchronisation** : Les deux interfaces partagent la même session Firestore et se mettent à jour en temps réel.

### B. Structure de la Modale (Desktop)

**Fichier** : Nouvelle modale `liveTeacherModal` (similaire à `challengeHubModal`)

```html
<div class="modal-overlay" id="liveTeacherModal">
    <div class="modal" style="height:90vh; max-width:900px;">
        <!-- Header avec titre et fermeture -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h2 style="margin:0; color:var(--primary);">🎓 Harmonist Live</h2>
            <span style="cursor:pointer; font-size:1.5rem;" onclick="window.UI.closeModals()">✕</span>
        </div>
        
        <!-- Navigation par onglets -->
        <div class="live-nav-tabs">
            <button class="live-tab active" onclick="window.LiveManager.switchTab('lobby')">Lobby</button>
            <button class="live-tab" onclick="window.LiveManager.switchTab('session')">Session Active</button>
            <button class="live-tab" onclick="window.LiveManager.switchTab('history')">Historique</button>
        </div>
        
        <!-- Contenu dynamique selon l'onglet -->
        <div id="liveTeacherContent"></div>
    </div>
</div>
```

### B. Onglet "Lobby" (Création de Session)

**Layout** :
```
┌─────────────────────────────────────┐
│  🎓 Harmonist Live                  │
├─────────────────────────────────────┤
│  [Lobby] [Session] [Historique]    │
├─────────────────────────────────────┤
│                                      │
│  Créer une nouvelle session          │
│  ┌──────────────────────────────┐   │
│  │ Code: ABCD                   │   │
│  │ [Copier]                     │   │
│  └──────────────────────────────┘   │
│                                      │
│  Participants (0)                    │
│  ┌──────────────────────────────┐   │
│  │ Aucun participant            │   │
│  └──────────────────────────────┘   │
│                                      │
│  [⚙️ Paramètres] [▶️ Démarrer]      │
└─────────────────────────────────────┘
```

**Fonctionnalités** :
- Génération automatique du code (4 lettres)
- Liste des participants en temps réel (via `onSnapshot`)
- Bouton "Kick" à côté de chaque participant
- Paramètres : Timer, Masquer pseudos, Limite participants

### C. Onglet "Session Active" (Pendant le Jeu)

#### Mode Desktop (Projection)

**Layout** :
```
┌─────────────────────────────────────┐
│  Session: ABCD  [📱 Télécommande]    │
├─────────────────────────────────────┤
│                                      │
│  Question 3/20                       │
│  ▓▓▓░░░░░░░░░░░░░░░░░               │
│                                      │
│  Réponses reçues: 12/15              │
│  ┌──────────────────────────────┐   │
│  │ Maj7: ████████ 8             │   │
│  │ Min7: ████ 4                 │   │
│  │ Dom7: █ 1                    │   │
│  └──────────────────────────────┘   │
│                                      │
│  [🔊 Comparer A/B] [📊 Détails]     │
│                                      │
│  ⏸️ En attente de la télécommande... │
└─────────────────────────────────────┘
```

**Fonctionnalités** :
- **Vue publique uniquement** : Pas de contrôles sensibles
- Graphique de répartition en temps réel
- Comparateur A/B (bonne réponse vs erreur fréquente)
- Indicateur de statut (en attente, révélation, etc.)
- **Bouton "📱 Télécommande"** : Affiche QR code pour connexion mobile

#### Mode Mobile (Télécommande)

**Layout** :
```
┌─────────────────────────────────────┐
│  🎓 Télécommande - Session ABCD     │
├─────────────────────────────────────┤
│                                      │
│  Question 3/20                       │
│  ▓▓▓░░░░░░░░░░░░░░░░░               │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ Accord à jouer :             │   │
│  │                              │   │
│  │  C Maj7                      │   │
│  │  Renversement: 1             │   │
│  │                              │   │
│  │  [🎹 Jouer le son]           │   │
│  └──────────────────────────────┘   │
│                                      │
│  Réponses: 12/15                     │
│  ┌──────────────────────────────┐   │
│  │ Maj7: 8  Min7: 4  Dom7: 1    │   │
│  └──────────────────────────────┘   │
│                                      │
│  [▶️ Révéler] [⏭️ Suivant] [⏸️ Pause]│
└─────────────────────────────────────┘
```

**Fonctionnalités** :
- **Affichage de l'accord** : Nom complet + renversement (toujours visible, même en mode piano live)
- Télécommande sonore (bouton "🎹 Jouer le son")
- **Mode Silencieux** : Option pour couper le son de l'ordi (l'accord reste affiché pour jouer au piano)
- Contrôles complets (Révéler, Question suivante, Pause, Stop)
- Statistiques détaillées (réponses par type)

### D. Connexion Mobile (QR Code)

**Flux de connexion** :
1. Prof ouvre session sur ordinateur
2. Clique sur "📱 Télécommande" dans l'onglet "Session Active"
3. QR code s'affiche avec URL unique : `harmonist-academy.com/live/ABCD/remote`
4. Prof scanne avec son téléphone
5. Télécommande mobile s'ouvre automatiquement
6. Les deux interfaces se synchronisent via Firestore

**Structure Firestore** :
```javascript
live_sessions/{sessionId}
  ├── code: "ABCD"
  ├── createdBy: "prof_uid"
  ├── remoteConnected: true  // Télécommande connectée
  ├── remoteDeviceId: "device_xyz"  // ID du téléphone
  ├── currentQuestion: { chord, step, startTime }
  ├── remoteControl: {
  │     action: "play" | "reveal" | "next" | "pause",
  │     timestamp: serverTimestamp
  │   }
  └── ...
```

**Interface QR Code** :
```html
<div id="liveRemoteQR" class="live-qr-modal" style="display:none;">
    <div class="modal-content">
        <h3>📱 Connecter la Télécommande</h3>
        <div id="liveQRCode"></div>
        <p>Scannez avec votre téléphone</p>
        <p style="font-size:0.8rem; color:var(--text-dim);">
            Ou ouvrez : <span id="liveRemoteURL"></span>
        </p>
        <button onclick="window.LiveManager.closeQR()">Fermer</button>
    </div>
</div>
```

### E. Mode "Télécommande Sonore" (Rideau)

**Sur Mobile (Télécommande)** :
- Affichage de l'accord complet (C Maj7, Renversement 1)
- Bouton "🎹 Jouer le son" (ou mode silencieux si prof joue au piano)
- Contrôles de navigation (Révéler, Suivant, Pause)
- Statistiques détaillées

**Sur Desktop (Projection)** :
- **Mode Observateur** : Affiche uniquement les informations publiques
- Graphiques de répartition
- Progression de la session
- Pas de contrôles (tout se fait depuis le mobile)

**CSS Télécommande Mobile** :
```css
.live-remote-container {
    padding: 20px;
    max-width: 400px;
    margin: 0 auto;
}

.live-chord-display {
    background: rgba(0,0,0,0.5);
    border: 2px solid var(--primary);
    border-radius: 16px;
    padding: 30px;
    text-align: center;
    margin: 20px 0;
}

.live-chord-name {
    font-size: 2.5rem;
    font-weight: 900;
    color: white;
    margin-bottom: 10px;
}

.live-chord-inv {
    font-size: 1.2rem;
    color: var(--text-dim);
}

.live-remote-controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
}

.live-remote-btn {
    padding: 15px;
    border-radius: 12px;
    border: none;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s;
}

.live-remote-btn:active {
    transform: scale(0.95);
}

.live-remote-btn.play {
    background: var(--primary);
    color: white;
}

.live-remote-btn.reveal {
    background: var(--success);
    color: white;
}

.live-remote-btn.next {
    background: var(--gold);
    color: black;
}
```

**CSS Mode Observateur (Desktop)** :
```css
.live-observer-mode {
    /* Interface épurée pour projection */
    background: rgba(0,0,0,0.8);
    padding: 40px;
}

.live-observer-mode .live-remote-controls {
    display: none; /* Masquer contrôles sur desktop */
}

.live-observer-mode .live-stats {
    font-size: 1.5rem; /* Agrandir pour projection */
}

.live-status-indicator {
    padding: 10px 20px;
    border-radius: 8px;
    margin: 20px 0;
    text-align: center;
}

.live-status-indicator.waiting {
    background: rgba(251, 191, 36, 0.2);
    color: var(--gold);
}

.live-status-indicator.revealed {
    background: rgba(16, 185, 129, 0.2);
    color: var(--success);
}
```

---

## 3. Interface Élève (Le Pad)

### A. Bascule en Mode Épuré

**Déclencheur** : Quand l'élève rejoint une session avec un code valide

**Changements visuels** :
1. **Masquer** :
   - Header complet (profil, stats, boutons)
   - Footer
   - Mode selector (Zen, Chrono, etc.)
   - Boutons Codex, Stats, Settings
   - Barre de progression normale

2. **Afficher** :
   - Barre de progression segmentée (20 blocs) en haut
   - Panneaux de réponse (Qualité + Renversement)
   - Boutons de commande (Écouter, Valider)
   - Indicateur de connexion (LED vert/rouge)
   - Message d'état ("En attente...", "Question X/20")

### B. Structure HTML Conditionnelle

**Approche** : Classes CSS conditionnelles basées sur `App.session.isLiveStudent`

```html
<!-- Dans index.html -->
<body class="live-student-mode">
    <!-- Header masqué en mode élève -->
    <header class="live-hide-when-student">
        <!-- ... header normal ... -->
    </header>
    
    <!-- Barre de progression Live (visible seulement en mode élève) -->
    <div id="liveProgressBar" class="live-progress-container" style="display:none;">
        <!-- 20 blocs segmentés -->
    </div>
    
    <!-- Zone de jeu (toujours visible) -->
    <div class="game-area">
        <!-- Panneaux de réponse -->
    </div>
    
    <!-- Commandes (toujours visibles) -->
    <div class="command-deck">
        <!-- Boutons Écouter, Valider -->
    </div>
</body>
```

**CSS** :
```css
/* Masquer éléments en mode élève */
body.live-student-mode .live-hide-when-student {
    display: none !important;
}

/* Afficher barre progression Live */
body.live-student-mode #liveProgressBar {
    display: flex !important;
}

/* Mode plein écran optionnel */
body.live-student-mode.fullscreen {
    padding: 0;
    margin: 0;
}
```

### C. Barre de Progression Segmentée

**Design** : Similaire à `challengeProgressContainer` mais avec 20 blocs

```html
<div id="liveProgressBar" class="live-progress-container">
    <div class="live-progress-segment" data-step="1"></div>
    <div class="live-progress-segment" data-step="2"></div>
    <!-- ... 20 segments ... -->
</div>
```

**États visuels** :
- **Blanc** : Question en cours
- **Vert** : Réponse correcte
- **Rouge** : Réponse incorrecte
- **Gris** : Pas encore répondu

**CSS** :
```css
.live-progress-container {
    display: flex;
    gap: 4px;
    padding: 10px;
    background: rgba(0,0,0,0.3);
    border-bottom: 1px solid var(--panel-border);
}

.live-progress-segment {
    flex: 1;
    height: 8px;
    border-radius: 4px;
    background: #334155; /* Gris = pas répondu */
    transition: background 0.3s;
}

.live-progress-segment.active {
    background: white; /* Question en cours */
}

.live-progress-segment.correct {
    background: var(--success); /* Vert = correct */
}

.live-progress-segment.incorrect {
    background: var(--error); /* Rouge = incorrect */
}
```

### D. Feedback Haptique & Visuel

**Lors de la validation** :
1. Bouton "Valider" devient "En attente..." (spinner)
2. Bouton désactivé (empêcher changement d'avis)
3. Vibration légère (50ms)

**Lors de la révélation** :
1. Flash vert (si correct) ou rouge (si incorrect)
2. Vibration : 100ms (correct) ou 200ms (incorrect)
3. Animation de transition douce (fade in/out)

**CSS** :
```css
.live-feedback-flash {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    animation: flashFade 0.5s;
}

.live-feedback-flash.correct {
    background: rgba(16, 185, 129, 0.3);
}

.live-feedback-flash.incorrect {
    background: rgba(239, 68, 68, 0.3);
}

@keyframes flashFade {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
}
```

### E. Indicateur de Connexion

**Emplacement** : En haut à droite (remplace le header)

```html
<div class="live-connection-indicator">
    <div class="live-led" id="liveConnectionLed"></div>
    <span id="liveConnectionText">Connecté</span>
</div>
```

**États** :
- **Vert** : Connecté et synchronisé
- **Orange** : Reconnexion en cours
- **Rouge** : Déconnecté

---

## 4. Gestion d'État & Synchronisation

### A. Variables de Session

**Dans `app.js`** :
```javascript
session: {
    // ... existant ...
    isLiveStudent: false,
    isLiveTeacher: false,
    liveSessionId: null,
    liveSessionCode: null,
    liveQuestionIndex: 0,
    liveAnswerSubmitted: false,
    liveWaitingForReveal: false
}
```

### B. Fonctions de Bascule

**Dans `ui.js`** :
```javascript
enterLiveStudentMode(sessionCode) {
    // 1. Valider le code
    // 2. Rejoindre la session Firestore
    // 3. Basculer UI en mode élève
    document.body.classList.add('live-student-mode');
    App.session.isLiveStudent = true;
    // 4. Écouter les changements de question
    // 5. Afficher barre progression
}

exitLiveStudentMode() {
    // 1. Quitter la session Firestore
    // 2. Restaurer UI normale
    document.body.classList.remove('live-student-mode');
    App.session.isLiveStudent = false;
    // 3. Retour au mode zen
    App.setMode('zen');
}

enterLiveTeacherMode() {
    // 1. Ouvrir modale prof (desktop)
    // 2. Basculer en mode prof (observateur)
    App.session.isLiveTeacher = true;
    App.session.isLiveObserver = true;
    document.body.classList.add('live-observer-mode');
    UI.openModal('liveTeacherModal');
}

enterLiveRemoteMode(sessionCode, deviceId) {
    // 1. Valider le code et deviceId
    // 2. Rejoindre la session Firestore comme télécommande
    // 3. Basculer UI en mode télécommande mobile
    App.session.isLiveRemote = true;
    App.session.liveRemoteDeviceId = deviceId;
    document.body.classList.add('live-remote-mode');
    // 4. Écouter les changements de question
    // 5. Afficher interface télécommande
    UI.renderLiveRemote();
}

showRemoteQR() {
    // Afficher QR code pour connexion mobile
    const sessionId = App.session.liveSessionId;
    const remoteURL = `${window.location.origin}/live/${App.session.liveSessionCode}/remote`;
    // Générer QR code avec bibliothèque (ex: qrcode.js)
    UI.openModal('liveRemoteQR');
}
```

### C. Listeners Temps Réel

**Dans nouveau fichier `live.js`** :
```javascript
export const LiveManager = {
    // Prof écoute les réponses
    listenToAnswers(sessionId, callback) {
        const answersRef = collection(db, `live_sessions/${sessionId}/answers`);
        return onSnapshot(answersRef, (snapshot) => {
            const answers = [];
            snapshot.forEach(doc => {
                answers.push({ uid: doc.id, ...doc.data() });
            });
            callback(answers);
        });
    },
    
    // Élève écoute la question active
    listenToCurrentQuestion(sessionId, callback) {
        const sessionRef = doc(db, `live_sessions/${sessionId}`);
        return onSnapshot(sessionRef, (doc) => {
            if (doc.exists()) {
                callback(doc.data().currentQuestion);
            }
        });
    },
    
    // Télécommande écoute les commandes
    listenToRemoteControl(sessionId, callback) {
        const sessionRef = doc(db, `live_sessions/${sessionId}`);
        return onSnapshot(sessionRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                if (data.remoteControl) {
                    callback(data.remoteControl);
                }
            }
        });
    },
    
    // Envoyer commande depuis télécommande
    sendRemoteCommand(sessionId, action) {
        const sessionRef = doc(db, `live_sessions/${sessionId}`);
        return updateDoc(sessionRef, {
            remoteControl: {
                action: action,
                timestamp: serverTimestamp(),
                deviceId: App.session.liveRemoteDeviceId
            }
        });
    },
    
    // Desktop écoute les commandes de la télécommande
    listenToRemoteActions(sessionId, callback) {
        const sessionRef = doc(db, `live_sessions/${sessionId}`);
        return onSnapshot(sessionRef, (doc) => {
            if (doc.exists()) {
                const remoteControl = doc.data().remoteControl;
                if (remoteControl && remoteControl.action) {
                    callback(remoteControl.action);
                    // Exécuter l'action (jouer son, révéler, etc.)
                }
            }
        });
    }
};
```

---

## 5. Cohérence avec le Design Existant

### A. Réutilisation des Composants

**Composants réutilisables** :
- ✅ Système de modales (`modal-overlay`, `modal`)
- ✅ Boutons (`cmd-btn`, `btn-action`, `btn-listen`)
- ✅ Panneaux de réponse (`panel`, `pad-grid`)
- ✅ Système de feedback (`feedback-msg`, animations)
- ✅ Toast notifications (`showToast`)

**Nouveaux composants nécessaires** :
- ⚠️ Barre progression segmentée (inspirée de `challengeProgressContainer`)
- ⚠️ Graphiques temps réel (nouvelle bibliothèque)
- ⚠️ Liste participants temps réel
- ⚠️ Télécommande sonore (mode aveugle)

### B. Palette de Couleurs

**Cohérence** :
- Utiliser les mêmes variables CSS (`--primary`, `--success`, `--error`, etc.)
- Mode Live peut avoir une couleur distinctive (ex: `--live: #8b5cf6` pour violet)
- Garder le même style de boutons et modales

### C. Responsive Design

**Mobile** :
- Interface élève : Optimisée pour petits écrans (boutons plus grands)
- Interface prof : Peut nécessiter scroll horizontal pour graphiques
- Télécommande : Bouton "JOUER" centré, grande taille

---

## 6. Flux Utilisateur Complet

### A. Professeur

```
1. Ouvrir Arène → Onglet "🎓 Classe"
2. Cliquer "Créer Session"
3. Code généré (ex: ABCD)
4. Attendre participants (liste mise à jour en temps réel)
5. Cliquer "Démarrer"
6. Basculer onglet "Session Active"
7. Utiliser barre Espace pour jouer le son (mode aveugle)
8. Voir graphique des réponses en temps réel
9. Cliquer "Révéler" quand prêt
10. Cliquer "Question suivante"
11. Répéter jusqu'à fin
12. Voir statistiques finales
```

### B. Élève

```
1. Ouvrir application (mode normal)
2. Cliquer "🎓 Rejoindre une Classe" (ou URL directe)
3. Entrer code (ex: ABCD)
4. Validation → Bascule automatique en mode élève
5. UI épurée s'affiche (header masqué, barre progression visible)
6. Attendre question (écran "En attente...")
7. Question affichée → Sélectionner réponse
8. Cliquer "Valider" → Bouton devient "En attente..."
9. Attendre révélation du prof
10. Flash vert/rouge + vibration selon résultat
11. Barre progression mise à jour
12. Nouvelle question automatique
13. Répéter jusqu'à fin
14. Voir score final
15. Option "Quitter" → Retour mode normal
```

---

## 7. Points d'Intégration dans le Code

### A. Fichiers à Modifier

1. **`index.html`** :
   - Ajouter modale `liveTeacherModal`
   - Ajouter modale `liveRemoteQR` (QR code)
   - Ajouter barre progression Live
   - Ajouter classes conditionnelles
   - Ajouter route `/live/:code/remote` pour télécommande mobile

2. **`ui.js`** :
   - Fonction `showLiveHub()` (similaire à `showChallengeHub()`)
   - Fonction `enterLiveStudentMode()`
   - Fonction `exitLiveStudentMode()`
   - Fonction `enterLiveRemoteMode()` (télécommande mobile)
   - Fonction `showRemoteQR()` (afficher QR code)
   - Fonction `renderLiveRemote()` (interface télécommande)
   - Rendu interface prof (desktop observateur)
   - Rendu interface télécommande (mobile)

3. **`app.js`** :
   - Variables session Live (ajouter `isLiveRemote`, `isLiveObserver`)
   - Gestion validation en mode Live
   - Synchronisation avec Firestore
   - Détection route `/live/:code/remote` pour basculer en mode télécommande

4. **`firebase.js`** :
   - Fonctions CRUD pour `live_sessions`
   - Listeners temps réel (`onSnapshot`)
   - Fonction `sendRemoteCommand()` (envoyer commande depuis mobile)
   - Fonction `listenToRemoteControl()` (écouter commandes sur desktop)

5. **`styles.css`** :
   - Classes `.live-student-mode`
   - Classes `.live-observer-mode` (desktop projection)
   - Classes `.live-remote-mode` (mobile télécommande)
   - Styles barre progression
   - Styles télécommande mobile
   - Styles mode observateur (projection)
   - Animations feedback

6. **Nouveau fichier `live.js`** :
   - `LiveManager` (similaire à `ChallengeManager`)
   - Gestion état session
   - Synchronisation temps réel
   - Gestion télécommande (commandes mobile → desktop)
   - Génération QR code (bibliothèque externe : `qrcode.js`)

7. **Nouveau fichier `live-remote.html`** (Optionnel) :
   - Page dédiée pour télécommande mobile
   - URL : `/live/:code/remote`
   - Interface optimisée mobile
   - Auto-détection et bascule en mode télécommande

### B. Règles Firestore à Ajouter

**Dans Firebase Console** :
```javascript
match /live_sessions/{sessionId} {
  // Lecture : Tous les utilisateurs authentifiés
  allow read: if request.auth != null;
  
  // Création : Tous les utilisateurs authentifiés
  allow create: if request.auth != null;
  
  // Mise à jour : Seulement le créateur (prof) OU la télécommande autorisée
  allow update: if request.auth != null && (
    request.auth.uid == resource.data.createdBy ||
    (request.resource.data.remoteControl != null && 
     request.resource.data.remoteControl.deviceId == resource.data.remoteDeviceId)
  );
  
  // Suppression : Seulement le créateur
  allow delete: if request.auth != null 
    && request.auth.uid == resource.data.createdBy;
  
  match /answers/{studentUid} {
    // Lecture : Seulement le prof (créateur de session)
    allow read: if request.auth != null 
      && get(/databases/$(database)/documents/live_sessions/$(sessionId)).data.createdBy == request.auth.uid;
    
    // Écriture : Seulement l'élève propriétaire
    allow write: if request.auth != null 
      && request.auth.uid == studentUid
      && request.resource.data.keys().hasOnly(['answer', 'timestamp', 'isCorrect']);
  }
}
```

---

## 8. Recommandations d'Implémentation

### Phase 1 (MVP) : Interface Basique
1. ✅ Modale prof avec onglet "Lobby"
2. ✅ Création session + code
3. ✅ Liste participants (temps réel basique)
4. ✅ Interface élève épurée (masquage header)
5. ✅ Barre progression segmentée
6. ✅ Synchronisation question active
7. ✅ Validation réponse élève

### Phase 2 : Fonctionnalités Avancées
1. ✅ Télécommande sonore (mode aveugle)
2. ✅ Graphiques temps réel
3. ✅ Comparateur A/B
4. ✅ Feedback haptique/visuel
5. ✅ Gestion pause/stop

### Phase 3 : Polish & Optimisations
1. ✅ Animations fluides
2. ✅ Gestion erreurs robuste
3. ✅ Analytics avancés
4. ✅ Export statistiques

---

## 9. Architecture Multi-Écrans

### A. Flux de Données

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Desktop Prof   │         │  Mobile Prof    │         │  Élèves         │
│  (Observateur)  │         │  (Télécommande) │         │  (Pads)         │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                          │                           │
         │                          │                           │
         └──────────────┬───────────┴───────────┬───────────────┘
                        │                       │
                        ▼                       ▼
                ┌───────────────────────────────────────┐
                │      Firestore live_sessions         │
                │                                       │
                │  - currentQuestion                    │
                │  - remoteControl (commandes)          │
                │  - answers/{studentUid}               │
                │  - settings.silentMode               │
                └───────────────────────────────────────┘
```

### B. Synchronisation

1. **Desktop (Observateur)** :
   - Écoute `currentQuestion` → Affiche question publique
   - Écoute `remoteControl` → Exécute actions (jouer son, révéler)
   - Écoute `answers` → Affiche graphiques temps réel
   - Écoute `settings.silentMode` → Affiche "🎹 Mode Piano Live" si activé

2. **Mobile (Télécommande)** :
   - Écoute `currentQuestion` → Affiche accord à jouer
   - Écrit `remoteControl` → Envoie commandes (play, reveal, next)
   - Écrit `settings.silentMode` → Active/désactive mode silencieux
   - Écoute `answers` → Affiche statistiques détaillées

3. **Élèves (Pads)** :
   - Écoute `currentQuestion` → Affiche nouvelle question
   - Écrit `answers/{uid}` → Envoie réponse
   - Écoute `remoteControl.action === 'reveal'` → Affiche résultat

### C. Mode Silencieux (Piano Live)

**Fonctionnalité** : Le prof peut couper le son de l'ordinateur et jouer l'accord au piano, tout en gardant l'affichage de l'accord sur la télécommande.

**Implémentation** :
- Toggle "🔇 Mode Silencieux" sur télécommande mobile
- **L'accord reste toujours affiché** sur la télécommande (même fonctionnalités que le mode normal)
- Quand activé :
  - Desktop : Son désactivé, affiche "🎹 Mode Piano Live"
  - Mobile : **Accord toujours visible** (ex: "C Maj7, Renversement 1")
  - Bouton "🎹 Jouer le son" reste disponible (peut être utilisé si besoin)
  - Prof peut jouer au piano manuellement en regardant l'accord affiché
  - Optionnel : Bouton "✓ Accord joué" pour confirmer (sans déclencher le son)

**Firestore** :
```javascript
live_sessions/{sessionId}
  ├── settings: {
  │     silentMode: true,  // Son ordi coupé
  │     pianoLive: true    // Prof joue au piano
  │   }
```

**Interface Mobile (Mode Silencieux)** :
```html
<div class="live-remote-container">
    <!-- Accord toujours affiché (même fonctionnalités que mode normal) -->
    <div class="live-chord-display">
        <div class="live-chord-name">C Maj7</div>
        <div class="live-chord-inv">Renversement: 1</div>
    </div>
    
    <!-- Bouton "Jouer le son" reste disponible -->
    <button class="live-remote-btn play" onclick="LiveManager.playChord()">
        🎹 Jouer le son
    </button>
    
    <!-- Toggle Mode Silencieux -->
    <div class="live-silent-toggle">
        <label>
            <input type="checkbox" id="silentModeToggle" onchange="LiveManager.toggleSilentMode(this.checked)">
            <span>🔇 Mode Silencieux</span>
        </label>
        <p style="font-size:0.8rem; color:var(--text-dim); margin-top:5px;">
            Coupe le son de l'ordinateur (l'accord reste affiché)
        </p>
    </div>
    
    <!-- Optionnel : Confirmation si prof joue au piano -->
    <button class="live-remote-btn confirm" onclick="LiveManager.markChordPlayed()" style="display:none;" id="chordPlayedBtn">
        ✓ Accord joué au piano
    </button>
    
    <!-- Contrôles normaux -->
    <div class="live-remote-controls">
        <button class="live-remote-btn reveal" onclick="LiveManager.reveal()">▶️ Révéler</button>
        <button class="live-remote-btn next" onclick="LiveManager.next()">⏭️ Suivant</button>
    </div>
</div>
```

**Comportement** :
- En mode silencieux activé : Le bouton "Jouer le son" peut toujours être utilisé (au cas où)
- L'accord reste visible pour que le prof puisse le jouer au piano
- Optionnel : Afficher le bouton "✓ Accord joué" seulement si mode silencieux activé

**Interface Desktop (Mode Silencieux)** :
```html
<div class="live-status-indicator piano-live">
    🎹 Mode Piano Live
    <div style="font-size:0.8rem; margin-top:5px;">
        Le professeur joue l'accord au piano
    </div>
</div>
```

**CSS** :
```css
/* Mode silencieux : Accord reste visible mais avec style distinct */
.live-silent-mode .live-chord-display {
    border-color: var(--gold);
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
    background: rgba(251, 191, 36, 0.1);
}

/* Indicateur sur desktop */
.live-status-indicator.piano-live {
    background: rgba(251, 191, 36, 0.2);
    color: var(--gold);
    border: 2px solid var(--gold);
}

/* Toggle Mode Silencieux */
.live-silent-toggle {
    margin: 20px 0;
    padding: 15px;
    background: rgba(0,0,0,0.3);
    border-radius: 12px;
    text-align: center;
}

.live-silent-toggle label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
    font-weight: 700;
    color: white;
}

.live-silent-toggle input[type="checkbox"] {
    width: 24px;
    height: 24px;
    cursor: pointer;
}

/* Bouton confirmation (optionnel) */
.live-remote-btn.confirm {
    background: var(--success);
    color: white;
    margin-top: 10px;
}

/* Bouton "Jouer le son" reste visible même en mode silencieux */
.live-remote-btn.play {
    background: var(--primary);
    color: white;
}
```

---

## Conclusion

L'intégration UI du mode classe est **cohérente** avec l'architecture existante :
- ✅ Réutilisation des composants (modales, boutons, panneaux)
- ✅ Système de classes conditionnelles pour basculer entre modes
- ✅ Design épuré pour élève (masquage éléments)
- ✅ **Dashboard projection pour prof (desktop observateur)**
- ✅ **Télécommande mobile pour contrôle privé**
- ✅ **Mode silencieux pour piano live**
- ✅ Synchronisation temps réel via Firestore listeners

**Nouveautés ajoutées** :
- 🆕 Interface projection (desktop) pour affichage public
- 🆕 Interface télécommande (mobile) pour contrôle privé
- 🆕 QR code pour connexion mobile
- 🆕 Mode silencieux (piano live)
- 🆕 Synchronisation bidirectionnelle (mobile ↔ desktop)

Le principal défi sera la gestion de l'état multijoueur et la synchronisation temps réel entre desktop et mobile, mais l'infrastructure est déjà en place.

