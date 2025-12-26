
import { App } from './app.js';
import { UI } from './ui.js';
import { Audio, Piano } from './audio.js';
import { PHYSICAL_MAP, DB } from './data.js';
import { ChallengeManager } from './challenges.js';

// Global assignments for HTML event listeners (onclick="window.App...")
window.App = App;
window.UI = UI;
window.Piano = Piano;
window.Audio = Audio;
window.AudioEngine = Audio;
window.ChallengeManager = ChallengeManager;

// MAPPING CLAVIER POUR LE MODE STUDIO (Positions physiques AZERTY/QWERTY standard)
// Rangée du bas (W X C V B N ,) et milieu (S D G H J)
const STUDIO_MAP = {
    'KeyZ': 0, // Do (W sur Azerty)
    'KeyS': 1, // Do#   
    'KeyX': 2, // Ré
    'KeyD': 3, // Ré#
    'KeyC': 4, // Mi
    'KeyV': 5, // Fa
    'KeyG': 6, // Fa#
    'KeyB': 7, // Sol
    'KeyH': 8, // Sol#
    'KeyN': 9, // La
    'KeyJ': 10, // La#
    'KeyM': 11, // Si (La virgule à droite du N sur Azerty a le code KeyM)
    'Comma': 11 // Fallback pour clavier Qwerty physique ou la virgule est Comma
};

// Keyboard Event Listeners
document.addEventListener('keydown', e => {
    if(e.code === 'Escape') UI.closeModals();

    // Raccourcis spécifiques au Mode Studio
    if (App.session.mode === 'studio') {
        if (e.code === 'ArrowUp') { 
            e.preventDefault(); 
            App.adjStudioOct(12); 
            return; 
        }
        if (e.code === 'ArrowDown') { 
            e.preventDefault(); 
            App.adjStudioOct(-12); 
            return; 
        }
        if (STUDIO_MAP[e.code] !== undefined) {
            e.preventDefault();
            App.setStudioBass(STUDIO_MAP[e.code]);
            return;
        }
    }

    if(e.code === 'Space') { 
        e.preventDefault(); 
        const valBtn = document.getElementById('valBtn');
        if(valBtn && !valBtn.disabled && valBtn.classList.contains('next')) {
            App.handleMain();
        }
        else if(!App.session.chord) App.playNew(); 
        else if(!App.session.done) App.replay(); 
        return;
    }
    if(e.code === 'Enter' || e.code === 'NumpadEnter') { 
        e.preventDefault(); 
        App.handleMain(); 
        return;
    }
    if(e.code === 'KeyH') {
        App.hint();
        return;
    }
    if(PHYSICAL_MAP[e.code] !== undefined) {
        const idx = PHYSICAL_MAP[e.code];
        if(App.session.mode === 'inverse') {
            if(idx < App.session.quizOptions.length) {
                if(!App.session.done) App.selectQuiz(idx);
            }
        } else {
            const isDigit = e.code.startsWith('Digit') || e.code.startsWith('Numpad');
            if(isDigit) {
                const ac = DB.chords.filter(c => App.data.settings.activeC.includes(c.id));
                if(ac[idx]) { 
                    if(!App.session.done) App.select('c', ac[idx].id);
                    else App.preview('c', ac[idx].id);
                }
            } else {
                const ai = DB.currentInvs.filter(i => App.data.settings.activeI.includes(i.id));
                if(ai[idx]) {
                    if(!App.session.done) App.select('i', ai[idx].id);
                    else App.preview('i', ai[idx].id);
                }
            }
        }
    }
});

// Initialization
window.onload = () => {
    App.init();
    
    // Hook : Vérifier si c'est la première visite et déclencher le tutoriel d'accueil
    setTimeout(() => {
        if (!localStorage.getItem('tuto_first_visit')) {
            const moduleId = window.UI.checkTutorialTriggers({ type: 'firstVisit' });
            if (moduleId) {
                window.UI.startTutorialModule(moduleId);
            }
        }
    }, 1000); // Délai pour laisser l'app s'initialiser
};

// GESTION DE LA FERMETURE / MINIMISATION (Mobile & Desktop)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        // L'utilisateur change d'onglet ou quitte l'app
        if (window.App && window.App.triggerCloudSave) {
            console.log("💾 Sauvegarde déclenchée : Page Hide");
            window.App.triggerCloudSave(true); // Force l'envoi immédiat
        }
    }
});