import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInAnonymously, signOut, onAuthStateChanged, GoogleAuthProvider, linkWithPopup, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, deleteDoc, getDoc, collection, addDoc, query, orderBy, limit, getDocs, where, serverTimestamp, runTransaction, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAMA9hH3hjlkjp-a4lpb3Dg9IusUB-AiMQ",
  authDomain: "harmonist-academy.firebaseapp.com",
  projectId: "harmonist-academy",
  storageBucket: "harmonist-academy.appspot.com",
  messagingSenderId: "1095938878602",
  appId: "1:1095938878602:web:1ea75d46f3f5d76d921173"
};

let app, auth, db, provider, userUid = null;
let isSyncDone = false; 

export const Cloud = {
    initialized: false,

    // --- 1. INITIALISATION ---
    async init(onLoginCallback) {
        if (this.initialized) return;

        try {
            if (!app) app = initializeApp(firebaseConfig);
            if (!auth) auth = getAuth(app);
            if (!db) db = getFirestore(app);
            // --- DEBUT AJOUT PERSISTANCE HORS-LIGNE ---
            try {
                // Tente d'activer le cache disque pour les données
                await enableIndexedDbPersistence(db);
                console.log("💾 Persistance Offline activée");
            } catch (err) {
                if (err.code == 'failed-precondition') {
                    console.warn("Persistance échouée (Plusieurs onglets ouverts)");
                } else if (err.code == 'unimplemented') {
                    console.warn("Persistance non supportée par le navigateur");
                }
            }
            // --- FIN AJOUT ---
            if (!provider) provider = new GoogleAuthProvider();

            this.initialized = true;

            onAuthStateChanged(auth, async (user) => {
                isSyncDone = false; 

                if (user) {
                    userUid = user.uid;
                    console.log("🔥 Session :", user.isAnonymous ? "Anonyme" : "Google", userUid);

                    let cloudData = null;
                    if (!user.isAnonymous) {
                        try {
                            const docRef = doc(db, "users", userUid);
                            const docSnap = await getDoc(docRef);
                            if (docSnap.exists()) cloudData = docSnap.data();
                        } catch (e) { console.error("Erreur Cloud:", e); }
                    }

                    if (onLoginCallback) onLoginCallback(user, cloudData);

                    isSyncDone = true; 
                    console.log("✅ Synchro terminée.");

                } else {
                    signInAnonymously(auth).then(() => { isSyncDone = true; }).catch(console.error);
                }
            });

        } catch (e) { console.error("Firebase Init Error:", e); }
    },

    getCurrentUID() { return userUid; },
    get auth() { return auth; },

    // --- 2. SAUVEGARDE ---
    async syncUserStats(appData) { return this.saveUser(appData); },

    async saveUser(appData) {
        if (!userUid || !db) return;
        
        // ANTI-POLLUTION : Pas de sauvegarde Cloud pour les Anonymes
        if (!auth.currentUser || auth.currentUser.isAnonymous) return;

        // VERROU SYNCHRO
        if (!isSyncDone) {
            console.warn("⏳ Sauvegarde bloquée : En attente de synchro Cloud...");
            return;
        }

        const payload = {
            username: appData.username || "Anonyme",
            xp: appData.xp,
            lvl: appData.lvl,
            mastery: appData.mastery,
            badges: appData.badges,
            bestChrono: appData.bestChrono,
            bestSprint: appData.bestSprint,
            bestInverse: appData.bestInverse,
            stats: appData.stats, 
            settings: appData.settings,
            currentSet: appData.currentSet,
            arenaStats: appData.arenaStats,
            lastSync: new Date().toISOString(),
            updatedAt: serverTimestamp()
        };

        try {
            await setDoc(doc(db, "users", userUid), payload, { merge: true });
        } catch (e) { console.error("Save Fail:", e); }
    },

    // --- 3. GESTION COMPTE (Login / Logout / Link) ---

    async logout() {
        if (!auth) return;
        try {
            await signOut(auth);
            userUid = null;
            isSyncDone = false;
            console.log("👋 Déconnexion réussie");
        } catch (e) {
            console.error("Logout Error:", e);
        }
    },

    async linkAccount() {
        if (!auth.currentUser) return { success: false };
        try { return { success: true, user: (await linkWithPopup(auth.currentUser, provider)).user }; } 
        catch (e) { return { success: false, error: e.message }; }
    },

    // LIBÉRATION DU PSEUDO (Pour la transition Anonyme -> Google)
    async releaseUsername(username) {
        if (!username || !db) return;
        const docId = username.trim().toLowerCase();
        
        try {
            // On supprime le document 'usernames/pseudo'
            // Cela fonctionne car on est encore connecté avec le compte qui le possède
            await deleteDoc(doc(db, "usernames", docId));
            console.log("🔓 Pseudo libéré avec succès :", username);
            return true;
        } catch (e) {
            console.warn("Impossible de libérer le pseudo (déjà libre ou permission refusée) :", e);
            return false;
        }
    },

    // LE VRAI LOGIN (Unique et complet)
    async login(localData, oldUid = null) {
        if (!auth) return { success: false, error: "Auth non init" };
        localData = localData || {};

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userRef = doc(db, 'users', user.uid);

            const serverSnap = await getDoc(userRef);
            let cloudData = serverSnap.exists() ? serverSnap.data() : {};

            // FUSION
            const finalData = {
                ...localData,
                ...cloudData,
                xp: Math.max(localData.xp || 0, cloudData.xp || 0),
                lvl: Math.max(localData.lvl || 1, cloudData.lvl || 1),
                mastery: Math.max(localData.mastery || 0, cloudData.mastery || 0),
                badges: [...new Set([...(localData.badges || []), ...(cloudData.badges || [])])],
                username: cloudData.username || localData.username
            };

            // GESTION PSEUDOS (Correctif Transaction Read/Write)
            const oldUsername = localData.username;
            const newUsername = finalData.username;

            await runTransaction(db, async (transaction) => {
                // --- PHASE 1 : TOUTES LES LECTURES D'ABORD ---
                let oldSnap = null;
                let oldNameRef = null;
                
                // Lecture 1 : Ancien pseudo (si pertinent)
                if (oldUsername && oldUsername !== "Élève Anonyme" && oldUsername !== newUsername) {
                    oldNameRef = doc(db, 'usernames', oldUsername.trim().toLowerCase());
                    oldSnap = await transaction.get(oldNameRef);
                }

                // Lecture 2 : Nouveau pseudo (si pertinent)
                let newSnap = null;
                let newNameRef = null;
                if (newUsername && newUsername !== "Élève Anonyme") {
                    newNameRef = doc(db, 'usernames', newUsername.trim().toLowerCase());
                    newSnap = await transaction.get(newNameRef);
                }

                // --- PHASE 2 : LOGIQUE & ÉCRITURES ---
                
                // A. Suppression de l'ancien (Nettoyage Zombie)
                if (oldSnap && oldSnap.exists()) {
                    const info = oldSnap.data();
                    // On supprime SEULEMENT si ça appartenait à mon ancien UID invité
                    if (oldUid && info.uid === oldUid) {
                        transaction.delete(oldNameRef); 
                    }
                }

                // B. Réservation du nouveau
                if (newNameRef) {
                    let canTake = false;
                    if (!newSnap || !newSnap.exists()) canTake = true;
                    else {
                        const info = newSnap.data();
                        // C'est à moi (via oldUid ou currentUid) ou c'est périmé
                        if ((oldUid && info.uid === oldUid) || info.uid === user.uid) canTake = true;
                        else if (info.expiresAt && info.expiresAt.toDate() < new Date()) canTake = true;
                    }

                    if (canTake) {
                        transaction.set(newNameRef, { 
                            uid: user.uid, 
                            original: newUsername, 
                            expiresAt: null, // À vie pour le compte Google
                            updatedAt: serverTimestamp() 
                        });
                    } else {
                         // Fallback si pris : on force le nom Google dans l'objet final (pas dans la DB usernames)
                         if (finalData.username === localData.username) {
                             finalData.username = user.displayName || "Harmoniste";
                         }
                    }
                }
            });

            // Sauvegarde finale du profil utilisateur
            await setDoc(userRef, finalData, { merge: true });
            return { success: true, user: user, data: finalData };

        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, error: error.message };
        }
    },

    async assignUsername(newUsername, oldUsername = null) {
        const currentUser = auth.currentUser;
        if (!currentUser || !db) return false;
        
        const uid = currentUser.uid;
        const cleanNew = newUsername.trim().toLowerCase();
        const displayNew = newUsername.trim();

        if (oldUsername && cleanNew === oldUsername.trim().toLowerCase()) return true;
        if (cleanNew.length < 3) return false;

        const newNameRef = doc(db, 'usernames', cleanNew);
        const userRef = doc(db, 'users', uid);
        const expirationDate = currentUser.isAnonymous 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
            : null;

        try {
            await runTransaction(db, async (transaction) => {
                const nameSnap = await transaction.get(newNameRef);
                if (nameSnap.exists()) {
                    const data = nameSnap.data();
                    if (data.uid !== uid && (!data.expiresAt || data.expiresAt.toDate() > new Date())) {
                        throw "Ce pseudo est déjà pris.";
                    }
                }

                if (oldUsername && oldUsername !== "Élève Anonyme") {
                    const cleanOld = oldUsername.trim().toLowerCase();
                    const oldNameRef = doc(db, 'usernames', cleanOld);
                    const oldSnap = await transaction.get(oldNameRef);
                    if (oldSnap.exists() && oldSnap.data().uid === uid) {
                        transaction.delete(oldNameRef);
                    }
                }

                transaction.set(newNameRef, { 
                    uid: uid, original: displayNew, expiresAt: expirationDate, updatedAt: serverTimestamp()
                });

                if (!currentUser.isAnonymous) {
                    transaction.set(userRef, { username: displayNew }, { merge: true });
                }
            });
            return true;
        } catch (e) {
            console.error("Erreur Pseudo:", e);
            window.UI.showToast(typeof e === 'string' ? e : "Erreur technique");
            return false;
        }
    },

    // --- 4. LEADERBOARDS & CHALLENGES (Identique ancien code) ---
    async submitScore(mode, score, username, mastery) {
        if (!userUid || !db || score <= 0) return;
        const payload = { uid: userUid, pseudo: username || "Anonyme", score: score, mastery: mastery, timestamp: new Date().toISOString() };
        try {
            const scoreRef = doc(db, `leaderboards/${mode}/scores`, userUid);
            const snap = await getDoc(scoreRef);
            if (snap.exists()) {
                if (score > snap.data().score) await setDoc(scoreRef, payload);
                else if (snap.data().pseudo !== username) await setDoc(scoreRef, { pseudo: username }, { merge: true });
            } else { await setDoc(scoreRef, payload); }
        } catch (e) { console.error("Score Submit Fail:", e); }
    },

    async getLeaderboard(mode, period = 'weekly') {
        if (!db) return [];
        try {
            const ref = collection(db, `leaderboards/${mode}/scores`);
            const q = query(ref, orderBy("score", "desc"), limit(50));
            const snap = await getDocs(q);
            const results = []; const seenUsers = new Set();
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            snap.forEach(d => {
                const data = d.data(); const key = data.uid || data.pseudo;
                if (seenUsers.has(key)) return;
                if(period === 'weekly' && new Date(data.timestamp) < sevenDaysAgo) return;
                results.push(data); seenUsers.add(key);
            });
            return results.slice(0, 20);
        } catch (e) { return []; }
    },

    async createChallenge(data) {
        if (!userUid || !db) return null;
        try {
            const docId = data.seed.toUpperCase();
            const docRef = doc(db, "challenges", docId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) return null;
            await setDoc(docRef, { ...data, seed: docId, creatorUid: userUid, created_at: serverTimestamp() });
            return docId;
        } catch (e) { return null; }
    },

    async getChallenge(id) {
        if (!db) return null;
        try {
            const snap = await getDoc(doc(db, "challenges", id.toUpperCase()));
            return snap.exists() ? { id: snap.id, ...snap.data() } : null;
        } catch (e) { return null; }
    },

    async submitChallengeScore(challengeId, scoreData) {
        // FIX: Vérifier que userUid est bien défini et égal à auth.currentUser.uid
        const currentUser = auth?.currentUser;
        if (!currentUser || !userUid || !db) {
            console.warn("submitChallengeScore: Missing auth or userUid", { hasAuth: !!currentUser, hasUserUid: !!userUid, hasDb: !!db });
            return;
        }
        
        // FIX: S'assurer que userUid correspond bien à l'utilisateur connecté
        if (userUid !== currentUser.uid) {
            console.warn("submitChallengeScore: userUid mismatch", { userUid, currentUid: currentUser.uid });
            userUid = currentUser.uid; // Corriger userUid si nécessaire
        }
        
        try {
            const docId = `${challengeId.toUpperCase()}_${userUid}`;
            // FIX: Utiliser collection() puis doc() pour les sous-collections
            const scoreRef = doc(collection(db, `challenges/${challengeId.toUpperCase()}/scores`), docId);
            const snap = await getDoc(scoreRef);
            
            // FIX: S'assurer que uid est bien inclus dans les données et que tous les champs requis sont présents
            const payload = { 
                uid: userUid, 
                ...scoreData, 
                timestamp: serverTimestamp() 
            };
            
            // Log pour debug
            console.log("Submitting challenge score:", { 
                challengeId: challengeId.toUpperCase(), 
                docId, 
                payload: { ...payload, timestamp: 'serverTimestamp' },
                note: payload.note,
                score: payload.score,
                total: payload.total,
                uid: payload.uid,
                authUid: currentUser.uid
            });
            
            // Vérifier que les données respectent les règles Firestore
            if (payload.note < 0 || payload.note > 50) {
                console.error("Invalid note value:", payload.note);
                return;
            }
            if (payload.score >= 1000) {
                console.error("Score too high:", payload.score);
                return;
            }
            if (payload.uid !== currentUser.uid) {
                console.error("UID mismatch:", { payloadUid: payload.uid, authUid: currentUser.uid });
                return;
            }
            
            if (snap.exists()) {
                const old = snap.data();
                if (scoreData.note > old.note || (scoreData.note === old.note && scoreData.time < old.time)) {
                    await setDoc(scoreRef, payload);
                    console.log("Challenge score updated successfully");
                } else if (old.pseudo !== scoreData.pseudo) {
                    await setDoc(scoreRef, { pseudo: scoreData.pseudo }, { merge: true });
                    console.log("Challenge score pseudo updated");
                } else {
                    console.log("Challenge score not updated (no improvement)");
                }
            } else {
                await setDoc(scoreRef, payload);
                console.log("Challenge score created successfully");
            }
        } catch (e) { 
            console.error("Challenge Submit Fail", e);
            // Log détaillé pour debug
            console.error("Details:", { 
                challengeId, 
                userUid, 
                scoreData, 
                currentUserUid: currentUser?.uid,
                errorCode: e?.code,
                errorMessage: e?.message
            });
        }
    },

    async getChallengeLeaderboard(challengeId) {
        if (!db) return [];
        try {
            const q = query(collection(db, `challenges/${challengeId.toUpperCase()}/scores`), orderBy("note", "desc"), limit(50));
            const snap = await getDocs(q);
            const results = []; snap.forEach(d => results.push(d.data()));
            return results.sort((a, b) => (b.note !== a.note) ? b.note - a.note : a.time - b.time);
        } catch (e) { return []; }
    },

    getDailyChallengeID() { return `DAILY-${new Date().toISOString().split('T')[0]}`; },
};