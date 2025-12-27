# Règles Firestore pour Harmonist Live

## Instructions

Ces règles doivent être ajoutées dans **Firebase Console** → **Firestore Database** → **Rules**.

## Règles à ajouter

Ajoutez ces règles dans votre fichier de règles Firestore (après les règles existantes pour `challenges`, `users`, etc.) :

```javascript
// --- LIVE SESSIONS (Harmonist Live) ---
match /live_sessions/{sessionId} {
  // Lecture : Tous les utilisateurs authentifiés peuvent lire les sessions
  allow read: if request.auth != null;
  
  // Création : Tous les utilisateurs authentifiés peuvent créer une session
  allow create: if request.auth != null
    && request.resource.data.createdBy == request.auth.uid
    && request.resource.data.keys().hasAll(['code', 'createdBy', 'status', 'createdAt', 'config', 'settings'])
    && request.resource.data.status is string
    && request.resource.data.status in ['waiting', 'active', 'paused', 'finished'];
  
  // Mise à jour : Seulement le créateur (prof) OU la télécommande autorisée
  allow update: if request.auth != null && (
    request.auth.uid == resource.data.createdBy ||
    (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['remoteControl', 'remoteConnected', 'remoteDeviceId']) &&
     request.resource.data.remoteControl != null)
  );
  
  // Suppression : Seulement le créateur
  allow delete: if request.auth != null 
    && request.auth.uid == resource.data.createdBy;
  
  // Sous-collection des réponses des élèves
  match /answers/{studentUid} {
    // Lecture : Seulement le prof (créateur de session)
    allow read: if request.auth != null 
      && get(/databases/$(database)/documents/live_sessions/$(sessionId)).data.createdBy == request.auth.uid;
    
    // Écriture : Seulement l'élève propriétaire
    allow write: if request.auth != null 
      && request.auth.uid == studentUid
      && request.resource.data.keys().hasOnly(['answer', 'timestamp', 'isCorrect'])
      && request.resource.data.answer is map
      && request.resource.data.timestamp is timestamp;
  }
}
```

## Structure des données

### Document `live_sessions/{sessionId}`
- `code`: string (4 lettres majuscules)
- `createdBy`: string (UID du professeur)
- `status`: string ('waiting' | 'active' | 'paused' | 'finished')
- `createdAt`: timestamp
- `config`: map (configuration de la session)
- `settings`: map (paramètres de la session)
- `currentQuestion`: map | null (question actuelle)
- `remoteControl`: map | null (télécommande)
- `remoteConnected`: boolean
- `remoteDeviceId`: string | null

### Sous-collection `live_sessions/{sessionId}/answers/{studentUid}`
- `answer`: map (réponse de l'élève)
- `timestamp`: timestamp
- `isCorrect`: boolean

## Test des règles

Après avoir ajouté les règles :

1. **Publier les règles** dans Firebase Console
2. **Attendre 1-2 minutes** pour la propagation
3. **Tester la création** d'une session depuis l'application
4. **Vérifier dans Firestore Console** que le document est créé

## Dépannage

Si vous obtenez toujours "Missing or insufficient permissions" :

1. Vérifiez que vous êtes bien authentifié (anonyme ou Google)
2. Vérifiez que `request.auth.uid` correspond à `createdBy`
3. Vérifiez que tous les champs requis sont présents dans `sessionData`
4. Vérifiez les logs de la console pour voir les valeurs exactes


