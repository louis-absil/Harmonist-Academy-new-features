

import { DB, BADGES, COACH_DB } from './data.js';
import { Audio, Piano } from './audio.js';
import { UI } from './ui.js';
import { Cloud } from './firebase.js';
import { ChallengeManager } from './challenges.js';

export const App = {
    isResetting: false,
    data: { 
        username: "Élève Anonyme", 
        xp:0, lvl:1, next:100, mastery:0, currentSet: 'academy',
        bestChrono:0, bestSprint:0, bestInverse:0,
        stats:{
            c:{}, i:{}, v:{}, l:{}, 
            totalPlayed: 0, 
            combos: [], 
            modesPlayed: [], 
            str_jazz: 0, str_007: 0, str_dim: 0, str_inv: 0
        }, 
        // V5.2 - STATS ARENE
        arenaStats: {
            lastDailyDate: null,
            currentStreak: 0,
            maxStreak: 0,
            totalScore: 0,
            challengesCreated: 0,
            bestDailyScore: 0, // Pourcentage maximum atteint en défi (ex: 0.45 pour 9/20)
            podiumDates: [] // Stocke les dates des podiums (ex: ['DAILY-2023-10-27'])
        },
        badges: [], 
        settings: { activeC: DB.sets.academy.chords.map(c=>c.id), activeI: DB.invs.map(i=>i.id) },
        history: [], tempToday: { date: null, ok: 0, tot: 0 }
    },
    session: { 
        mode:'zen', time:60, lives:3, chord:null, selC:null, selI:null, done:false, 
        zenCounter: 0,
        hint:false, score:0, streak:0, globalOk:0, globalTot:0, 
        quizOptions:[], quizCorrectIdx:0, quizUserChoice:null, 
        currentSprintTime: 10, roundLocked: false,
        startTime: 0, cleanStreak: 0, openStreak: 0, fullConfigStreak: 0, fastStreak: 0, lowLifeRecovery: false, lastActionTime: 0,
        replayCount: 0, djClickTimes: [], selectionHistory: [], prevChordHash: null,
        str36Streak: 0, str45Streak: 0, geoStreak: 0, triStreak: 0, rootlessStreak: 0, monoStreak: 0, dejaVu: false,
        audioStartTime: 0, lastReactionTime: Infinity, hasReplayed: false, pureStreak: 0, razorTriggered: false,
        titleClicks: 0, lastChordType: null, jackpotStreak: 0, collectedRoots: null,
        isChallenge: false,
        isNavigating: false,
        // ÉTAT CHALLENGE TEMPORAIRE (Pour Badges de Rang Passifs)
        challengeRank: null, challengeTotalPlayers: 0, challengeNetTime: 0,
        // ÉTAT STUDIO (V5.1)
        studio: {
            chordId: 'maj7',
            invId: 0,
            bassMidi: 48, // C3
            octaveShift: 0,
            sequence: [] // [ { type:'maj7', inv:0, bass:48 }, ... ]
        }
    },
    timerRef: null, sprintRef: null, vignetteRef: null,
    
    // Wrapper RNG pour permettre l'injection de Seed par ChallengeManager
    rng() { return Math.random(); },

    onUserLogin(user) {
        // Logique optionnelle au login
        console.log("User logged in:", user.uid);
    },

    init() {
                // Initialisation Cloud avec Callback de mise à jour
        Cloud.init((user, cloudData) => {
            // 1. On injecte l'utilisateur dans l'App
            // App.onUserLogin(user); 

            if (cloudData) {
                // 2. Si on a des données, on les charge
                App.syncFromCloud(cloudData);

                // 3. CORRECTIF AFFICHAGE XP :
                // On utilise updateHeader qui gère l'XP, le Niveau et le Pseudo
                if (window.UI) {
                    window.UI.updateHeader(); 
                    window.UI.renderBadges();
                }
            }

            // 4. CORRECTIF MODALE :
            // Si la modale paramètres est ouverte, on la redessine pour afficher "Certifié"
            if (window.UI && document.getElementById('settingsModal')?.classList.contains('open')) {
                window.UI.renderSettings();
            }
        });
        ChallengeManager.checkRescue(); 

        try {
            const s = JSON.parse(localStorage.getItem('harmonist_v6_data') || '{}');
            if(s.xp !== undefined) { 
                this.data.username = s.username || "Élève Anonyme";
                this.data.xp = s.xp || 0;
                this.data.lvl = s.lvl || 1;
                this.data.next = s.next || 100;
                this.data.badges = s.badges || [];
                this.data.bestChrono = s.bestChrono || 0;
                this.data.bestSprint = s.bestSprint || 0;
                this.data.bestInverse = s.bestInverse || 0;
                this.data.history = s.history || [];
                this.data.mastery = s.mastery !== undefined ? s.mastery : 0;
                this.data.currentSet = s.currentSet || 'academy';
                this.data.stats.totalPlayed = s.stats?.totalPlayed || 0;
                this.data.stats.c = s.stats?.c || {};
                this.data.stats.i = s.stats?.i || {};
                this.data.stats.v = s.stats?.v || {}; 
                this.data.stats.l = s.stats?.l || {}; 
                this.data.stats.combos = s.stats?.combos || [];
                this.data.stats.modesPlayed = s.stats?.modesPlayed || [];
                this.data.stats.str_jazz = s.stats?.str_jazz || 0;
                this.data.stats.str_007 = s.stats?.str_007 || 0;
                this.data.stats.str_dim = s.stats?.str_dim || 0;
                this.data.stats.str_inv = s.stats?.str_inv || 0;
                
                // V5.2 Migration ArenaStats + Podium
                this.data.arenaStats = s.arenaStats || {
                    lastDailyDate: null,
                    currentStreak: 0,
                    maxStreak: 0,
                    totalScore: 0,
                    challengesCreated: 0,
                    bestDailyScore: 0,
                    podiumDates: []
                };
                // Safety migration
                if(!this.data.arenaStats.podiumDates) this.data.arenaStats.podiumDates = [];
                if(this.data.arenaStats.bestDailyScore === undefined) this.data.arenaStats.bestDailyScore = 0;
                
                if(s.settings && s.settings.activeC) { this.data.settings = s.settings; }
            }
        } catch (e) { console.error("Save Corrupted, resetting", e); }

        const todayStr = new Date().toLocaleDateString('fr-FR', {day: 'numeric', month: 'numeric'});
        if(this.data.tempToday.date !== todayStr) { this.data.tempToday = { date: todayStr, ok: 0, tot: 0 }; }
        
        // On ne charge pas le set par défaut si une restauration de défi est en cours
        if(!this.session.isChallenge) {
            this.loadSet(this.data.currentSet, true);
        }
        
        this.calcGlobalStats(); 
        window.UI.renderBoard(); 
        window.UI.updateHeader();
        window.UI.updateModeLocks();
        Piano.init(); 
        // --- AJOUT : LANCEMENT AUTO DU TUTORIEL ---
        // --- LANCEMENT AUTO DU WALKTHROUGH ---
        // On change la clé pour forcer le redémarrage du tuto V5.4 pour tout le monde
        if (!localStorage.getItem('tuto_seen_v5.4')) {
            setTimeout(() => {
                window.UI.startWalkthrough();
            }, 1000);
        }
        // --- V6.0 IDENTITY CHECK ---
        // On attend que Firebase s'initialise (2s) pour vérifier si le pseudo local est valide
        setTimeout(() => {
            this.checkIdentity();
        }, 2000);
        
        // --- AJOUT : SENTINELLES DE SAUVEGARDE (Smart Sync) ---
        // 1. Mobile : Quand l'utilisateur change d'app ou va à l'écran d'accueil
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.triggerSave("Minimisation App"); // CORRIGÉ (C'était forceCloudSave)
            }
        });

        // 2. Desktop : Quand l'utilisateur ferme l'onglet ou le navigateur
        window.addEventListener('beforeunload', () => {
            this.triggerSave("Fermeture Onglet"); // CORRIGÉ
        });
        
        // 3. Mobile (Safari iOS) : Sécurité supplémentaire
        window.addEventListener('pagehide', () => {
            this.triggerSave("Page Hide"); // CORRIGÉ
        });
    },

        // Dans app.js, ajoutez ceci dans l'objet App :
    onUserLogin(user) {
        console.log("Utilisateur connecté :", user.uid);
        // Vous pouvez ajouter ici des analytics si besoin
    },

    saveUser() {
        if (!this.data) return;
        const saveData = {
            data: this.data,
            settings: this.session.settings
            // Ajoute d'autres propriétés si nécessaire selon ta structure
        };
        localStorage.setItem('harmonist_save', JSON.stringify(saveData));
        console.log('💾 Sauvegarde effectuée');
    },

    async setUsername(val) {
        if(!val || val.length < 2) return;
        const requestedName = val.trim().substring(0, 15);
        
        // --- MODIFICATION ICI : Capture de l'ancien nom ---
        const oldName = this.data.username; 
        
        window.UI.showToast("Vérification du pseudo...");
        
        // On passe l'ancien nom à Firebase pour qu'il puisse le supprimer
        const result = await Cloud.assignUsername(requestedName, oldName);

        // 2. Normalisation du résultat
        // Cette ligne est LA clé : elle accepte soit un booléen (mon fix), soit un objet (ton ancien système)
        const isSuccess = (result === true) || (result && result.success === true);

        // 3. Traitement
        if (isSuccess) {
            // --- SUCCÈS ---
            this.data.username = requestedName;
            this.saveData(); 

            // Gestion des messages spécifiques (Compatibilité future)
            if (result.status === 'ZOMBIE_CLAIMED') {
                window.UI.showToast("♻️ Pseudo inactif récupéré !");
            } else if (result.status === 'OFFLINE_PASS') {
                window.UI.showToast("⚠️ Hors-ligne : Pseudo temporaire");
            } else {
                // Cas standard (le booléen true tombe ici)
                window.UI.showToast("✅ Pseudo enregistré !");
            }
            
            window.UI.updateHeader(); 
            
            // On s'assure que l'input affiche bien la valeur validée
            const input = document.getElementById('usernameInput');
            if(input) input.value = requestedName;

        } else {
            // --- ÉCHEC ---
            console.error("Erreur setUsername:", result); 

            // Note : firebase.js affiche déjà le Toast d'erreur technique (ex: "Pseudo pris")
            // Mais on peut gérer les cas spécifiques si l'objet result contient des détails
            if (result.reason === 'TAKEN_VERIFIED') {
                window.UI.showToast("⛔ Ce pseudo appartient à un membre certifié.");
            } else if (result.reason === 'TAKEN_ACTIVE') {
                window.UI.showToast("⛔ Ce pseudo est déjà pris.");
            }
            
            // ACTION CRITIQUE : On remet l'ancien pseudo dans l'input
            // car le changement a été refusé.
            const input = document.getElementById('usernameInput');
            if(input) {
                input.value = this.data.username;
                // Petit feedback visuel rouge sur la bordure
                input.style.borderColor = "var(--error)";
                setTimeout(() => input.style.borderColor = "var(--panel-border)", 1000);
            }
        }
    },

// --- V6.0 MÉTHODES D'IDENTITÉ ---

    // Appelé au démarrage pour vérifier les conflits "Legacy"
    async checkIdentity() {
        const currentName = this.data.username;
        if (currentName === "Élève Anonyme") return; // On s'en fiche du par défaut

        // On tente de réserver notre PROPRE nom actuel
        const result = await Cloud.assignUsername(currentName);

        // Si le serveur dit "Non, c'est pris par quelqu'un d'autre (actif)"
        // C'est que nous sommes dans un conflit Legacy (un imposteur local)
        if (!result.success && (result.reason === 'TAKEN_ACTIVE' || result.reason === 'TAKEN_VERIFIED')) {
            const newName = `${currentName}#${Math.floor(Math.random() * 9999)}`;
            console.warn(`Conflit de pseudo détecté. Renommage : ${newName}`);
            
            this.data.username = newName;
            this.saveData();
            window.UI.updateHeader();
            
            // Notification explicative
            setTimeout(() => {
                alert(`Mise à jour V6.0 Identity :\n\nLe pseudo "${currentName}" est déjà réservé par un autre élève.\n\nVotre pseudo a été ajusté en "${newName}".\nVous pourrez le changer dans les paramètres.`);
            }, 1000);
        } 
        else if (result.success) {
            console.log("Identité vérifiée :", result.status);
        }
    },

    // Appelé par le bouton "Sauvegarder ma progression"
    async secureAccount() {
        if (!confirm("Voulez-vous lier ce profil à votre compte Google pour ne jamais perdre votre progression ?")) return;

        const result = await Cloud.linkAccount();
        
        if (result.success) {
            window.UI.showToast("🎉 Compte sécurisé avec succès !");
            window.UI.showToast(`Bienvenue, ${result.user.displayName || 'Membre Certifié'}`);
            
            // On re-confirme le pseudo pour passer le statut à 'verified' dans la base
            await Cloud.assignUsername(this.data.username);
            
            // --- AJOUT CRUCIAL ICI ---
            // 3. On force la sauvegarde de TOUTES les données locales (XP, lvl...) vers le nouveau compte Cloud
            // Sinon le compte Cloud reste vide !
            if (Cloud.saveUser) {
                await Cloud.saveUser(this.data);
                console.log("Sauvegarde initiale forcée vers le Cloud.");
            }
            // -------------------------
            
            // Rafraîchir l'interface des paramètres
            window.UI.renderSettings();
        } else {
            alert("Erreur lors de la liaison : " + result.error);
        }
    },

    // Appelé par le bouton "Déjà un compte ?"
    async signIn() {
        const confirmMsg = "ATTENTION :\n\nVous allez vous connecter à un compte existant.\nLa progression actuelle (Invité) sera remplacée par celle de votre sauvegarde Cloud.\n\nContinuer ?";
        
        if (!confirm(confirmMsg)) return;

        const result = await Cloud.login();
        
        if (result.success) {
            window.UI.showToast(`Bon retour, ${result.user.displayName.split(' ')[0]} !`);
            // On recharge la page pour être sûr de charger proprement toutes les données du compte
            setTimeout(() => window.location.reload(), 1000);
        } else {
            alert("Erreur de connexion : " + result.error);
        }
    },

    // --- LOGIQUE PROGRESSION ARENE ---
    // Appelé par ChallengeManager.finish()
    updateArenaStats(score, total) {
        if(total <= 0) return;
        const ratio = score / total;
        
        // Mise à jour du meilleur score perso (pour l'affichage "Record Perso")
        if (ratio > this.data.arenaStats.bestDailyScore) {
            this.data.arenaStats.bestDailyScore = ratio;
        }
    },

    // Appelé par UI.js pour savoir quoi afficher (En progrès / Record / En Hausse)
    getProgressionStatus(score, total) {
        const ratio = score / total;
        
        // 1. Est-ce un Record Personnel ? (Même si c'est nul, si c'est mieux qu'avant, c'est un record)
        // On compare avec le bestDailyScore stocké. Si c'est >= (car on vient potentiellement de le mettre à jour), c'est un record.
        // Attention : Si c'est la toute première partie (best=0), on considère ça comme un record pour encourager.
        const currentBest = this.data.arenaStats.bestDailyScore;
        // On ajoute une marge d'erreur pour les flottants, ou on compare strictement si on vient de le set.
        // Si le ratio actuel est >= au record stocké (qui a pu être mis à jour il y a une milliseconde), c'est un PB.
        if (ratio >= currentBest && currentBest > 0) return 'best';

        // 2. Est-ce une tendance à la hausse ? (Moyenne des 5 derniers jours vs Aujourd'hui)
        if (this.data.history.length >= 3) {
            let sumPct = 0;
            this.data.history.forEach(h => {
                if(h.tot > 0) sumPct += (h.ok / h.tot);
            });
            const avgPct = sumPct / this.data.history.length;
            
            // Si on performe 10% mieux que sa moyenne habituelle
            if (ratio > (avgPct * 1.1)) return 'trend';
        }

        return 'steady'; // "En progrès" par défaut
    },

    isLocked(id) {
        // BYPASS: En mode Challenge, tous les accords sont débloqués pour l'examen
        if(this.session.isChallenge) return false;
        
        const c = DB.chords.find(x => x.id === id);
        if(!c) return false;
        if(this.data.currentSet === 'jazz' && this.data.mastery === 1) return (c.unlockLvl && c.unlockLvl > this.data.lvl);
        if(this.data.currentSet === 'laboratory' && this.data.mastery <= 2) return (c.unlockLvl && c.unlockLvl > this.data.lvl);
        return false;
    },

    loadSet(setName, silent = false) {
        if(!DB.sets[setName]) setName = 'academy';
        this.data.currentSet = setName;
        DB.chords = DB.sets[setName].chords;
        
        if(DB.sets[setName].mode === 'jazz') { DB.currentInvs = DB.voicings; document.getElementById('invPanelLabel').innerText = "Voicing (Texture)"; } 
        else if (DB.sets[setName].mode === 'lab') { DB.currentInvs = []; document.getElementById('invPanelLabel').innerText = "Configuration"; } 
        else { DB.currentInvs = DB.invs; document.getElementById('invPanelLabel').innerText = "Renversement"; }
        
        const validIds = DB.chords.map(c => c.id);
        const hasInvalid = this.data.settings.activeC.some(id => !validIds.includes(id));
        if(hasInvalid || this.data.settings.activeC.length === 0) { this.data.settings.activeC = validIds; }
        
        if(this.data.currentSet === 'laboratory') { this.data.settings.activeI = [0,1,2,3]; } 
        else { const validInvIds = DB.currentInvs.map(i => i.id); this.data.settings.activeI = validInvIds; }

        this.data.settings.activeC = this.data.settings.activeC.filter(id => !this.isLocked(id));
        if(this.data.settings.activeC.length === 0) { const available = DB.chords.find(c => !this.isLocked(c.id)); if(available) this.data.settings.activeC = [available.id]; }

        if(!silent) {
            this.saveData(); window.UI.renderBoard(); window.UI.renderSettings(); this.resetRound(true); this.playNew(); window.UI.showToast(`Ambiance : ${DB.sets[setName].name}`);
        }
    },

    calcGlobalStats() { let ok=0, tot=0; for(let k in this.data.stats.c) { ok+=this.data.stats.c[k].ok; tot+=this.data.stats.c[k].tot; } this.session.globalOk = ok; this.session.globalTot = tot; },

    getDifficultyMultiplier() {
        const activeC = this.data.settings.activeC.length; const activeI = this.data.settings.activeI.length; const maxC = DB.chords.length;
        if(this.data.currentSet === 'academy' && activeC === 1 && this.data.settings.activeC[0] === 'dim7') return 0; 
        if (activeC === 1 && activeI === 1) return 0;
        if ((activeC * activeI) <= 4) return 0.2;
        if (activeC === maxC && activeI === 1) return 0.75;
        return 1.0;
    },

    passMastery() {
        if(this.data.lvl < 20) return;
        if(confirm("Félicitations ! Vous allez valider ce niveau de Maîtrise.\n\nVotre Niveau reviendra à 1, mais vous gagnerez une Étoile et conserverez vos stats et badges.\n\nContinuer ?")) {
            this.data.mastery++; this.data.lvl = 1; this.data.xp = 0; this.data.next = 100;
            this.data.settings.activeC = this.data.settings.activeC.filter(id => !this.isLocked(id));
            if(this.data.settings.activeC.length === 0) { const available = DB.chords.find(c => !this.isLocked(c.id)); if(available) this.data.settings.activeC = [available.id]; }
            this.saveData(); window.UI.closeModals(); window.UI.renderBoard(); window.UI.updateHeader(); Audio.sfx('prestige'); window.UI.confetti(); setTimeout(() => window.UI.confetti(), 500); setTimeout(() => window.UI.confetti(), 1000); window.UI.showToast(`✨ Maîtrise ${this.data.mastery} atteinte !`); window.UI.showToast(`Nouveau contenu disponible dans les paramètres !`); window.UI.updateModeLocks(); 
            
            // Hook : Vérifier si un tutoriel de maîtrise doit s'afficher
            setTimeout(() => {
                const moduleId = window.UI.checkTutorialTriggers({ type: 'masteryUnlock' });
                if (moduleId) {
                    window.UI.startTutorialModule(moduleId);
                }
            }, 2000);
            
            setTimeout(() => { this.playNew(); }, 4000);
        }
    },

    setMode(m) {
        if(this.session.isChallenge && m !== 'zen' && m !== 'studio') {
            return;
        } 

        if(this.data.mastery === 0) {
            if(m === 'inverse' && this.data.lvl < 3) { window.UI.showToast("🔒 Débloqué au Niveau 3"); window.UI.vibrate([50,50]); return; }
            if(m === 'chrono' && this.data.lvl < 8) { window.UI.showToast("🔒 Débloqué au Niveau 8"); window.UI.vibrate([50,50]); return; }
            if(m === 'sprint' && this.data.lvl < 12) { window.UI.showToast("🔒 Débloqué au Niveau 12"); window.UI.vibrate([50,50]); return; }
        }
        
        // Hook : Vérifier si un mode vient d'être débloqué pour la première fois
        if (m !== 'zen' && m !== 'studio') {
            // Vérifier si c'est la première fois qu'on utilise ce mode après déblocage
            const modeKey = `tuto_mode_${m}_used`;
            const wasUsed = localStorage.getItem(modeKey) === 'true';
            if (!wasUsed) {
                localStorage.setItem(modeKey, 'true');
                setTimeout(() => {
                    const moduleId = window.UI.checkTutorialTriggers({ type: 'modeUnlock', mode: m });
                    if (moduleId) {
                        window.UI.startTutorialModule(moduleId);
                    }
                }, 500);
            }
        }
        
        if(Audio.ctx && Audio.ctx.state === 'suspended') Audio.ctx.resume();
        Audio.init();
        // Ne pas jouer de son pour les modes chrono et sprint qui perturbent l'écoute
        if (m !== 'chrono' && m !== 'sprint') {
            Audio.sfx('mode_switch');
        }
        this.session.mode = m;
        document.getElementById('modeZen').className = m==='zen'?'mode-opt active':'mode-opt';
        document.getElementById('modeChrono').className = m==='chrono'?'mode-opt active':'mode-opt';
        document.getElementById('modeSprint').className = m==='sprint'?'mode-opt active':'mode-opt';
        document.getElementById('modeInverse').className = m==='inverse'?'mode-opt active':'mode-opt';
        window.UI.updateModeLocks();
        
        const chronoDisplay = document.getElementById('chronoDisplay');
        if (chronoDisplay) chronoDisplay.style.display = (m==='chrono' || m==='sprint') ?'block':'none';
        const timerVal = document.getElementById('timerVal');
        if (timerVal) timerVal.style.display = (m === 'sprint') ? 'none' : 'inline';
        document.getElementById('toolsBar').className = (m==='sprint') ? 'tools-bar sprint-active' : 'tools-bar';
        
        // Mode Studio UI Toggle
        const studioPanel = document.getElementById('studioPanel');
        const playBtn = document.getElementById('playBtn');
        const replayBtn = document.getElementById('replayBtn');
        const valBtn = document.getElementById('valBtn');

        if(m === 'studio') {
            if (studioPanel) studioPanel.style.display = 'flex';
            const chronoDisplay = document.getElementById('chronoDisplay');
            if (chronoDisplay) chronoDisplay.style.display = 'none';
            const scoreGroup = document.getElementById('scoreGroup');
            if (scoreGroup) scoreGroup.classList.remove('active');
            
            // REAFFECTATION DES BOUTONS POUR LE STUDIO
            valBtn.innerText = "+ Ajouter";
            valBtn.disabled = false;
            
            playBtn.innerHTML = "<span class='icon-lg'>🚪</span><span>Quitter</span>";
            playBtn.disabled = false;
            playBtn.onclick = () => window.App.setMode('zen');
            playBtn.style.borderColor = "var(--error)"; 

            replayBtn.innerHTML = "<span class='icon-lg'>💾</span><span>Créer</span>";
            replayBtn.disabled = false;
            replayBtn.onclick = () => window.App.exportStudioChallenge();
            
            // Init Studio Defaults if first time
            if(!this.session.studio.chordId) {
                this.session.studio.chordId = this.data.settings.activeC[0];
                this.session.studio.invId = 0;
                this.session.studio.bassMidi = 48; // C3
            }
            // Update Visuals
            window.UI.renderSel(); 
            this.renderStudioTimeline();
        } else {
            if (studioPanel) studioPanel.style.display = 'none';
            // Restauration des fonctions par défaut des boutons
            playBtn.onclick = () => window.App.playNew();
            playBtn.innerHTML = "<span class='icon-lg'>▶</span><span>Écouter</span>";
            playBtn.style.borderColor = "";
            replayBtn.onclick = () => window.App.replay();
            replayBtn.innerHTML = "<span class='icon-lg'>↺</span><span>Rejouer</span>";
        }

        if(m !== 'zen' && m !== 'studio' && !this.session.isChallenge) { document.getElementById('scoreGroup').classList.add('active'); let best = 0; if(m === 'chrono') best = this.data.bestChrono; if(m === 'sprint') best = this.data.bestSprint; if(m === 'inverse') best = this.data.bestInverse; document.getElementById('highScoreVal').innerText = best; } else { if (!this.session.isChallenge) document.getElementById('scoreGroup').classList.remove('active'); }
        
        const mainArea = document.getElementById('mainArea'); const appContainer = document.querySelector('.app-container');
        if(m === 'inverse') { 
            if (mainArea) mainArea.classList.add('quiz-mode'); 
            if (appContainer) appContainer.classList.add('quiz-mode'); 
            const panelChord = document.getElementById('panelChord');
            const invPanel = document.getElementById('invPanel');
            const quizArea = document.getElementById('quizArea');
            if (panelChord) panelChord.style.display = 'none'; 
            if (invPanel) invPanel.style.display = 'none'; 
            if (quizArea) quizArea.style.display = 'flex'; 
        } else { 
            if (mainArea) mainArea.classList.remove('quiz-mode'); 
            if (appContainer) appContainer.classList.remove('quiz-mode'); 
            const panelChord = document.getElementById('panelChord');
            const invPanel = document.getElementById('invPanel');
            const quizArea = document.getElementById('quizArea');
            if (panelChord) panelChord.style.display = 'flex'; 
            if (invPanel) invPanel.style.display = 'flex'; 
            if (quizArea) quizArea.style.display = 'none'; 
        }
        this.resetRound(true);
        if(m === 'inverse') this.playNewQuiz(); else if (m !== 'studio') this.playNew();
    },

    toggleSetting(type, id) {
        if (this.session.isChallenge) { window.UI.showToast("🔒 Réglages verrouillés pendant le défi"); return; }

        if(type === 'c' && this.isLocked(id)) { const chord = DB.chords.find(c => c.id === id); window.UI.showToast(`🔒 Débloqué au Niveau ${chord.unlockLvl}`); window.UI.vibrate([50,50]); return; }
        const list = type === 'c' ? this.data.settings.activeC : this.data.settings.activeI;
        const idx = list.indexOf(id);
        if (idx > -1) { 
            // Sécurité : Empêcher de désactiver le dernier élément
            if (list.length > 1) {
                list.splice(idx, 1); 
            } else {
                window.UI.showToast("⚠️ Il faut garder au moins 1 choix !");
                return;
            }
        } else { 
            if(this.data.currentSet === 'jazz' && list.length >= 6) { window.UI.showToast("⚠️ Max 6 accords actifs"); return; } 
            list.push(id); 
        }
        this.saveData(); window.UI.renderBoard(); window.UI.renderSettings(); window.UI.updateHeader(); 
    },

    async hardReset() { 
        if(!confirm("☢️ RESET D'USINE ☢️\n\nCela va :\n1. Supprimer votre pseudo du Cloud\n2. Effacer les données locales\n3. Vous déconnecter\n\nL'application redémarrera à zéro.")) return;

        // 1. ON ACTIVE LE BOUCLIER (Anti-sauvegarde)
        this.isResetting = true; 

        // On tue les timers
        if (this.cloudSaveTimer) { clearTimeout(this.cloudSaveTimer); this.cloudSaveTimer = null; }
        if (this.timerRef) clearInterval(this.timerRef);

        console.log("💀 Démarrage du nettoyage...");
        window.UI.showToast("♻️ Libération du pseudo et nettoyage...");

        // --- AJOUT : 2. LIBÉRATION DU PSEUDO (Pendant qu'on est encore connecté) ---
        // On ne le fait que si on a un vrai pseudo et qu'on est connecté
        if (typeof Cloud !== 'undefined' && Cloud.auth.currentUser) {
            const currentName = this.data.username;
            if (currentName && currentName !== "Élève Anonyme") {
                try {
                    console.log(`🗑️ Libération du pseudo : ${currentName}`);
                    await Cloud.releaseUsername(currentName);
                } catch (e) {
                    console.warn("Erreur libération pseudo (peut-être déjà libre) :", e);
                }
            }
        }
        // ---------------------------------------------------------------------------

        // 3. DÉCONNEXION FIREBASE
        if (typeof Cloud !== 'undefined' && Cloud.auth) {
            try { await Cloud.logout(); } catch (e) { console.warn(e); }
        }

        // 4. VIDAGE COMPLET DONNÉES
        localStorage.clear(); 

        // 5. SUPPRESSION INDEXEDDB (Persistence Firebase)
        if (window.indexedDB && window.indexedDB.databases) {
            try {
                const dbs = await window.indexedDB.databases();
                for (const db of dbs) {
                    window.indexedDB.deleteDatabase(db.name);
                }
            } catch (e) {}
        }

        // 6. SUPPRESSION CACHE & SERVICE WORKER
        if ('caches' in window) {
            try {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
            } catch (e) {}
        }
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                await registration.unregister();
            }
        }

        // 7. LA RUSE DU CHANGEMENT D'URL (Pour éviter le cache zombie)
        setTimeout(() => {
            window.location.replace(window.location.pathname + '?reset_t=' + Date.now());
        }, 500);
    },


    // Sauvegarde Locale (Ultra rapide - Appelé à chaque point)
    saveData() {
        // --- BLOCAGE DE SÉCURITÉ ---
        // Si on est en train de reset, INTERDICTION d'écrire quoi que ce soit !
        if (this.isResetting) {
            console.log("🛑 Sauvegarde bloquée (Reset en cours)");
            return;
        }
        // ---------------------------
        if(!this.data) return;
        try {
            localStorage.setItem('harmonist_v6_data', JSON.stringify(this.data));
            
            // DÉCLENCHEMENT SAUVEGARDE CLOUD (Si connecté)
            if (Cloud.auth && Cloud.auth.currentUser) {
                this.triggerCloudSave();
            }
        } catch(e) {
            console.warn("Local Save Error", e);
        }
    },

    // --- NOUVEAU SYSTÈME DE SAUVEGARDE (Debounce) ---
    cloudSaveTimer: null,

    // DANS app.js

    triggerCloudSave(immediate = false) {
        // --- AJOUT SÉCURITÉ CRITIQUE ---
        // Si on est en train de reset, on annule TOUT (même les timers en cours)
        if (this.isResetting) {
            if (this.cloudSaveTimer) clearTimeout(this.cloudSaveTimer);
            return;
        }
        // -------------------------------

        const user = Cloud.auth.currentUser;

        // --- ANTI-POLLUTION (FILTRE CRITIQUE) ---
        // Si Invité (Anonyme) ou pas connecté :
        // 1. On sécurise les données en LOCAL (au cas où)
        // 2. On COUPE l'accès au Cloud (return) pour ne pas polluer la base 'users'
        if (!user || user.isAnonymous) {
            console.log("💾 Sauvegarde Locale (Invité)");
            try {
                localStorage.setItem('harmonist_v6_data', JSON.stringify(this.data));
            } catch (e) { console.warn("Erreur quota localStorage", e); }
            return; 
        }

        // --- SYNCHRO CLOUD (Membres Uniquement) ---
        
        // Cas 1 : Sauvegarde Immédiate (Fermeture, Level Up...)
        if (immediate) {
            if (this.cloudSaveTimer) clearTimeout(this.cloudSaveTimer);
            // On met à jour le timestamp
            this.data.lastSave = Date.now();
            // On envoie
            Cloud.saveUser(this.data); 
            return;
        }

        // Cas 2 : Sauvegarde Temporisée (Debounce 5s)
        if (this.cloudSaveTimer) return;

        this.cloudSaveTimer = setTimeout(() => {
            this.data.lastSave = Date.now();
            Cloud.saveUser(this.data);
            this.cloudSaveTimer = null;
        }, 5000); 
    },

    // // Sauvegarde Cloud (Appelé uniquement à la fermeture/minimisation)
    // forceCloudSave(reason = "Unknown") {
    //     if (Cloud && Cloud.auth && Cloud.auth.currentUser) {
    //         // On utilise sendBeacon si possible (plus fiable lors d'une fermeture)
    //         // Mais comme on passe par Firestore SDK, on fait un appel standard
    //         console.log(`☁️ Sauvegarde Cloud déclenchée (${reason})...`);
    //         Cloud.saveUser(this.data).catch(e => console.error("Cloud Fail:", e));
    //     }
    // },

    // Nouvelle fonction appelée automatiquement par UI.closeModals()
    onSettingsClosed() {
        // 1. Sauvegarde
        Cloud.syncUserStats(this.data); 

        // 2. LOGIQUE INTELLIGENTE (Accords + Renversements)
        const currentChord = this.session.chord;
        
        if (currentChord) {
            // A. Vérifie si le TYPE d'accord (ex: 'maj7') est toujours coché
            const isChordValid = this.data.settings.activeC.includes(currentChord.type.id);
            
            // B. Vérifie si le RENVERSEMENT (ex: 0, 1, 2...) est toujours coché
            // Note : currentChord.inv est l'index du renversement (0, 1, 2, 3)
            const isInvValid = this.data.settings.activeI.includes(currentChord.inv);

            // CONDITION STRICTE : Les deux doivent être vrais
            if (isChordValid && isInvValid) {
                // CAS A : Tout est valide -> On garde le tour en cours
                window.UI.renderBoard();
                window.UI.renderSel(); 
            } else {
                // CAS B : Soit l'accord, soit le renversement est interdit -> Nouvelle donne
                this.playNew();
                window.UI.showToast("Paramètres changés : Nouvelle donne !");
            }
        } else {
            // Pas de session -> on lance
            this.playNew();
        }
    },

    resetRound(full=false) {
        if(this.timerRef) { clearInterval(this.timerRef); this.timerRef = null; }
        if(this.sprintRef) { clearInterval(this.sprintRef); this.sprintRef = null; }
        if(this.vignetteRef) { clearTimeout(this.vignetteRef); this.vignetteRef = null; }
        document.getElementById('vignette').className = 'vignette-overlay';
        window.UI.updateBackground(0);
        if(full) { 
            this.session.score=0; this.session.streak=0; 
            this.session.cleanStreak=0; this.session.openStreak=0; 
            this.session.fullConfigStreak=0; this.session.fastStreak=0;
            this.session.lowLifeRecovery = false;
            this.session.startTime = Date.now();
            this.session.pureStreak = 0; this.session.titleClicks = 0;
            this.session.lastChordType = null; this.session.jackpotStreak = 0;
            this.session.collectedRoots = new Set();
            this.session.challengeRank = null;
            this.session.challengeTotalPlayers = 0;
            this.session.challengeNetTime = 0;
            this.session.prevChordHash = null; // FIX BADGE DEJA VU
        }
        this.session.time = 60; this.session.lives = 3; this.session.done = false; 
        this.session.roundLocked = false; this.session.chord = null;
        this.session.quizUserChoice = null; this.session.lastActionTime = Date.now();
        this.session.audioStartTime = Date.now(); this.session.hint = false;
        this.session.hasReplayed = false; this.session.razorTriggered = false;
        window.UI.resetVisuals(); window.UI.updateHeader(); window.UI.updateChrono(); 
        
        if (this.session.mode !== 'studio') {
            window.UI.msg("Prêt ?");
            const playBtn = document.getElementById('playBtn');
            const valBtn = document.getElementById('valBtn');
            const hintBtn = document.getElementById('hintBtn');
            if (playBtn) playBtn.innerHTML = "<span class='icon-lg'>▶</span><span>Écouter</span>";
            if (valBtn) {
                // FIX: Utiliser innerHTML pour être cohérent avec handleAnswer() qui utilise innerHTML
                valBtn.innerHTML = "Valider"; 
                valBtn.classList.remove('next'); 
                valBtn.disabled = true;
            }
            if (hintBtn) {
                hintBtn.disabled = false; 
                hintBtn.style.opacity = '1';
            }
        } else {
             window.UI.msg("Mode Studio");
             // En mode studio, on ne reset pas les boutons car setMode l'a fait
             document.getElementById('valBtn').disabled = false;
        }
    },

    clickTitle() { this.session.titleClicks = (this.session.titleClicks || 0) + 1; window.UI.vibrate(20); this.checkBadges(); },

    getNotes(type, invId, root, open, contextSet = null) {
        const currentSet = contextSet || this.data.currentSet;
        if(currentSet === 'laboratory') {
            let intervals = [];
            if(type && type.configs && type.configs[invId]) { intervals = type.configs[invId].iv; } else { intervals = [0, 4, 7]; }
            return intervals.map(i => root + i);
        }
        if(currentSet === 'jazz') {
            let notes = type.iv.map(x => root + x); 
            if(invId === 1) { if(notes.length >= 4) { const dropped = notes[notes.length - 2] - 12; notes.splice(notes.length - 2, 1); notes.push(dropped); notes.sort((a,b)=>a-b); } }
            else if(invId === 2) { const shell = [notes[0], notes[1]]; if(notes.length > 3) shell.push(notes[3]); else if(notes.length > 2) shell.push(notes[2]); notes = shell; }
            else if(invId === 3) { notes.shift(); }
            return notes;
        }
        let notes = type.iv.map(x => root + x);
        for(let i=0; i<invId; i++) notes.push(notes.shift() + 12);
        if(open) { const b = notes[0]; const r = notes.slice(1); r[0]+=12; if(this.rng()>0.5) r[1]+=12; r[2]+=12; notes = [b, ...r]; }
        return notes;
    },

    // --- STUDIO PHASE 2 LOGIC ---
    getNotesFromBass(typeObj, invId, targetBassMidi) {
        const draftNotes = this.getNotes(typeObj, invId, 60, false);
        const draftBass = Math.min(...draftNotes);
        const shift = targetBassMidi - draftBass;
        return draftNotes.map(n => n + shift);
    },

    updateStudioState(type, id) {
        if(type === 'c') this.session.studio.chordId = id;
        if(type === 'i') this.session.studio.invId = id;
        window.UI.renderSel();
        this.playStudioPreview();
    },

    setStudioBass(noteIndex) {
        const octaveBase = 36 + this.session.studio.octaveShift; // Default C2 (36)
        const targetMidi = octaveBase + noteIndex;
        this.session.studio.bassMidi = targetMidi;
        
        document.querySelectorAll('.piano-key').forEach((k, idx) => {
             if(idx === noteIndex) k.classList.add('selected');
             else k.classList.remove('selected');
        });
        
        this.playStudioPreview();
    },

    adjStudioOct(delta) {
        this.session.studio.octaveShift += delta;
        if (this.session.studio.octaveShift < 0) this.session.studio.octaveShift = 0;
        if (this.session.studio.octaveShift > 24) this.session.studio.octaveShift = 24;
        const currentKeyIdx = this.session.studio.bassMidi % 12;
        this.setStudioBass(currentKeyIdx);
    },

    playStudioPreview() {
        const s = this.session.studio;
        const typeObj = DB.chords.find(c => c.id === s.chordId);
        if(!typeObj) return;
        const notes = this.getNotesFromBass(typeObj, s.invId, s.bassMidi);
        Audio.chord(notes);
        if(Piano) Piano.visualize(notes);
    },

    addToTimeline() {
        const s = this.session.studio;
        if(!s.chordId) return;
        
        // Store minimal data to reconstruct
        const item = { type: s.chordId, inv: s.invId, bass: s.bassMidi };
        s.sequence.push(item);
        
        window.UI.vibrate(20);
        window.UI.showToast("Accord ajouté !");
        this.renderStudioTimeline();
    },

    removeFromTimeline(index) {
        this.session.studio.sequence.splice(index, 1);
        this.renderStudioTimeline();
    },

    renderStudioTimeline() {
        const container = document.getElementById('studioTimeline');
        const seq = this.session.studio.sequence;
        if(seq.length === 0) {
            container.innerHTML = '<div class="timeline-placeholder">Timeline vide...</div>';
            return;
        }
        
        container.innerHTML = seq.map((item, idx) => {
            const chordObj = DB.chords.find(c => c.id === item.type);
            const invObj = DB.invs.find(i => i.id === item.inv);
            const name = chordObj ? chordObj.name : '?';
            const bassNote = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][item.bass % 12];
            const oct = Math.floor(item.bass / 12) - 1;
            
            return `
                <div class="timeline-item" onclick="window.App.previewTimelineItem(${idx})">
                    <span style="color:var(--gold); font-weight:900;">${idx+1}.</span>
                    <span>${bassNote}${oct} ${name}</span>
                    <span class="timeline-item-del" onclick="event.stopPropagation(); window.App.removeFromTimeline(${idx})">×</span>
                </div>
            `;
        }).join('');
        
        // Auto scroll to end
        container.scrollLeft = container.scrollWidth;
    },

    previewTimelineItem(idx) {
        const item = this.session.studio.sequence[idx];
        if(!item) return;
        const typeObj = DB.chords.find(c => c.id === item.type);
        const notes = this.getNotesFromBass(typeObj, item.inv, item.bass);
        Audio.chord(notes);
    },

    async exportStudioChallenge() {
        const seq = this.session.studio.sequence;
        if(seq.length < 5) {
            alert("La séquence doit contenir au moins 5 accords.");
            return;
        }
        
        const seedName = prompt("Nommez votre défi (ex: JAZZ-EXAM-1) :");
        if(!seedName) return;
        
        const finalSeed = seedName.toUpperCase().replace(/[^A-Z0-9-]/g, '');
        
        const data = {
            seed: finalSeed,
            length: seq.length,
            sequence: seq, // STORE SEQUENCE
            settings: {
                set: this.data.currentSet,
                activeC: this.data.settings.activeC,
                activeI: this.data.settings.activeI
            }
        };
        
        const id = await Cloud.createChallenge(data);
        if(id) {
            // V5.2 - Increment Challenges Created
            this.data.arenaStats.challengesCreated++;
            this.saveData();
            this.checkBadges();

            alert(`Défi créé avec succès !\nCode : ${id}`);
            // Reset Studio
            this.session.studio.sequence = [];
            this.renderStudioTimeline();
        } else {
            alert("Erreur : Ce nom de défi existe peut-être déjà.");
        }
    },
    // ----------------------------

    startSprintTimer(duration) {
        if(this.sprintRef) clearTimeout(this.sprintRef);
        if(this.vignetteRef) clearTimeout(this.vignetteRef);
        document.getElementById('vignette').className = 'vignette-overlay';
        const fill = document.getElementById('sprintFill');
        fill.style.transition = 'none'; fill.style.transform = 'scaleX(1)'; fill.className = 'sprint-bar-fill';
        if(duration > 7) fill.classList.add('easy'); else if(duration > 5) fill.classList.add('med'); else fill.classList.add('hard');
        void fill.offsetWidth; fill.style.transition = `transform ${duration}s linear`; fill.style.transform = 'scaleX(0)';
        const stressTime = duration * 0.7;
        this.vignetteRef = setTimeout(() => { if(!this.session.done) document.getElementById('vignette').classList.add('stress'); }, stressTime * 1000);
        this.sprintRef = setTimeout(() => { if(!this.session.done) { this.handleSprintFail(); } }, duration * 1000);
    },

    handleSprintFail() {
        if(this.session.roundLocked) return; 
        this.session.done = true; this.session.roundLocked = true; this.session.streak = 0; this.session.lives--;
        window.UI.updateBackground(0); window.UI.updateChrono(); Audio.sfx('lose'); window.UI.vibrate(300);
        const c = this.session.chord; const isDim = c.type.id === 'dim7';
        let invName = ""; if (this.data.currentSet === 'laboratory') { invName = c.type.configs[c.inv].name; } else if (!isDim) { invName = DB.currentInvs[c.inv].name; }
        window.UI.msg(`Raté : ${c.type.sub} ${invName}`, false);
        document.getElementById('vignette').className = 'vignette-overlay';
        document.getElementById('c-'+c.type.id).classList.add('correction'); if(c.type.id !== 'dim7') document.getElementById('i-'+c.inv).classList.add('correction');
        if(this.session.lives <= 0) { this.gameOver(); } 
        else { document.getElementById('valBtn').innerText = "Suivant"; document.getElementById('valBtn').classList.add('next'); document.getElementById('valBtn').disabled = false; document.getElementById('playBtn').innerHTML = "<span class='icon-lg'>▶</span><span>Suivant</span>"; document.getElementById('playBtn').disabled = false; }
    },
    
    generateQuizOption() {
        const activeC = DB.chords.filter(c => this.data.settings.activeC.includes(c.id));
        const type = activeC[Math.floor(this.rng() * activeC.length)];
        let invId = 0;
        if(this.data.currentSet === 'laboratory') {
            const availableInvs = this.data.settings.activeI.filter(idx => type.configs[idx]);
            if(availableInvs.length === 0) return { type, inv: 0 };
            invId = availableInvs[Math.floor(this.rng()*availableInvs.length)];
        } else {
            const ai = DB.currentInvs.filter(i => this.data.settings.activeI.includes(i.id));
            if(ai.length === 0) return { type, inv: 0 };
            const invObj = ai[Math.floor(this.rng()*ai.length)];
            invId = invObj.id;
            if(type.id === 'dim7' && this.data.currentSet !== 'jazz') invId = 0;
        }
        if(this.data.currentSet === 'laboratory' && !type.configs) return this.generateQuizOption();
        return { type, inv: invId };
    },

    getNotesWithFixedBass(type, inv, fixedBass) {
        let tempNotes = this.getNotes(type, inv, 0, false);
        let minInterval = Math.min(...tempNotes);
        let effectiveRoot = fixedBass - minInterval;
        return this.getNotes(type, inv, effectiveRoot, false);
    },

    playNewQuiz() {
        Audio.init(); if(!DB.chords.length) { this.loadSet('academy'); return; }
        this.session.done = false; this.session.roundLocked = false; this.session.quizUserChoice = null; this.session.hint = false;
        window.UI.resetVisuals(); this.session.lastActionTime = Date.now();
        
        const opts = []; let safeguard = 0;
        while(opts.length < 3 && safeguard < 100) {
            safeguard++; const candidate = this.generateQuizOption();
            const exists = opts.some(o => o.type.id === candidate.type.id && o.inv === candidate.inv);
            if(!exists) opts.push(candidate);
        }
        const fixedBass = 60 + Math.floor(this.rng() * 5); 
        this.session.quizOptions = opts.map(o => {
            const notes = this.getNotesWithFixedBass(o.type, o.inv, fixedBass);
            return { ...o, notes: notes, label: (this.data.currentSet === 'laboratory') ? o.type.configs[o.inv].name : o.type.name };
        });
        
        const correctIdx = Math.floor(this.rng() * opts.length);
        this.session.quizCorrectIdx = correctIdx;
        const target = this.session.quizOptions[correctIdx];
        if (!target) { 
            this.playNewQuiz(); 
            return; 
        }
        this.session.chord = { ...target, root: fixedBass }; 
        window.UI.renderQuizOptions(this.session.quizOptions, target); window.UI.msg("Quel est ce son ?", "");
        document.getElementById('playBtn').disabled = true; document.getElementById('replayBtn').disabled = true; document.getElementById('hintBtn').disabled = false;
        document.getElementById('valBtn').innerText = "Valider"; document.getElementById('valBtn').className = "cmd-btn btn-action"; document.getElementById('valBtn').disabled = true;
        document.getElementById('playBtn').innerHTML = "<span class='icon-lg'>...</span><span>En cours</span>";
        this.session.hasReplayed = false;
    },

    selectQuiz(idx) {
        const opt = this.session.quizOptions[idx]; if(!opt) return;
        Audio.chord(opt.notes);
        const btn = document.getElementById(`qbtn-${idx}`); if(btn) { btn.classList.add('playing'); setTimeout(() => btn.classList.remove('playing'), 200); }
        if(this.session.done) return; 
        window.UI.vibrate(10); this.session.quizUserChoice = idx;
        window.UI.updateQuizSelection(idx); document.getElementById('valBtn').disabled = false;
    },

    playNew() {
        Audio.init(); if (!DB.chords.length) { this.loadSet(this.data.currentSet); return; }
        
        if(this.sprintRef) { clearTimeout(this.sprintRef); this.sprintRef = null; }
        if(this.vignetteRef) { clearTimeout(this.vignetteRef); this.vignetteRef = null; }
        document.getElementById('sprintFill').style.transition = 'none'; document.getElementById('sprintFill').style.transform = 'scaleX(1)'; document.getElementById('vignette').className = 'vignette-overlay';
        if(this.session.mode === 'chrono' && !this.timerRef && !this.session.chord) {
            this.timerRef = setInterval(() => { this.session.time--; window.UI.updateChrono(); if(this.session.time <= 0) { clearInterval(this.timerRef); this.timerRef = null; this.gameOver(); } }, 1000);
        }
        this.session.done = false; this.session.roundLocked = false; this.session.selC = null; this.session.selI = null; this.session.hint = false; 
        window.UI.resetVisuals(); 
        // FIX: Réinitialiser visuellement les sélections pour éviter qu'elles restent affichées
        window.UI.renderSel();
        this.session.lastActionTime = Date.now(); this.session.replayCount = 0; this.session.djClickTimes = []; this.session.selectionHistory = []; this.session.hasReplayed = false;

        // --- CORRECTIF : AFFICHER LA BARRE EN MODE DÉFI ---
        if (this.session.isChallenge && window.UI && ChallengeManager.active) {
            // if(window.UI.updateChallengeProgress) {
            //     // On met à jour la barre immédiatement (Step 0 pour la Q1, etc.)
            //     window.UI.updateChallengeProgress(ChallengeManager.state.step, ChallengeManager.config.length);
            // }
        }
        // --------------------------------------------------

        // --- CUSTOM CHALLENGE SEQUENCE OVERRIDE ---
        if(this.session.isChallenge && ChallengeManager.config.sequence) {
            const step = ChallengeManager.state.step;
            if(step < ChallengeManager.config.sequence.length) {
                const item = ChallengeManager.config.sequence[step];
                const typeObj = DB.chords.find(c => c.id === item.type);
                if(typeObj) {
                    const notes = this.getNotesFromBass(typeObj, item.inv, item.bass);
                    this.session.chord = { type: typeObj, inv: item.inv, notes: notes, root: notes[0], open: false }; // open false for custom
                    
                    Audio.chord(notes);
                    this.session.audioStartTime = Date.now();
                    
                    window.UI.msg("Écoute...", "");
                    document.getElementById('playBtn').disabled = true; document.getElementById('replayBtn').disabled = false; document.getElementById('hintBtn').disabled = false;
                    document.getElementById('valBtn').innerText = "Valider"; document.getElementById('valBtn').className = "cmd-btn btn-action"; document.getElementById('valBtn').disabled = true;
                    setTimeout(() => { document.getElementById('playBtn').innerHTML = "<span class='icon-lg'>...</span><span>En cours</span>"; }, 500);
                    return;
                }
            }
        }
        // ------------------------------------------

        const ac = DB.chords.filter(c => this.data.settings.activeC.includes(c.id));
        if(!ac.length) { this.data.settings.activeC = DB.chords.map(c=>c.id); this.playNew(); return; }
        
        const type = ac[Math.floor(this.rng() * ac.length)];
        // FIX JACKPOT: Removed logic from here
        
        let invId = 0;
        if(this.data.currentSet === 'laboratory') {
            const availableInvs = this.data.settings.activeI.filter(idx => type.configs[idx]);
            if(availableInvs.length === 0) { this.data.settings.activeI = [0,1,2,3]; invId = 0; } else { invId = availableInvs[Math.floor(this.rng()*availableInvs.length)]; }
        } else {
            const ai = DB.currentInvs.filter(i => this.data.settings.activeI.includes(i.id));
            if(!ai.length) { this.data.settings.activeI = DB.currentInvs.map(i=>i.id); this.playNew(); return; }
            const invObj = ai[Math.floor(this.rng()*ai.length)];
            invId = invObj.id;
            if(type.id === 'dim7' && this.data.currentSet !== 'jazz') invId = 0;
        }
        
        const open = document.getElementById('toggleOpen').checked && this.data.currentSet === 'academy';
        const root = (open ? 36 : 48) + Math.floor(this.rng()*12);
        try {
            const notes = this.getNotes(type, invId, root, open);
            this.session.chord = { type, inv: invId, notes, root, open };
            Audio.chord(notes); this.session.audioStartTime = Date.now();
            if(this.data.currentSet === 'jazz' && invId === 3) { const bassFreq = 440 * Math.pow(2, (root - 69) / 12); Audio.playPureTone(bassFreq, Audio.ctx.currentTime, 1.5, 'sine'); Audio.playPureTone(bassFreq/2, Audio.ctx.currentTime, 1.5, 'sine'); }
        } catch (e) { console.error("Audio Gen Error", e); }

        window.UI.msg("Écoute...", "");
        document.getElementById('playBtn').disabled = true; document.getElementById('replayBtn').disabled = false; document.getElementById('hintBtn').disabled = false;
        document.getElementById('valBtn').innerText = "Valider"; document.getElementById('valBtn').className = "cmd-btn btn-action"; document.getElementById('valBtn').disabled = true;
        setTimeout(() => { document.getElementById('playBtn').innerHTML = "<span class='icon-lg'>...</span><span>En cours</span>"; }, 500);
        
        if(this.session.mode === 'sprint') {
            const reduction = this.session.streak * 0.25;
            const duration = Math.max(3.5, 10 - reduction);
            this.session.currentSprintTime = duration;
            this.startSprintTimer(duration);
        }
        
        if(this.data.settings.activeC.length === 1) { this.select('c', this.data.settings.activeC[0]); }
        if(this.data.currentSet !== 'laboratory' && this.data.settings.activeI.length === 1) { this.select('i', this.data.settings.activeI[0]); }
    },

    hint() { if(this.session.chord) { Audio.chord(this.session.chord.notes, true); if(!this.session.done) { this.session.hint = true; window.UI.msg("Indice utilisé"); } else { if(Piano) Piano.visualize(this.session.chord.notes); } } },
    
    replay() { 
        if(this.session.chord) { 
            // 1. Logique existante (Stats & Badge DJ)
            this.session.replayCount++; 
            this.session.hasReplayed = true; 
            const now = Date.now(); 
            this.session.djClickTimes.push(now); 
            this.session.djClickTimes = this.session.djClickTimes.filter(t => now - t <= 5000); 
            
            // 2. Jouer le son (Code existant)
            Audio.chord(this.session.chord.notes); 

            // --- 3. AJOUT : RAPPEL VISUEL EN MODE DÉFI ---
            if (this.session.isChallenge && window.ChallengeManager && window.UI && window.UI.showToast) {
                const cm = window.ChallengeManager;
                // Affiche "Rappel : Question 2 / 20"
                window.UI.showToast(`Rappel : Question ${cm.state.step + 1} / ${cm.config.length}`);
            }
            // ---------------------------------------------

            // 4. Visualisation (Code existant)
            if(this.session.done && window.Piano) Piano.visualize(this.session.chord.notes); 
        } 
    },

    preview(typeStr, id) {
        if(!this.session.chord) return;
        let targetTypeId = (typeStr === 'c') ? id : this.session.chord.type.id;
        let targetInvId = (typeStr === 'i') ? id : this.session.chord.inv;
        let targetType = DB.chords.find(c => c.id === targetTypeId); if(!targetType) return;
        if(targetTypeId === 'dim7' && this.data.currentSet !== 'jazz') targetInvId = 0;
        
        // REFACTORING V5.1 : Utilisation de getNotesFromBass
        const refBass = Math.min(...this.session.chord.notes);
        const finalNotes = this.getNotesFromBass(targetType, targetInvId, refBass);
        
        Audio.chord(finalNotes);
        const elId = (typeStr === 'c') ? 'c-' + id : 'i-' + id;
        const el = document.getElementById(elId); if(el) { el.classList.add('playing'); setTimeout(() => el.classList.remove('playing'), 200); }
    },

    select(type, id) {
        window.UI.vibrate(10);
        
        // HOOK STUDIO V5.1
        if(this.session.mode === 'studio') {
            this.updateStudioState(type, id);
            return;
        }

        if(this.session.done) { this.preview(type, id); return; }
        if(type === 'c') {
            this.session.selC = id; this.session.selectionHistory.push(id);
            const isDim = (id === 'dim7' && this.data.currentSet !== 'jazz');
            const p = document.getElementById('invPanel'); if(p) { p.style.opacity = isDim ? '0.3' : '1'; p.style.pointerEvents = isDim ? 'none' : 'auto'; }
            if(isDim) this.session.selI = -1; else if(this.session.selI === -1) this.session.selI = null;
            if(this.data.currentSet === 'laboratory') { window.UI.renderBoard(); }
        } else { this.session.selI = id; }
        window.UI.renderSel();
    },

    async handleMain() { 
         if(this.session.done) { 
             
             // --- FIX 4 & 7 : NAVIGATION DÉFI & DEBOUNCE ---
             if (this.session.isChallenge) {
                 // Si on est déjà en train de changer de question, on ne fait rien (Anti-Spam)
                 if (this.session.isNavigating) return;
                 this.session.isNavigating = true;
                 
                 // 2. Logique Suivante (Charge le son, change l'index)
                 ChallengeManager.nextStep();
                 
                 // 3. On déverrouille
                 this.session.isNavigating = false;
                 return;
             }

             // FIX: Si on n'est plus en mode défi mais que done est encore true, on réinitialise
             // Cela peut arriver si restore() n'a pas complètement réinitialisé l'état
             if (!this.session.chord) {
                 this.session.done = false;
                 this.resetRound(true);
             }

             if(this.session.mode === 'inverse') this.playNewQuiz(); 
             else this.playNew(); 
         } 
         else if(!document.getElementById('valBtn').disabled) { 
             // ... le reste de la validation normale ...
             if(this.session.mode === 'inverse') this.validateQuiz(); 
             else if(this.session.mode === 'studio') this.addToTimeline();
             else this.validate(); 
         }
    },

    // --- SYSTEME DE SAUVEGARDE INTELLIGENT ---
    async triggerSave(reason = "Auto") {
        // --- AJOUT SÉCURITÉ ---
        if (this.isResetting) return;
        // ----------------------

        // On ne sauvegarde que si un utilisateur est connecté
        if (!Cloud.auth.currentUser) return;

        console.log(`💾 Sauvegarde déclenchée : ${reason}`);
        
        // On met à jour le timestamp local avant envoi
        this.data.lastSave = Date.now(); 
        
        // Envoi silencieux (on ne bloque pas l'UI)
        try {
            await Cloud.saveUser(this.data);
        } catch (e) {
            console.warn("Save failed:", e);
        }
    },

    validate() {
        if(this.session.roundLocked) return; 
        if(this.sprintRef) { clearTimeout(this.sprintRef); this.sprintRef = null; }
        if(this.vignetteRef) { clearTimeout(this.vignetteRef); this.vignetteRef = null; }
        document.getElementById('sprintFill').style.transition = 'none'; document.getElementById('vignette').className = 'vignette-overlay';
        const c = this.session.chord;
        // FIX: Vérifier que chord existe avant d'accéder à ses propriétés
        if (!c || !c.type) {
            console.warn("validate() called but chord is null or invalid");
            return;
        }
        const okC = this.session.selC === c.type.id; const isDim = c.type.id === 'dim7' && this.data.currentSet !== 'jazz'; const okI = isDim ? true : (this.session.selI === c.inv);
        
        // HOOK POUR LE MODE DÉFI (V5.0)
        if(this.session.isChallenge) {
            this.session.done = true; this.session.roundLocked = true;
            const win = okC && okI;
            window.UI.reveal(okC, okI);
            // On délègue la gestion de la réponse au ChallengeManager
            ChallengeManager.handleAnswer(win, c, {type: this.session.selC, inv: this.session.selI});
            return;
        }

        this.session.done = true; this.session.roundLocked = true; 
        this.processWin(okC, okI); window.UI.reveal(okC, okI);
        
        // Hook : Vérifier si c'est la première réponse correcte ou erreur
        if (okC && okI) {
            // Première réponse correcte
            if (!localStorage.getItem('tuto_module_first_correct_seen')) {
                setTimeout(() => {
                    const moduleId = window.UI.checkTutorialTriggers({ type: 'firstCorrect' });
                    if (moduleId) {
                        window.UI.startTutorialModule(moduleId);
                    }
                }, 1000);
            }
        } else {
            // Première erreur
            if (!localStorage.getItem('tuto_module_first_error_seen')) {
                setTimeout(() => {
                    const moduleId = window.UI.checkTutorialTriggers({ type: 'firstError' });
                    if (moduleId) {
                        window.UI.startTutorialModule(moduleId);
                    }
                }, 1000);
            }
        }
    },
    
    validateQuiz() {
        if(this.session.roundLocked) return; 
        this.session.done = true; this.session.roundLocked = true;
        const userIdx = this.session.quizUserChoice; const correctIdx = this.session.quizCorrectIdx; const userOpt = this.session.quizOptions[userIdx]; const corrOpt = this.session.quizOptions[correctIdx];
        const okC = userOpt.type.id === corrOpt.type.id; let okI = userOpt.inv === corrOpt.inv; if (corrOpt.type.id === 'dim7' && this.data.currentSet !== 'jazz') okI = true;
        Audio.chord(corrOpt.notes);
        
        // HOOK POUR LE MODE DÉFI (V5.0 - Variante Quiz)
        if(this.session.isChallenge) {
             const win = okC && okI;
             window.UI.revealQuiz(userIdx, correctIdx, this.session.quizOptions);
             ChallengeManager.handleAnswer(win, corrOpt, userOpt);
             return;
        }

        this.processWin(okC, okI);
        window.UI.revealQuiz(userIdx, correctIdx, this.session.quizOptions);
    },

    processWin(okC, okI) {
        const win = okC && okI; const c = this.session.chord; const isDim = c.type.id === 'dim7' && this.data.currentSet !== 'jazz'; const difficultyMult = this.getDifficultyMultiplier(); const isTrivial = difficultyMult === 0;
        const getRank = (ok) => { if(ok >= 100) return 3; if(ok >= 50) return 2; if(ok >= 20) return 1; return 0; };
        let oldCRank = 0; let oldIRank = 0; let invObj = null;
        
        if(!isTrivial) {
            const cStat = this.data.stats.c[c.type.id]; if(cStat) oldCRank = getRank(cStat.ok);
            if(this.data.currentSet === 'jazz') { invObj = this.data.stats.v[c.inv]; } else if (this.data.currentSet === 'laboratory') { invObj = this.data.stats.l[`${c.type.id}_${c.inv}`]; } else { invObj = this.data.stats.i[c.inv]; } if(invObj) oldIRank = getRank(invObj.ok);
        }
        
        if(!isTrivial) {
            if(this.data.currentSet === 'jazz') { if(!this.data.stats.v[c.inv]) this.data.stats.v[c.inv] = {ok:0, tot:0}; this.data.stats.v[c.inv].tot++; if(okI) this.data.stats.v[c.inv].ok++; } 
            else if(this.data.currentSet === 'laboratory') { const lKey = `${c.type.id}_${c.inv}`; if(!this.data.stats.l[lKey]) this.data.stats.l[lKey] = {ok:0, tot:0}; this.data.stats.l[lKey].tot++; if(okI) this.data.stats.l[lKey].ok++; } 
            else { if(!isDim) { if(!this.data.stats.i[c.inv]) this.data.stats.i[c.inv] = {ok:0, tot:0}; this.data.stats.i[c.inv].tot++; if(okI) this.data.stats.i[c.inv].ok++; } }
            if(!this.data.stats.c[c.type.id]) this.data.stats.c[c.type.id] = {ok:0, tot:0}; this.data.stats.c[c.type.id].tot++; if(okC) this.data.stats.c[c.type.id].ok++;
            this.data.stats.totalPlayed++; this.calcGlobalStats();
            if(win) { const comboID = `${c.type.id}-${c.inv}`; if(!this.data.stats.combos.includes(comboID)) this.data.stats.combos.push(comboID); }
        }
        
        if(win) {
            let basePts = 50; if(document.getElementById('toggleOpen').checked) basePts = 75; if(this.session.hint) basePts = 20;
            if(this.session.mode === 'sprint') { const speedMultiplier = 10 / this.session.currentSprintTime; basePts = Math.round(basePts * speedMultiplier); }
            const rawBonus = this.session.hint ? 0 : (this.session.streak * 10); const totalRaw = basePts + rawBonus; let totalGain = Math.round(totalRaw * difficultyMult);
            if(isTrivial) totalGain = 0;
            this.session.score += totalGain;
            let badgeUnlocked = false; let levelUp = false; let rankUp = false;
            
            if(!isTrivial) {
                const newCStat = this.data.stats.c[c.type.id]; const newCRank = newCStat ? getRank(newCStat.ok) : 0;
                let newIRank = 0; let newInvObj = null; if(this.data.currentSet === 'jazz') newInvObj = this.data.stats.v[c.inv]; else if(this.data.currentSet === 'laboratory') newInvObj = this.data.stats.l[`${c.type.id}_${c.inv}`]; else newInvObj = this.data.stats.i[c.inv]; if(newInvObj) newIRank = getRank(newInvObj.ok);
                const rankMessagesC = { 1: `${c.type.sub} : Rang Bronze débloqué !`, 2: `${c.type.sub} : Rang Argent (Solide) !`, 3: `${c.type.sub} : Rang Or (Maîtrise) !` };
                const rankMessagesI = { 1: "Variation : Rang Bronze atteint", 2: "Variation : Niveau Argent", 3: "Variation : Virtuose (Or)" };
                if(newCRank > oldCRank) { rankUp = true; const msg = rankMessagesC[newCRank] || `${c.type.sub} : Niveau Supérieur !`; window.UI.showToast(msg); } 
                else if (!isDim && newIRank > oldIRank) { rankUp = true; const msg = rankMessagesI[newIRank] || "Variation améliorée !"; window.UI.showToast(msg); }
                
                this.data.tempToday.tot++; this.data.tempToday.ok++;
                if(this.data.tempToday.tot >= 5) { const todayStr = this.data.tempToday.date; const lastIdx = this.data.history.length - 1; if(lastIdx >= 0 && this.data.history[lastIdx].date === todayStr) { this.data.history[lastIdx] = { ...this.data.tempToday }; } else { this.data.history.push({ ...this.data.tempToday }); if(this.data.history.length > 7) this.data.history.shift(); } }
                if(!this.session.hint) { this.session.streak++; window.UI.triggerCombo(this.session.streak); }
                if (this.data.lvl < 20) { this.data.xp += totalGain; if(this.data.xp >= this.data.next) { this.data.xp -= this.data.next; this.data.lvl++; this.data.next = Math.floor(this.data.next * 1.2); levelUp = true; window.UI.showLevelUp(); this.triggerCloudSave(true); window.UI.updateModeLocks(); if(this.data.mastery === 0) { if(this.data.lvl === 3) setTimeout(()=> window.UI.showToast("🔓 Mode Inverse Débloqué !"), 2000); if(this.data.lvl === 8) setTimeout(()=> window.UI.showToast("🔓 Mode Chrono Débloqué !"), 2000); if(this.data.lvl === 12) setTimeout(()=> window.UI.showToast("🔓 Mode Sprint Débloqué !"), 2000); } } } else { this.data.xp = this.data.next; }
                
                if(!this.session.hint && this.session.mode !== 'inverse') this.session.cleanStreak++; else this.session.cleanStreak = 0; if(c.open) this.session.openStreak++; else this.session.openStreak = 0;
                const allC = this.data.settings.activeC.length === DB.chords.length; const allI = (this.data.currentSet === 'laboratory') ? true : (this.data.settings.activeI.length === DB.currentInvs.length); if(allC && allI) this.session.fullConfigStreak++; else this.session.fullConfigStreak = 0;
                const reactionTime = (Date.now() - this.session.lastActionTime); if(reactionTime < 2000) this.session.fastStreak++; else this.session.fastStreak = 0; 
                const reactionFromAudio = (Date.now() - this.session.audioStartTime); this.session.lastReactionTime = reactionFromAudio;
                
                if(c.type.id === 'maj7' || c.type.id === 'min7') this.data.stats.str_jazz++; if(c.type.id === 'minmaj7') this.data.stats.str_007++; if(c.type.id === 'dim7') this.data.stats.str_dim++; if(!isDim && c.inv !== 0) this.data.stats.str_inv++; if(this.session.lives === 1) this.session.lowLifeRecovery = true;
                if(c.type.id === 'struct_36') this.session.str36Streak++; else this.session.str36Streak = 0; if(c.type.id === 'struct_45tr') this.session.str45Streak++; else this.session.str45Streak = 0; if(['struct_36', 'struct_45tr'].includes(c.type.id)) this.session.geoStreak++; else this.session.geoStreak = 0; if(c.type.id === 'trichord') this.session.triStreak++; else this.session.triStreak = 0;
                if(this.data.currentSet === 'jazz' && c.inv === 3) this.session.rootlessStreak++; else this.session.rootlessStreak = 0; if(this.data.settings.activeC.length === 1) this.session.monoStreak++; else this.session.monoStreak = 0;
                const curHash = `${c.type.id}-${c.inv}-${c.root}`; this.session.dejaVu = (this.session.prevChordHash === curHash); this.session.prevChordHash = curHash;
                if (!this.session.hasReplayed && this.session.mode !== 'inverse') this.session.pureStreak++; else this.session.pureStreak = 0;
                if (this.session.mode === 'chrono' && this.session.time <= 2) { this.session.razorTriggered = true; } else { this.session.razorTriggered = false; }
                if (!this.session.collectedRoots) this.session.collectedRoots = new Set(); this.session.collectedRoots.add(this.session.chord.root % 12);

                // NOUVEAU CODE (Strict : Type + Inversion identiques)
                // On vérifie si le type est le même ET si l'inversion est la même
                // Note : this.session.lastChordInv doit être initialisé (sera undefined au début, donc ça marche)
                if (this.session.lastChordType === c.type.id && this.session.lastChordInv === c.inv) { 
                    this.session.jackpotStreak++; 
                    } else { 
                    this.session.jackpotStreak = 1; 
                }
                // On sauvegarde les deux pour le prochain tour
                this.session.lastChordType = c.type.id;
                this.session.lastChordInv = c.inv;

                window.UI.vibrate([50,50,50]); window.UI.confetti(); window.UI.msg(this.session.streak > 2 ? `SÉRIE x${this.session.streak} !` : "EXCELLENT !", true);
                badgeUnlocked = this.checkBadges();
            } else { window.UI.msg("Correct ! (Mode Trivial)", true); }
            if(this.session.mode === 'chrono') this.session.time += 3;
            let soundToPlay = 'win'; if (this.data.lvl === 20 && levelUp) soundToPlay = 'max'; else if (levelUp) soundToPlay = 'lvl'; if (rankUp) soundToPlay = 'rankup'; if (badgeUnlocked) soundToPlay = 'badge'; Audio.sfx(soundToPlay);
        } else {
            this.session.streak = 0; this.session.cleanStreak = 0; this.session.openStreak = 0; this.session.fullConfigStreak = 0; this.session.fastStreak = 0;
            if(c.type.id === 'maj7' || c.type.id === 'min7') this.data.stats.str_jazz = 0; if(c.type.id === 'minmaj7') this.data.stats.str_007 = 0; if(c.type.id === 'dim7') this.data.stats.str_dim = 0; if(!isDim && c.inv !== 0) this.data.stats.str_inv = 0;
            this.session.str36Streak = 0; this.session.str45Streak = 0; this.session.geoStreak = 0; this.session.triStreak = 0; this.session.rootlessStreak = 0; this.session.monoStreak = 0; this.session.dejaVu = false;
            this.session.pureStreak = 0; this.session.jackpotStreak = 0;
            this.session.lastChordType = null; // Reset streak logic on loss

            Audio.sfx('lose'); window.UI.vibrate(300); window.UI.updateBackground(0);
            let invName = ""; if(this.data.currentSet === 'laboratory') invName = c.type.configs[c.inv].name; else if(!isDim) invName = DB.currentInvs[c.inv].name;
            window.UI.msg(`Raté : ${c.type.sub} ${invName}`, false);
            
            // MORT SUBITE MODE INVERSE
            if (this.session.mode === 'inverse') {
                this.gameOver();
                return;
            }

            if(this.session.mode === 'chrono' || this.session.mode === 'sprint') { 
                this.session.lives--; 
                if(this.session.lives <= 0) return this.gameOver(); 
            }
        }
        window.UI.updateHeader(); window.UI.updateChrono(); this.saveData();
        document.getElementById('hintBtn').disabled = false; document.getElementById('hintBtn').style.opacity = '1';
        const btn = document.getElementById('valBtn'); btn.innerText = "Suivant"; btn.classList.add('next'); btn.disabled = false;
        const play = document.getElementById('playBtn'); play.innerHTML = "<span class='icon-lg'>▶</span><span>Suivant</span>"; play.disabled = false;

        // --- AJOUT V6.2 : CHECKPOINT ZEN ---
            // Sauvegarde tous les 20 accords réussis en mode Zen
            if (this.session.mode === 'zen') {
                this.session.zenCounter = (this.session.zenCounter || 0) + 1;
                if (this.session.zenCounter >= 20) {
                    this.triggerSave("Zen Checkpoint (20)");
                    this.session.zenCounter = 0;
                }
            }
    },

    checkBadges() {
        let unlockedSomething = false;
        const hadBadges = this.data.badges.length > 0;
        BADGES.forEach(b => {
            if(!this.data.badges.includes(b.id)) {
                if(b.check(this.data, this.session)) { this.data.badges.push(b.id); window.UI.showBadge(b); unlockedSomething = true; this.saveData(); }
            }
        });
        
        // Hook : Vérifier si c'est le premier badge débloqué
        if (unlockedSomething && !hadBadges) {
            setTimeout(() => {
                const moduleId = window.UI.checkTutorialTriggers({ type: 'firstBadge' });
                if (moduleId) {
                    window.UI.startTutorialModule(moduleId);
                }
            }, 2000); // Délai pour laisser l'animation du badge se terminer
        }
        
        return unlockedSomething;
    },

    async gameOver() {
        // 1. Sauvegarde Immédiate de la session
        this.triggerSave("Game Over");
        
        if(!this.data.stats.modesPlayed.includes(this.session.mode)) { this.data.stats.modesPlayed.push(this.session.mode); }
        const badged = this.checkBadges(); if(badged) Audio.sfx('badge');
        let isBest = false;
        if(this.session.mode === 'chrono' && this.session.score > this.data.bestChrono) { this.data.bestChrono = this.session.score; isBest=true; }
        if(this.session.mode === 'sprint' && this.session.score > this.data.bestSprint) { this.data.bestSprint = this.session.score; isBest=true; }
        if(this.session.mode === 'inverse' && this.session.score > this.data.bestInverse) { this.data.bestInverse = this.session.score; isBest=true; }
        this.saveData(); 
        
        // ENVOI CLOUD (Pseudo + Mastery)
        if(this.session.score > 0) {
            // On attend la confirmation d'envoi pour que le classement soit à jour
            await Cloud.submitScore(this.session.mode, this.session.score, this.data.username, this.data.mastery);
        }
        
        document.getElementById('endScore').innerText = this.session.score;
        document.getElementById('endHighScore').innerText = "Record: " + (this.session.mode==='chrono'?this.data.bestChrono:this.session.mode==='sprint'?this.data.bestSprint:this.data.bestInverse);
        
        // NOUVEAU : On prépare l'affichage (Feedback Inverse + Classement)
        await window.UI.populateGameOver(this.session, this.session.mode);

        window.UI.openModal('modalGameOver', true);
        
        // Hook : Vérifier si un tutoriel de fin de partie doit s'afficher
        setTimeout(() => {
            const moduleId = window.UI.checkTutorialTriggers({ type: 'gameOver' });
            if (moduleId) {
                window.UI.startTutorialModule(moduleId);
            }
        }, 500);
    },
    
    replaySameMode() { window.UI.closeModals(); this.setMode(this.session.mode); },

    analyzeCoach() {
        const s = this.session; const d = this.data; const rand = (arr) => arr[Math.floor(this.rng() * arr.length)];
        const sTot = s.globalTot; const sOk = s.globalOk; const sAcc = sTot > 0 ? (sOk / sTot) : 0;
        let gOk = 0, gTot = 0; for(let k in d.stats.c) { gOk += d.stats.c[k].ok; gTot += d.stats.c[k].tot; } const gAcc = gTot > 0 ? (gOk / gTot) : 0;
        if(sTot < 5 && gTot < 20) { return { t: "Débutant", m: rand(COACH_DB.start) }; }
        if(gAcc > 0.70 && sTot > 10 && sAcc < 0.50) { return { t: "Santé ☕", m: rand(COACH_DB.critical) }; }
        // --- NOUVELLE LOGIQUE COACH (ACCORDS + RENVERSEMENTS) ---
        let candidates = [];
        const THRESHOLD = 0.45; // Seuil de faiblesse (< 45% de réussite)
        const MIN_PLAYED = 5;   // Minimum d'essais pour être jugé

        // 1. Analyse des Accords
        if (d.stats && d.stats.c) {
            for(let cid in d.stats.c) {
                const st = d.stats.c[cid];
                // On vérifie le score ET si on a une phrase dans la DB pour cet accord
                if(st && st.tot >= MIN_PLAYED && (st.ok / st.tot) < THRESHOLD) {
                    if(COACH_DB.weakness[cid]) { candidates.push(cid); }
                }
            }
        }

        // 2. Analyse des Renversements (Sauf Labo pour l'instant)
        if (d.currentSet !== 'laboratory') {
            // On choisit la bonne statistique (Jazz = Voicings 'v', Academy = Inversions 'i')
            let invStats = (d.currentSet === 'jazz') ? d.stats.v : d.stats.i;
            let prefix = (d.currentSet === 'jazz') ? 'voc_' : 'inv_';

            if (invStats) {
                for(let iid in invStats) {
                    const st = invStats[iid];
                    const dbKey = prefix + iid; // ex: "inv_0" ou "voc_2"
                    
                    if(st && st.tot >= MIN_PLAYED && (st.ok / st.tot) < THRESHOLD) {
                        if(COACH_DB.weakness[dbKey]) { candidates.push(dbKey); }
                    }
                }
            }
        }

        // 3. Tirage au sort équitable & Traduction du nom
        if(candidates.length > 0) {
            const chosenId = rand(candidates); 
            const tip = rand(COACH_DB.weakness[chosenId]);
            
            // --- TRADUCTION DE L'ID EN NOM LISIBLE ---
            let prettyName = chosenId; // Valeur par défaut (au cas où)

            // Cas A : C'est un Renversement (inv_0, inv_1...)
            if (chosenId.startsWith('inv_')) {
                const idx = parseInt(chosenId.split('_')[1]);
                const obj = DB.invs.find(x => x.id === idx);
                // Format demandé : "Nom (Chiffrage)" ex: État Fondamental (7)
                if(obj) prettyName = `${obj.name} (${obj.figure.join('')})`; 
            }
            // Cas B : C'est un Voicing Jazz (voc_0...)
            else if (chosenId.startsWith('voc_')) {
                const idx = parseInt(chosenId.split('_')[1]);
                const obj = DB.voicings.find(x => x.id === idx);
                if(obj) prettyName = obj.name;
            }
            // Cas C : C'est un Accord (maj7, min7...)
            else {
                // On cherche l'accord dans tous les sets connus pour retrouver son nom
                // (On cherche d'abord dans le set courant, sinon dans les autres)
                let obj = DB.chords.find(x => x.id === chosenId);
                if (!obj) obj = DB.sets.academy.chords.find(x => x.id === chosenId);
                if (!obj && DB.sets.jazz) obj = DB.sets.jazz.chords.find(x => x.id === chosenId);
                if (!obj && DB.sets.laboratory) obj = DB.sets.laboratory.chords.find(x => x.id === chosenId);
                
                if(obj) prettyName = obj.name;
            }

            return { t: tip.t, m: tip.m, target: prettyName };
        }
        // -------------------------------------------------------
        if(s.fastStreak > 3 && sAcc < 0.60) { return { t: "Vitesse ⚠️", m: rand(COACH_DB.speed_warn) }; }
        if(gAcc < 0.60 && s.streak >= 8) { return { t: "Déclic 💡", m: rand(COACH_DB.breakthrough) }; }
        if(sTot > 40 && sAcc < 0.50) { return { t: "Persévérance 💪", m: rand(COACH_DB.effort) }; }
        if(sTot > 5 && (s.replayCount / sTot) > 2.5 && sAcc > 0.80) { return { t: "Confiance 🦁", m: rand(COACH_DB.patience) }; }
        if(s.streak >= 12) { return { t: "En Feu 🔥", m: rand(COACH_DB.streak) }; }
        return { t: "Rappel 🧠", m: rand(COACH_DB.theory) };
    },

    // Reçoit les données du Cloud au démarrage
    syncFromCloud(cloudData) {
        if (!cloudData) return;

        console.log("☁️ Comparaison Cloud vs Local...", cloudData.xp, "vs", this.data.xp);

        // LOGIQUE : Le score le plus élevé l'emporte (Fusion intelligente)
        if (cloudData.xp > this.data.xp) {
            console.log("✅ Cloud plus avancé : Mise à jour locale.");
            
            // On écrase les données locales avec celles du Cloud
            this.data = { ...this.data, ...cloudData };
            this.saveData(); // On met à jour le localStorage immédiatement
            
            // UI UPDATE : On utilise updateHeader pour tout rafraîchir d'un coup
            window.UI.updateHeader();
            window.UI.renderBadges();
            
            // Si la modale Paramètres est ouverte, on la rafraîchit pour virer "Invité"
            if(document.getElementById('settingsModal').classList.contains('open')) {
                window.UI.renderSettings();
            }
            
            window.UI.showToast("☁️ Progression récupérée !");
        } 
        else if (this.data.xp > cloudData.xp) {
            console.log("⚠️ Local plus avancé que le Cloud. Sauvegarde forcée.");
            // Cas où on a joué hors ligne : on met à jour le Cloud tout de suite
            this.triggerSave("Sync Démarrage (Local > Cloud)"); // CORRIGÉ (C'était forceCloudSave)
        }
        else {
            console.log("🔄 Synchronisation parfaite (Égalité).");
            
            // --- AJOUT SÉCURITÉ IDENTITÉ ---
            // Même si l'XP est pareille, si le Cloud a un vrai pseudo et que je suis "Anonyme", je prends celui du Cloud.
            if (cloudData.username && cloudData.username !== "Élève Anonyme" && this.data.username === "Élève Anonyme") {
                console.log("🔧 Correction Pseudo via Cloud");
                this.data.username = cloudData.username;
                this.saveData();
                window.UI.updateHeader();
            }
            // -------------------------------

            // Rafraîchir l'interface des paramètres (pour afficher "Certifié")
            if(document.getElementById('settingsModal').classList.contains('open')) {
                window.UI.renderSettings();
            }
        }
    },
    
    // --- GESTION DU BOUTON GOOGLE (CORRIGÉ & VALIDÉ) ---
    async handleGoogleAuth() {
        const btn = document.getElementById('googleAuthBtn');
        if(!btn) return;

        const user = Cloud.auth.currentUser;

        // --- CAS 1 : DÉCONNEXION (Si déjà connecté et pas anonyme) ---
        if (user && !user.isAnonymous) {
            if(confirm("Se déconnecter du compte Google ?")) {
                await Cloud.logout();
                localStorage.removeItem('harmonist_v6_data');
                window.location.reload(); 
            }
            return;
        }

        // --- CAS 2 : CONNEXION (Migration) ---
        
        const oldUid = user ? user.uid : null;
        const currentName = this.data.username; // On garde le nom en mémoire

        btn.disabled = true;
        btn.innerHTML = "Connexion...";
        
        // A. LE "SUICIDE" DU PSEUDO
        // On le libère volontairement AVANT la connexion pour que le futur compte Google puisse le prendre.
        // On ne le fait que si ce n'est pas le pseudo par défaut.
        let released = false;
        if (currentName && currentName !== "Élève Anonyme") {
            // On tente de le supprimer. Si ça marche, released = true.
            released = await Cloud.releaseUsername(currentName);
        }

        // B. LA CONNEXION
        const result = await Cloud.login(this.data, oldUid);
        
        if (result.success) {
            // SUCCÈS : Le pseudo a été repris par la fonction login (qui le réserve pour le compte Google)
            this.data = result.data;
            this.saveData(); 
            
            window.UI.updateHeader();
            window.UI.renderBadges();
            window.UI.renderSettings(); 
            
            this.session.done = true; 
            if(this.data.lvl > 1) window.UI.updateModeLocks();

            window.UI.showToast(`Bienvenue, ${result.user.displayName || 'Harmoniste'} !`);
            
        } else {
            // ÉCHEC / ANNULATION : FILET DE SÉCURITÉ
            // Si l'utilisateur a annulé la popup Google, il est toujours connecté en Anonyme.
            // Mais on a supprimé son pseudo à l'étape A ! Il faut le récupérer tout de suite.
            if (released) {
                console.log("⚠️ Connexion annulée, récupération immédiate du pseudo...");
                await Cloud.assignUsername(currentName);
            }

            window.UI.showToast("Connexion annulée");
            window.UI.renderSettings(); 
        }
    },

};
