
import { Cloud } from './firebase.js';
import { doc, collection, onSnapshot, updateDoc, serverTimestamp, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Générer un code 4 lettres aléatoire
function generateSessionCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export const LiveManager = {
    active: false,
    sessionId: null,
    sessionCode: null,
    
    // État de la session
    state: {
        status: 'idle', // 'idle' | 'waiting' | 'active' | 'paused' | 'finished'
        currentQuestion: null,
        participants: [],
        answers: {},
        config: null
    },
    
    // Listeners (pour cleanup)
    listeners: {
        session: null,
        answers: null,
        participants: null
    },
    
    // --- CRÉATION DE SESSION ---
    
    async createSession(config = {}) {
        if (this.active) {
            console.warn("⚠️ Session déjà active, cleanup d'abord");
            this.cleanup();
        }
        
        // Générer code unique (4 lettres)
        let code = generateSessionCode();
        let attempts = 0;
        
        // Vérifier que le code n'existe pas déjà (max 10 tentatives)
        while (attempts < 10) {
            const existing = await Cloud.getLiveSession(code);
            if (!existing) break; // Code disponible
            code = generateSessionCode();
            attempts++;
        }
        
        if (attempts >= 10) {
            console.error("❌ Impossible de générer un code unique");
            return null;
        }
        
        // Créer session dans Firestore
        const sessionId = await Cloud.createLiveSession(code, config);
        if (!sessionId) {
            console.error("❌ Erreur lors de la création de la session");
            return null;
        }
        
        this.active = true;
        this.sessionId = sessionId;
        this.sessionCode = code;
        this.state.status = 'waiting';
        this.state.config = config;
        
        console.log("✅ Session Live créée:", code);
        return { sessionId, code };
    },
    
    // --- REJOINDRE SESSION ---
    
    async joinSession(code) {
        if (this.active) {
            console.warn("⚠️ Session déjà active, cleanup d'abord");
            this.cleanup();
        }
        
        const session = await Cloud.getLiveSession(code.toUpperCase());
        if (!session) {
            console.error("❌ Session introuvable:", code);
            return null;
        }
        
        if (session.status === 'finished') {
            console.error("❌ Session terminée");
            return null;
        }
        
        this.active = true;
        this.sessionId = session.id;
        this.sessionCode = code.toUpperCase();
        this.state.status = session.status;
        this.state.config = session.config || {};
        
        console.log("✅ Session Live rejointe:", code);
        return { sessionId: session.id, code: code.toUpperCase() };
    },
    
    // --- LISTENERS TEMPS RÉEL ---
    
    listenToSession(sessionId, callback) {
        if (!sessionId) return null;
        
        // Détacher listener précédent si existe
        if (this.listeners.session) {
            this.listeners.session();
        }
        
        // Accéder à db via Cloud
        const db = Cloud.getDB();
        if (!db) {
            console.error("❌ Firestore db non disponible");
            return null;
        }
        const sessionRef = doc(db, 'live_sessions', sessionId.toUpperCase());
        
        this.listeners.session = onSnapshot(sessionRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                this.state.status = data.status || 'idle';
                this.state.currentQuestion = data.currentQuestion || null;
                
                if (callback) {
                    callback({
                        id: docSnap.id,
                        ...data
                    });
                }
            }
        }, (error) => {
            console.error("❌ Erreur listener session:", error);
        });
        
        return this.listeners.session;
    },
    
    listenToAnswers(sessionId, callback) {
        if (!sessionId) return null;
        
        // Détacher listener précédent si existe
        if (this.listeners.answers) {
            this.listeners.answers();
        }
        
        // Accéder à db via Cloud
        const db = Cloud.getDB();
        if (!db) {
            console.error("❌ Firestore db non disponible");
            return null;
        }
        const answersRef = collection(db, `live_sessions/${sessionId.toUpperCase()}/answers`);
        
        this.listeners.answers = onSnapshot(answersRef, (snapshot) => {
            const answers = {};
            snapshot.forEach(doc => {
                answers[doc.id] = doc.data();
            });
            
            this.state.answers = answers;
            
            if (callback) {
                callback(answers);
            }
        }, (error) => {
            console.error("❌ Erreur listener answers:", error);
        });
        
        return this.listeners.answers;
    },
    
    // --- GESTION DES QUESTIONS ---
    
    async setCurrentQuestion(sessionId, question) {
        if (!sessionId) return false;
        
        const success = await Cloud.updateLiveSession(sessionId, {
            currentQuestion: {
                chord: question.chord,
                step: question.step,
                startTime: serverTimestamp()
            }
        });
        
        if (success) {
            this.state.currentQuestion = question;
            console.log("✅ Question active mise à jour:", question.step);
        }
        
        return success;
    },
    
    async nextQuestion(sessionId, questionGenerator) {
        if (!sessionId) return false;
        
        const currentQ = this.state.currentQuestion;
        const nextStep = currentQ ? currentQ.step + 1 : 1;
        
        // Générer nouvelle question (utiliser questionGenerator si fourni)
        let nextQuestion;
        if (questionGenerator && typeof questionGenerator === 'function') {
            nextQuestion = questionGenerator(nextStep);
        } else {
            // Fallback : question par défaut (sera amélioré plus tard)
            nextQuestion = {
                chord: { type: 'maj7', inv: 0 },
                step: nextStep
            };
        }
        
        return await this.setCurrentQuestion(sessionId, nextQuestion);
    },
    
    // --- SOUMISSION RÉPONSES ---
    
    async submitAnswer(sessionId, studentUid, answer) {
        if (!sessionId || !studentUid || !answer) return false;
        
        const success = await Cloud.submitLiveAnswer(sessionId, studentUid, answer);
        
        if (success) {
            console.log("✅ Réponse soumise:", answer);
        }
        
        return success;
    },
    
    // --- GESTION PARTICIPANTS ---
    
    listenToParticipants(sessionId, callback) {
        if (!sessionId) return null;
        
        // Détacher listener précédent si existe
        if (this.listeners.participants) {
            this.listeners.participants();
        }
        
        // Note: Pour l'instant, on simule avec une sous-collection
        // Plus tard, on pourra créer une vraie sous-collection participants
        // Pour le MVP, on utilise les réponses comme indicateur de participants
        const answersRef = collection(Cloud.getDB(), `live_sessions/${sessionId.toUpperCase()}/answers`);
        
        this.listeners.participants = onSnapshot(answersRef, (snapshot) => {
            const participants = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                participants[doc.id] = {
                    uid: doc.id,
                    pseudo: data.pseudo || 'Élève anonyme',
                    joinedAt: data.timestamp
                };
            });
            
            this.state.participants = participants;
            
            if (callback) {
                callback(participants);
            }
        }, (error) => {
            console.error("❌ Erreur listener participants:", error);
        });
        
        return this.listeners.participants;
    },
    
    async kickParticipant(studentUid) {
        
        if (!this.sessionId || !studentUid) return false;
        
        try {
            const answerRef = doc(Cloud.getDB(), `live_sessions/${this.sessionId.toUpperCase()}/answers`, studentUid);
            await deleteDoc(answerRef);
            console.log("✅ Participant expulsé:", studentUid);
            if (window.UI) window.UI.showToast("Participant expulsé");
            return true;
        } catch (error) {
            console.error("❌ Erreur kick participant:", error);
            return false;
        }
    },
    
    // --- GESTION SESSION ---
    
    async startSession() {
        if (!this.sessionId) {
            console.error("❌ Aucune session active");
            return false;
        }
        
        const success = await Cloud.updateLiveSession(this.sessionId, {
            status: 'active',
            startedAt: serverTimestamp()
        });
        
        if (success) {
            this.state.status = 'active';
            console.log("✅ Session démarrée");
            
            // Générer première question
            await this.generateFirstQuestion();
            
            // Basculer vers onglet Session Active
            if (this.switchTab) {
                this.switchTab('session');
            }
        }
        
        return success;
    },
    
    async stopSession() {
        if (!this.sessionId) return false;
        
        const success = await Cloud.updateLiveSession(this.sessionId, {
            status: 'finished',
            finishedAt: serverTimestamp()
        });
        
        if (success) {
            this.state.status = 'finished';
            console.log("✅ Session arrêtée");
        }
        
        return success;
    },
    
    async pauseSession() {
        if (!this.sessionId) return false;
        
        const success = await Cloud.updateLiveSession(this.sessionId, {
            status: 'paused',
            pausedAt: serverTimestamp()
        });
        
        if (success) {
            this.state.status = 'paused';
            console.log("⏸️ Session en pause");
        }
        
        return success;
    },
    
    // --- ACTIONS SUR QUESTIONS ---
    
    playCurrentChord() {
        
        if (!this.state.currentQuestion || !this.state.currentQuestion.chord) {
            console.warn("⚠️ Aucune question active");
            if (window.UI) window.UI.showToast("Aucune question active");
            return;
        }
        
        const chord = this.state.currentQuestion.chord;
        const App = window.App;
        const DB = window.DB;
        
        if (!DB) {
            console.error("❌ DB n'est pas disponible");
            if (window.UI) window.UI.showToast("Erreur: Base de données non chargée");
            return;
        }
        
        // Trouver l'objet chord complet (DB.chords est défini après loadSet)
        const chordsList = DB.chords || [];
        const chordObj = chordsList.find(c => c.id === chord.type || c.id === chord.id);
        if (!chordObj) {
            console.error("❌ Chord non trouvé:", chord);
            return;
        }
        
        // Générer les notes de l'accord
        const inv = chord.inv !== undefined ? chord.inv : 0;
        let notes;
        
        if (App.getNotes && typeof App.getNotes === 'function') {
            // Utiliser getNotes avec root et open
            const root = chord.root !== undefined ? chord.root : (chord.open ? 36 : 48);
            const open = chord.open !== undefined ? chord.open : false;
            notes = App.getNotes(chordObj, inv, root, open);
        } else if (App.getNotesFromBass && typeof App.getNotesFromBass === 'function' && chord.bass) {
            notes = App.getNotesFromBass(chordObj, inv, chord.bass);
        } else {
            // Fallback : utiliser les notes de base de l'accord
            notes = chordObj.notes || [];
        }
        
        if (notes && notes.length > 0 && window.Audio && window.Audio.chord) {
            window.Audio.chord(notes);
            console.log("🎹 Accord joué:", chordObj.name, "Renversement", inv);
            if (window.UI) window.UI.showToast("🎹 Son joué");
        } else {
            console.error("❌ Impossible de jouer l'accord - notes invalides:", notes);
        }
    },
    
    revealAnswer() {
        
        if (!this.sessionId || !this.state.currentQuestion) {
            console.warn("⚠️ Aucune session ou question active");
            return;
        }
        
        // Mettre à jour la session pour indiquer que la réponse est révélée
        Cloud.updateLiveSession(this.sessionId, {
            'currentQuestion.revealed': true,
            'currentQuestion.revealedAt': serverTimestamp()
        }).then(success => {
            if (success) {
                console.log("👁️ Réponse révélée");
                if (window.UI) window.UI.showToast("👁️ Réponse révélée");
                // Rejouer l'accord pour que tout le monde l'entende
                this.playCurrentChord();
            }
        });
    },
    
    async nextQuestion() {
        
        if (!this.sessionId) {
            console.error("❌ Aucune session active");
            return false;
        }
        
        const currentQ = this.state.currentQuestion;
        const nextStep = currentQ ? (currentQ.step || 0) + 1 : 1;
        
        // Générer nouvelle question
        const nextQuestion = this.generateQuestion(nextStep);
        
        const success = await this.setCurrentQuestion(this.sessionId, nextQuestion);
        
        if (success) {
            // Rejouer automatiquement le nouvel accord
            setTimeout(() => {
                this.playCurrentChord();
            }, 300);
        }
        
        return success;
    },
    
    generateQuestion(step) {
        const App = window.App;
        const DB = window.DB;
        
        if (!App || !DB) {
            // Fallback basique
            return {
                chord: { type: 'maj7', inv: 0 },
                step: step
            };
        }
        
        // --- SÉQUENCE PERSONNALISÉE (comme dans ChallengeManager) ---
        if (this.config && this.config.sequence && Array.isArray(this.config.sequence)) {
            const sequenceIndex = step - 1; // step commence à 1, index à 0
            if (sequenceIndex < this.config.sequence.length) {
                const item = this.config.sequence[sequenceIndex];
                const chordsList = DB.chords || [];
                const typeObj = chordsList.find(c => c.id === item.type);
                if (typeObj) {
                    return {
                        chord: {
                            type: item.type,
                            inv: item.inv !== undefined ? item.inv : 0,
                            bass: item.bass,
                            root: item.root,
                            open: item.open !== undefined ? item.open : false
                        },
                        step: step
                    };
                }
            }
        }
        
        // --- GÉNÉRATION ALÉATOIRE (par défaut) ---
        // Obtenir la liste des accords (DB.chords est défini après loadSet)
        const chordsList = DB.chords || [];
        
        // Utiliser la logique de génération de questions de l'app
        const ac = chordsList.filter(c => App.data.settings.activeC.includes(c.id));
        if (!ac.length) {
            // Si aucun accord actif, utiliser tous les accords
            const type = chordsList[Math.floor(Math.random() * chordsList.length)];
            const invId = Math.floor(Math.random() * 4);
            return {
                chord: { type: type.id, inv: invId },
                step: step
            };
        }
        
        const type = ac[Math.floor(Math.random() * ac.length)];
        let invId = 0;
        
        if (App.data.currentSet === 'laboratory') {
            const ai = DB.currentInvs.filter(i => App.data.settings.activeI.includes(i.id));
            if (ai.length) {
                invId = ai[Math.floor(Math.random() * ai.length)].id;
            }
        } else {
            invId = Math.floor(Math.random() * 4);
        }
        
        // Générer root et open comme dans App.playNew()
        const open = App.data.settings && App.data.settings.open && App.data.currentSet === 'academy';
        const root = (open ? 36 : 48) + Math.floor(Math.random() * 12);
        
        return {
            chord: { 
                type: type.id, 
                inv: invId,
                root: root,
                open: open
            },
            step: step
        };
    },
    
    async generateFirstQuestion() {
        if (!this.sessionId) return false;
        
        const firstQuestion = this.generateQuestion(1);
        return await this.setCurrentQuestion(this.sessionId, firstQuestion);
    },
    
    showRemoteQR() {
        
        if (!this.sessionId || !this.sessionCode) {
            console.warn("⚠️ Aucune session active");
            if (window.UI) window.UI.showToast("Aucune session active");
            return;
        }
        
        // Pour l'instant, afficher une modale simple avec le code
        // Plus tard, on pourra ajouter un vrai QR code
        const url = `${window.location.origin}/live/${this.sessionCode}/remote`;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.zIndex = '10000';
        modal.innerHTML = `
            <div class="modal" style="max-width:400px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h3 style="margin:0; color:var(--primary);">📱 Télécommande Mobile</h3>
                    <span style="cursor:pointer; font-size:1.5rem;" onclick="this.closest('.modal-overlay').remove()">✕</span>
                </div>
                <div style="text-align:center; padding:20px;">
                    <p style="color:var(--text-dim); margin-bottom:20px;">
                        Scannez ce QR code avec votre téléphone ou ouvrez l'URL ci-dessous
                    </p>
                    <div id="liveQRCode" style="background:white; padding:20px; border-radius:12px; margin:20px auto; width:200px; height:200px; display:flex; align-items:center; justify-content:center;">
                        <div style="color:var(--text-dim);">QR Code<br/>(À implémenter)</div>
                    </div>
                    <div style="background:rgba(0,0,0,0.3); border-radius:8px; padding:15px; margin:20px 0;">
                        <div style="font-size:0.9rem; color:var(--text-dim); margin-bottom:5px;">URL de la télécommande</div>
                        <div style="font-family:monospace; color:white; word-break:break-all;">${url}</div>
                        <button class="cmd-btn btn-action" style="width:100%; margin-top:10px;" onclick="navigator.clipboard.writeText('${url}'); window.UI.showToast('URL copiée !');">
                            📋 Copier l'URL
                        </button>
                    </div>
                    <button class="cmd-btn" style="width:100%; margin-top:10px;" onclick="this.closest('.modal-overlay').remove()">
                        Fermer
                    </button>
                </div>
            </div>
        `;
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        document.body.appendChild(modal);
    },
    
    // --- NAVIGATION ONGLETS ---
    
    switchTab(tabName) {
        
        // Mettre à jour les boutons d'onglets
        document.querySelectorAll('.live-tab-btn').forEach(btn => {
            btn.classList.remove('active');
            // Aussi retirer active de lb-period-btn pour être sûr
            if (btn.classList.contains('lb-period-btn')) {
                btn.classList.remove('active');
            }
        });
        
        const activeBtn = Array.from(document.querySelectorAll('.live-tab-btn')).find(btn => {
            const text = btn.textContent.trim();
            if (tabName === 'lobby') return text.includes('Lobby');
            if (tabName === 'session') return text.includes('Session');
            if (tabName === 'history') return text.includes('Historique');
            return false;
        });
        
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Rendre le contenu approprié
        const content = document.getElementById('liveTeacherContent');
        if (!content) {
            console.error('❌ liveTeacherContent not found');
            return;
        }
        
        if (tabName === 'lobby') {
            if (window.UI && window.UI.renderLiveLobby) {
                window.UI.renderLiveLobby();
            } else {
                console.error('❌ renderLiveLobby not found');
            }
        } else if (tabName === 'session') {
            if (window.UI && window.UI.renderLiveSession) {
                window.UI.renderLiveSession();
            } else {
                console.error('❌ renderLiveSession not found');
            }
        } else if (tabName === 'history') {
            if (window.UI && window.UI.renderLiveHistory) {
                window.UI.renderLiveHistory();
            } else {
                console.error('❌ renderLiveHistory not found');
            }
        }
    },
    
    // --- CLEANUP ---
    
    cleanup() {
        // Détacher tous les listeners
        if (this.listeners.session) {
            this.listeners.session();
            this.listeners.session = null;
        }
        if (this.listeners.answers) {
            this.listeners.answers();
            this.listeners.answers = null;
        }
        if (this.listeners.participants) {
            this.listeners.participants();
            this.listeners.participants = null;
        }
        
        // Réinitialiser état
        this.active = false;
        this.sessionId = null;
        this.sessionCode = null;
        this.state = {
            status: 'idle',
            currentQuestion: null,
            participants: [],
            answers: {},
            config: null
        };
        
        console.log("🧹 LiveManager cleanup terminé");
    }
};

