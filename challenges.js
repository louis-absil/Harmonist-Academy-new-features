

import { Cloud } from './firebase.js';
import { Audio } from './audio.js';

export const ChallengeManager = {
    active: false,
    config: null, // { id, seed, length, settings, sequence? }
    state: {
        step: 0,
        score: 0,
        mistakes: [], // { chord, userResp }
        startTime: 0,
        netTime: 0, // Temps de réflexion pur (Speedrunner badge)
        history: [],
        attempts: [] // Full log for stats
    },

    // RNG Seeded (Mulberry32)
    seedFunc: null,
    initSeed(str) {
        let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
        for (let i = 0, k; i < str.length; i++) {
            k = str.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        let seedState = (h1>>>0) + (h2>>>0) + (h3>>>0) + (h4>>>0);
        
        this.seedFunc = () => {
            let t = seedState += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
        console.log("🎲 Challenge RNG initialized with:", str);
    },

    checkRescue() {
        const backup = localStorage.getItem('harmonist_challenge_backup');
        if (backup) {
            console.log("🧹 Nettoyage d'un défi interrompu.");
            this.restore(); 
        }
    },

    async start(challengeData) {
        const App = window.App;
        const snapshot = {
            settings: JSON.parse(JSON.stringify(App.data.settings)),
            currentSet: App.data.currentSet,
            mode: App.session.mode
        };
        localStorage.setItem('harmonist_challenge_backup', JSON.stringify(snapshot));

        this.active = true;
        this.config = challengeData;
        
        // Si une séquence custom est fournie, on utilise le RNG mais la longueur est forcée
        if (challengeData.sequence) {
            this.config.length = challengeData.sequence.length;
        }
        
        this.initSeed(challengeData.seed);
        
        this.state = {
            step: 0,
            score: 0,
            mistakes: [],
            startTime: Date.now(),
            netTime: 0,
            history: [],
            attempts: [],
            qStartMs: performance.now(),
        };

        App.session.isChallenge = true;
        // FIX: Réinitialiser globalOk et globalTot pour les badges (b_crash)
        // Ces stats doivent refléter uniquement le défi en cours, pas les stats globales
        App.session.challengeGlobalOk = 0;
        App.session.challengeGlobalTot = 0;
        App.rng = this.seedFunc; 
        
        if (challengeData.settings) {
            if (challengeData.settings.set) {
                App.loadSet(challengeData.settings.set, true); 
            }
            App.data.settings.activeC = challengeData.settings.activeC;
            App.data.settings.activeI = challengeData.settings.activeI;
        }
        
        App.setMode('zen'); 
        
        window.UI.closeModals();
        window.UI.updateChallengeControls(true); // Toggle Settings button to Exit button

        document.getElementById('currentScoreVal').innerText = "1/" + this.config.length;
        document.getElementById('highScoreVal').innerText = "EXAM";
        document.getElementById('streakVal').innerText = "-"; 
        
        // Hook : Vérifier si c'est le premier défi
        setTimeout(() => {
            const moduleId = window.UI.checkTutorialTriggers({ type: 'challengeStart' });
            if (moduleId) {
                window.UI.startTutorialModule(moduleId);
            }
        }, 500);
        
        // --- FIX UI : INITIALISATION BARRE ---
    if (window.UI.initChallengeProgress) {
        // On initialise juste la barre (Case 0 blanche par défaut)
        window.UI.initChallengeProgress(this.config.length);
    }

        window.UI.showToast(`Défi lancé : ${challengeData.seed}`);
        
        App.playNew(); 
    },

    restore() {
        const App = window.App;
        const backupStr = localStorage.getItem('harmonist_challenge_backup');
        if (backupStr) {
            const backup = JSON.parse(backupStr);
            App.data.currentSet = backup.currentSet;
            App.data.settings = backup.settings;
            App.session.mode = backup.mode || 'zen';
            localStorage.removeItem('harmonist_challenge_backup');
        }
        
        this.active = false;
        App.session.isChallenge = false;
        
        // FIX CRITIQUE: On force session.done à false AVANT toute autre opération
        // pour éviter que les boutons restent en mode "Suivant"
        App.session.done = false;
        App.session.roundLocked = false;
        
        // FIX CRITIQUE: Réinitialiser toutes les sélections et l'état de la question
        // pour éviter que la dernière réponse du défi soit validée dans le mode zen
        App.session.selC = null;
        App.session.selI = null;
        App.session.chord = null;
        App.session.quizUserChoice = null;

        // Nettoyage de l'interface unifiée
        if(window.UI.resetChallengeUI) window.UI.resetChallengeUI();
        
        App.loadSet(App.data.currentSet, true);

        App.rng = Math.random; 
        
        App.loadSet(App.data.currentSet, true);
        App.setMode(App.session.mode);
        
        // FIX: Vérifier que scoreGroup existe avant d'accéder à classList
        const scoreGroup = document.getElementById('scoreGroup');
        if (scoreGroup) {
            scoreGroup.classList.remove('active');
        }
        
        window.UI.updateChallengeControls(false); // Restore Settings button
        
        // FIX CRITIQUE: Forcer la réinitialisation des boutons après setMode()
        // On utilise setTimeout pour s'assurer que setMode() a fini d'exécuter resetRound() et playNew()
        setTimeout(() => {
            const valBtn = document.getElementById('valBtn');
            const playBtn = document.getElementById('playBtn');
            
            if (valBtn) {
                // FIX: Utiliser innerHTML pour être cohérent avec handleAnswer() qui utilise innerHTML
                valBtn.innerHTML = "Valider";
                valBtn.classList.remove('next');
                valBtn.disabled = true;
            }
            if (playBtn) {
                playBtn.innerHTML = "<span class='icon-lg'>▶</span><span>Écouter</span>";
                playBtn.disabled = false;
            }
            
            // FIX CRITIQUE: Réinitialiser l'affichage des sélections pour éviter que les boutons restent sélectionnés
            if (window.UI.renderSel) {
                window.UI.renderSel();
            }
        }, 100);
        
        // FIX CRITIQUE: S'assurer qu'une nouvelle question est bien lancée après restore()
        // setMode() appelle déjà playNew(), mais on veut être sûr que tout est correctement initialisé
        setTimeout(() => {
            // Si aucune question n'est chargée, on en lance une nouvelle
            if (!App.session.chord && App.session.mode !== 'studio') {
                if (App.session.mode === 'inverse') {
                    App.playNewQuiz();
                } else {
                    App.playNew();
                }
            }
        }, 200);
    },

    handleAnswer(win, chord, userResp) {
        // --- 1. Calcul du score ---
        const nowMs = performance.now();
        const timeSpentMs = nowMs - (this.state.qStartMs ?? nowMs);
        this.state.netTime += timeSpentMs;
        
        // FIX: Mettre à jour challengeGlobalOk et challengeGlobalTot pour les badges (b_crash)
        // Ces stats doivent refléter uniquement le défi en cours, pas les stats globales
        if (!window.App.session.challengeGlobalTot) window.App.session.challengeGlobalTot = 0;
        if (!window.App.session.challengeGlobalOk) window.App.session.challengeGlobalOk = 0;
        window.App.session.challengeGlobalTot++;
        if (win) window.App.session.challengeGlobalOk++;

        // --- 2. Enregistrement de l'historique ---
        this.state.history.push({ 
            win, 
            chord: chord.id, 
            user: userResp 
        });

        // --- LOG STATS (utilisé par la modale "Statistiques") ---
        this.state.attempts.push({
            win,
            chord,       // objet chord complet
            userResp,    // réponse utilisateur
            step: this.state.step,
            timeMs: timeSpentMs,
        });


        if (!win) {
        // Format attendu par UI.renderChallengeReport(report)
        this.state.mistakes.push({
            chord,      // objet chord complet (type, notes, inv, etc.)
            userResp,   // la réponse utilisateur
            step: this.state.step  // FIX: Stocker le numéro de question pour la numérotation correcte
            });
            this.state.score -= 5;
        } else {
            this.state.score += 20;
        }


        // --- 3. Audio Feedback ---
        if(win) AudioEngine.sfx('win');
        else AudioEngine.sfx('lose');

        // --- 4. Mise à jour de la barre visuelle (UI) ---
        if (window.UI.updateChallengeProgress) {
            window.UI.updateChallengeProgress(this.state.step, win ? 'win' : 'lose');
        }

        // --- 5. Changement du bouton pour passer à la suite ---
        // FIX: Ne modifier les boutons QUE si on est encore en mode défi actif
        // Sinon, ils seront réinitialisés par restore() et on ne veut pas les écraser
        if (this.active && App.session.isChallenge) {
            const btn = document.getElementById('valBtn');
            const play = document.getElementById('playBtn');
            
            if(btn) {
                btn.innerHTML = "Question Suivante &gt;&gt;"; 
                btn.classList.add('next');
                btn.disabled = false;
            }
            
            // On permet de réécouter si besoin, mais visuellement on suggère d'avancer
            if(play) {
                play.innerHTML = "<span class='icon-lg'>▶</span><span>Suivant</span>";
                play.disabled = false;
            }
        }

        // Prépare le chrono de la prochaine question
        this.state.qStartMs = performance.now();

    },

    nextStep() {
        this.state.step++;
        
        if (this.state.step >= this.config.length) {
            this.finish();
        } else {
            // --- AJOUT DU TOAST ICI ---
            // Affiche "Question 2 / 10"
            const currentQ = this.state.step + 1;
            window.UI.showToast(`Question ${currentQ} / ${this.config.length}`);
            
            // Lance la question suivante
            window.App.playNew(); 
        }
    },

    async finish() {
        // FIX: Empêcher les appels multiples
        if (!this.active) {
            return;
        }
        
        // Désactiver immédiatement pour éviter les appels multiples
        this.active = false;
        
        const App = window.App;
        
        // 1. Son de fin
        AudioEngine.sfx('win');

        // 2. Calculs de temps et note
        const endTime = Date.now();
        const totalTime = endTime - this.state.startTime;
        
        // FIX CRITIQUE: Calculer la note à partir du nombre de bonnes réponses, pas du score total
        // this.state.score est un score cumulatif (points), pas le nombre de bonnes réponses
        // On calcule le nombre de bonnes réponses à partir de attempts
        const correctAnswers = this.state.attempts ? this.state.attempts.filter(a => a.win === true).length : 0;
        const finalNote = Math.round((correctAnswers / this.config.length) * 20);
        
        // Validation : s'assurer que finalNote est dans la plage [0, 20]
        if (finalNote < 0 || finalNote > 20) {
            console.error("Invalid finalNote calculated:", finalNote, { correctAnswers, total: this.config.length });
        }

        // --- PRÉPARATION DES DONNÉES POUR L'UI ---
        const resultData = {
            id: this.config.id,
            seed: this.config.seed,
            note: finalNote,
            score: this.state.score,
            total: this.config.length,
            mistakes: this.state.mistakes,
            attempts: this.state.attempts,
            time: totalTime,
            attempts: Array.isArray(this.state.attempts) ? this.state.attempts : [],
        };

        // --- CORRECTION CRITIQUE (Optimistic UI) ---
        // On affiche le rapport MAINTENANT. 
        // Ainsi, même si le code ci-dessous (Cloud/Stats) plante ou lag, l'utilisateur voit son résultat.
        window.UI.updateChallengeControls(false); // Restaure l'état des boutons

        try {
            if (window.UI.renderChallengeReport) {
                window.UI.renderChallengeReport(resultData);
            } else {
                console.error("UI.renderChallengeReport introuvable !");
                alert(`Défi terminé !\nNote: ${finalNote}/20`);
            }
        } catch (err) {
            console.error("renderChallengeReport a crash:", err);
            alert(`Défi terminé !\nNote: ${finalNote}/20`);
        }


        // 3. LOGIQUE MÉTIER (STREAK & STATS) - (Exécuté en arrière-plan)
        // Vérifie si le défi du jour a été joué
        const todayISO = new Date().toISOString().split('T')[0];
        const lastDaily = App.data.arenaStats.lastDailyDate;
        
        // On met à jour les stats d'Arène
        App.data.arenaStats.totalScore += this.state.score;

        // Gestion de la série (Streak)
        if (lastDaily !== todayISO) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            if (lastDaily === yesterday) {
                App.data.arenaStats.currentStreak++;
            } else {
                // Si ce n'était pas hier, on reset à 1 (sauf si c'est aujourd'hui, déjà filtré par le if)
                App.data.arenaStats.currentStreak = 1;
            }
            App.data.arenaStats.lastDailyDate = todayISO;
            
            // Met à jour le max streak si battu
            if (App.data.arenaStats.currentStreak > App.data.arenaStats.maxStreak) {
                App.data.arenaStats.maxStreak = App.data.arenaStats.currentStreak;
            }
        }
        
        // Update Best Daily Score (Local)
        App.updateArenaStats(this.state.score, this.config.length);

        // Store length for Badge checking BEFORE saving
        App.session.lastChallengeLength = this.config.length;
        
        // Sauvegarde locale
        if (typeof App.saveUser === 'function') {
            App.saveUser();
        } else {
            console.warn("⚠️ Fonction App.saveUser toujours manquante !");
        }

        // 4. SAUVEGARDE CLOUD & BADGES (Async / Background)
        // On met tout ceci dans un Try/Catch pour que si Internet coupe, ça ne plante pas l'app silencieusement
        try {
            await Cloud.submitChallengeScore(this.config.id, {
                pseudo: App.data.username,
                note: finalNote,
                score: this.state.score,
                total: this.config.length,
                time: totalTime,
                mastery: App.data.mastery
            });
            
            // 5. VÉRIFICATION BADGES DE RANG (Empereur / Outsider)
            // On ne fait ça que si le submit a fonctionné
            const lb = await Cloud.getChallengeLeaderboard(this.config.id);
            const myUid = Cloud.getCurrentUID();
            const myEntryIndex = lb.findIndex(entry => entry.uid === myUid);
            
            if (myEntryIndex !== -1) {
                App.session.challengeRank = myEntryIndex + 1;
                App.session.challengeTotalPlayers = lb.length;
                App.session.challengeNetTime = this.state.netTime; // Important pour badges speedrunner
                App.checkBadges();
            } else {
                // FIX: Vérifier les badges même si l'utilisateur n'est pas dans le leaderboard
                // (Champion, Rituel, Maître du Jeu ne dépendent pas du classement)
                App.session.challengeNetTime = this.state.netTime; // Important pour badges speedrunner
                App.checkBadges();
            }

        } catch (e) { 
            // On log l'erreur pour le debug, mais l'utilisateur ne s'en rendra pas compte (UX préservée)
            console.error("Cloud Flow Error (Background):", e);
        }
    },

    exit() {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4137fff8-1e02-4a44-a17e-e122d054e9a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'challenges.js:351',message:'ChallengeManager.exit called',data:{active:this.active},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        try {
            this.restore();
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/4137fff8-1e02-4a44-a17e-e122d054e9a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'challenges.js:355',message:'restore() completed successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
            // #endregion
        } catch (e) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/4137fff8-1e02-4a44-a17e-e122d054e9a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'challenges.js:358',message:'restore() threw error',data:{error:e?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
            // #endregion
            console.error("restore() error:", e);
        }
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4137fff8-1e02-4a44-a17e-e122d054e9a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'challenges.js:362',message:'Before closeModals call',data:{uiExists:!!window.UI,closeModalsExists:!!window.UI?.closeModals},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        window.UI.closeModals();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4137fff8-1e02-4a44-a17e-e122d054e9a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'challenges.js:365',message:'After closeModals call',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        window.UI.showToast("Retour à l'entraînement libre");
    }
};
