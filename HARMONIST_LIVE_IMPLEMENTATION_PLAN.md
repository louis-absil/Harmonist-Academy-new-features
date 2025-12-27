# Plan d'Implémentation : Harmonist Live 🎓

## Stratégie Globale

**Approche** : Implémentation incrémentale, en commençant par les fondations (backend) puis en ajoutant les interfaces progressivement.

**Principe** : Chaque étape doit être testable indépendamment avant de passer à la suivante.

---

## Phase 0 : Préparation & Infrastructure (Fondations)

### Étape 0.1 : Import `onSnapshot` dans Firebase
**Fichier** : `firebase.js`
**Durée** : 5 minutes

```javascript
// Ajouter onSnapshot à l'import
import { ..., onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
```

**Test** : Vérifier que l'import fonctionne (pas d'erreur console)

---

### Étape 0.2 : Créer structure Firestore de base
**Fichier** : `firebase.js`
**Durée** : 30 minutes

**Fonctions à ajouter** :
```javascript
// Dans Cloud object
createLiveSession(code, config) {
    // Créer document live_sessions/{sessionId}
    // Retourner sessionId
}

getLiveSession(sessionId) {
    // Récupérer session
}

updateLiveSession(sessionId, data) {
    // Mettre à jour session
}
```

**Test** : Créer une session manuellement depuis la console, vérifier dans Firestore

---

### Étape 0.3 : Ajouter règles Firestore
**Fichier** : Firebase Console → Firestore Rules
**Durée** : 15 minutes

**Règles à ajouter** (voir document d'intégration section 7.B)

**Test** : Vérifier que les règles bloquent les accès non autorisés

---

## Phase 1 : Backend & Synchronisation (MVP Core)

### Étape 1.1 : Créer `live.js` - Structure de base
**Fichier** : `live.js` (nouveau)
**Durée** : 1 heure

**Structure minimale** :
```javascript
export const LiveManager = {
    active: false,
    sessionId: null,
    sessionCode: null,
    
    // État de la session
    state: {
        status: 'idle', // 'idle' | 'waiting' | 'active' | 'paused' | 'finished'
        currentQuestion: null,
        participants: [],
        answers: {}
    },
    
    // Listeners (à implémenter plus tard)
    listeners: {
        session: null,
        answers: null,
        participants: null
    },
    
    // Méthodes de base
    async createSession(config) {
        // Générer code 4 lettres
        // Créer document Firestore
        // Retourner sessionId et code
    },
    
    async joinSession(code) {
        // Valider code
        // Rejoindre session
        // Retourner sessionId
    },
    
    cleanup() {
        // Détacher tous les listeners
        // Réinitialiser état
    }
};
```

**Test** : Vérifier que le module s'importe sans erreur

---

### Étape 1.2 : Implémenter création de session
**Fichier** : `live.js`
**Durée** : 1 heure

**Fonctionnalités** :
- Génération code 4 lettres aléatoire
- Création document Firestore `live_sessions/{sessionId}`
- Structure initiale : `code`, `createdBy`, `status: 'waiting'`, `createdAt`

**Test** : Créer une session depuis la console, vérifier dans Firestore

---

### Étape 1.3 : Implémenter listeners temps réel (onSnapshot)
**Fichier** : `live.js`
**Durée** : 2 heures

**Listeners à implémenter** :
1. `listenToSession(sessionId, callback)` - Écoute changements de session
2. `listenToAnswers(sessionId, callback)` - Écoute réponses des élèves
3. `listenToParticipants(sessionId, callback)` - Écoute participants (sous-collection)

**Test** : 
- Créer session
- Modifier manuellement dans Firestore
- Vérifier que le callback est appelé

---

### Étape 1.4 : Implémenter gestion des questions
**Fichier** : `live.js`
**Durée** : 1.5 heures

**Fonctionnalités** :
- `setCurrentQuestion(sessionId, question)` - Mettre à jour question active
- `nextQuestion(sessionId)` - Passer à la question suivante
- Génération de questions (réutiliser logique de `challenges.js`)

**Test** : 
- Créer session
- Définir question active
- Vérifier que `currentQuestion` est mis à jour dans Firestore

---

### Étape 1.5 : Implémenter soumission de réponses (élève)
**Fichier** : `live.js`
**Durée** : 1 heure

**Fonctionnalités** :
- `submitAnswer(sessionId, studentUid, answer)` - Soumettre réponse
- Créer document dans `live_sessions/{sessionId}/answers/{studentUid}`
- Calculer `isCorrect` automatiquement

**Test** :
- Créer session
- Soumettre réponse depuis console
- Vérifier dans Firestore sous-collection `answers`

---

## Phase 2 : Interface Professeur - Desktop (MVP UI)

### Étape 2.1 : Ajouter onglet "🎓 Classe" dans Arène
**Fichier** : `index.html`
**Durée** : 15 minutes

**Modification** :
- Ajouter bouton onglet dans `challengeHubModal`
- Ajouter contenu onglet `c-tab-live`

**Test** : Vérifier que l'onglet s'affiche et se sélectionne

---

### Étape 2.2 : Créer modale Live Teacher (structure HTML)
**Fichier** : `index.html`
**Durée** : 30 minutes

**Structure** :
- Modale `liveTeacherModal`
- Onglets : Lobby, Session Active, Historique
- Contenu onglet Lobby (bouton "Créer Session")

**Test** : Vérifier que la modale s'ouvre et affiche les onglets

---

### Étape 2.3 : Implémenter création de session (UI)
**Fichier** : `ui.js`
**Durée** : 1 heure

**Fonctionnalités** :
- Fonction `showLiveHub()` - Ouvrir modale Live
- Fonction `createLiveSession()` - Créer session via `LiveManager`
- Afficher code généré
- Bouton "Copier code"

**Test** :
- Cliquer "Créer Session"
- Vérifier que code s'affiche
- Vérifier création dans Firestore

---

### Étape 2.4 : Implémenter liste participants (temps réel)
**Fichier** : `ui.js`
**Durée** : 1.5 heures

**Fonctionnalités** :
- Écouter sous-collection `participants` avec `onSnapshot`
- Afficher liste participants en temps réel
- Bouton "Kick" à côté de chaque participant

**Test** :
- Créer session
- Rejoindre depuis un autre onglet (simuler élève)
- Vérifier que participant apparaît dans la liste

---

### Étape 2.5 : Implémenter démarrage de session
**Fichier** : `ui.js` + `live.js`
**Durée** : 1 heure

**Fonctionnalités** :
- Bouton "Démarrer" dans Lobby
- Changer `status: 'waiting'` → `status: 'active'`
- Générer première question
- Basculer vers onglet "Session Active"

**Test** :
- Créer session avec participants
- Cliquer "Démarrer"
- Vérifier changement de statut dans Firestore

---

### Étape 2.6 : Implémenter affichage question active (Desktop)
**Fichier** : `ui.js`
**Durée** : 1 heure

**Fonctionnalités** :
- Écouter `currentQuestion` avec `onSnapshot`
- Afficher numéro question (ex: "Question 3/20")
- Afficher barre progression segmentée
- Afficher graphique réponses (basique, sans Chart.js pour l'instant)

**Test** :
- Démarrer session
- Changer question depuis console
- Vérifier que l'affichage se met à jour

---

## Phase 3 : Interface Élève (MVP UI)

### Étape 3.1 : Ajouter bouton "Rejoindre Classe"
**Fichier** : `index.html` + `ui.js`
**Durée** : 30 minutes

**Fonctionnalités** :
- Bouton dans header ou dans Arène
- Modal de saisie code (4 lettres)
- Validation code

**Test** : Vérifier que le modal s'ouvre et accepte le code

---

### Étape 3.2 : Implémenter mode élève (masquage UI)
**Fichier** : `ui.js` + `styles.css`
**Durée** : 1 heure

**Fonctionnalités** :
- Fonction `enterLiveStudentMode(sessionCode)`
- Ajouter classe `live-student-mode` au body
- Masquer header, footer, mode selector
- Afficher barre progression Live

**CSS** :
```css
body.live-student-mode header,
body.live-student-mode .tools-bar,
body.live-student-mode footer {
    display: none !important;
}
```

**Test** :
- Rejoindre session
- Vérifier que header/footer sont masqués
- Vérifier que barre progression s'affiche

---

### Étape 3.3 : Implémenter barre progression segmentée
**Fichier** : `ui.js` + `styles.css`
**Durée** : 1 heure

**Fonctionnalités** :
- Créer 20 segments dynamiquement
- Mettre à jour segments selon progression
- États : gris (pas répondu), blanc (en cours), vert (correct), rouge (incorrect)

**Test** :
- Rejoindre session
- Vérifier que 20 segments s'affichent
- Simuler progression, vérifier mise à jour

---

### Étape 3.4 : Implémenter écoute question active (élève)
**Fichier** : `live.js` + `ui.js`
**Durée** : 1.5 heures

**Fonctionnalités** :
- Écouter `currentQuestion` avec `onSnapshot`
- Quand question change :
  - Réinitialiser sélections
  - Afficher nouvelle question
  - Mettre à jour barre progression
  - Réinitialiser état "réponse soumise"

**Test** :
- Rejoindre session
- Prof change question
- Vérifier que l'élève voit la nouvelle question

---

### Étape 3.5 : Implémenter soumission réponse (élève)
**Fichier** : `app.js` + `live.js`
**Durée** : 1.5 heures

**Fonctionnalités** :
- Modifier `validate()` pour détecter mode Live
- Si `App.session.isLiveStudent` :
  - Appeler `LiveManager.submitAnswer()`
  - Désactiver bouton "Valider"
  - Afficher "En attente..."
  - Empêcher changement de réponse

**Test** :
- Rejoindre session
- Sélectionner réponse
- Cliquer "Valider"
- Vérifier soumission dans Firestore
- Vérifier que bouton est désactivé

---

## Phase 4 : Contrôles Professeur (MVP Core)

### Étape 4.1 : Implémenter révélation (prof)
**Fichier** : `live.js` + `ui.js`
**Durée** : 1 heure

**Fonctionnalités** :
- Bouton "Révéler" dans Session Active
- Mettre à jour `remoteControl.action = 'reveal'`
- Élèves écoutent et affichent résultat
- Feedback visuel (flash vert/rouge) pour élèves

**Test** :
- Prof clique "Révéler"
- Vérifier que les élèves voient le résultat

---

### Étape 4.2 : Implémenter question suivante (prof)
**Fichier** : `live.js` + `ui.js`
**Durée** : 1 heure

**Fonctionnalités** :
- Bouton "Question suivante"
- Appeler `LiveManager.nextQuestion()`
- Générer nouvelle question
- Mettre à jour `currentQuestion`

**Test** :
- Prof clique "Question suivante"
- Vérifier que nouvelle question s'affiche pour tous

---

### Étape 4.3 : Implémenter graphique réponses (basique)
**Fichier** : `ui.js`
**Durée** : 1.5 heures

**Fonctionnalités** :
- Écouter `answers` avec `onSnapshot`
- Agrégation côté client (compter par type d'accord)
- Afficher barres horizontales simples (pas Chart.js pour l'instant)
- Format : "Maj7: ████████ 8"

**Test** :
- Plusieurs élèves soumettent réponses
- Vérifier que graphique se met à jour en temps réel

---

## Phase 5 : Télécommande Mobile (Avancé)

### Étape 5.1 : Implémenter génération QR code
**Fichier** : `ui.js` + bibliothèque QR (ex: `qrcode.js`)
**Durée** : 1 heure

**Fonctionnalités** :
- Bouton "📱 Télécommande" dans Session Active
- Générer QR code avec URL : `/live/{code}/remote`
- Afficher modal avec QR code

**Test** : Vérifier que QR code s'affiche et est scannable

---

### Étape 5.2 : Créer route `/live/:code/remote`
**Fichier** : `main.js` ou routeur
**Durée** : 30 minutes

**Fonctionnalités** :
- Détecter URL pattern `/live/:code/remote`
- Extraire code
- Appeler `enterLiveRemoteMode(code)`

**Test** : Ouvrir URL directement, vérifier bascule en mode télécommande

---

### Étape 5.3 : Implémenter interface télécommande mobile
**Fichier** : `ui.js` + `styles.css`
**Durée** : 2 heures

**Fonctionnalités** :
- Fonction `enterLiveRemoteMode(code)`
- Ajouter classe `live-remote-mode` au body
- Afficher accord à jouer (grand format)
- Boutons : "Jouer le son", "Révéler", "Suivant", "Pause"
- Toggle "Mode Silencieux"

**Test** :
- Scanner QR code
- Vérifier que interface télécommande s'affiche
- Vérifier que accord s'affiche

---

### Étape 5.4 : Implémenter synchronisation mobile ↔ desktop
**Fichier** : `live.js`
**Durée** : 2 heures

**Fonctionnalités** :
- `sendRemoteCommand(sessionId, action)` - Envoyer commande depuis mobile
- `listenToRemoteActions(sessionId, callback)` - Écouter commandes sur desktop
- Desktop exécute actions (jouer son, révéler, etc.)

**Test** :
- Mobile envoie commande "play"
- Vérifier que desktop joue le son
- Répéter pour "reveal", "next"

---

### Étape 5.5 : Implémenter mode silencieux
**Fichier** : `live.js` + `ui.js`
**Durée** : 1 heure

**Fonctionnalités** :
- Toggle "Mode Silencieux" sur mobile
- Mettre à jour `settings.silentMode` dans Firestore
- Desktop écoute et affiche "🎹 Mode Piano Live"
- Son désactivé sur desktop si `silentMode = true`

**Test** :
- Activer mode silencieux sur mobile
- Vérifier que desktop affiche indicateur
- Vérifier que son est coupé

---

## Phase 6 : Polish & Optimisations

### Étape 6.1 : Feedback haptique/visuel (élève)
**Fichier** : `ui.js`
**Durée** : 1 heure

**Fonctionnalités** :
- Flash vert/rouge lors révélation
- Vibration (100ms correct, 200ms incorrect)
- Animation transition douce

**Test** : Vérifier feedback lors révélation

---

### Étape 6.2 : Gestion erreurs robuste
**Fichier** : `live.js` + `ui.js`
**Durée** : 2 heures

**Fonctionnalités** :
- Reconnexion automatique si déconnexion
- Messages d'erreur clairs
- Timeout session si prof inactif
- Validation codes invalides

**Test** : Simuler déconnexion, vérifier reconnexion

---

### Étape 6.3 : Graphiques avancés (Chart.js)
**Fichier** : `ui.js` + Chart.js
**Durée** : 2 heures

**Fonctionnalités** :
- Intégrer Chart.js
- Graphique en barres pour réponses
- Graphique en camembert pour répartition
- Mise à jour temps réel

**Test** : Vérifier graphiques avec données réelles

---

### Étape 6.4 : Comparateur A/B
**Fichier** : `ui.js` + `live.js`
**Durée** : 1.5 heures

**Fonctionnalités** :
- Bouton "Comparer A/B" dans Session Active
- Jouer bonne réponse
- Jouer erreur la plus fréquente
- Alterner entre les deux

**Test** : Vérifier comparaison sonore

---

## Ordre d'Implémentation Recommandé

### Sprint 1 (Fondations) - 1 semaine
1. ✅ Phase 0 : Préparation & Infrastructure
2. ✅ Phase 1 : Backend & Synchronisation (Étapes 1.1 à 1.5)

**Objectif** : Avoir un backend fonctionnel, testable depuis la console

---

### Sprint 2 (Interface Prof Desktop) - 1 semaine
3. ✅ Phase 2 : Interface Professeur Desktop (Étapes 2.1 à 2.6)

**Objectif** : Prof peut créer session, voir participants, démarrer, voir réponses

---

### Sprint 3 (Interface Élève) - 1 semaine
4. ✅ Phase 3 : Interface Élève (Étapes 3.1 à 3.5)

**Objectif** : Élève peut rejoindre, voir questions, soumettre réponses

---

### Sprint 4 (Contrôles & Télécommande) - 1 semaine
5. ✅ Phase 4 : Contrôles Professeur (Étapes 4.1 à 4.3)
6. ✅ Phase 5 : Télécommande Mobile (Étapes 5.1 à 5.5)

**Objectif** : Prof peut contrôler depuis desktop ou mobile, mode silencieux

---

### Sprint 5 (Polish) - 1 semaine
7. ✅ Phase 6 : Polish & Optimisations (Étapes 6.1 à 6.4)

**Objectif** : Expérience utilisateur fluide, graphiques, gestion erreurs

---

## Points d'Attention

### Dépendances Critiques
- **Phase 1 doit être complète** avant Phase 2 (backend nécessaire)
- **Phase 2 doit être complète** avant Phase 3 (session doit exister)
- **Phase 3 peut être développée en parallèle** avec Phase 4 (élève et prof indépendants)
- **Phase 5 nécessite Phase 2** (télécommande utilise session existante)

### Tests à Chaque Étape
- Tester manuellement chaque fonctionnalité
- Vérifier Firestore après chaque action
- Tester avec 2 onglets (simuler prof + élève)
- Vérifier synchronisation temps réel

### Risques Identifiés
- **Listeners non détachés** → Fuites mémoire
- **Synchronisation timing** → Race conditions
- **Quota Firestore** → Trop de lectures/écritures
- **Déconnexion réseau** → Perte de synchronisation

---

## Par Où Commencer ?

### 🎯 Recommandation : Commencer par Phase 0 + Phase 1

**Pourquoi** :
1. **Fondations solides** : Backend doit être stable avant UI
2. **Testable rapidement** : Peut tester depuis console avant UI
3. **Dépendances claires** : Toutes les autres phases dépendent de Phase 1
4. **Validation concept** : Vérifier que synchronisation temps réel fonctionne

**Première étape concrète** :
1. Importer `onSnapshot` dans `firebase.js` (5 min)
2. Créer `live.js` avec structure de base (1h)
3. Implémenter `createSession()` et tester depuis console (1h)
4. Implémenter `listenToSession()` et tester (1h)

**Total première session** : ~3 heures pour avoir backend fonctionnel

---

## Checklist de Démarrage

Avant de commencer Phase 1 :
- [ ] Firebase/Firestore configuré et fonctionnel
- [ ] `onSnapshot` importé dans `firebase.js`
- [ ] Règles Firestore préparées (peuvent être ajoutées plus tard)
- [ ] Compréhension de la structure `challenges.js` (pattern similaire)

Prêt à commencer ? 🚀



