

import { Audio, Piano } from './audio.js';
import { BADGES, CODEX_DATA, DB, LORE_MATERIALS, GHOSTS, COACH_DB } from './data.js';
import { ChallengeManager } from './challenges.js';
import { Cloud } from './firebase.js';

// --- CONFIGURATION LORE (MAÎTRISE) ---
const LORE_GRADES = ['Novice', 'Initié', 'Adepte', 'Virtuose', 'Maître'];
const LORE_PLACES = ['Le Club', 'Le Labo', 'Le Cosmos', "L'Institut", 'La Source'];

export const UI = {
    // STATE
    lbState: { mode: 'chrono', period: 'weekly' },
    createConfig: { length: 10 },
    currentTutorialModule: null, // Module actuellement affiché
    wtStep: 0, // Étape actuelle dans le module

    // --- SYSTÈME DE TUTORIEL MODULAIRE ---
    tutorialModules: {
        // Module 1 : Premiers pas (Tutoriel d'accueil minimal)
        'first_visit': {
            id: 'first_visit',
            name: 'Premiers pas',
            steps: [
                {
                    target: null,
                    title: "Bienvenue !",
                    text: "Harmonist Academy est votre compagnon pour développer l'oreille relative. Commençons par les bases.",
                },
                {
                    target: "playBtn",
                    title: "Moteur Sonore",
                    text: "Cliquez ici pour activer le son.<br><br><strong>⚠️ iPhone/iPad :</strong> Désactivez impérativement le mode silencieux (bouton latéral) pour entendre le piano.",
                },
                {
                    target: "panelChord",
                    title: "La Qualité de l'Accord",
                    text: "Sélectionnez ici la <strong>qualité</strong> de l'accord (Maj7, min7, Dom7, etc.).",
                },
                {
                    target: "invPanel",
                    title: "Le Renversement",
                    text: "Sélectionnez ici le <strong>renversement</strong> de l'accord (État Fondamental, 1er, 2ème, etc.).",
                },
                {
                    target: "replayBtn",
                    title: "Réécouter",
                    text: "Cliquez ici pour réentendre l'accord.<br><em>Raccourci clavier : Espace</em>",
                },
                {
                    target: "hintBtn",
                    title: "L'Indice",
                    text: "Bloqué ? Le bouton loupe joue les notes une par une (arpège).<br><strong>Attention :</strong> Utiliser l'indice réduit le score du tour.<br><em>Raccourci clavier : H</em>",
                },
                {
                    target: "valBtn",
                    title: "Valider",
                    text: "Une fois votre choix fait (Couleur + Renversement), confirmez ici.<br><em>Raccourci clavier : Entrée</em>",
                },
                {
                    target: null,
                    title: "À vous de jouer !",
                    text: "Vous pouvez relancer ce guide à tout moment depuis les <strong>Paramètres > Guide</strong>.",
                }
            ],
            trigger: 'onFirstVisit',
            requiredLevel: 0,
            requiredMastery: 0,
        },

        // Module 2 : Votre progression
        'progression': {
            id: 'progression',
            name: 'Votre progression',
            steps: [
                {
                    target: "rankIcon",
                    title: "Votre Niveau",
                    text: "Ici s'affichent votre <strong>Niveau</strong> et votre <strong>Maîtrise</strong>. Gagnez de l'XP en répondant correctement pour débloquer les contenus avancés.",
                },
                {
                    target: "xpBar",
                    title: "Barre d'XP",
                    text: "Chaque bonne réponse vous fait gagner de l'XP. Atteignez le niveau suivant pour débloquer de nouveaux modes et contenus.",
                }
            ],
            trigger: 'onModalOpen',
            modalId: 'modalProfile',
            requiredLevel: 0,
            requiredMastery: 0,
        },

        // Module 3 : Modes de jeu (dynamique selon déblocage)
        'mode_inverse': {
            id: 'mode_inverse',
            name: 'Mode Inverse',
            steps: [
                {
                    target: "modeInverse",
                    title: "Mode Inverse",
                    text: "Le jeu vous donne le nom de l'accord, vous devez trouver le son parmi les options. Développe l'oreille intérieure et la mémoire auditive.",
                }
            ],
            trigger: 'onModeUnlock',
            mode: 'inverse',
            requiredLevel: 3,
            requiredMastery: 0,
        },

        'mode_chrono': {
            id: 'mode_chrono',
            name: 'Mode Chrono',
            steps: [
                {
                    target: "modeChrono",
                    title: "Mode Chrono",
                    text: "Course contre la montre ! Vous avez 60 secondes pour faire le meilleur score. Chaque bonne réponse vous fait gagner du temps. Attention : les erreurs vous font perdre une vie !",
                }
            ],
            trigger: 'onModeUnlock',
            mode: 'chrono',
            requiredLevel: 8,
            requiredMastery: 0,
        },

        'mode_sprint': {
            id: 'mode_sprint',
            name: 'Mode Sprint',
            steps: [
                {
                    target: "modeSprint",
                    title: "Mode Sprint",
                    text: "L'épreuve ultime ! Le temps diminue à chaque question. Plus vous répondez vite, plus vous gagnez de points. Renforce l'intuition musicale et les réflexes.",
                }
            ],
            trigger: 'onModeUnlock',
            mode: 'sprint',
            requiredLevel: 12,
            requiredMastery: 0,
        },

        // Module 4 : Paramètres
        'settings': {
            id: 'settings',
            name: 'Paramètres',
            steps: [
                {
                    target: "usernameInput",
                    title: "Votre Identité",
                    text: "Choisissez un pseudo unique. S'il est libre, il sera réservé pour vous. <br><em>(Les pseudos inactifs sont recyclés après 90 jours).</em>",
                },
                {
                    target: "googleAuthBtn",
                    title: "Sécuriser le Compte",
                    text: "<strong>Recommandé :</strong> Connectez-vous avec Google pour sauvegarder votre progression dans le Cloud et éviter de tout perdre en cas de nettoyage du navigateur.",
                    skipIf: () => {
                        const user = Cloud.auth?.currentUser;
                        return user && !user.isAnonymous;
                    }
                },
                {
                    target: "settingsChords",
                    title: "Cursus & Accords",
                    text: "Sélectionnez précisément les types d'accords que vous voulez travailler. Plus vous en activez, plus vous gagnez d'XP. En atteignant le <strong>Niveau 20</strong>, validez la <strong>Maîtrise</strong> pour débloquer de nouveaux sets d'accords.",
                },
                {
                    target: "settingsInvs",
                    title: "Renversements",
                    text: "Activez ou désactivez les renversements (État Fondamental, 1er, 2ème...). Maîtriser les renversements est une des clés vers la maîtrise de l'oreille relative.",
                }
            ],
            trigger: 'onModalOpen',
            modalId: 'settingsModal',
            requiredLevel: 0,
            requiredMastery: 0,
        },

        // Module 5 : Statistiques
        'stats': {
            id: 'stats',
            name: 'Statistiques',
            steps: [
                {
                    target: "coachDisplay",
                    title: "Le Coach Virtuel",
                    text: "Il analyse vos dernières parties pour vous donner des conseils personnalisés sur vos points faibles.",
                },
                {
                    target: "historyChart",
                    title: "Historique",
                    text: "Consultez votre taux de réussite sur les 7 dernières sessions.",
                },
                {
                    target: "statsContent",
                    title: "Analyse Précise",
                    text: "Visualisez votre pourcentage de réussite pour chaque accord et chaque renversement.",
                },
                {
                    target: "badgesGrid",
                    title: "Trophées",
                    text: "Collectionnez les badges en accomplissant des exploits. Cliquez sur un badge pour voir comment l'obtenir.",
                    onEnter: () => {
                        const m = document.querySelector('#statsModal .modal');
                        if(m) m.scrollTop = 400;
                    }
                }
            ],
            trigger: 'onModalOpen',
            modalId: 'statsModal',
            requiredLevel: 0,
            requiredMastery: 0,
        },

        // Module 6 : Codex
        'codex': {
            id: 'codex',
            name: 'Le Codex',
            steps: [
                {
                    target: "codexGridContainer",
                    title: "Fiches Théoriques",
                    text: "Cliquez sur une carte pour obtenir des éléments théoriques et écouter l'accord.",
                },
                {
                    target: null,
                    title: "Navigation",
                    text: "Utilisez les onglets pour naviguer entre les différents sets d'accords (Académie, Jazz, Laboratoire).",
                }
            ],
            trigger: 'onModalOpen',
            modalId: 'modalCodex',
            requiredLevel: 0,
            requiredMastery: 0,
        },

        // Module 7 : Arène
        'arena': {
            id: 'arena',
            name: "L'Arène",
            steps: [
                {
                    target: "tuto-arena-nav",
                    title: "Navigation",
                    text: "Utilisez ces onglets pour naviguer entre les Classements, le Défi du Jour et les modes Créatifs.",
                    onEnter: () => {
                        const nav = document.querySelector('.lb-sub-nav');
                        if(nav) nav.id = "tuto-arena-nav";
                    }
                },
                {
                    target: "c-tab-global",
                    title: "Défi du Jour",
                    text: "Chaque jour, une série unique. Tout le monde a le même tirage. Qui aura la meilleure note ?",
                    onEnter: () => { window.UI.switchChallengeTab('global'); }
                },
                {
                    target: "c-tab-join",
                    title: "Rejoindre",
                    text: "Rejoignez un défi avec un code, ou consultez votre score avec le bouton 'Voir Scores'.",
                    onEnter: () => { window.UI.switchChallengeTab('join'); }
                }
            ],
            trigger: 'onModalOpen',
            modalId: 'challengeHubModal',
            requiredLevel: 0,
            requiredMastery: 0,
        },

        // Module 8 : Créer un défi
        'create_challenge': {
            id: 'create_challenge',
            name: 'Créer un défi',
            steps: [
                {
                    target: "btnOpenStudio",
                    title: "Le Studio",
                    text: "Composez votre propre dictée musicale accord par accord pour vous mesurer à vos amis.",
                },
                {
                    target: "createControls",
                    title: "Générateur Aléatoire",
                    text: "Ou laissez l'IA créer un défi. Le contenu dépendra des <strong>Accords activés dans vos Paramètres</strong>.",
                }
            ],
            trigger: 'onTabSwitch',
            tabId: 'c-tab-create',
            requiredLevel: 0,
            requiredMastery: 0,
        },

        // Module 9 : Fin de partie
        'game_over': {
            id: 'game_over',
            name: 'Fin de partie',
            steps: [
                {
                    target: "endScore",
                    title: "Votre Score",
                    text: "Votre score final s'affiche ici. Comparez-le avec votre record personnel.",
                },
                {
                    target: "miniLeaderboardArea",
                    title: "Classement",
                    text: "Voyez où vous vous situez dans le classement hebdomadaire. Améliorez votre position en rejouant !",
                    skipIf: () => {
                        const lbArea = document.getElementById('miniLeaderboardArea');
                        return !lbArea || lbArea.style.display === 'none';
                    }
                }
            ],
            trigger: 'onGameOver',
            requiredLevel: 0,
            requiredMastery: 0,
        },

        // Module 10 : Première réponse correcte
        'first_correct': {
            id: 'first_correct',
            name: 'Première réponse correcte',
            steps: [
                {
                    target: null,
                    title: "Bravo !",
                    text: "Vous avez gagné de l'XP ! Continuez ainsi pour progresser et débloquer de nouveaux contenus.",
                }
            ],
            trigger: 'onFirstCorrect',
            requiredLevel: 0,
            requiredMastery: 0,
        },

        // Module 11 : Première erreur
        'first_error': {
            id: 'first_error',
            name: 'Première erreur',
            steps: [
                {
                    target: null,
                    title: "Apprendre de ses erreurs",
                    text: "Observez la correction : l'accord cible est en vert, votre réponse en rouge. C'est ainsi qu'on développe l'oreille !",
                }
            ],
            trigger: 'onFirstError',
            requiredLevel: 0,
            requiredMastery: 0,
        },

        // Module 12 : Premier badge
        'first_badge': {
            id: 'first_badge',
            name: 'Premier badge',
            steps: [
                {
                    target: null,
                    title: "Badge débloqué !",
                    text: "Félicitations ! Vous avez débloqué un badge. Consultez tous vos badges dans les <strong>Statistiques</strong>.",
                }
            ],
            trigger: 'onFirstBadge',
            requiredLevel: 0,
            requiredMastery: 0,
        },

        // Module 13 : Premier défi
        'first_challenge': {
            id: 'first_challenge',
            name: 'Premier défi',
            steps: [
                {
                    target: "challengeProgressContainer",
                    title: "Barre de progression",
                    text: "Cette barre montre votre progression dans le défi. Chaque segment représente une question.",
                },
                {
                    target: null,
                    title: "Fin du défi",
                    text: "À la fin, vous verrez un rapport détaillé avec vos erreurs et votre classement.",
                }
            ],
            trigger: 'onChallengeStart',
            requiredLevel: 0,
            requiredMastery: 0,
        },

        // Module 14 : Maîtrise atteinte
        'mastery_unlocked': {
            id: 'mastery_unlocked',
            name: 'Maîtrise atteinte',
            steps: [
                {
                    target: null,
                    title: "Nouveaux contenus !",
                    text: "Félicitations ! Vous avez atteint la Maîtrise. De nouveaux sets d'accords sont maintenant disponibles : <strong>Le Club (Jazz)</strong> et <strong>Le Laboratoire</strong>.",
                },
                {
                    target: "settingsChords",
                    title: "Activer les nouveaux sets",
                    text: "Allez dans les <strong>Paramètres</strong> pour activer les nouveaux accords et renversements.",
                    onEnter: () => { window.UI.openModal('settingsModal'); }
                }
            ],
            trigger: 'onMasteryUnlock',
            requiredLevel: 20,
            requiredMastery: 1,
        },

        // Module 15 : Premier classement
        'first_leaderboard': {
            id: 'first_leaderboard',
            name: 'Premier classement',
            steps: [
                {
                    target: "c-tab-arcade",
                    title: "Classements",
                    text: "Comparez vos scores avec le monde entier. Votre position est mise en évidence.",
                }
            ],
            trigger: 'onFirstLeaderboard',
            requiredLevel: 0,
            requiredMastery: 0,
        }
    },

    // --- ANCIEN SYSTÈME (GARDÉ POUR COMPATIBILITÉ) ---
    wtData: [
        // 0. ACCUEIL
        {
            target: null,
            title: "Bienvenue !",
            text: "Harmonist Academy est votre compagnon pour développer l'oreille relative. Ce guide interactif va vous montrer les clés de la réussite en quelques étapes.",
            onEnter: () => { window.UI.closeModals(); } 
        },

        // 1. AUDIO
        { 
            target: "playBtn", 
            title: "Moteur Sonore", 
            text: "Cliquez ici pour activer le son.<br><br><strong>⚠️ iPhone/iPad :</strong> Désactivez impérativement le mode silencieux (bouton latéral) pour entendre le piano.",
        },
        
        // 2. IDENTITÉ
        { 
            target: "rankIcon", 
            title: "Votre Progression", 
            text: "Ici s'affichent votre <strong>Niveau</strong> et votre <strong>Maîtrise</strong>. Gagnez de l'XP pour débloquer les contenus avancés." 
        },

        // 3. MODES
        { target: "modeZen", title: "Mode Zen", text: "L'apprentissage pur sans stress. Idéal pour débuter et s'entraîner." },
        { target: "modeInverse", title: "Mode Inverse", text: "<strong>Niveau 3 requis.</strong><br>Le jeu donne le nom, vous trouvez le son. Développe l'oreille intérieure." },
        { target: "modeChrono", title: "Mode Chrono", text: "<strong>Niveau 8 requis.</strong><br>Course contre la montre pour entraîner vos réflexes." },
        { target: "modeSprint", title: "Mode Sprint", text: "<strong>Niveau 12 requis.</strong><br>L'épreuve ultime : le temps diminue à chaque question. Renforce l'intuition musicale." },

        // 4. ZONE DE JEU
        { 
            target: "mainArea", 
            title: "Zone d'Écoute", 
            text: "Écoutez l'accord, identifiez sa <strong>Couleur</strong> (Panneau de Gauche/Haut) et son <strong>Renversement</strong> (Panneau de Droite/Bas)." 
        },
        // CORRECTION 2 : Détail des boutons de contrôle
        { 
            target: "replayBtn", 
            title: "Réécouter", 
            text: "Cliquez ici pour réentendre l'accord.<br><em>Raccourci clavier : Espace</em>" 
        },
        { 
            target: "hintBtn", 
            title: "L'Indice", 
            text: "Bloqué ? Le bouton loupe joue les notes une par une (arpège).<br><strong>Attention :</strong> Utiliser l'indice réduit le score du tour.<br><em>Raccourci clavier : H</em>" 
        },
        { 
            target: "valBtn", 
            title: "Valider", 
            text: "Une fois votre choix fait (Couleur + Renversement), confirmez ici.<br><em>Raccourci clavier : Entrée</em>" 
        },
        // --- PARAMÈTRES ---
        { 
            target: "btnSettings", 
            title: "Paramètres", 
            text: "C'est ici que tout se configure. Ouvrons le menu...", 
        },
        { 
            target: "usernameInput", 
            title: "Votre Identité", 
            text: "Choisissez un pseudo unique. S'il est libre, il sera réservé pour vous. <br><em>(Les pseudos inactifs sont recyclés après 90 jours).</em>",
            action: "openSettings" // Ouvre la modale settings
        },
        // --- REMPLACEMENT DE L'ÉTAPE SAUVEGARDE ---
        { 
            target: "googleAuthBtn", // ON CIBLE LE NOUVEAU BOUTON
            title: "Sécuriser le Compte", 
            text: "<strong>Très Important :</strong><br>Actuellement, vos données sont stockées uniquement sur cet appareil.<br>Connectez-vous avec Google pour <strong>sauvegarder votre progression dans le Cloud</strong> et éviter de tout perdre en cas de nettoyage du navigateur.",
        },
        // -------------------------------------------
        { 
            target: "settingsChords", // Cible stable (toujours visible)
            title: "Cursus & Accords", 
            text: "Sélectionnez précisément les types d'accords que vous voulez travailler. Plus vous en activez, plus vous gagnez d'XP. En atteignant le <strong>Niveau 20</strong>, validez la <strong>Maîtrise</strong> pour faire apparaître ici de nouveaux sets d'accords." 
        },
        { 
            target: "settingsInvs", 
            title: "Renversements", 
            text: "Activez ou désactivez les renversements (État Fondamental, 1er, 2ème...). Maîtriser les renversements est une des clés vers la maîtrise de l'oreille relative." 
        },
        { 
            target: "btnResetSave", 
            title: "Réinitialiser", 
            text: "Ce bouton efface TOUTE votre progression. À utiliser uniquement si vous voulez recommencer votre carrière à zéro.",
            onEnter: () => { document.querySelector('#settingsModal .modal').scrollTop = 1000; }
        },
        
        // --- STATS ---
        { 
            target: "btnStats", 
            title: "Vos Statistiques", 
            text: "Suivez votre progression en détail. Fermons les réglages et ouvrons les stats...",
            onEnter: () => { window.UI.closeModals(); } 
        },
        { 
            target: "coachDisplay", 
            title: "Le Coach Virtuel", 
            text: "Il analyse vos dernières parties pour vous donner des conseils personnalisés sur vos points faibles.",
            onEnter: () => { window.UI.openModal('statsModal'); }
        },
        { 
            target: "historyChart", 
            title: "Historique", 
            text: "Consultez votre taux de réussite sur les 7 dernières sessions." 
        },
        { 
            target: "statsContent", 
            title: "Analyse Précise", 
            text: "Visualisez votre pourcentage de réussite pour chaque accord et chaque renversement." 
        },
        { 
            target: "badgesGrid", 
            title: "Trophées", 
            text: "Collectionnez les badges en accomplissant des exploits. Cliquez sur un badge pour voir comment l'obtenir.",
            onEnter: () => { 
                // On scrolle juste ce qu'il faut pour voir le début des badges
                const m = document.querySelector('#statsModal .modal');
                if(m) m.scrollTop = 400; 
            }
        },

        // --- CODEX (NOUVEAU) ---
        {
            target: "btnCodex",
            title: "Le Codex",
            text: "Votre encyclopédie théorique interactive.",
            onEnter: () => { window.UI.closeModals(); }
        },
        {
            target: "codexGridContainer", // Cible la grille
            title: "Fiches Théoriques",
            text: "Cliquez sur une carte pour obtenir des éléments théoriques et écouter l'accord.",
            onEnter: () => { window.UI.openCodex(); }
        },

        // --- ARÈNE (NOUVEAU & DÉTAILLÉ) ---
        { 
            target: "btnArena", 
            title: "L'Arène", 
            text: "Prêt à vous mesurer au monde ? Les classements et défis se trouvent ici.",
            onEnter: () => { window.UI.closeModals(); }
        },
        { 
            // ASTUCE TECHNIQUE : On cible la modale, mais on injecte un ID sur les onglets pour l'étape d'après
            target: "challengeHubModal", 
            title: "Le Hub", 
            text: "Bienvenue dans l'Arène.",
            onEnter: () => { 
                window.UI.showChallengeHub(); 
                // Hack pour cibler la barre d'onglets qui n'a pas d'ID dans le HTML
                const nav = document.querySelector('.lb-sub-nav');
                if(nav) nav.id = "tuto-arena-nav"; 
            }
        },
        { 
            target: "tuto-arena-nav", // On cible l'ID qu'on vient de créer dynamiquement
            title: "Navigation", 
            text: "Utilisez ces onglets pour naviguer entre les Classements, le Défi du Jour et les modes Créatifs."
        },
        { 
            target: "c-tab-arcade", 
            title: "Classements", 
            text: "Comparez vos scores (Chrono, Sprint et Inverse) avec le monde entier.",
            onEnter: () => { 
                // CORRECTION : showChallengeHub charge déjà l'onglet 'arcade' par défaut.
                // On retire l'appel manuel à switchChallengeTab pour éviter le double chargement.
                if(!document.getElementById('challengeHubModal').classList.contains('open')) {
                    window.UI.showChallengeHub();
                }
            }
        },
        { 
            target: "c-tab-global", 
            title: "Défi du Jour", 
            text: "Chaque jour, une série unique. Tout le monde a le même tirage. Qui aura la meilleure note ?",
            onEnter: () => { window.UI.switchChallengeTab('global'); }
        },
        // Onglet REJOINDRE
        { 
            target: "c-tab-join", 
            title: "Rejoindre", 
            text: "Rejoignez un défi, ou consultez votre score avec le bouton 'Voir Scores'.",
            onEnter: () => { window.UI.switchChallengeTab('join'); }
        },
        { 
            target: "joinInput", 
            title: "Code Défi", 
            text: "Entrez ici le code fourni par votre professeur ou un ami pour lancer un défi spécifique.",
        },
        // Onglet CRÉER
        { 
            target: "c-tab-create", 
            title: "Créer", 
            text: "Devenez le professeur et créez votre propre défi.",
            onEnter: () => { window.UI.switchChallengeTab('create'); }
        },
        { 
            target: "btnOpenStudio", 
            title: "Le Studio", 
            text: "Composez votre propre dictée musicale accord par accord pour vous mesurer à vos amis.",
        },
        { 
            target: "createControls", 
            title: "Générateur Aléatoire", 
            text: "Ou laissez l'IA créer un défi. Le contenu dépendra des <strong>Accords activés dans vos Paramètres</strong>.",
        },

        // FIN
        { 
            target: null, 
            title: "Bonne chance !", 
            text: "Vous pouvez relancer ce guide à tout moment depuis les <strong>Paramètres > Guide</strong>.<br>À vous de jouer !",
            onEnter: () => { window.UI.closeModals(); }
        }
    ],

    // Vérifie si un module de tutoriel doit être affiché
    checkTutorialTriggers(context) {
        const data = window.App?.data || {};
        const lvl = data.lvl || 1;
        const mastery = data.mastery || 0;
        
        // Vérifier chaque module
        for (const [moduleId, module] of Object.entries(this.tutorialModules)) {
            // Vérifier si le module a déjà été vu
            if (localStorage.getItem(`tuto_module_${moduleId}_seen`) === 'true') {
                continue;
            }
            
            // Vérifier les conditions de niveau et maîtrise
            if (lvl < module.requiredLevel || mastery < module.requiredMastery) {
                continue;
            }
            
            // Vérifier le déclencheur selon le contexte
            let shouldTrigger = false;
            
            switch (module.trigger) {
                case 'onFirstVisit':
                    if (context.type === 'firstVisit' && !localStorage.getItem('tuto_first_visit')) {
                        shouldTrigger = true;
                    }
                    break;
                    
                case 'onModalOpen':
                    if (context.type === 'modalOpen' && context.modalId === module.modalId) {
                        shouldTrigger = true;
                    }
                    break;
                    
                case 'onModeUnlock':
                    if (context.type === 'modeUnlock' && context.mode === module.mode) {
                        shouldTrigger = true;
                    }
                    break;
                    
                case 'onTabSwitch':
                    if (context.type === 'tabSwitch' && context.tabId === module.tabId) {
                        shouldTrigger = true;
                    }
                    break;
                    
                case 'onGameOver':
                    if (context.type === 'gameOver') {
                        shouldTrigger = true;
                    }
                    break;
                    
                case 'onFirstCorrect':
                    if (context.type === 'firstCorrect') {
                        shouldTrigger = true;
                    }
                    break;
                    
                case 'onFirstError':
                    if (context.type === 'firstError') {
                        shouldTrigger = true;
                    }
                    break;
                    
                case 'onFirstBadge':
                    if (context.type === 'firstBadge') {
                        shouldTrigger = true;
                    }
                    break;
                    
                case 'onChallengeStart':
                    if (context.type === 'challengeStart') {
                        shouldTrigger = true;
                    }
                    break;
                    
                case 'onMasteryUnlock':
                    if (context.type === 'masteryUnlock') {
                        shouldTrigger = true;
                    }
                    break;
                    
                case 'onFirstLeaderboard':
                    if (context.type === 'firstLeaderboard') {
                        shouldTrigger = true;
                    }
                    break;
            }
            
            if (shouldTrigger) {
                return moduleId;
            }
        }
        
        return null;
    },

    // Lance un module de tutoriel spécifique
    startTutorialModule(moduleId) {
        const module = this.tutorialModules[moduleId];
        if (!module) {
            console.warn(`Module de tutoriel introuvable: ${moduleId}`);
            return;
        }
        
        // Vérifier les conditions une dernière fois
        const data = window.App?.data || {};
        if (data.lvl < module.requiredLevel || data.mastery < module.requiredMastery) {
            return;
        }
        
        this.currentTutorialModule = moduleId;
        this.wtStep = 0;
        this.startWalkthrough(moduleId);
    },

    startWalkthrough(moduleId = null) {
        // Si un moduleId est fourni, utiliser ce module, sinon utiliser l'ancien système
        let steps = [];
        
        if (moduleId && this.tutorialModules[moduleId]) {
            steps = this.tutorialModules[moduleId].steps;
            this.currentTutorialModule = moduleId;
        } else {
            // Ancien système : utiliser wtData
            steps = this.wtData;
            this.currentTutorialModule = null;
        }
        
        // Filtrer les étapes selon les conditions
        const data = window.App?.data || {};
        const filteredSteps = steps.filter(step => {
            // Vérifier skipIf si présent
            if (step.skipIf && typeof step.skipIf === 'function') {
                try {
                    if (step.skipIf()) return false;
                } catch (e) {
                    console.warn("Erreur dans skipIf:", e);
                }
            }
            return true;
        });
        
        // Stocker les étapes filtrées temporairement
        this.currentSteps = filteredSteps;
        this.wtStep = 0;
        
        // IMPORTANT: Ne PAS fermer les modales si c'est un tutoriel contextuel (moduleId fourni)
        // Car le tutoriel doit s'afficher SUR la modale ouverte
        if (!moduleId) {
            // Ferme les modales existantes pour nettoyer la vue (ancien système)
            this.closeModals();
        }
        document.getElementById('tour-spotlight').classList.add('active');
        document.getElementById('tour-tooltip').classList.add('active');
        this.renderWalkthroughStep();
        
        // Empêche le scroll pendant le tuto
        document.body.style.overflow = 'hidden';
    },

    endWalkthrough() {
        const spotlight = document.getElementById('tour-spotlight');
        const tooltip = document.getElementById('tour-tooltip');
        if(spotlight) spotlight.classList.remove('active');
        if(tooltip) tooltip.classList.remove('active');
        document.body.style.overflow = ''; // Restaure le scroll
        
        // Marquer le module comme vu
        if (this.currentTutorialModule) {
            localStorage.setItem(`tuto_module_${this.currentTutorialModule}_seen`, 'true');
        } else {
            // Ancien système
            localStorage.setItem('tuto_seen_v5.4', 'true');
        }
        
        // Marquer la première visite
        if (this.currentTutorialModule === 'first_visit') {
            localStorage.setItem('tuto_first_visit', 'true');
        }
        
        this.currentTutorialModule = null;
        this.currentSteps = null;
        
        // Petit délai pour reset le highlight
        setTimeout(() => {
            const spot = document.getElementById('tour-spotlight');
            if(spot) {
                spot.style.top = '-1000px'; 
                spot.style.left = '-1000px';
                spot.style.width = '0';
                spot.style.height = '0';
                spot.style.pointerEvents = 'none'; // FIX: Désactiver les interactions
            }
            const tool = document.getElementById('tour-tooltip');
            if(tool) {
                tool.style.pointerEvents = 'none'; // FIX: Désactiver les interactions
            }
        }, 500);
    },

    nextWalkthroughStep() {
        Audio.sfx('card_open'); // Son plus doux et musical
        this.wtStep++;
        const steps = this.currentSteps || this.wtData;
        if (this.wtStep >= steps.length) {
            this.endWalkthrough();
            this.showToast("🎓 Bon entraînement !");
        } else {
            this.renderWalkthroughStep();
        }
    },

    renderWalkthroughStep() {
        const steps = this.currentSteps || this.wtData;
        
        // Sécurité fin de parcours
        if (this.wtStep >= steps.length) {
            this.endWalkthrough();
            this.showToast("🎓 Bon entraînement !");
            return;
        }

        const step = steps[this.wtStep];
        if(!step) return;

        // --- 1. GESTION DES ACTIONS (FIX: Ouverture des Modales) ---
        // C'est ici que ça manquait. On traite l'instruction 'action' du wtData.
        if (step.action === 'openSettings') {
            this.openModal('settingsModal');
        } 
        else if (step.action === 'openArena') {
            this.showChallengeHub();
        }

        // Supporte aussi les fonctions personnalisées existantes (onEnter)
        if (step.onEnter) {
            step.onEnter();
        }

            // --- 2. DÉLAI D'ANIMATION (Augmenté à 400ms) ---
        // On laisse le temps à la modale de s'ouvrir (transition CSS) avant de calculer les positions
        setTimeout(() => {
            const spot = document.getElementById('tour-spotlight');
            const tool = document.getElementById('tour-tooltip');
            let targetEl = step.target ? document.getElementById(step.target) : null;

            // --- 3. AUTO-SKIP INTELLIGENT (Mis à jour) ---
            // Si l'étape concerne le bouton Google, on vérifie si l'utilisateur est déjà connecté.
            if (step.target === 'googleAuthBtn') {
                const user = Cloud.auth ? Cloud.auth.currentUser : null;
                // Si l'utilisateur est déjà un membre certifié (NON anonyme), c'est inutile de lui dire de se connecter.
                // On passe donc à l'étape suivante.
                if (user && !user.isAnonymous) {
                    console.log("[Tuto] Utilisateur déjà connecté Google, étape suivante.");
                    this.nextWalkthroughStep();
                    return;
                }
            }

            // Remplissage du contenu
            const steps = this.currentSteps || this.wtData;
            document.getElementById('tour-title').innerHTML = step.title;
            document.getElementById('tour-desc').innerHTML = step.text;
            document.getElementById('tour-step-count').innerText = `${this.wtStep + 1}/${steps.length}`;
            
            // --- LOGIQUE DE POSITIONNEMENT ---
            if (!targetEl) {
                // CAS 1 : Pas de cible (Centré)
                spot.style.width = '0px'; spot.style.height = '0px';
                spot.style.top = '50%'; spot.style.left = '50%';
                tool.style.top = '50%'; tool.style.left = '50%';
                tool.style.transform = 'translate(-50%, -50%)';
                const arrow = document.getElementById('tour-arrow');
                if(arrow) arrow.style.display = 'none';

            } else {
                // CAS 2 : Cible trouvée
                
                // --- 4. SCROLL AUTOMATIQUE (FIX: Élément visible) ---
                // Force le navigateur à scroller l'élément au centre de la vue (crucial pour les modales)
                // On remplace 'smooth' par 'auto' pour éviter le décalage pendant l'animation
                // IMPORTANT: Ne pas scroller si l'élément est caché (display: none)
                if (window.getComputedStyle(targetEl).display !== 'none') {
                    targetEl.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
                }

                const rect = targetEl.getBoundingClientRect();
                const margin = 15;
                
                // Le projecteur (Spotlight)
                // FIX: Si l'élément est invisible (width/height = 0 ou display: none), utiliser une position par défaut
                const targetDisplay = window.getComputedStyle(targetEl).display;
                if (rect.width === 0 || rect.height === 0 || targetDisplay === 'none') {
                    // Élément invisible, centrer le spotlight
                    spot.style.width = '200px';
                    spot.style.height = '200px';
                    spot.style.top = '50%';
                    spot.style.left = '50%';
                    spot.style.transform = 'translate(-50%, -50%)';
                } else {
                    spot.style.width = (rect.width + 8) + 'px';
                    spot.style.height = (rect.height + 8) + 'px';
                    spot.style.top = (rect.top - 4) + 'px';
                    spot.style.left = (rect.left - 4) + 'px';
                    spot.style.transform = '';
                }
                
                // Récupère l'arrondi de l'élément ciblé pour que ce soit joli
                const style = window.getComputedStyle(targetEl);
                spot.style.borderRadius = style.borderRadius !== '0px' ? style.borderRadius : '8px';

                // La bulle d'aide (Tooltip)
                const toolH = tool.offsetHeight || 200;
                const toolW = tool.offsetWidth || 320;
                
                // Par défaut en dessous
                let top = rect.bottom + margin;
                let left = rect.left + (rect.width/2) - (toolW/2);
                
                // Si dépasse en bas de l'écran, on met au dessus
                if (top + toolH > window.innerHeight - 10) {
                    top = rect.top - toolH - margin;
                }
                
                // Garde-fous écrans
                if (top < 10) top = 10;
                if (left < 10) left = 10;
                if (left + toolW > window.innerWidth) left = window.innerWidth - toolW - 10;

                tool.style.top = top + 'px';
                tool.style.left = left + 'px';
                tool.style.transform = ''; 
                // FIX: S'assurer que le tooltip est cliquable (z-index élevé et pointer-events)
                tool.style.pointerEvents = 'auto';
                tool.style.zIndex = '2147483647';
                // FIX: S'assurer que les boutons du tooltip sont cliquables
                const tourBtns = tool.querySelectorAll('.tour-btn');
                tourBtns.forEach(btn => {
                    btn.style.pointerEvents = 'auto';
                    btn.style.zIndex = '2147483648';
                });

                // La flèche
                const arrow = document.getElementById('tour-arrow');
                if(arrow) {
                    const targetDisplay = window.getComputedStyle(targetEl).display;
                    let arrowLeft = (rect.width === 0 || rect.height === 0 || targetDisplay === 'none') ? toolW / 2 - 8 : (rect.left + rect.width/2) - left - 8;
                    arrowLeft = Math.max(10, Math.min(toolW - 26, arrowLeft));
                    arrow.style.left = arrowLeft + 'px';
                    arrow.style.top = (rect.bottom + margin === top) ? '-8px' : 'auto';
                    arrow.style.bottom = (rect.bottom + margin !== top) ? '-8px' : 'auto';
                    arrow.style.display = 'block';
                }
            } 
        }, 400); // Délai suffisant pour l'ouverture de la modale
    },
    
    // Garder cette fonction pour le bouton "Guide" du menu
    // Par défaut, lance le tutoriel d'accueil, mais peut être utilisé pour l'ancien tutoriel complet
    openTutorial(moduleId = null) {
        if (moduleId && this.tutorialModules[moduleId]) {
            this.startTutorialModule(moduleId);
        } else {
            // Par défaut, lancer uniquement le tutoriel d'accueil
            this.startTutorialModule('first_visit');
        }
    },

    // --- AJOUT ICI ---
    badgeQueue: [],      // Liste d'attente
    isBadgeBusy: false,  // Est-ce qu'un badge est déjà affiché ?
    // -----------------

    // --- CHALLENGE HUB (V5.0) ---
    
    showChallengeHub() {
        this.openModal('challengeHubModal');
        this.switchChallengeTab('arcade'); 
        this.loadDailyChallengeUI();
    },
    
    updateChallengeControls(active) {
        const btn = document.getElementById('btnSettings');
        if(!btn) return;
        
        if (active) {
            // Mode Défi : Bouton Quitter (Porte)
            btn.innerHTML = "🚪";
            btn.onclick = async () => {
                const confirmed = await window.UI.showConfirmModal("Quitter le défi en cours ? Tout progrès sera perdu.", "Quitter le défi");
                if(confirmed) {
                    window.ChallengeManager.exit();
                }
            };
            btn.style.borderColor = "var(--error)";
            btn.style.color = "var(--error)";
        } else {
            // Mode Normal : Bouton Settings (Engrenage)
            btn.innerHTML = "⚙️";
            btn.onclick = () => window.UI.openModal('settingsModal');
            btn.style.borderColor = "";
            btn.style.color = "";
        }
    },

    switchChallengeTab(tabName) {
        document.querySelectorAll('.challenge-tab-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.challenge-tab-btn').forEach(el => el.classList.remove('active'));
        
        const tabContent = document.getElementById(`c-tab-${tabName}`);
        if(tabContent) tabContent.style.display = 'block';
        
        // Gestion des boutons d'onglets (Mapping manuel basé sur l'ordre HTML)
        const btns = document.querySelectorAll('.challenge-tab-btn');
        if(btns.length >= 4) {
            if(tabName === 'arcade') { btns[0].classList.add('active'); this.updateLeaderboardView(); }
            if(tabName === 'global') btns[1].classList.add('active');
            if(tabName === 'join') btns[2].classList.add('active');
            if(tabName === 'create') btns[3].classList.add('active');
        }
        
        // Hook : Vérifier si un tutoriel contextuel doit s'afficher pour l'onglet "Créer"
        if (tabName === 'create') {
            setTimeout(() => {
                const moduleId = this.checkTutorialTriggers({ type: 'tabSwitch', tabId: 'c-tab-create' });
                if (moduleId) {
                    this.startTutorialModule(moduleId);
                }
            }, 300);
        }
    },

    async loadDailyChallengeUI() {
        const id = Cloud.getDailyChallengeID();
        const dateEl = document.getElementById('dailyDateStr');
        if(dateEl) dateEl.innerText = id.split('-').slice(1).join('/');
        
        const list = document.getElementById('dailyLeaderboardList');
        if(list) {
            list.innerHTML = '<div style="text-align:center; padding:10px; color:var(--text-dim);">Chargement...</div>';
            
            const scores = await Cloud.getChallengeLeaderboard(id);
            const myUid = Cloud.getCurrentUID();
            
            list.innerHTML = '';
            
            if(scores.length === 0) {
                list.innerHTML = '<div style="text-align:center; color:var(--text-dim);">Soyez le premier à jouer aujourd\'hui !</div>';
            } else {
                let userFoundInTop = false;
                
                // VERIFICATION PASSIVE DES BADGES DE RANG (Empereur / Olympien)
                // On cherche l'utilisateur via son UID unique
                const myEntryIndex = scores.findIndex(s => s.uid === myUid);
                
                if (myEntryIndex !== -1) {
                    const rank = myEntryIndex + 1;
                    const total = scores.length;
                    
                    // Mise à jour de la session pour la vérification des badges
                    window.App.session.challengeRank = rank;
                    window.App.session.challengeTotalPlayers = total;
                    
                    // Logique OLYMPIEN (Podium sur 5 challenges différents)
                    if (rank <= 3 && total >= 20) {
                        const podiums = window.App.data.arenaStats.podiumDates;
                        if (!podiums.includes(id)) {
                            podiums.push(id);
                            window.App.save();
                        }
                    }
                    
                    // Déclenchement de la vérification (Débloque Empereur, Outsider, Olympien si conditions remplies)
                    window.App.checkBadges();
                }

                // RENDER LIST
                scores.forEach((s, idx) => {
                    const isMe = (s.uid === myUid);
                    if (isMe) userFoundInTop = true;
                    
                    let rank = idx+1;
                    let color = 'white';
                    
                    // Calcul de la réussite (Moyenne)
                    // FIX: Calculer le nombre de bonnes réponses à partir de note et total
                    const totalPoints = s.total || 20;
                    let correctAnswers;
                    
                    // Calcul correct : utiliser note si disponible (nouveaux scores), sinon estimer à partir de score
                    if (s.note !== undefined && s.note !== null) {
                        // Nouveaux scores : note sur 20, on calcule correctAnswers
                        correctAnswers = Math.round((s.note / 20) * totalPoints);
                    } else if (s.score !== undefined && s.score !== null) {
                        // Anciens scores : score est le total de points, on doit estimer
                        if (s.score <= totalPoints * 20) {
                            correctAnswers = Math.max(0, Math.min(totalPoints, Math.round(s.score / 20)));
                        } else {
                            // Score trop élevé, on utilise une estimation conservatrice
                            correctAnswers = Math.round(totalPoints * 0.5); // Estimation à 50%
                        }
                    } else {
                        correctAnswers = 0;
                    }
                    
                    const isPass = (correctAnswers / totalPoints) >= 0.5;

                    let rankDisplay = rank;
                    let scoreDisplay = `${correctAnswers}/${totalPoints}`;

                    if(idx===0) { rankDisplay='🥇'; color='var(--gold)'; }
                    else if(idx===1) { rankDisplay='🥈'; color='#e2e8f0'; }
                    else if(idx===2) { rankDisplay='🥉'; color='#b45309'; }
                    
                    // LOGIQUE ANTI-HUMILIATION & PROGRESSION (V5.3)
                    if (!isPass) {
                        rankDisplay = '-'; // On masque le rang exact
                        scoreDisplay = `<span style="font-size:0.75rem; font-weight:400; opacity:0.7; color:var(--text-dim);">💪 En progrès</span>`;
                        color = 'var(--text-dim)';
                        
                        // Si c'est moi, on checke si c'est un record personnel ou une tendance haussière
                        if (isMe) {
                            const status = window.App.getProgressionStatus(displayScore, totalPoints);
                            if (status === 'best') {
                                scoreDisplay = `<span style="font-size:0.7rem; font-weight:900; opacity:1; color:var(--cyan);">⭐ Record Perso</span>`;
                                color = 'var(--cyan)';
                            } else if (status === 'trend') {
                                scoreDisplay = `<span style="font-size:0.7rem; font-weight:900; opacity:1; color:var(--success);">📈 En hausse</span>`;
                                color = 'var(--success)';
                            }
                        }
                    }

                    // AFFICHAGE MAITRISE (V5.3)
                    let masteryHtml = "";
                    if (s.mastery && s.mastery > 0) {
                        const lore = this.getLoreState(s.mastery);
                        // Version compacte pour la liste
                        masteryHtml = `<div style="font-size:0.6rem; color:${lore.color}; opacity:0.7; margin-top:2px;">Maîtrise ${s.mastery} ${lore.starsHTML}</div>`;
                    }

                    list.innerHTML += `
                        <div style="display:flex; align-items:center; background:rgba(255,255,255,0.05); padding:8px; border-radius:8px; border:1px solid ${isMe ? 'var(--primary)' : 'transparent'};">
                            <div style="width:30px; text-align:center; font-weight:700;">${rankDisplay}</div>
                            <div style="flex:1;">
                                <div style="font-weight:700; color:${color};">${s.pseudo}</div>
                                ${masteryHtml}
                            </div>
                            <div style="font-weight:900;">${scoreDisplay}</div>
                        </div>
                    `;
                });

                // Message d'encouragement si le joueur a joué aujourd'hui mais n'est pas dans le top affiché
                const todayISO = new Date().toISOString().split('T')[0];
                if (!userFoundInTop && window.App.data.arenaStats.lastDailyDate === todayISO) {
                    list.innerHTML += `
                        <div style="margin-top:10px; padding:10px; background:rgba(99, 102, 241, 0.1); border:1px dashed var(--primary); border-radius:8px; text-align:center; color:#a5b4fc; font-size:0.85rem;">
                            <strong>Continuez vos efforts !</strong><br>Votre score est enregistré, visez le Top 50 pour apparaître ici !
                        </div>
                    `;
                }
            }
        }
    },

    async joinDailyChallenge() {
        const id = Cloud.getDailyChallengeID();
        const settings = {
            activeC: DB.sets.academy.chords.map(c=>c.id), 
            activeI: DB.invs.map(i=>i.id),
            set: 'academy'
        };
        const challengeData = {
            id: id,
            seed: id,
            length: 20,
            settings: settings
        };
        const confirmed = await this.showConfirmModal(`Lancer le Défi du Jour ?<br><br>20 Questions • Mode Académie`, "Défi du Jour");
        if(confirmed) {
            await ChallengeManager.start(challengeData);
        }
    },

    async joinDailyChallenge() {
        const id = Cloud.getDailyChallengeID();
        const settings = {
            activeC: DB.sets.academy.chords.map(c=>c.id), 
            activeI: DB.invs.map(i=>i.id),
            set: 'academy'
        };
        const challengeData = {
            id: id,
            seed: id,
            length: 20,
            settings: settings
        };
        const confirmed = await this.showConfirmModal(`Lancer le Défi du Jour ?<br><br>20 Questions • Mode Académie`, "Défi du Jour");
        if(confirmed) {
            await ChallengeManager.start(challengeData);
        }
    },

    async joinChallenge() {
        // Cible l'input avec le bon ID (joinInput)
        const input = document.getElementById('joinInput');
        if(!input) { 
            console.error("Input 'joinInput' introuvable"); 
            this.showToast("Erreur : Champ de code introuvable");
            return; 
        }
        
        const code = input.value.trim().toUpperCase();
        
        if(code.length < 3) {
            this.showToast("⚠️ Le code doit contenir au moins 3 caractères");
            return;
        }
        
        let data = await Cloud.getChallenge(code);
        
        if(!data) {
            data = {
                id: code,
                seed: code,
                length: 20,
                settings: { 
                    set: window.App.data.currentSet, 
                    activeC: window.App.data.settings.activeC, 
                    activeI: window.App.data.settings.activeI 
                }
            };
        }
        
        const confirmed = await this.showConfirmModal(`Rejoindre le défi "${code}" ?`, "Rejoindre un défi");
        
        if(confirmed) {
            await ChallengeManager.start(data);
        }
    },

    async viewChallengeLeaderboard() {
        const input = document.getElementById('joinInput');
        if(!input) return;
        
        const code = input.value.trim().toUpperCase();
        if(code.length < 3) { window.UI.showToast("Code trop court"); return; }

        const container = document.getElementById('join-lb-results');
        if(!container) return;

        container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-dim);">Recherche du classement...</div>';
        const scores = await Cloud.getChallengeLeaderboard(code);
        
        if(scores.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-dim);">Aucun score trouvé pour <strong>${code}</strong>.</div>`;
        } else {
            const myUid = Cloud.getCurrentUID();
            let html = `<h4 style="margin:10px 0; color:var(--text-dim); text-align:center;">Classement : ${code}</h4><div style="display:flex; flex-direction:column; gap:8px; max-height:200px; overflow-y:auto;">`;
            scores.forEach((s, idx) => {
                const isMe = (s.uid === myUid);
                let rank = idx+1;
                let color = 'white';
                
                // FIX: Calculer le nombre de bonnes réponses à partir de note et total
                // score est le total de points, pas le nombre de bonnes réponses
                const totalPoints = s.total || 20;
                let correctAnswers;
                
                // Calcul correct : utiliser note si disponible (nouveaux scores), sinon estimer à partir de score
                if (s.note !== undefined && s.note !== null) {
                    // Nouveaux scores : note sur 20, on calcule correctAnswers
                    correctAnswers = Math.round((s.note / 20) * totalPoints);
                } else if (s.score !== undefined && s.score !== null) {
                    // Anciens scores : score est le total de points, on doit estimer
                    // Si score = 25 et total = 10, cela ne peut pas être 25 bonnes réponses
                    // On estime : si score est raisonnable, on peut l'utiliser, sinon on calcule
                    // En général, score = correctAnswers * 20 - mistakes * 5
                    // Pour simplifier, on estime : correctAnswers ≈ score / 20 (si score < total * 20)
                    if (s.score <= totalPoints * 20) {
                        correctAnswers = Math.max(0, Math.min(totalPoints, Math.round(s.score / 20)));
                    } else {
                        // Score trop élevé, on utilise une estimation conservatrice
                        correctAnswers = Math.round(totalPoints * 0.5); // Estimation à 50%
                    }
                } else {
                    correctAnswers = 0;
                }
                
                const isPass = (correctAnswers / totalPoints) >= 0.5;

                let rankDisplay = rank;
                let scoreDisplay = `${correctAnswers}/${totalPoints}`;

                if(idx===0) { rankDisplay='🥇'; color='var(--gold)'; }
                else if(idx===1) { rankDisplay='🥈'; color='#e2e8f0'; }
                else if(idx===2) { rankDisplay='🥉'; color='#b45309'; }
                
                if (!isPass) {
                    rankDisplay = '-'; // On masque le rang exact pour les scores < 50%
                    color = 'var(--text-dim)';
                    // FIX: Masquer le score exact pour tous (y compris l'utilisateur) si < 50%
                    scoreDisplay = `<span style="font-size:0.75rem; font-weight:400; opacity:0.7; color:var(--text-dim);">💪 En progrès</span>`;
                    // L'utilisateur verra toujours son pseudo avec "En progrès", mais pas son score exact
                }

                let masteryHtml = "";
                if (s.mastery && s.mastery > 0) {
                    const lore = this.getLoreState(s.mastery);
                    masteryHtml = `<div style="font-size:0.6rem; color:${lore.color}; opacity:0.7; margin-top:2px;">Maîtrise ${s.mastery} ${lore.starsHTML}</div>`;
                }

                html += `
                    <div style="display:flex; align-items:center; background:rgba(255,255,255,0.05); padding:8px; border-radius:8px; border:1px solid ${isMe ? 'var(--primary)' : 'transparent'};">
                        <div style="width:30px; text-align:center; font-weight:700;">${rankDisplay}</div>
                        <div style="flex:1;">
                            <div style="font-weight:700; color:${color};">${s.pseudo}</div>
                            ${masteryHtml}
                        </div>
                        <div style="font-weight:900;">${scoreDisplay}</div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        }
    },

    setCreateLength(n) {
        this.createConfig.length = n;
        document.querySelectorAll('#c-tab-create .mode-opt').forEach(b => {
            b.classList.remove('active');
            if(b.innerText == n) b.classList.add('active');
        });
    },

    async createChallengeAction() {
        const seedInput = document.getElementById('createSeedInput');
        let seed = seedInput ? seedInput.value.trim().toUpperCase() : "";
        if(!seed) seed = 'DEF-' + Math.floor(Math.random()*10000);
        
        const data = {
            seed: seed,
            length: this.createConfig.length,
            settings: {
                set: window.App.data.currentSet,
                activeC: window.App.data.settings.activeC,
                activeI: window.App.data.settings.activeI
            }
        };
        
        const id = await Cloud.createChallenge(data);
        if(id) {
            // V5.2 - Increment Challenges Created
            window.App.data.arenaStats.challengesCreated++;
            window.App.save();
            window.App.checkBadges();

            alert(`Défi créé ! Code : ${id}`);
            if(document.getElementById('challengeCodeInput')) {
                document.getElementById('challengeCodeInput').value = id;
            }
            this.switchChallengeTab('join');
        } else {
            alert("Erreur de création (Code déjà pris ?)");
        }
    },

    renderChallengeReport(report) {
        // Normalisation : accepte soit {chord,userResp} soit l'ancien {correct,given}
        const mistakes = Array.isArray(report.mistakes) ? report.mistakes.map(m => {
            if (m && m.chord && m.userResp) return m;

            // Fallback ancien format
            const chordObj = (m && m.correct)
                ? { type: (DB.chords.find(c => c.id === m.correct) || { name: m.correct, sub: "" }), notes: [] }
                : { type: { name: "?", sub: "" }, notes: [] };

            return {
                chord: chordObj,
                userResp: (m && m.given) ? m.given : {}
            };
        }) : [];

        let coachMsg = "Bravo pour cet effort.";
        if (mistakes.length > 0) {
            const m0 = mistakes[0];
            const cName = m0?.chord?.type?.name || "?";
            coachMsg = `Tu as confondu <strong>${cName}</strong>. Compare tes réponses ci-dessous.`;
        } else {
            coachMsg = "Un parcours sans faute ! Ton oreille est affûtée.";
        }

        const modal = document.getElementById('challengeReportModal');
        if(!modal) return;
        
        // VIEW 1: MISTAKES LIST
        // FIX: Utiliser le step stocké dans chaque erreur, ou trouver dans attempts
        const mistakeToQuestionMap = new Map();
        if (report.attempts && report.mistakes) {
            // Trouver tous les indices dans attempts où win === false (dans l'ordre chronologique)
            const errorIndices = [];
            report.attempts.forEach((attempt, idx) => {
                if (!attempt.win) {
                    errorIndices.push(idx);
                }
            });
            
            // Mapper chaque erreur à son numéro de question réel
            report.mistakes.forEach((mistake, mistakeIdx) => {
                // Priorité 1: Utiliser step si disponible
                if (mistake.step !== undefined) {
                    mistakeToQuestionMap.set(mistakeIdx, mistake.step + 1); // +1 car step commence à 0
                } 
                // Priorité 2: Utiliser l'index dans attempts
                else if (mistakeIdx < errorIndices.length) {
                    mistakeToQuestionMap.set(mistakeIdx, errorIndices[mistakeIdx] + 1);
                } 
                // Fallback
                else {
                    mistakeToQuestionMap.set(mistakeIdx, mistakeIdx + 1);
                }
            });
        }
        
        const mistakesHTML = mistakes.map((m, mistakeIdx) => {
            const targetNotesStr = JSON.stringify(m.chord.notes);
            const targetName = m.chord.type.name;
            const targetSub = m.chord.type.sub;
            
            // ISO-BASS LOGIC: Detect target physical bass note to align user response
            const targetBass = Math.min(...m.chord.notes);

            let userNotes = [];
            let userLabel = "???";
            let userSub = "";
            
            if (m.userResp.notes) {
                userNotes = m.userResp.notes;
                userLabel = m.userResp.label || m.userResp.type.name;
            } else {
                const uType = m.userResp.type;
                const uInv = m.userResp.inv;
                const uTypeObj = DB.chords.find(c => c.id === uType);
                if (uTypeObj) {
                    userLabel = uTypeObj.name;
                    userSub = uTypeObj.sub;
                    // V5.2 ISO-BASS FIX: Use getNotesFromBass instead of getNotes with default root
                    // This ensures the comparison chord sounds at the same pitch height as the target
                    userNotes = window.App.getNotesFromBass(uTypeObj, uInv, targetBass);
                }
            }
            const userNotesStr = JSON.stringify(userNotes);
            
            // FIX: Utiliser le numéro de question réel au lieu de l'index dans mistakes
            const questionNumber = mistakeToQuestionMap.get(mistakeIdx) || (mistakeIdx + 1);

            return `
                <div class="mistake-row" style="flex-direction:column; align-items:stretch; cursor:default; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; padding-bottom:5px; border-bottom:1px solid rgba(255,255,255,0.05);">
                        <span style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase;">Question ${questionNumber}</span>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <div style="flex:1; background:rgba(16, 185, 129, 0.1); border:1px solid rgba(16, 185, 129, 0.3); border-radius:8px; padding:8px; cursor:pointer;" onclick="window.AudioEngine.chord(${targetNotesStr})">
                            <div style="font-size:0.6rem; color:var(--success); font-weight:700;">CIBLE</div>
                            <div style="font-weight:700; color:white;">${targetName}</div>
                            <div style="font-size:0.7rem; opacity:0.7;">${targetSub}</div>
                            <div style="margin-top:5px; font-size:1.2rem;">🔊</div>
                        </div>
                        <div style="flex:1; background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.3); border-radius:8px; padding:8px; cursor:pointer;" onclick="window.AudioEngine.chord(${userNotesStr})">
                            <div style="font-size:0.6rem; color:var(--error); font-weight:700;">RÉPONSE</div>
                            <div style="font-weight:700; color:white;">${userLabel}</div>
                            <div style="font-size:0.7rem; opacity:0.7;">${userSub}</div>
                            <div style="margin-top:5px; font-size:1.2rem;">🔊</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // VIEW 2: STATISTICS GRID
        let statsHTML = "";
        let statsInvHTML = "";
        
        if (report.attempts) {
            const stats = {};
            const statsInv = {};
            
            const isLab = window.App.data.currentSet === 'laboratory';
            const isJazz = window.App.data.currentSet === 'jazz';

            report.attempts.forEach(a => {
                // CHORDS AGG
                const id = a.chord.type.id;
                if(!stats[id]) stats[id] = {ok:0, tot:0, name: a.chord.type.name, sub: a.chord.type.sub};
                stats[id].tot++;
                if(a.win) stats[id].ok++;
                
                // INV AGG
                let iName = "";
                if(isLab) {
                    if(a.chord.type.configs && a.chord.type.configs[a.chord.inv]) {
                        iName = a.chord.type.configs[a.chord.inv].name;
                    } else iName = `Config ${a.chord.inv}`;
                } else if (isJazz) {
                    const v = DB.voicings.find(x => x.id === a.chord.inv);
                    iName = v ? v.name : `Voicing ${a.chord.inv}`;
                } else {
                    const i = DB.invs.find(x => x.id === a.chord.inv);
                    iName = i ? i.name : `Inv ${a.chord.inv}`;
                }
                
                // Composite key for Lab to avoid name collision if needed, but display name is enough
                const iKey = isLab ? `${id}_${a.chord.inv}` : a.chord.inv; 
                // Using display name as key for simplicity in grouping same-named invs
                const iDisplayKey = iName;
                
                if(!statsInv[iDisplayKey]) statsInv[iDisplayKey] = {ok:0, tot:0, name: iName};
                statsInv[iDisplayKey].tot++;
                if(a.win) statsInv[iDisplayKey].ok++;
            });
            
            statsHTML = `<h5 style="color:var(--text-dim); margin-bottom:5px;">QUALITÉS</h5>` + Object.values(stats).map(s => {
                const pct = Math.round((s.ok / s.tot) * 100);
                const col = pct >= 80 ? 'var(--success)' : (pct >= 50 ? 'var(--warning)' : 'var(--error)');
                return `
                    <div class="stat-item">
                        <div class="stat-header">
                            <span style="color:white; font-weight:700;">${s.name}</span>
                            <span>${s.ok}/${s.tot} (${pct}%)</span>
                        </div>
                        <div class="stat-track">
                            <div class="stat-fill" style="width:${pct}%; background:${col}"></div>
                        </div>
                    </div>
                `;
            }).join('');
            
            statsInvHTML = `<h5 style="color:var(--text-dim); margin:15px 0 5px 0;">VARIATIONS</h5>` + Object.values(statsInv).map(s => {
                const pct = Math.round((s.ok / s.tot) * 100);
                const col = pct >= 80 ? 'var(--success)' : (pct >= 50 ? 'var(--warning)' : 'var(--error)');
                return `
                    <div class="stat-item">
                        <div class="stat-header">
                            <span style="color:white; font-weight:700;">${s.name}</span>
                            <span>${s.ok}/${s.tot} (${pct}%)</span>
                        </div>
                        <div class="stat-track">
                            <div class="stat-fill" style="width:${pct}%; background:${col}"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // FIX: Calculer le nombre de bonnes réponses à partir de attempts
        const correctAnswers = report.attempts ? report.attempts.filter(a => a.win).length : 0;
        const totalQuestions = report.total || (report.attempts ? report.attempts.length : 0);
        const pct = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

        modal.innerHTML = `
            <div class="modal" style="text-align:center;">
                <h4 style="color:var(--text-dim); margin-bottom:10px;">Rapport de Session</h4>
                <h2 style="margin:0; color:white; font-size:1.5rem;">${report.seed}</h2>
                
                <div class="report-score-circle" style="border-color:${pct >= 50 ? 'var(--success)' : 'var(--error)'}; color:${pct >= 50 ? 'var(--success)' : 'var(--error)'};">
                    <span style="font-size:3.5rem; font-weight:900;">${correctAnswers}</span>
                    <span style="font-size:1rem; opacity:0.8;">/ ${totalQuestions}</span>
                    <div style="font-size:0.9rem; margin-top:5px; color:${pct>=50?'var(--success)':'var(--error)'}">${pct}%</div>
                </div>

                <div class="coach-bubble" style="margin-bottom:20px;">
                    <strong>🧠 Coach:</strong> ${coachMsg}
                </div>

                <div class="report-tabs" style="display:flex; justify-content:center; gap:10px; margin-bottom:10px;">
                    <button id="btn-rep-err" class="mode-opt active" onclick="window.UI.switchReportTab('err')">Erreurs</button>
                    <button id="btn-rep-stat" class="mode-opt" onclick="window.UI.switchReportTab('stat')">Statistiques</button>
                    <button id="btn-rep-leaderboard" class="mode-opt" onclick="window.UI.switchReportTab('leaderboard', '${report.id || report.seed}')">Classement</button>
                </div>

                <div style="background:rgba(0,0,0,0.2); border-radius:12px; padding:10px; max-height:250px; overflow-y:auto; text-align:left;">
                    <div id="view-rep-err">
                        ${mistakesHTML}
                        ${report.mistakes.length === 0 ? '<div style="text-align:center; opacity:0.5; padding:20px;">Aucune erreur ! Une oreille parfaite.</div>' : ''}
                    </div>
                    <div id="view-rep-stat" style="display:none;">
                        ${statsHTML}
                        ${statsInvHTML}
                    </div>
                    <div id="view-rep-leaderboard" style="display:none;">
                        <div style="text-align:center; padding:20px; color:var(--text-dim); font-size:0.8rem;">Chargement du classement...</div>
                    </div>
                </div>

                <button id="btn-rep-quit" class="cmd-btn btn-action" style="width:100%; margin-top:15px;" onclick="
                    try { window.ChallengeManager?.exit?.(); } catch(e) { window.UI?.closeModals?.(); }
                ">
                 Quitter
                </button>
            </div>
        `;
        // FIX: Utiliser openModal pour s'assurer que la modale est visible
        this.openModal('challengeReportModal');
        Audio.sfx('win');
    },

    switchReportTab(tab, challengeId = null) {
        document.getElementById('view-rep-err').style.display = tab === 'err' ? 'block' : 'none';
        document.getElementById('view-rep-stat').style.display = tab === 'stat' ? 'block' : 'none';
        document.getElementById('view-rep-leaderboard').style.display = tab === 'leaderboard' ? 'block' : 'none';
        document.getElementById('btn-rep-err').classList.toggle('active', tab === 'err');
        document.getElementById('btn-rep-stat').classList.toggle('active', tab === 'stat');
        document.getElementById('btn-rep-leaderboard').classList.toggle('active', tab === 'leaderboard');
        
        // Charger le leaderboard uniquement quand l'onglet est activé (lazy loading)
        if (tab === 'leaderboard' && challengeId) {
            this.loadChallengeLeaderboard(challengeId, document.getElementById('view-rep-leaderboard'));
        }
    },

    // Fonction pour charger le leaderboard d'un défi dans la modale de fin
    async loadChallengeLeaderboard(challengeId, containerElement) {
        if (!containerElement || !challengeId) return;
        
        // Afficher l'état de chargement
        containerElement.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-dim); font-size:0.8rem;">Chargement du classement...</div>';
        
        try {
            const scores = await Cloud.getChallengeLeaderboard(challengeId);
            const myUid = Cloud.getCurrentUID();
            
            containerElement.innerHTML = ''; // Clear loading text
            
            if (scores.length === 0) {
                containerElement.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-dim);">Aucun score pour ce défi.</div>';
                return;
            }
            
            // Calculer la fenêtre de scores à afficher (utilisateur +/- 2)
            let myIndex = scores.findIndex(s => s.uid === myUid);
            let start = 0;
            let end = Math.min(10, scores.length); // Afficher jusqu'à 10 scores
            
            if (myIndex !== -1) {
                start = Math.max(0, myIndex - 2);
                end = Math.min(scores.length, start + 5);
                // Ajuster si on est en bas de liste pour afficher 5 éléments si possible
                if (end - start < 5 && start > 0) {
                    start = Math.max(0, end - 5);
                }
            }
            
            const slice = scores.slice(start, end);
            
            slice.forEach((s, idx) => {
                const absRank = start + idx + 1;
                const isMe = (myIndex !== -1 && (start + idx) === myIndex);
                
                // Calculer le nombre de bonnes réponses
                const totalPoints = s.total || 20;
                let correctAnswers;
                
                if (s.note !== undefined && s.note !== null) {
                    correctAnswers = Math.round((s.note / 20) * totalPoints);
                } else if (s.score !== undefined && s.score !== null) {
                    if (s.score <= totalPoints * 20) {
                        correctAnswers = Math.max(0, Math.min(totalPoints, Math.round(s.score / 20)));
                    } else {
                        correctAnswers = Math.round(totalPoints * 0.5);
                    }
                } else {
                    correctAnswers = 0;
                }
                
                const isPass = (correctAnswers / totalPoints) >= 0.5;
                
                let rankDisplay = absRank;
                let color = 'white';
                let scoreDisplay = `${correctAnswers}/${totalPoints}`;
                
                if (absRank === 1) { rankDisplay = '🥇'; color = 'var(--gold)'; }
                else if (absRank === 2) { rankDisplay = '🥈'; color = '#e2e8f0'; }
                else if (absRank === 3) { rankDisplay = '🥉'; color = '#b45309'; }
                
                if (!isPass) {
                    rankDisplay = '-';
                    color = 'var(--text-dim)';
                    scoreDisplay = '<span style="font-size:0.75rem; font-weight:400; opacity:0.7; color:var(--text-dim);">💪 En progrès</span>';
                }
                
                const row = document.createElement('div');
                row.style.cssText = `
                    display:flex; align-items:center; padding:6px 10px; border-radius:8px; 
                    background:${isMe ? 'rgba(99, 102, 241, 0.15)' : 'transparent'}; 
                    border:1px solid ${isMe ? 'var(--primary)' : 'transparent'};
                    margin-bottom: 2px;
                    font-size: 0.85rem;
                `;
                
                row.innerHTML = `
                    <div style="width:25px; text-align:center; font-size:1rem; margin-right:8px;">${rankDisplay}</div>
                    <div style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:700; color:${isMe ? 'white' : color};">
                        ${s.pseudo}
                    </div>
                    <div style="font-weight:900; color:${color};">${scoreDisplay}</div>
                `;
                
                containerElement.appendChild(row);
            });
            
        } catch (e) {
            console.error("Erreur lors du chargement du leaderboard:", e);
            containerElement.innerHTML = '<div style="color:var(--error); text-align:center; padding:20px;">Erreur de connexion</div>';
        }
    },

    // --- LEADERBOARD ARCADE ---
    
    setLbMode(mode) { this.lbState.mode = mode; this.updateLeaderboardView(); },
    setLbPeriod(period) { this.lbState.period = period; this.updateLeaderboardView(); },

    async updateLeaderboardView() {
        const mode = this.lbState.mode;
        const period = this.lbState.period;
        const container = document.getElementById('c-tab-arcade');
        if(!container) return; 

        container.querySelectorAll('.mode-opt').forEach(b => b.classList.remove('active'));
        const activeModeBtn = document.getElementById(`lb-mode-${mode}`);
        if(activeModeBtn) activeModeBtn.classList.add('active');
        
        container.querySelectorAll('.lb-period-btn').forEach(b => b.classList.remove('active'));
        const activePeriodBtn = document.getElementById(`lb-period-${period}`);
        if(activePeriodBtn) activePeriodBtn.classList.add('active');
        
        await this.loadLeaderboardData(mode, period);
    },

    async loadLeaderboardData(mode, period) {
        const list = document.getElementById('lb-list');
        const loader = document.getElementById('lb-loader');
        if(list) list.innerHTML = '';
        if(loader) loader.style.display = 'block';
        try {
            let realScores = await Cloud.getLeaderboard(mode, period);
            realScores = realScores.slice(0, 20); 
            const modeGhosts = GHOSTS.filter(g => g.mode === mode);
            let scores = [...realScores, ...modeGhosts];
            scores.sort((a, b) => b.score - a.score);

            if(loader) loader.style.display = 'none';
            if(scores.length === 0 && list) {
                const periodText = period === 'weekly' ? "cette semaine" : "pour le moment";
                list.innerHTML = `<div style="text-align:center; color:var(--text-dim); margin-top:20px;">Aucun score ${periodText}.<br>Soyez le premier !</div>`;
                return;
            }
            const myUid = Cloud.getCurrentUID();
            let foundUser = false;
            
            scores.forEach((s, idx) => {
                // Vérifier si l'utilisateur est dans le classement
                if (!s.isGhost && s.uid === myUid && !foundUser) {
                    foundUser = true;
                    // Hook : Vérifier si c'est la première fois que l'utilisateur apparaît dans un classement
                    if (!localStorage.getItem('tuto_module_first_leaderboard_seen')) {
                        setTimeout(() => {
                            const moduleId = this.checkTutorialTriggers({ type: 'firstLeaderboard' });
                            if (moduleId) {
                                this.startTutorialModule(moduleId);
                            }
                        }, 1000);
                    }
                }
                
                let rankVisual = `<span style="width:25px; font-weight:700; color:var(--text-dim);">${idx+1}</span>`;
                if(idx === 0) rankVisual = '🥇';
                if(idx === 1) rankVisual = '🥈';
                if(idx === 2) rankVisual = '🥉';
                
                const row = document.createElement('div');
                row.className = s.isGhost ? 'leaderboard-row ghost' : 'leaderboard-row';
                const masteryStars = "★".repeat(Math.max(0, (s.mastery || 0) % 5));
                const masteryColor = LORE_MATERIALS[Math.floor((s.mastery || 0)/5)]?.color || 'var(--text-dim)';
                
                let nameHtml = s.pseudo || s.name;
                let subHtml = `Maîtrise ${s.mastery||0} ${masteryStars}`;
                
                if (s.isGhost) {
                    nameHtml = `${s.name} ✨`;
                    let levelLabel = "Initié";
                    if (s.mastery >= 19) levelLabel = "Divin";
                    else if (s.mastery >= 10) levelLabel = "Maître";
                    subHtml = `<span style="color:var(--text-dim)">Légende</span> • ${levelLabel}`;
                    row.style.cursor = 'help';
                    row.onclick = () => window.UI.showGhostQuote(s.name, s.quote);
                }

                row.innerHTML = `<div style="font-size:1.2rem; width:30px; text-align:center;">${rankVisual}</div><div style="flex:1; margin-left:10px;"><div style="font-weight:700; color:${s.isGhost ? '#a5f3fc' : masteryColor};">${nameHtml}</div><div style="font-size:0.7rem; opacity:0.6;">${subHtml}</div></div><div style="font-weight:900; font-size:1.1rem; color:var(--gold);">${s.score}</div>`;
                if(list) list.appendChild(row);
            });
        } catch (e) { console.error(e); if(loader) loader.innerHTML = "Erreur de chargement..."; }
    },
    
    // --- GAME OVER LOGIC (AJOUT) ---
    async populateGameOver(sessionData, mode) {
        const fbArea = document.getElementById('inverseFeedbackArea');
        const lbArea = document.getElementById('miniLeaderboardArea');
        
        // 1. Reset Areas
        if(fbArea) { fbArea.innerHTML = ''; fbArea.style.display = 'none'; }
        if(lbArea) { lbArea.innerHTML = '<div style="text-align:center; padding:10px; color:var(--text-dim); font-size:0.8rem;">Chargement du classement...</div>'; lbArea.style.display = 'flex'; }

        // 2. Feedback Inverse Mode
        if (mode === 'inverse' && fbArea && sessionData.chord) {
            fbArea.style.display = 'flex';
            
            // Target Button
            const targetNotes = JSON.stringify(sessionData.chord.notes);
            const btnTarget = `
                <button class="cmd-btn" style="background:rgba(16, 185, 129, 0.2); border:1px solid var(--success); color:var(--success); flex:1; padding:10px;" onclick="window.AudioEngine.chord(${targetNotes})">
                    <span style="font-size:0.8rem; font-weight:800;">✅ CIBLE</span>
                    <span style="font-size:1.5rem;">🔊</span>
                </button>
            `;
            
            // Error Button (User Choice)
            let btnError = "";
            if (sessionData.quizUserChoice !== null && sessionData.quizOptions[sessionData.quizUserChoice]) {
                const userOpt = sessionData.quizOptions[sessionData.quizUserChoice];
                const userNotes = JSON.stringify(userOpt.notes);
                btnError = `
                    <button class="cmd-btn" style="background:rgba(239, 68, 68, 0.2); border:1px solid var(--error); color:var(--error); flex:1; padding:10px;" onclick="window.AudioEngine.chord(${userNotes})">
                        <span style="font-size:0.8rem; font-weight:800;">❌ ERREUR</span>
                        <span style="font-size:1.5rem;">🔊</span>
                    </button>
                `;
            }
            
            fbArea.innerHTML = btnTarget + btnError;
        }

        // 3. Mini Leaderboard (Slice)
        if (lbArea) {
            try {
                const scores = await Cloud.getLeaderboard(mode, 'weekly');
                const myUid = Cloud.getCurrentUID();
                const myPseudo = window.App.data.username; // Fallback

                let myIndex = scores.findIndex(s => s.uid === myUid);
                // Fallback username match if UID not found (rare but possible with anon auth legacy)
                if (myIndex === -1) myIndex = scores.findIndex(s => s.pseudo === myPseudo && s.score === sessionData.score);
                
                lbArea.innerHTML = ''; // Clear loading text

                if (scores.length === 0) {
                    lbArea.innerHTML = '<div style="text-align:center; opacity:0.6; padding:10px;">Aucun score cette semaine.</div>';
                    return;
                }

                // Calculate Slice Window (User +/- 2)
                let start = 0;
                let end = 5; // Default Top 5
                
                if (myIndex !== -1) {
                    start = Math.max(0, myIndex - 2);
                    end = Math.min(scores.length, start + 5);
                    // Adjust if we are at the bottom of the list to show 5 items if possible
                    if (end - start < 5 && start > 0) {
                        start = Math.max(0, end - 5);
                    }
                }

                const slice = scores.slice(start, end);
                
                slice.forEach((s, i) => {
                    const absRank = start + i + 1;
                    const isMe = (myIndex !== -1 && (start + i) === myIndex);
                    
                    let rankDisplay = `<span style="color:var(--text-dim); font-weight:700;">${absRank}</span>`;
                    if (absRank === 1) rankDisplay = '🥇';
                    if (absRank === 2) rankDisplay = '🥈';
                    if (absRank === 3) rankDisplay = '🥉';
                    
                    const row = document.createElement('div');
                    row.className = 'leaderboard-row'; 
                    // Manual override for mini version to ensure it fits nicely
                    row.style.cssText = `
                        display:flex; align-items:center; padding:6px 10px; border-radius:8px; 
                        background:${isMe ? 'rgba(99, 102, 241, 0.15)' : 'transparent'}; 
                        border:1px solid ${isMe ? 'var(--primary)' : 'transparent'};
                        margin-bottom: 2px;
                        font-size: 0.85rem;
                    `;
                    
                    row.innerHTML = `
                        <div style="width:25px; text-align:center; font-size:1rem; margin-right:8px;">${rankDisplay}</div>
                        <div style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:700; color:${isMe ? 'white' : 'var(--text-dim)'};">
                            ${s.pseudo}
                        </div>
                        <div style="font-weight:900; color:var(--gold);">${s.score}</div>
                    `;
                    lbArea.appendChild(row);
                });

            } catch(e) {
                console.error(e);
                lbArea.innerHTML = '<div style="color:var(--error); text-align:center;">Erreur connexion</div>';
            }
        }
    },

    showGhostQuote(name, quote) {
        let el = document.getElementById('badgeOverlay');
        if (!el) { el = document.createElement('div'); el.id = 'badgeOverlay'; el.className = 'modal-overlay badge-lightbox'; document.body.appendChild(el); el.onclick = () => { el.classList.remove('open'); }; }
        el.innerHTML = `<div class="modal" style="max-width:350px;"><div style="font-size:3rem; margin-bottom:10px;">👻</div><h2 style="color:var(--cyan); margin:0; text-transform:uppercase; letter-spacing:1px; line-height:1.2;">${name}</h2><div style="margin-top:10px; height:2px; background:var(--panel-border); width:50%; margin-left:auto; margin-right:auto;"></div><p style="color:white; margin-top:20px; font-size:1.1rem; line-height:1.5; font-style:italic;">"${quote}"</p><button class="cmd-btn btn-listen" style="width:100%; margin-top:20px; padding:12px;" onclick="document.getElementById('badgeOverlay').classList.remove('open')">Fermer</button></div>`;
        el.classList.add('open');
        window.UI.vibrate(10);
    },

    // --- STANDARD HELPER METHODS ---
    getSymbol(id) {
        // CORRECTION : On checke minmaj7 EN PREMIER pour ne pas qu'il soit attrapé par le 'maj7' plus bas
        if(id === 'minmaj7') return '-Δ'; 
        
        if(id.includes('maj7')) return 'Δ';
        if(id.includes('min7')) return '-7'; 
        if(id.includes('dom7') || id === 'dom13') return '7';
        if(id === 'hdim7') return 'Ø';
        if(id === 'dim7') return 'o';
        if(id === 'maj69') return '6/9';
        if(id === 'min6') return '-6';
        if(id === 'alt') return 'Alt';
        if(id.includes('sus')) return 'Sus';
        if(id === 'maj9') return 'Δ9';
        if(id === 'min9') return '-9';
        if(id === 'struct_36') return '3/6';
        if(id === 'struct_45tr') return '4/5-Tr';
        if(id === 'trichord') return '3-X';
        if(id === 'sus_sym') return 'Sus';
        // --- AJOUT POUR LES RENVERSEMENTS (inv_0, inv_1...) ---
        if (id.startsWith('inv_')) {
            const idx = parseInt(id.split('_')[1]);
            // On cherche le chiffrage dans la DB
            // Note: DB doit être accessible ici
            const invObj = DB.invs.find(x => x.id === idx);
            if (invObj && invObj.figure) {
                // On formate en HTML vertical (classe figured-bass déjà dans ton CSS)
                return `<div class="figured-bass" style="font-size:0.5em; line-height:0.9;">${invObj.figure.map(n => `<span>${n}</span>`).join('')}</div>`;
            }
            return idx === 0 ? 'F' : (idx === 1 ? '1' : (idx === 2 ? '2' : '3'));
        }
        // -----------------------------------------------------
        
        return id;
    },

    getLabel(item, type) {
        if (item.figure && item.figure.length > 0) {
            return `<div class="figured-bass">${item.figure.map(n => `<span>${n}</span>`).join('')}</div>`;
        }
        if (type === 'c') {
            return item.tech || item.name;
        }
        return item.corr || item.name;
    },
    
    renderQuizOptions(options, targetOpt) {
        document.querySelectorAll('.quiz-btn').forEach(b => {
            b.className = 'quiz-btn';
            b.classList.remove('selected', 'correct', 'wrong', 'lab-mode');
        });
        
        const isLab = window.App.data.currentSet === 'laboratory';
        let targetVisual = "";

        if (isLab) {
            const config = targetOpt.type.configs[targetOpt.inv];
            let top='?', bot='?';
            
            if(targetOpt.type.id === 'trichord') {
                const vals = [['1/2','1/2'], ['Tr','1/2'], ['1','1'], ['3M','1/2']];
                [top, bot] = vals[targetOpt.inv] || ['?','?'];
            } else if (targetOpt.type.id === 'struct_36') {
                const vals = [['6m','3m'], ['3m','6m'], ['6M','3M'], ['3M','6M']];
                [top, bot] = vals[targetOpt.inv] || ['?','?'];
            } else if (targetOpt.type.id === 'struct_45tr') {
                const vals = [['Tr','4J'], ['4J','Tr'], ['Tr','5J'], ['5J','Tr']];
                [top, bot] = vals[targetOpt.inv] || ['?','?'];
            } else if (targetOpt.type.id === 'sus_sym') {
                 const txts = ["Sus 2", "Sus 4", "Quartal", "Quintal"];
                 top = txts[targetOpt.inv]; bot = "";
            }
            
            if(targetOpt.type.id === 'sus_sym') {
                targetVisual = `<div style="font-size:2rem; font-weight:900;">${top}</div><div class="lab-tag">${targetOpt.type.name}</div>`;
            } else {
                targetVisual = `<div class="figured-bass quiz-huge"><span>${top}</span><span>${bot}</span></div><div class="lab-tag">${config.name}</div>`;
            }
        } else {
            const labelC = this.getLabel(targetOpt.type, 'c');
            let labelI = "";
            if (targetOpt.type.id !== 'dim7') {
                 const invList = (window.App.data.currentSet === 'jazz') ? DB.voicings : DB.invs;
                 const invObj = invList.find(i => i.id === targetOpt.inv);
                 if(invObj) labelI = this.getLabel(invObj, 'i');
            }
            targetVisual = `${labelC}<div style="font-size:0.4em; opacity:0.7; margin-top:5px;">${labelI}</div>`;
        }
        
        const labelEl = document.getElementById('quizTargetLbl');
        if(labelEl) labelEl.innerHTML = targetVisual;

        [0, 1, 2].forEach(idx => {
            const btn = document.getElementById(`qbtn-${idx}`);
            if(!btn) return;
            if(options[idx]) {
                btn.style.display = 'flex';
                if (isLab) btn.classList.add('lab-mode');
                const letters = ['A', 'B', 'C'];
                btn.innerHTML = `${letters[idx]}<span class="reveal">...</span>`;
            } else {
                btn.style.display = 'none';
            }
        });
    },

    updateQuizSelection(idx) {
        document.querySelectorAll('.quiz-btn').forEach(b => b.classList.remove('selected'));
        if(idx !== null) {
            const btn = document.getElementById(`qbtn-${idx}`);
            if(btn) btn.classList.add('selected');
        }
    },
    
    revealQuiz(userChoiceIdx, correctIdx, options) {
         const isLab = window.App.data.currentSet === 'laboratory';
         options.forEach((opt, idx) => {
            const btn = document.getElementById(`qbtn-${idx}`);
            if(!btn) return;
            btn.classList.remove('selected');
            if(idx === correctIdx) {
                btn.classList.add('correct');
            } else if (idx === userChoiceIdx && userChoiceIdx !== correctIdx) {
                btn.classList.add('wrong');
            }
            
            let visual = "";
            if (isLab) {
                const config = opt.type.configs[opt.inv];
                let top='?', bot='?';
                if(opt.type.id === 'trichord') {
                    const vals = [['1/2','1/2'], ['Tr','1/2'], ['1','1'], ['3M','1/2']];
                    [top, bot] = vals[opt.inv] || ['?','?'];
                } else if (opt.type.id === 'struct_36') {
                    const vals = [['6m','3m'], ['3m','6m'], ['6M','3M'], ['3M','6M']];
                    [top, bot] = vals[opt.inv] || ['?','?'];
                } else if (opt.type.id === 'struct_45tr') {
                    const vals = [['Tr','4J'], ['4J','Tr'], ['Tr','5J'], ['5J','Tr']];
                    [top, bot] = vals[opt.inv] || ['?','?'];
                }
                if (opt.type.id === 'sus_sym') {
                     const txts = ["Sus 2", "Sus 4", "Quartal", "Quintal"];
                     visual = `<div style="font-size:1.1rem; font-weight:900;">${txts[opt.inv]}</div>`;
                } else {
                     visual = `<div class="figured-bass"><span>${top}</span><span>${bot}</span></div>`;
                }
            } else {
                const labelC = this.getLabel(opt.type, 'c');
                let labelI = "";
                if (opt.type.id !== 'dim7') {
                     const invList = (window.App.data.currentSet === 'jazz') ? DB.voicings : DB.invs;
                     const invObj = invList.find(i => i.id === opt.inv);
                     if(invObj) labelI = this.getLabel(invObj, 'i');
                }
                visual = `${labelC}<br><span style="font-size:0.6em; opacity:0.7;">${labelI}</span>`;
            }
            const letters = ['A', 'B', 'C'];
            btn.innerHTML = `${letters[idx]}<span class="reveal">${visual}</span>`;
         });
    },

    getLoreState(m) {
        if (m <= 0) return { rankLabel: 'M-00', starsHTML: '', fullName: 'Débutant', grade: 'Débutant', material: null, place: "L'Académie", color: '#94a3b8', shadow: 'rgba(148, 163, 184, 0.2)' };
        const mIdx = m - 1; 
        const gradeIdx = mIdx % 5;
        const gradeName = LORE_GRADES[gradeIdx];
        const starCount = gradeIdx + 1; 
        const placeName = LORE_PLACES[mIdx] || null;
        const matIdx = Math.floor(mIdx / 5);
        let matName, color, shadow, particle;

        if (matIdx < LORE_MATERIALS.length) {
            const mat = LORE_MATERIALS[matIdx];
            matName = mat.name;
            particle = mat.particle || "de "; 
            color = mat.color;
            shadow = mat.shadow;
        } else {
            const offset = matIdx - LORE_MATERIALS.length;
            const hue = (280 + (offset * 137.5)) % 360; 
            color = `hsl(${Math.round(hue)}, 100%, 60%)`;
            shadow = `hsl(${Math.round(hue)}, 100%, 40%)`;
            matName = `Transcendance ${offset + 1}`;
            particle = "de ";
        }
        const fullName = `${gradeName} ${particle}${matName}`;
        const rankLabel = `M-${m.toString().padStart(2, '0')}`;
        let starsHTML = "";
        for(let i=0; i<starCount; i++) starsHTML += `<span class="tier-star">★</span>`;

        return { rankLabel, starsHTML, grade: gradeName, material: matName, fullName, place: placeName, color, shadow };
    },

    renderBoard() {
        const d = window.App.data;
        const isLab = d.currentSet === 'laboratory';
        const getRankClass = (ok) => {
            if(ok >= 100) return 'rank-gold';
            if(ok >= 50) return 'rank-silver';
            if(ok >= 20) return 'rank-bronze';
            return '';
        };

        const cg = document.getElementById('chordGrid'); 
        if(cg) {
            cg.innerHTML='';
            if(d.settings.activeC.length > 4) { cg.className = "pad-grid grid-c"; } else { cg.className = "pad-grid grid-i"; }

            if(d.settings && d.settings.activeC) { 
                DB.chords.forEach(c => { 
                    if(!d.settings.activeC.includes(c.id)) return; 
                    const ok = d.stats.c[c.id] ? d.stats.c[c.id].ok : 0;
                    const visual = this.getLabel(c, 'c');
                    cg.innerHTML += `<div class="pad ${getRankClass(ok)}" id="c-${c.id}" onclick="window.App.select('c','${c.id}')"><div class="pad-main">${visual}</div><div class="pad-sub">${c.sub}</div></div>`; 
                }); 
            }
        }

        const ig = document.getElementById('invGrid'); 
        if(ig) {
            ig.innerHTML='';
            if (isLab) {
                ig.className = "pad-grid grid-lab";
                const session = window.App.session;
                let contextId = session.selC || (session.chord ? session.chord.type.id : d.settings.activeC[0]);
                const chordObj = DB.sets.laboratory.chords.find(c => c.id === contextId);
                const labConfig = { leftTitle: "8ve Diminuée >|<", rightTitle: "8ve Augmentée <|>", leftColor: "var(--warning)", rightColor: "var(--primary)" };

                if (contextId === 'trichord') { labConfig.leftTitle = "DISSONANCE"; labConfig.rightTitle = "COULEUR"; } 
                else if (contextId === 'sus_sym') { labConfig.leftTitle = "TRIADES SUS"; labConfig.rightTitle = "EMPILEMENTS"; }

                ig.innerHTML += `<div class="lab-header" style="color:${labConfig.leftColor}">${labConfig.leftTitle}</div><div class="lab-header" style="color:${labConfig.rightColor}">${labConfig.rightTitle}</div>`;

                const createLabBtn = (id) => {
                    if(!chordObj || !chordObj.configs[id]) return `<div class="pad locked"></div>`;
                    const config = chordObj.configs[id];
                    const statKey = `${contextId}_${id}`;
                    const ok = d.stats.l[statKey] ? d.stats.l[statKey].ok : 0;
                    let visual = "";
                    let tagPos = config.name.toUpperCase();
                    
                    if (contextId === 'trichord') {
                        let top='?', bot='?';
                        if(id===0){top='1/2';bot='1/2';}
                        if(id===1){top='Tr';bot='1/2';} 
                        if(id===2){top='1';bot='1';}
                        if(id===3){top='3M';bot='1/2';}
                        visual = `<div class="figured-bass"><span>${top}</span><span>${bot}</span></div>`;
                    }
                    else if (contextId === 'sus_sym') {
                        let txt = "";
                        if(id===0){txt="Sus 2";} if(id===1){txt="Sus 4";} if(id===2){txt="Quartal";} if(id===3){txt="Quintal";}
                        visual = `<div style="font-size:1.1rem; font-weight:900;">${txt}</div>`;
                    }
                    else if (contextId === 'struct_36') {
                        let top='?', bot='?';
                        if(id===0){top='6m';bot='3m';} if(id===1){top='3m';bot='6m';} if(id===2){top='6M';bot='3M';} if(id===3){top='3M';bot='6M';}
                        visual = `<div class="figured-bass"><span>${top}</span><span>${bot}</span></div>`;
                    }
                    else if (contextId === 'struct_45tr') {
                        let top='?', bot='?';
                        if(id===0){top='Tr';bot='4J';} if(id===1){top='4J';bot='Tr';} if(id===2){top='Tr';bot='5J';} if(id===3){top='5J';bot='Tr';}
                        visual = `<div class="figured-bass"><span>${top}</span><span>${bot}</span></div>`;
                    }
                    let extraClass = (id < 2) ? "lab-contracted" : "lab-expanded";
                    return `<div class="pad ${getRankClass(ok)} ${extraClass}" id="i-${id}" onclick="window.App.select('i',${id})"><div class="pad-main">${visual}</div><div class="lab-tag">${tagPos}</div></div>`;
                };
                ig.innerHTML += createLabBtn(0); ig.innerHTML += createLabBtn(2); ig.innerHTML += createLabBtn(1); ig.innerHTML += createLabBtn(3);
            } else {
                ig.className = "pad-grid grid-i"; 
                if(d.settings && d.settings.activeI) { 
                    DB.currentInvs.forEach(i => { 
                        if(!d.settings.activeI.includes(i.id)) return; 
                        let ok = 0; let visual = ""; let subText = i.sub;
                        if(d.currentSet === 'jazz') { ok = d.stats.v[i.id] ? d.stats.v[i.id].ok : 0; visual = this.getLabel(i, 'i'); } 
                        else { ok = d.stats.i[i.id] ? d.stats.i[i.id].ok : 0; visual = this.getLabel(i, 'i'); }
                        ig.innerHTML += `<div class="pad ${getRankClass(ok)}" id="i-${i.id}" onclick="window.App.select('i',${i.id})"><div class="pad-main">${visual}</div><div class="pad-sub">${subText}</div></div>`; 
                    }); 
                }
            }
        }

        // Rendre les schémas de clavier pour les raccourcis
        // Vérifier si on est en mode desktop
        const isDesktop = window.innerWidth > 768;
        
        if (isDesktop) {
            // Schéma pour les accords (1-6)
            this.renderKeyboardShortcuts('chords', ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6']);
            
            // Schéma pour les renversements (Q W E R)
            // Seulement si ce n'est pas le mode laboratory
            if (!isLab) {
                this.renderKeyboardShortcuts('inversions', ['KeyQ', 'KeyW', 'KeyE', 'KeyR']);
            }
        }
    },

    renderSel() {
        document.querySelectorAll('.pad').forEach(p => p.classList.remove('selected'));
        
        // Studio Mode Handling
        if(window.App.session.mode === 'studio') {
            const s = window.App.session.studio;
            if(s.chordId) {
                const el = document.getElementById('c-'+s.chordId);
                if(el) el.classList.add('selected');
            }
            if(s.invId !== null) {
                const el = document.getElementById('i-'+s.invId);
                if(el) el.classList.add('selected');
            }
            const valBtn = document.getElementById('valBtn');
            if(valBtn) valBtn.disabled = false;
            return;
        }

        // Standard Game Mode Handling
        if(window.App.session.selC) {
            const el = document.getElementById('c-'+window.App.session.selC);
            if(el) el.classList.add('selected');
        }
        if(window.App.session.selI !== null && window.App.session.selI !== -1) {
            const el = document.getElementById('i-'+window.App.session.selI);
            if(el) el.classList.add('selected');
        }
        const valBtn = document.getElementById('valBtn');
        if(valBtn) valBtn.disabled = !(window.App.session.selC && window.App.session.selI !== null);
    },

    reveal(okC, okI) {
        const c = window.App.session.chord; 
        const cEl = document.getElementById('c-'+c.type.id);
        if(cEl) cEl.classList.add(okC?'correct':'correction');
        
        if(!okC && window.App.session.selC) {
            const selEl = document.getElementById('c-'+window.App.session.selC);
            if(selEl) selEl.classList.add('wrong');
        }
        
        if(c.type.id !== 'dim7') { 
            const iEl = document.getElementById('i-'+c.inv);
            if(iEl) iEl.classList.add(okI?'correct':'correction');
            
            if(!okI && window.App.session.selI !== null) {
                const selIEl = document.getElementById('i-'+window.App.session.selI);
                if(selIEl) selIEl.classList.add('wrong');
            }
        }
    },

    resetVisuals() { 
        document.querySelectorAll('.pad').forEach(p => p.className='pad'); 
        document.querySelectorAll('.quiz-btn').forEach(b => { b.className = 'quiz-btn'; b.classList.remove('selected', 'correct', 'wrong', 'lab-mode'); });
        window.UI.renderBoard(); 
        const p = document.getElementById('invPanel'); if(p) { p.style.opacity = '1'; p.style.pointerEvents = 'auto'; }
        const piano = document.getElementById('pianoCanvas'); if(piano) piano.classList.remove('show');
        const vis = document.getElementById('visualizer'); if(vis) vis.style.opacity = '0.5';
    },

    msg(txt, state) { 
        const el = document.getElementById('statusText'); 
        if(!el) return;
        el.innerText = txt; 
        el.className = "feedback-msg " + (state==='correct'?'correct':state==='warning'?'warning':state===false?'wrong':''); 
    },

    vibrate(ptr) { if(navigator.vibrate) navigator.vibrate(ptr); },
    
    // --- DANS UI.JS ---

    // 1. Initialisation de la barre (Correction du segment en trop)
    initChallengeProgress(total) {
        const container = document.getElementById('challengeProgressContainer');
        if (!container) return;
        
        // A. Nettoyage absolu (Supprime les anciens segments fantômes)
        container.innerHTML = ''; 
        container.style.display = 'flex';

        // B. Boucle Corrigée : Strictement inférieur à total (i < total)
        // Si total = 10, ça va de 0 à 9 (donc 10 cases).
        for (let i = 0; i < total; i++) {
            const seg = document.createElement('div');
            seg.className = 'challenge-segment'; // Classe de base (Gris)
            seg.id = `prog-seg-${i}`;
            
            // C. Seule la première case est "Active/Blanche" au début
            if (i === 0) {
                seg.classList.add('current');
            }
            
            container.appendChild(seg);
        }
    },

    // 2. Mise à jour de la barre (Correction des couleurs)
    updateChallengeProgress(stepIndex, status) { 
        // stepIndex = Index de la question qu'on vient de finir
        
        // A. GESTION DU PASSÉ (La question finie)
        const currentSeg = document.getElementById(`prog-seg-${stepIndex}`);
        if (currentSeg) {
            // FORCE RESET : On écrase toutes les classes pour ne garder que la base
            // Cela supprime 'current', 'wrong', 'active', etc.
            currentSeg.className = 'challenge-segment'; 
            
            // On applique proprement la couleur du résultat
            // status doit être 'win' (Vert) ou 'lose' (Rouge)
            currentSeg.classList.add(status === 'win' ? 'correct' : 'wrong');
        }

        // B. GESTION DU FUTUR (La question suivante)
        const nextIndex = stepIndex + 1;
        const nextSeg = document.getElementById(`prog-seg-${nextIndex}`);
        
        // On vérifie que la case existe (pour ne pas planter à la dernière question)
        if (nextSeg) {
            nextSeg.className = 'challenge-segment'; // On s'assure qu'elle est propre
            nextSeg.classList.add('current'); // Elle devient blanche (En cours)
        }
    },

    resetChallengeUI() {
        const container = document.getElementById('challengeProgressContainer');
        if(container) {
            container.style.display = 'none';
            container.innerHTML = '';
        }
        
        const oldScore = document.getElementById('scoreGroup');
        if(oldScore) oldScore.classList.remove('hidden-force');
        
        const chrono = document.getElementById('chronoDisplay');
        if(chrono) {
            chrono.classList.remove('hidden-force');
            // --- CORRECTION : ON VIDE LE TEXTE "QUESTION 1" ---
            chrono.innerHTML = '00:00'; 
            // --------------------------------------------------
        }
        
        const overlay = document.getElementById('interstitialOverlay');
        if(overlay) overlay.style.display = 'none';
    }, // N'oublie pas la virgule ici si ce n'est pas la dernière fonction

    // Affiche l'écran de transition "Question X / Y"
    async showChallengeTransition(nextStepIndex, total) {
        const overlay = document.getElementById('interstitialOverlay');
        const title = document.getElementById('interstitialTitle');
        
        if (!overlay || !title) return;

        // Mise à jour du texte
        title.innerHTML = `Question <span style="color:var(--gold)">${nextStepIndex + 1}</span> / ${total}`;
        
        // Apparition
        overlay.classList.add('active');

        // PAUSE (0.8s suffisent pour lire sans frustrer)
        await new Promise(r => setTimeout(r, 800)); 

        // Disparition
        overlay.classList.remove('active');
        
        // Petite sécu pour laisser le CSS finir le fade-out
        await new Promise(r => setTimeout(r, 200));
    },

    updateHeader() {
        const d = window.App.data; 
        const r = DB.ranks[Math.min(d.lvl-1, DB.ranks.length-1)];
        document.getElementById('rankIcon').innerText = r.i; document.getElementById('rankTitle').innerText = r.t; document.getElementById('lvlOverlayName').innerText = r.t; document.getElementById('lvlNum').innerText = d.lvl; 
        const lore = this.getLoreState(d.mastery);
        const headerLeft = document.querySelector('.header-left');
        headerLeft.className = "header-left tier-dynamic";
        headerLeft.style.setProperty('--tier-color', lore.color); headerLeft.style.setProperty('--tier-shadow', lore.shadow);
        document.getElementById('headerStars').innerHTML = lore.starsHTML;
        document.getElementById('xpBar').style.width = (d.xp/d.next)*100 + '%';
        document.getElementById('streakVal').innerText = window.App.session.streak; 
        document.getElementById('streakVal').className = window.App.session.streak > 20 ? 'stat-val streak-super' : (window.App.session.streak > 10 ? 'stat-val streak-fire' : 'stat-val');
        if(document.getElementById('scoreGroup').classList.contains('active')) { const sc = document.getElementById('currentScoreVal'); sc.innerText = window.App.session.score; sc.style.color = 'var(--gold)'; }
        const pct = window.App.session.globalTot ? Math.round((window.App.session.globalOk / window.App.session.globalTot) * 100) : 0; document.getElementById('precisionVal').innerText = pct + '%';
    },

    updateChrono() { 
        const timerVal = document.getElementById('timerVal');
        const livesVal = document.getElementById('livesVal');
        if (timerVal) timerVal.innerText = window.App.session.time; 
        if (livesVal) livesVal.innerText = '❤️'.repeat(window.App.session.lives); 
    },

    updateBackground(streak) { const body = document.body; if(streak >= 20) body.style.backgroundColor = '#370b1b'; else if(streak >= 10) body.style.backgroundColor = '#1e1b4b'; else body.style.backgroundColor = '#0f172a'; },
    
    triggerCombo(streak) {
        this.updateBackground(streak);
        if(streak > 5) { const sv = document.getElementById('streakVal'); sv.style.transform = "scale(1.5)"; setTimeout(()=>sv.style.transform="scale(1)", 150); }
        if(streak > 0 && streak % 10 === 0) { const pop = document.getElementById('comboPopup'); document.getElementById('comboTitle').innerText = `COMBO x${streak}`; pop.classList.add('show'); Audio.sfx('win'); setTimeout(() => pop.classList.remove('show'), 1500); }
    },

    confetti() { const c=document.getElementById('confetti'); const x=c.getContext('2d'); c.width=window.innerWidth; c.height=window.innerHeight; let p=[]; for(let i=0;i<60;i++)p.push({x:c.width/2,y:c.height/2,vx:(Math.random()-0.5)*25,vy:(Math.random()-0.5)*25,c:`hsl(${Math.random()*360},100%,50%)`,l:1}); const u=()=>{x.clearRect(0,0,c.width,c.height); let a=false; p.forEach(k=>{if(k.l>0){k.x+=k.vx;k.y+=k.vy;k.vy+=0.6;k.l-=0.02;x.fillStyle=k.c;x.beginPath();x.arc(k.x,k.y,6,0,7);x.fill();a=true;}}); if(a)requestAnimationFrame(u);}; u(); },
    
    showLevelUp() { const ov = document.getElementById('levelOverlay'); ov.classList.add('active'); setTimeout(() => { ov.classList.remove('active'); }, 3000); },
    
    showToast(msg) { const t = document.getElementById('rankToast'); t.innerText = msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 3000); },
    
    showBadge(b) { 
        // 1. On ajoute le badge à la file d'attente
        this.badgeQueue.push(b);
        // 2. On tente de traiter la file
        this.processBadgeQueue();
    },

    processBadgeQueue() {
        // Si déjà occupé ou file vide, on ne fait rien
        if (this.isBadgeBusy || this.badgeQueue.length === 0) return;

        // On verrouille et on prend le premier badge
        this.isBadgeBusy = true;
        const b = this.badgeQueue.shift();

        // Affichage (Code original)
        const el = document.getElementById('badgeRibbon'); 
        const tit = document.getElementById('badgeRibbonTitle'); 
        tit.innerText = b.title; 
        document.querySelector('.badge-ribbon-icon').innerText = b.icon; 
        
        // Animation Entrée
        el.classList.add('show'); 
        
        // Gestion de la sortie et du suivant
        setTimeout(() => { 
            // Animation Sortie
            el.classList.remove('show'); 
            
            // On attend la fin de l'animation CSS (0.6s) avant de lancer le suivant
            setTimeout(() => {
                this.isBadgeBusy = false;
                // Appel récursif pour voir s'il en reste
                this.processBadgeQueue();
            }, 600); 
            
        }, 4000); // Durée d'affichage (4s)
    },

    openBadgeLightbox(b) {
        let el = document.getElementById('badgeOverlay');
        if (!el) { el = document.createElement('div'); el.id = 'badgeOverlay'; el.className = 'modal-overlay badge-lightbox'; document.body.appendChild(el); el.onclick = () => { el.classList.remove('open'); }; }
        const unlocked = window.App.data.badges.includes(b.id);
        let title = b.title, desc = b.desc, icon = b.icon, lockedTxt = unlocked ? "DÉBLOQUÉ" : "VERROUILLÉ", statusClass = unlocked ? "unlocked" : "locked";
        if(b.secret && !unlocked) { title = "Badge Mystère"; desc = "Continuez votre progression pour révéler ce badge."; icon = "🔒"; lockedTxt = "SECRET"; }
        el.innerHTML = `<div class="modal" style="max-width:350px;"><div style="font-size:4rem; margin-bottom:10px; animation:pop 0.5s;">${icon}</div><h2 style="color:var(--gold); margin:0; text-transform:uppercase; letter-spacing:1px; line-height:1.2;">${title}</h2><div style="margin-top:10px; font-weight:800; font-size:0.8rem; background:rgba(255,255,255,0.1); padding:4px 10px; border-radius:10px; display:inline-block; letter-spacing:1px;" class="${statusClass}">${lockedTxt}</div><p style="color:var(--text-dim); margin-top:20px; font-size:1rem; line-height:1.5;">${desc}</p><button class="cmd-btn btn-listen" style="width:100%; margin-top:20px; padding:12px;">Fermer</button></div>`;
        el.classList.add('open'); window.UI.vibrate(10);
    },
    
    updateModeLocks() {
        const d = window.App.data;
        document.querySelectorAll('.mode-opt').forEach(el => el.classList.remove('locked'));
        if(d.mastery === 0) { if(d.lvl < 3) document.getElementById('modeInverse').classList.add('locked'); if(d.lvl < 8) document.getElementById('modeChrono').classList.add('locked'); if(d.lvl < 12) document.getElementById('modeSprint').classList.add('locked'); }
    },

    openModal(id, locked = false) { 
        if(id==='settingsModal') window.UI.renderSettings(); if(id==='statsModal') window.UI.renderStats(); if(id==='modalProfile') window.UI.renderProfile();
        
        // Mapping modalId → son approprié
        const modalSounds = {
            'settingsModal': 'modal_settings',
            'statsModal': 'modal_stats',
            'modalProfile': 'modal_profile',
            'challengeHubModal': 'modal_arena',
            'challengeReportModal': null, // Déjà géré avec 'win' dans renderChallengeReport
            'modalGameOver': null // Probablement géré ailleurs
        };
        
        // Jouer le son approprié (sauf si null ou si c'est le codex qui a son propre son)
        if (id !== 'modalCodex' && modalSounds[id] !== null && modalSounds[id] !== undefined) {
            Audio.sfx(modalSounds[id]);
        } else if (modalSounds[id] === undefined) {
            // Son générique pour les modales non mappées
            Audio.sfx('modal_open');
        }
        
        const el = document.getElementById(id);
        if(el) { 
            el.classList.add('open');
            // FIX: Forcer display: flex pour éviter que style inline display:none écrase le CSS
            el.style.display = 'flex';
            el.onclick = (e) => { if (locked) return; if (e.target === el) window.UI.closeModals(); }; 
            
            // Hook : Vérifier si un tutoriel contextuel doit s'afficher
            if (!locked) {
                setTimeout(() => {
                    const moduleId = this.checkTutorialTriggers({ type: 'modalOpen', modalId: id });
                    if (moduleId) {
                        this.startTutorialModule(moduleId);
                    }
                }, 300); // Délai pour laisser la modale s'ouvrir
            }
        }
    },
    
    openCodex() {
        Audio.sfx('codex_open'); 
        const modal = document.getElementById('modalCodex'); 
        modal.classList.add('open');
        modal.style.display = 'flex';
        // FIX: Ajouter l'event handler pour fermer en cliquant en dehors (comme openModal)
        // IMPORTANT: Ne pas fermer si on clique sur les éléments du tutoriel
        modal.onclick = (e) => { 
            // Ne pas fermer si on clique sur les éléments du tutoriel
            if (e.target === modal && !e.target.closest('#tour-tooltip') && !e.target.closest('#tour-spotlight')) {
                window.UI.closeModals(); 
            }
        };
        
        // Hook : Vérifier si un tutoriel contextuel doit s'afficher
        setTimeout(() => {
            const moduleId = this.checkTutorialTriggers({ type: 'modalOpen', modalId: 'modalCodex' });
            if (moduleId) {
                this.startTutorialModule(moduleId);
            }
        }, 300);
        
        // MODIFICATION ICI : Ajout du bouton "codex-mobile-close" dans content-area
        modal.innerHTML = `
            <div class="modal codex-terminal">
                <div class="codex-layout">
                    <div class="codex-sidebar">
                        <div class="codex-logo">📖</div>
                        <button class="codex-tab active" data-tab="academy" onclick="window.UI.switchCodexTab('academy')"><div class="tab-icon">🏛️</div><div class="tab-label">Académie</div></button>
                        <button class="codex-tab" data-tab="jazz" onclick="window.UI.switchCodexTab('jazz')"><div class="tab-icon">🎷</div><div class="tab-label">Club</div></button>
                        <button class="codex-tab" data-tab="laboratory" onclick="window.UI.switchCodexTab('laboratory')"><div class="tab-icon">🧪</div><div class="tab-label">Labo</div></button>
                        <div style="flex:1"></div>
                        <button class="codex-close" onclick="window.UI.closeModals()">✕</button>
                    </div>
                    <div class="codex-content-area">
                        <button class="codex-mobile-close" onclick="window.UI.closeModals()">✕</button> <div id="codexGridContainer" class="codex-grid-container"></div>
                        <div id="codexDetailContainer" class="codex-detail-container" style="display:none;"></div>
                    </div>
                </div>
            </div>`;
            
        modal.onclick = (e) => { if (e.target === modal) window.UI.closeModals(); }; 
        this.switchCodexTab('academy');

        const quitBtn = document.getElementById('btn-rep-quit');
            if (quitBtn) {
                quitBtn.addEventListener('click', () => {
            try {
                window.ChallengeManager?.exit?.();
            } catch (e) {
                console.error("Quit challenge failed:", e);
                // Fallback : au moins fermer la modale
                window.UI?.closeModals?.();
            }
    });
}
    },

    switchCodexTab(tabName) { Audio.sfx('codex_select'); document.querySelectorAll('.codex-tab').forEach(t => t.classList.remove('active')); document.querySelector(`.codex-tab[data-tab="${tabName}"]`).classList.add('active'); document.getElementById('codexDetailContainer').style.display = 'none'; document.getElementById('codexGridContainer').style.display = 'grid'; this.renderCodexGrid(tabName); },
    
    renderCodexGrid(setKey) {
        const d = window.App.data; const grid = document.getElementById('codexGridContainer'); grid.innerHTML = ''; const set = DB.sets[setKey]; if(!set) return;
        if(setKey === 'jazz' && d.mastery === 0) { grid.innerHTML = `<div class="codex-locked-msg">🔒 Débloquez la Maîtrise 1 pour accéder au Club.</div>`; return; }
        if(setKey === 'laboratory' && d.mastery <= 1) { grid.innerHTML = `<div class="codex-locked-msg">🔒 Débloquez la Maîtrise 2 pour accéder au Labo.</div>`; return; }

        const title1 = document.createElement('h3'); title1.className = 'codex-section-title'; title1.innerText = "Entités Harmoniques"; grid.appendChild(title1);
        set.chords.forEach(c => {
            let unlocked = true; if(setKey === 'jazz' && d.mastery === 1 && c.unlockLvl > d.lvl) unlocked = false; if(setKey === 'laboratory' && d.mastery <= 2 && c.unlockLvl > d.lvl) unlocked = false;
            const card = document.createElement('div'); card.className = `codex-card ${unlocked ? 'unlocked' : 'locked'}`; const symbol = unlocked ? this.getSymbol(c.id) : '?';
            card.innerHTML = `<div class="codex-holo"></div><div class="codex-card-symbol">${symbol}</div><div class="codex-card-title">${unlocked ? c.name : '???'}</div>`;
            card.onclick = () => { if(unlocked) { this.showCodexCard(c, setKey); Audio.sfx('card_open'); } else { this.showToast("🔒 Verrouillé"); this.vibrate(50); } }; grid.appendChild(card);
        });

        if(setKey === 'laboratory') {
            set.chords.forEach(parent => {
                let parentUnlocked = true; if(d.mastery <= 2 && parent.unlockLvl > d.lvl) parentUnlocked = false;
                if (parentUnlocked) {
                    const subTitle = document.createElement('h3'); subTitle.className = 'codex-section-title'; subTitle.style.marginTop = '20px'; subTitle.style.color = 'var(--cyan)'; subTitle.innerText = `Analyse : ${parent.name}`; grid.appendChild(subTitle);
                    if (parent.configs) {
                        parent.configs.forEach(conf => {
                            const card = document.createElement('div'); 
                            card.className = "codex-card unlocked landscape"; 
                            card.style.borderColor = "var(--cyan)"; 
                            
                            // MAGIE ICI : On découpe "6m - 3m" ou "4J + Tr" pour l'empiler
                            // Le regex / [-+] / coupe sur " - " ou " + "
                            const parts = conf.sub.split(/ [-+] /);
                            let symbolHtml = conf.sub; // Fallback
                            
                            if (parts.length === 2) {
                                // On génère le HTML vertical (classe figured-bass déjà dans votre CSS)
                                symbolHtml = `<div class="figured-bass" style="font-size:2rem; line-height:0.9;"><span>${parts[0]}</span><span>${parts[1]}</span></div>`;
                            }

                            card.innerHTML = `<div class="codex-holo"></div><div class="codex-card-symbol landscape">${symbolHtml}</div><div class="codex-card-title" style="font-size:0.7rem;">${conf.name}</div>`;
                            
                            card.onclick = () => { const synth = { id: `lab_${parent.id}_${conf.id}`, isSyntheticLab: true, name: conf.name, sub: `${parent.tech} / ${conf.sub}`, iv: conf.iv, parent: parent }; this.showCodexCard(synth, setKey); Audio.sfx('card_open'); }; grid.appendChild(card);
                        });
                    }
                }
            }); return;
        }

        const title2 = document.createElement('h3'); title2.className = 'codex-section-title'; title2.style.marginTop = '20px'; title2.innerText = "Techniques & Variations"; grid.appendChild(title2);
        let vars = []; if(setKey === 'academy') { vars = DB.invs; } else if(setKey === 'jazz') { vars = DB.voicings; }
        vars.forEach(v => {
            const card = document.createElement('div'); card.className = "codex-card unlocked landscape"; let symbolHtml = v.corr; if(v.figure && v.figure.length > 0) { symbolHtml = `<div class="figured-bass">${v.figure.map(n=>`<span>${n}</span>`).join('')}</div>`; }
            card.innerHTML = `<div class="codex-holo"></div><div class="codex-card-symbol landscape">${symbolHtml}</div><div class="codex-card-title">${v.name}</div>`;
            card.onclick = () => { let syntheticCard = { ...v, iv: [] }; syntheticCard.id = `${setKey === 'jazz'?'voc':'inv'}_${v.id}`; this.showCodexCard(syntheticCard, setKey); Audio.sfx('card_open'); }; grid.appendChild(card);
        });
    },

    showCodexCard(chord, setKey) {
        const grid = document.getElementById('codexGridContainer');
        const detail = document.getElementById('codexDetailContainer');
        grid.style.display = 'none';
        detail.style.display = 'flex';

        // 1. Récupération des Données Statiques
        let data = CODEX_DATA[chord.id] || { flavor: "Données non disponibles.", theory: "...", coach: "...", tags: [], examples: [] };
        
        // Gestion Labo Synthétique (Cas particulier)
        if (chord.isSyntheticLab) {
            const parentData = CODEX_DATA[chord.parent.id] || {};
            data = {
                flavor: parentData.flavor,
                coach: parentData.coach,
                tags: parentData.tags,
                examples: parentData.examples,
                theory: `<strong>Intervalles (1/2 tons) :</strong> [ ${chord.iv.join(' - ')} ]<br>Configuration spécifique de la ${chord.parent.name}.`
            };
        }

        // 2. LOGIQUE COACH DYNAMIQUE (Nouveau)
        // On remplace le texte statique par un tirage au sort dans la base de données du coach
        let dynamicCoachMsg = data.coach; // Valeur par défaut
        
        // On essaie de trouver des conseils spécifiques dans COACH_DB.weakness
        // Note: COACH_DB doit être importé en haut de ui.js
        if (typeof COACH_DB !== 'undefined' && COACH_DB.weakness && COACH_DB.weakness[chord.id]) {
            const tips = COACH_DB.weakness[chord.id];
            if (tips.length > 0) {
                const randomTip = tips[Math.floor(Math.random() * tips.length)];
                dynamicCoachMsg = `<strong>${randomTip.t} :</strong> ${randomTip.m}`;
            }
        }

        // 3. LOGIQUE YOUTUBE (Nouveau)
        const tagsHTML = (data.tags || []).map(t => `<span class="codex-chip">${t}</span>`).join('');
        
        const examplesHTML = (data.examples && data.examples.length > 0) 
            ? `<div class="cd-examples">
                 <strong>🎵 Exemples Célèbres :</strong>
                 <ul>
                   ${data.examples.map(e => {
                       // Compatible String (Vieux format) ou Objet (Nouveau format)
                       const label = typeof e === 'string' ? e : e.title;
                       const link = (typeof e === 'object' && e.url && e.url.length > 0) 
                           ? `<a href="${e.url}" target="_blank" class="yt-link" style="color:var(--gold); text-decoration:none; border-bottom:1px dotted var(--gold);">📺 ${label}</a>` 
                           : label;
                       return `<li style="margin-bottom:4px;">${link}</li>`;
                   }).join('')}
                 </ul>
               </div>` 
            : '';

        let configsHTML = '';
        if(setKey === 'laboratory' && chord.configs && !chord.isSyntheticLab) {
            configsHTML = `<div class="cd-section"><div class="cd-theory"><strong>🔬 Configurations Spécifiques :</strong><ul>`;
            chord.configs.forEach(c => { configsHTML += `<li><strong>${c.name} :</strong> ${c.sub}</li>`; });
            configsHTML += `</ul></div></div>`;
        }

        // Rendu HTML
        detail.innerHTML = `
            <div class="cd-nav-bar">
                <button class="cd-back-btn" onclick="window.UI.backToCodexGrid()">← Retour</button>
                <div style="flex:1"></div>
                <button class="cd-close-btn" onclick="window.UI.closeModals()">✕</button>
            </div>
            <div class="cd-scroll-content">
                <div class="cd-header-hero">
                    <div class="cd-hero-icon">${chord.isSyntheticLab ? '🔬' : this.getSymbol(chord.id)}</div>
                    <div class="cd-hero-text">
                        <h2>${chord.name}</h2>
                        <span>${chord.sub}</span>
                    </div>
                    <button class="btn-gold-play" id="cdPlayBtn" onclick="window.UI.playCodexSound()">▶</button>
                </div>
                
                <div class="cd-tags-row">${tagsHTML}</div>
                
                <div class="cd-vis">
                    <canvas id="codexPianoCanvas" width="300" height="80"></canvas>
                </div>
                
                <div class="cd-section">
                    <div class="cd-flavor">${data.flavor}</div>
                </div>
                
                <div class="cd-section">
                    <div class="cd-theory">${data.theory}</div>
                    ${examplesHTML}
                </div>
                
                ${configsHTML}
                
                <div class="cd-coach-box">
                    <div class="coach-head">🧠 Le Coach</div>
                    <div>${dynamicCoachMsg}</div>
                </div>
                
                <button class="btn-action-train" onclick="window.UI.startTrainingFromCodex('${chord.id}', '${setKey}')">
                    🎯 S'entraîner sur cet accord
                </button>
            </div>
        `;
        
        // Logique Audio (Inchangée)
        let notes = [];
        if(setKey === 'laboratory') { 
            if (chord.isSyntheticLab) { const root = 60; notes = chord.iv.map(i => root + i); } 
            else if (chord.configs) { notes = window.App.getNotes(chord, 0, 60, false, 'laboratory'); } 
        } else { 
            if (chord.id.startsWith('inv_') || chord.id.startsWith('voc_')) { 
                const demoChord = { id: 'demo', iv: [0,4,7,11] }; 
                const varId = parseInt(chord.id.split('_')[1]); 
                notes = window.App.getNotes(demoChord, varId, 60, false, setKey); 
            } else { 
                notes = window.App.getNotes(chord, 0, 60, false, setKey); 
            } 
        }
        detail.dataset.notes = JSON.stringify(notes); 
        setTimeout(() => { 
            const canvas = document.getElementById('codexPianoCanvas'); 
            if(canvas) Piano.visualize(notes, canvas); 
        }, 100);
    },
    
    playCodexSound() { const det = document.getElementById('codexDetailContainer'); const btn = document.getElementById('cdPlayBtn'); if(btn) { btn.classList.add('playing'); setTimeout(() => btn.classList.remove('playing'), 500); } if(det && det.dataset.notes) { const notes = JSON.parse(det.dataset.notes); Audio.chord(notes, true); Piano.visualize(notes, document.getElementById('codexPianoCanvas')); } },
    backToCodexGrid() { Audio.sfx('codex_select'); document.getElementById('codexDetailContainer').style.display = 'none'; document.getElementById('codexGridContainer').style.display = 'grid'; },
    startTrainingFromCodex(chordId, setKey) {
        let targetC = []; let targetI = []; const isVar = chordId.includes('_') && (chordId.startsWith('inv') || chordId.startsWith('voc') || chordId.startsWith('lab'));
        if (isVar) { const parts = chordId.split('_'); const varId = parseInt(parts[parts.length-1]); targetI = [varId]; if(parts[0] === 'lab') { const parentId = parts.slice(1, parts.length-1).join('_'); targetC = [parentId]; } else { targetC = DB.sets[setKey].chords.map(c => c.id); } window.UI.showToast(`Entraînement : Var ${varId}`); } 
        else { targetC = [chordId]; if(setKey === 'laboratory') targetI = [0,1,2,3]; else if(setKey === 'jazz') targetI = DB.voicings.map(i => i.id); else targetI = DB.invs.map(i => i.id); window.UI.showToast(`Entraînement : ${chordId}`); }
        if (window.App.data.currentSet !== setKey) { window.App.loadSet(setKey, true); }
        window.App.data.settings.activeC = targetC; window.App.data.settings.activeI = targetI; window.App.save();
        window.UI.closeModals(); window.UI.renderSettings(); window.UI.renderBoard(); window.App.playNew();
    },

    closeModals() { 
        const settingsEl = document.getElementById('settingsModal');
        // On regarde si les paramètres sont ouverts AVANT de tout fermer
        const wasSettingsOpen = settingsEl && settingsEl.classList.contains('open');

        document.querySelectorAll('.modal-overlay').forEach(m => {
            m.classList.remove('open');
            m.style.display = 'none'; // FIX: Forcer display:none pour les modales dynamiques
        });
        
        // Si on vient de fermer les paramètres, on déclenche la logique de mise à jour dans App
        if (wasSettingsOpen && window.App && window.App.onSettingsClosed) {
            window.App.onSettingsClosed();
        }
    },

    // Modale de confirmation personnalisée (remplace confirm() pour compatibilité Live Preview)
    confirmModalPromise: null,
    confirmModalResolve: null,
    
    async showConfirmModal(message, title = "Confirmation") {
        return new Promise((resolve) => {
            this.confirmModalPromise = resolve;
            const modal = document.getElementById('confirmModal');
            const titleEl = document.getElementById('confirmModalTitle');
            const messageEl = document.getElementById('confirmModalMessage');
            
            if (titleEl) titleEl.innerText = title;
            if (messageEl) messageEl.innerHTML = message.replace(/\n/g, '<br>');
            
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('open');
                // Fermeture au clic sur l'overlay
                modal.onclick = (e) => {
                    if (e.target === modal) {
                        this.confirmModalResolve(false);
                    }
                };
            } else {
                console.error("confirmModal not found in DOM");
                // Fallback: résoudre immédiatement avec false si la modale n'existe pas
                resolve(false);
            }
        });
    },
    
    confirmModalResolve(result) {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.classList.remove('open');
            modal.style.display = 'none';
        }
        
        // Son approprié selon l'action
        if (result) {
            Audio.sfx('button_confirm');
        } else {
            Audio.sfx('button_cancel');
        }
        
        if (this.confirmModalPromise) {
            this.confirmModalPromise(result);
            this.confirmModalPromise = null;
        }
    },
    
    renderSettings() { 
        const d = window.App.data;
        
        // --- MODIFICATION : IDENTITÉ & GOOGLE AUTH ---
        const nameInput = document.getElementById('usernameInput');
        if(nameInput) {
            nameInput.value = d.username || "";
            
            // 1. Nettoyage
            const parent = nameInput.parentElement;
            ['identityBadge', 'btnSecureAccount', 'btnLoginExisting', 'googleAuthBtn'].forEach(id => {
                const el = document.getElementById(id);
                if(el) el.remove();
            });

            // 2. Détection de l'état Auth (CORRECTION ICI)
            const user = Cloud.auth ? Cloud.auth.currentUser : null;
            // On considère "Connecté" seulement si l'utilisateur n'est PAS anonyme
            const isAuth = user && !user.isAnonymous;

            // 3. Création du Bouton
            const authBtn = document.createElement('button');
            authBtn.id = 'googleAuthBtn';
            authBtn.className = 'cmd-btn';
            
            const btnColor = isAuth ? "rgba(239, 68, 68, 0.2)" : "#4285F4"; 
            const btnBorder = isAuth ? "var(--error)" : "#4285F4";
            const btnTextColor = isAuth ? "var(--error)" : "white";
            const btnText = isAuth ? `Déconnexion (${user.displayName || 'Google'})` : "Connexion Google (Sauvegarde Cloud)";
            const icon = isAuth ? '🚪' : '☁️';

            authBtn.style.cssText = `width:100%; margin-top:10px; margin-bottom:20px; padding:12px; background:${btnColor}; border:1px solid ${btnBorder}; color:${btnTextColor}; font-weight:700; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer;`;
            authBtn.innerHTML = `<span>${icon}</span> ${btnText}`;
            
            authBtn.onclick = () => {
                if(window.App.handleGoogleAuth) window.App.handleGoogleAuth();
            };

            parent.insertAdjacentElement('afterend', authBtn);

            // 4. Gestion Input Pseudo
            let typeTimeout;
            nameInput.oninput = (e) => {
                const val = e.target.value;
                authBtn.innerHTML = `<span style="opacity:0.7">⏳ Mise à jour...</span>`;
                clearTimeout(typeTimeout);
                typeTimeout = setTimeout(() => { 
                    window.App.setUsername(val); 
                    authBtn.innerHTML = `<span>${icon}</span> ${btnText}`;
                }, 1000); 
            };
        }
        // --- FIN MODIFICATION ---

        const grids = document.querySelectorAll('.settings-grid');
        const setContainer = grids[0];
        if(setContainer) {
            setContainer.style.gridTemplateColumns = "1fr 1fr 1fr"; setContainer.innerHTML = ''; 
            const sets = ['academy', 'jazz', 'laboratory'];
            sets.forEach(sid => {
                const s = DB.sets[sid]; const div = document.createElement('div'); div.className = d.currentSet === sid ? 'setting-chip active' : 'setting-chip';
                let isLocked = false; if(sid === 'jazz' && d.mastery < 1) isLocked = true; if(sid === 'laboratory' && d.mastery < 2) isLocked = true; if(isLocked) div.classList.add('locked');
                div.innerText = (sid === 'academy' ? "🏛️ Académie" : (sid === 'jazz' ? "🎷 Le Club" : "🧪 Labo"));
                if(sid === 'laboratory') div.style.borderColor = "var(--cyan)"; if(sid === 'laboratory' && d.currentSet === 'laboratory') div.style.boxShadow = "0 0 15px var(--cyan)";
                if(sid === 'jazz') div.style.borderColor = "var(--gold)"; if(sid === 'jazz' && d.currentSet === 'jazz') div.style.boxShadow = "0 0 15px var(--gold)";
                div.onclick = () => { if(isLocked) window.UI.showToast("🔒 Verrouillé"); else window.App.loadSet(sid); }; setContainer.appendChild(div);
            });
        }
        if(d.currentSet === 'jazz' || d.currentSet === 'laboratory') document.getElementById('rowToggleOpen').style.display='none'; else document.getElementById('rowToggleOpen').style.display='flex';
        
        // Ajouter un son pour le toggle "Position Ouverte"
        const toggleOpen = document.getElementById('toggleOpen');
        if (toggleOpen) {
            toggleOpen.checked = d.settings.open || false;
            // Supprimer les anciens listeners pour éviter les doublons
            const newToggle = toggleOpen.cloneNode(true);
            toggleOpen.parentNode.replaceChild(newToggle, toggleOpen);
            
            newToggle.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                // Sauvegarder la valeur dans les données
                window.App.data.settings.open = isChecked;
                // Jouer le son approprié
                Audio.sfx(isChecked ? 'toggle_on' : 'toggle_off');
            });
        }
        
        const gen = (arr, type, dest) => { document.getElementById(dest).innerHTML = arr.map(x => { const active = (type==='c'?d.settings.activeC:d.settings.activeI).includes(x.id); let locked = window.App.isLocked(x.id); let cls = `setting-chip ${active?'active':''} ${locked?'locked':''}`; const visual = this.getLabel(x, type); return `<div class="${cls}" onclick="window.App.toggleSetting('${type}', ${typeof x.id==='string'?"'"+x.id+"'":x.id})">${visual}</div>`; }).join(''); }; 
        gen(DB.chords, 'c', 'settingsChords'); 
        if(d.currentSet === 'laboratory') { const labOpts = [ {id: 0, name: "Pos. Alpha (0)", corr: "d8↳/Chrom/Sus2"}, {id: 1, name: "Pos. Beta (1)", corr: "d8↗/Vien/Sus4"}, {id: 2, name: "Pos. Gamma (2)", corr: "a8↳/1t/4al"}, {id: 3, name: "Pos. Delta (3)", corr: "a8↗/Octat/5tal"} ]; gen(labOpts, 'i', 'settingsInvs'); } else { gen(DB.currentInvs, 'i', 'settingsInvs'); }
    },
    
    renderProfile() {
        const d = window.App.data;
        const ranks = DB.ranks;
        const currentLvlIdx = Math.min(d.lvl - 1, ranks.length - 1);
        const r = ranks[currentLvlIdx];
        
        // 1. HEADER INFO
        document.getElementById('profileAvatar').innerText = r.i; 
        document.getElementById('profileName').innerText = r.t; // Le titre actuel est en haut
        
        // Stats
        document.getElementById('profileTotal').innerText = window.App.session.globalTot; 
        const acc = window.App.session.globalTot ? Math.round((window.App.session.globalOk/window.App.session.globalTot)*100) : 0; 
        document.getElementById('profileAcc').innerText = acc + "%";
        
        // XP Bar & Text
        const pct = Math.min(100, (d.xp / d.next) * 100); 
        document.getElementById('profileXpBar').style.width = pct + "%";
        document.getElementById('xpCurrent').innerText = Math.floor(d.xp);
        document.getElementById('xpNext').innerText = d.lvl >= 20 ? "MAX" : Math.floor(d.next);

        // Lore & Maîtrise (Refonte)
        const lore = this.getLoreState(d.mastery);
        
        // On récupère l'icône du matériau dans LORE_MATERIALS (data.js)
        // lore.material contient le nom, on doit retrouver l'objet complet ou on l'ajoute dans getLoreState
        // Pour faire simple, on va utiliser l'index de maitrise pour retrouver l'icone dans data.js
        const matIdx = Math.floor((d.mastery > 0 ? d.mastery - 1 : 0) / 5);
        // Fallback icone si hors limites
        const matIcon = (LORE_MATERIALS[matIdx] && LORE_MATERIALS[matIdx].icon) ? LORE_MATERIALS[matIdx].icon : '🎓';
        
        document.getElementById('masteryIcon').innerText = matIcon;
        document.getElementById('masteryLabel').innerText = `Maîtrise ${d.mastery}`;
        document.getElementById('profileStars').innerHTML = lore.starsHTML;

        // Couleurs Dynamiques
        const header = document.querySelector('.profile-header-compact'); 
        const fill = document.getElementById('profileXpBar');
        const iconBadge = document.getElementById('masteryIcon');
        
        if(header) {
            header.style.borderBottomColor = lore.color;
            // On applique la couleur du rang à la barre XP et aux textes
            header.style.setProperty('--tier-color', lore.color);
            header.style.setProperty('--tier-shadow', lore.shadow);
            
            document.querySelector('.profile-avatar-small').style.borderColor = lore.color;
            document.querySelector('.profile-avatar-small').style.boxShadow = `0 0 15px ${lore.shadow}`;
            
            fill.style.backgroundColor = lore.color;
            fill.style.boxShadow = `0 0 10px ${lore.shadow}`;
            
            iconBadge.style.color = lore.color;
            iconBadge.style.borderColor = lore.color; // Si on veut ajouter une bordure
        }

        // 2. TIMELINE GENERATION (Correction Doublon)
        const container = document.getElementById('levelTimeline');
        if(container) {
            container.innerHTML = '';
            
            // CORRECTION ICI : On commence à currentLvlIdx - 1
            // On affiche uniquement le PASSÉ. Le présent est dans le header.
            for(let i = currentLvlIdx - 1; i >= 0; i--) {
                const rank = ranks[i];
                const node = document.createElement('div');
                node.className = 'tl-node'; // Plus de classe 'current' car le courant est en haut
                
                node.innerHTML = `
                    <div class="tl-icon">${rank.i}</div>
                    <div class="tl-content">
                        <div style="font-size:0.6rem; text-transform:uppercase; color:var(--text-dim); font-weight:900;">Niveau ${i+1}</div>
                        <div style="font-weight:700; color:var(--text-dim); line-height:1.2;">${rank.t}</div>
                    </div>
                `;
                container.appendChild(node);
            }
            
            // Message si niveau 1 (Vide en dessous)
            if (currentLvlIdx === 0) {
                container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-dim); font-style:italic; font-size:0.8rem;">Le début de votre voyage...</div>`;
            }
        }

        // 3. PRESTIGE (Inchangé)
        const btn = document.getElementById('btnPrestige'); 
        if(d.lvl >= 20) { 
            const nextM = d.mastery + 1; const nextLore = this.getLoreState(nextM); 
            const destName = nextLore.place ? nextLore.place : "L'Inconnu"; 
            btn.disabled = false; btn.removeAttribute('disabled'); btn.classList.remove('locked');
            document.getElementById('prestigeNextName').innerText = `Vers : ${destName}`; 
        } else { 
            btn.disabled = true; btn.setAttribute('disabled', 'true'); 
            document.getElementById('prestigeNextName').innerText = "Niveau 20 Requis"; 
        }
    },

    renderStats() {
        const advice = window.App.analyzeCoach ? window.App.analyzeCoach() : {t:"Conseil", m:"Joue un peu plus !"};
        let badgeHTML = ""; if(advice.target) { let targetName = advice.target; const allChords = [...DB.sets.academy.chords, ...DB.sets.jazz.chords, ...DB.sets.laboratory.chords]; const found = allChords.find(c => c.id === advice.target); if(found) targetName = found.name; badgeHTML = `<span class="coach-tag context-badge" style="background:var(--accent); margin-right:5px;">${targetName}</span>`; }
        let msg = advice.m; msg = msg.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); msg = msg.replace(/\*(.*?)\*/g, '<em>$1</em>');
        document.getElementById('coachDisplay').innerHTML = `<div class="coach-avatar">🧠</div><div class="coach-bubble"><div><span class="coach-tag">${advice.t}</span> ${badgeHTML}</div>${msg}</div>`;
        const histContainer = document.getElementById('historyChart'); let histHTML = '<div class="chart-limit-line"></div><div class="chart-container">'; const data = window.App.data.history || []; for(let i=0; i<7; i++) { const entry = data[i]; if(entry) { const pct = Math.round((entry.ok / entry.tot) * 100); let col = '#ef4444'; if(pct >= 50) col = '#f59e0b'; if(pct >= 80) col = '#10b981'; histHTML += `<div class="chart-col"><div class="chart-track"><div class="chart-bar" style="height:${pct}%; background:${col};"></div></div><span class="chart-label">${entry.date}</span></div>`; } else { histHTML += `<div class="chart-col"><div class="chart-track" style="background:rgba(255,255,255,0.02);"></div><span class="chart-label">-</span></div>`; } } histHTML += '</div>'; histContainer.innerHTML = histHTML;
        const html = (arr, cat) => arr.map(x => { let s; if(cat === 'i' && window.App.data.currentSet === 'jazz') { return ""; } if (window.App.data.currentSet === 'laboratory' && cat === 'i') return ""; s = window.App.data.stats[cat][x.id] || {ok:0, tot:0}; const p = s.tot?Math.round((s.ok/s.tot)*100):0; const col = p>=80?'var(--success)':p>=50?'var(--warning)':'var(--error)'; return `<div class="stat-item"><div class="stat-header"><span>${x.name||x.corr}</span><span>${p}%</span></div><div class="stat-track"><div class="stat-fill" style="width:${p}%;background:${s.tot?col:'transparent'}"></div></div></div>`; }).join('');
        let chordHTML = html(DB.chords, 'c'); let invHTML = "";
        if(window.App.data.currentSet === 'jazz') { invHTML = "<h4>Voicings</h4>" + DB.currentInvs.map(x => { const s = window.App.data.stats.v[x.id] || {ok:0, tot:0}; const p = s.tot?Math.round((s.ok/s.tot)*100):0; const col = p>=80?'var(--success)':p>=50?'var(--warning)':'var(--error)'; return `<div class="stat-item"><div class="stat-header"><span>${x.corr}</span><span>${p}%</span></div><div class="stat-track"><div class="stat-fill" style="width:${p}%;background:${s.tot?col:'transparent'}"></div></div></div>`; }).join(''); } else if (window.App.data.currentSet === 'laboratory') { invHTML = "<h4>Détail des Configurations</h4>"; DB.sets.laboratory.chords.forEach(c => { if(window.App.data.settings.activeC.includes(c.id)) { invHTML += `<h5 style="margin:8px 0 4px 0; color:var(--cyan); border-bottom:1px solid rgba(6,182,212,0.2); padding-bottom:2px;">${c.name}</h5>`; c.configs.forEach(conf => { const key = `${c.id}_${conf.id}`; const s = window.App.data.stats.l[key] || {ok:0, tot:0}; const p = s.tot?Math.round((s.ok/s.tot)*100):0; const col = p>=80?'var(--success)':p>=50?'var(--warning)':'var(--error)'; invHTML += `<div class="stat-item"><div class="stat-header"><span style="color:var(--text-dim);">${conf.name}</span><span>${p}%</span></div><div class="stat-track"><div class="stat-fill" style="width:${p}%;background:${s.tot?col:'transparent'}"></div></div></div>`; }); } }); } else { invHTML = "<h4>Renversements</h4>" + html(DB.currentInvs, 'i'); }
        document.getElementById('statsContent').innerHTML = "<h4>Accords</h4>"+chordHTML+"<br>"+invHTML;
        
        // --- BADGES RENDER ---
        const grid = document.getElementById('badgesGrid'); grid.innerHTML = ''; 
        const unlockedIDs = window.App.data.badges; 
        const totalVisible = BADGES.filter(b => !b.secret || unlockedIDs.includes(b.id)).length; 
        const unlockedCount = unlockedIDs.length; 
        document.getElementById('badgeCount').innerText = `${unlockedCount}/${totalVisible}`;
        
        // APPEL DE LA NOUVELLE FONCTION
        this.renderBadges();
    },

    // --- NOUVELLE FONCTION AJOUTÉE ---
    renderBadges() {
        const grid = document.getElementById('badgesGrid'); 
        if(!grid) return; // Sécurité si la modale n'est pas dans le DOM
        grid.innerHTML = ''; 
        
        const unlockedIDs = window.App.data.badges; 
        const totalVisible = BADGES.filter(b => !b.secret || unlockedIDs.includes(b.id)).length; 
        const unlockedCount = unlockedIDs.length; 
        
        const countEl = document.getElementById('badgeCount');
        if(countEl) countEl.innerText = `${unlockedCount}/${totalVisible}`;
        
        const renderBadge = (b) => { 
            const unlocked = unlockedIDs.includes(b.id); 
            const el = document.createElement('div'); 
            el.className = `badge-item set-${b.setID || 'core'} ${unlocked ? 'unlocked' : ''}`; 
            el.innerHTML = b.icon; 
            if(b.category === 'arena') el.style.borderColor = "var(--primary)";
            el.onclick = () => { window.UI.openBadgeLightbox(b); }; 
            grid.appendChild(el); 
        };
        
        // V5.2 - SECTION ARENE
        const arenaTitle = document.createElement('h4'); 
        arenaTitle.style.cssText = "grid-column: 1 / -1; margin: 0 0 5px 0; color: var(--primary); font-size: 0.75rem; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 2px;"; 
        arenaTitle.innerText = "⚔️ Arène & Défis"; 
        grid.appendChild(arenaTitle);
        const arenaBadges = BADGES.filter(b => b.category === 'arena' && (!b.secret || unlockedIDs.includes(b.id))); 
        arenaBadges.forEach(b => renderBadge(b));

        const careerTitle = document.createElement('h4'); 
        careerTitle.style.cssText = "grid-column: 1 / -1; margin: 15px 0 5px 0; color: var(--gold); font-size: 0.75rem; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 2px;"; 
        careerTitle.innerText = "🏆 Carrière"; 
        grid.appendChild(careerTitle);
        const careerBadges = BADGES.filter(b => b.category === 'career' && (!b.secret || unlockedIDs.includes(b.id))); 
        const sortOrder = ['core', 'academy', 'jazz', 'laboratory']; 
        careerBadges.sort((a,b) => sortOrder.indexOf(a.setID) - sortOrder.indexOf(b.setID)); 
        careerBadges.forEach(b => renderBadge(b));
        
        const loreTitle = document.createElement('h4'); 
        loreTitle.style.cssText = "grid-column: 1 / -1; margin: 25px 0 5px 0; color: var(--gold); font-size: 0.75rem; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 2px;"; 
        loreTitle.innerText = "💠 Héritage"; 
        grid.appendChild(loreTitle);
        const loreBadges = BADGES.filter(b => b.category === 'lore' && (!b.secret || unlockedIDs.includes(b.id))); 
        loreBadges.forEach(b => renderBadge(b));
        
        const oldDetail = document.getElementById('badgeDetail'); if(oldDetail) oldDetail.style.display = 'none';
    },

    // --- NOUVELLE MÉTHODE POUR LA FIN DU DÉFI ---
    openChallengeEndModal(score, mistakes, totalQuestions, challengeId) {
        const modal = document.getElementById('endGameModal');
        const content = document.getElementById('endGameContent');
        if (!modal || !content) return;

        // 1. Calcul du pourcentage
        const accuracy = Math.round(((totalQuestions - mistakes.length) / totalQuestions) * 100);
        
        // 2. Génération HTML des erreurs (Comparatif)
        let mistakesHTML = '<div class="mistakes-list">';
        
        // Sécurité sur le tableau lui-même
        if (data.mistakes && Array.isArray(data.mistakes) && data.mistakes.length > 0) {
            data.mistakes.forEach(m => {
                // 1. GUARD CLAUSE BASIQUE : L'entrée doit exister
                if (!m || !m.correct) return;

                // 2. GUARD CLAUSE CRITIQUE (Le Fix du Crash)
                // On cherche l'accord dans la DB
                let correctObj = window.DB.chords.find(c => c.id === m.correct);

                // SI undefined (accord introuvable ou ID corrompu), on crée un objet de secours
                // Cela empêche l'erreur "Cannot read properties of undefined (reading 'type')"
                if (!correctObj) {
                    console.warn(`Accord introuvable pour l'ID: ${m.correct}`);
                    correctObj = { name: m.correct || '?', type: '?', suffix: '' };
                }

                // Maintenant on peut lire .name ou .type sans faire planter l'app
                const givenLabel = m.given || "Aucune réponse";

                mistakesHTML += `
                <div class="mistake-row" onclick="window.App.preview('c', '${m.correct}')">
                    <div class="mistake-info">
                        <span class="mistake-label">Attendu :</span>
                        <strong class="text-success">${correctObj.name}</strong> 
                    </div>
                    <div class="mistake-info">
                        <span class="mistake-label">Donné :</span>
                        <strong class="text-error">${givenLabel}</strong>
                    </div>
                </div>`;
            });
        } else {
            mistakesHTML += '<div style="text-align:center; padding:10px; color:var(--text-dim); font-style:italic;">Aucune erreur. Parfait !</div>';
        }
        
        mistakesHTML += '</div>';

        // 3. Construction du contenu final
        content.innerHTML = `
            <div class="modal-header">
                <h2>Défi Terminé</h2>
                <div class="score-badge">${score} pts</div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Précision</span>
                    <span class="stat-value">${accuracy}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Questions</span>
                    <span class="stat-value">${totalQuestions}</span>
                </div>
            </div>

            ${mistakesHTML}

            <div class="modal-actions">
                <button class="btn-primary" onclick="window.ChallengeManager.restore()">
                    Quitter le mode Défi
                </button>
            </div>
        `;

        // 4. Affichage
        modal.classList.add('active');
    },

    renderKeyboardShortcuts(type, keyCodes) {
        // Ne pas afficher en mode mobile
        if (window.innerWidth <= 768) {
            return;
        }

        let containerId;
        let keysToShow = [];

        if (type === 'chords') {
            containerId = 'chordShortcutsVisual';
            // Pour les accords : afficher les touches 1-6
            keysToShow = [
                { code: 'Digit1', label: '1', highlight: keyCodes.includes('Digit1') || keyCodes.includes('Numpad1') },
                { code: 'Digit2', label: '2', highlight: keyCodes.includes('Digit2') || keyCodes.includes('Numpad2') },
                { code: 'Digit3', label: '3', highlight: keyCodes.includes('Digit3') || keyCodes.includes('Numpad3') },
                { code: 'Digit4', label: '4', highlight: keyCodes.includes('Digit4') || keyCodes.includes('Numpad4') },
                { code: 'Digit5', label: '5', highlight: keyCodes.includes('Digit5') || keyCodes.includes('Numpad5') },
                { code: 'Digit6', label: '6', highlight: keyCodes.includes('Digit6') || keyCodes.includes('Numpad6') }
            ];
        } else if (type === 'inversions') {
            containerId = 'invShortcutsVisual';
            // Pour les renversements : afficher Q W E R (positions physiques, pas les caractères)
            // Le code utilise KeyQ, KeyW, KeyE, KeyR qui sont universels
            keysToShow = [
                { code: 'KeyQ', label: 'Q', highlight: keyCodes.includes('KeyQ') },
                { code: 'KeyW', label: 'W', highlight: keyCodes.includes('KeyW') },
                { code: 'KeyE', label: 'E', highlight: keyCodes.includes('KeyE') },
                { code: 'KeyR', label: 'R', highlight: keyCodes.includes('KeyR') }
            ];
        } else {
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) return;

        // Générer le HTML du schéma
        let html = '<div class="keyboard-shortcut-visual">';
        keysToShow.forEach(key => {
            const highlightClass = key.highlight ? ' highlight' : '';
            html += `<div class="keyboard-key${highlightClass}" data-key="${key.code}">${key.label}</div>`;
        });
        html += '</div>';

        container.innerHTML = html;
    },

};