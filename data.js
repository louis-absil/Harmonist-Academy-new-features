

// --- MASTERY & SETS ---
export const MASTERY_NAMES = [
    "🏛️ L'Académie", "🎷 Le Club", "🧪 Le Laboratoire", "🌌 Le Cosmos"
];

// Cycle de 5 niveaux de Maîtrise par matière (Utilisé par UI.js et BADGES)
export const LORE_MATERIALS = [
    { name: "Cristal",    icon: "💠", particle: "de ",  color: "#a5f3fc", shadow: "#22d3ee" }, // Cyan clair
    { name: "Marbre",     icon: "🏛️", particle: "de ",  color: "#e2e8f0", shadow: "#94a3b8" }, // Blanc gris
    { name: "Argent",     icon: "🥈", particle: "de l'", color: "#cbd5e1", shadow: "#64748b" }, // Argent (Médaille)
    { name: "Or",         icon: "⚜️", particle: "de l'", color: "#fbbf24", shadow: "#b45309" }, // Or (Fleur de Lys)
    { name: "Chrome",     icon: "💿", particle: "de ",  color: "#38bdf8", shadow: "#0ea5e9" }, // Bleu électrique
    { name: "Carbone",    icon: "🌑", particle: "de ",  color: "#71717a", shadow: "#27272a" }, // Gris sombre / Lune
    { name: "Titane",     icon: "🛡️", particle: "de ",  color: "#94a3b8", shadow: "#475569" }, // Bleu gris
    { name: "Plasma",     icon: "⚛️", particle: "de ",  color: "#c084fc", shadow: "#9333ea" }, // Violet / Atome
    { name: "Saphir",     icon: "🔹", particle: "de ",  color: "#3b82f6", shadow: "#1d4ed8" }, // Bleu royal
    { name: "Émeraude",   icon: "🟢", particle: "d'",   color: "#34d399", shadow: "#059669" }, // Vert
    { name: "Rubis",      icon: "🔻", particle: "de ",  color: "#f43f5e", shadow: "#be123c" }, // Rouge
    { name: "Diamant",    icon: "💎", particle: "de ",  color: "#818cf8", shadow: "#4f46e5" }, // Indigo
    { name: "Obsidienne", icon: "🌋", particle: "d'",   color: "#1e293b", shadow: "#0f172a" }, // Noir bleu / Volcan
    { name: "Météore",    icon: "☄️", particle: "de ",  color: "#f97316", shadow: "#c2410c" }, // Orange brûlé
    { name: "Quasar",     icon: "🌀", particle: "de ",  color: "#d946ef", shadow: "#a21caf" }, // Magenta
    { name: "Absolu",     icon: "🌟", particle: "de l'",  color: "#fcd34d", shadow: "#ffffff" }  // Or Blanc / Étoile
];

// --- GHOST PLAYERS (Historique) ---
export const GHOSTS = [
    // CHRONO (Endurance)
    { mode: 'chrono', name: 'Erik Satie', mastery: 2, score: 800, quote: "Avant d'écrire une œuvre, j'en fais plusieurs fois le tour en accompagnant le tout de gestes très précis.", isGhost: true },
    { mode: 'chrono', name: 'G. Rossini', mastery: 10, score: 3500, quote: "Donnez-moi une liste de blanchisserie et je la mettrai en musique.", isGhost: true },
    { mode: 'chrono', name: 'J.S. Bach', mastery: 20, score: 9000, quote: "C'est facile : il suffit d'appuyer sur la bonne touche au bon moment et l'instrument joue tout seul.", isGhost: true },

    // SPRINT (Vitesse)
    { mode: 'sprint', name: 'C. Debussy', mastery: 4, score: 1200, quote: "La musique commence là où la parole est impuissante.", isGhost: true },
    { mode: 'sprint', name: 'W.A. Mozart', mastery: 12, score: 4500, quote: "La musique ne doit jamais offenser l'oreille, mais toujours rester musique.", isGhost: true },
    { mode: 'sprint', name: 'N. Paganini', mastery: 19, score: 12000, quote: "Paganini ne répète pas.", isGhost: true },

    // INVERSE (Écoute / Mort Subite)
    { mode: 'inverse', name: 'John Cage', mastery: 1, score: 350, quote: "Je n'ai pas d'oreille. Je n'ai jamais entendu de musique. Je ne fais qu'organiser des sons.", isGhost: true },
    { mode: 'inverse', name: 'Nadia Boulanger', mastery: 15, score: 2500, quote: "Pour étudier la musique, nous devons apprendre les règles. Pour créer de la musique, nous devons les briser.", isGhost: true },
    { mode: 'inverse', name: 'L.V. Beethoven', mastery: 20, score: 10000, quote: "Jouer une fausse note est insignifiant. Jouer sans passion est inexcusable !", isGhost: true }
];

export const DB = {
    sets: {
        academy: { 
            id: 'academy',
            name: "L'Académie", 
            mode: "std", 
            description: "Les fondations de l'harmonie occidentale.",
            chords: [ 
                { id: 'maj7', name: 'M7M', tech: 'M7M', sub: 'Maj7 / Δ', iv: [0,4,7,11] }, 
                { id: 'min7', name: 'm7m', tech: 'm7m', sub: 'min7 / m7', iv: [0,3,7,10] }, 
                { id: 'dom7', name: 'M7m', tech: 'M7m', sub: 'Dom7 / 7', iv: [0,4,7,10] }, 
                { id: 'hdim7', name: 'dim7m', tech: 'dim7m', sub: 'm7b5 / Ø', iv: [0,3,6,10] }, 
                { id: 'dim7', name: 'dim7dim', tech: 'dim7dim', sub: 'Dim7 / °7', iv: [0,3,6,9] }, 
                { id: 'minmaj7', name: 'm7M', tech: 'm7M', sub: 'mM7 / -Δ', iv: [0,3,7,11] } 
            ]
        },
        jazz: {
            id: 'jazz',
            name: "Le Club",
            mode: "jazz",
            description: "Extensions, couleurs et textures modernes.",
            chords: [
                { id: 'maj69', name: 'M6/9', tech: 'Maj69', sub: 'Maj69 / 6/9', iv: [0,4,7,9,14], unlockLvl: 1 },
                { id: 'min6', name: 'm6', tech: 'm6', sub: 'min6 / m6', iv: [0,3,7,9], unlockLvl: 2 },
                { id: 'hdim7', name: 'm7b5', tech: 'm7b5', sub: 'm7b5 / Ø', iv: [0,3,6,10], unlockLvl: 4 },
                { id: 'dom13', name: 'Dom13', tech: '13', sub: 'Dom13 / 13', iv: [0,4,7,10,21], unlockLvl: 5 }, 
                { id: 'dim7', name: 'Dim7', tech: 'Dim7', sub: 'Dim7 / °7', iv: [0,3,6,9], unlockLvl: 7 },
                { id: 'alt', name: 'Alt', tech: 'Alt', sub: 'Alt / 7alt', iv: [0,4,10,15,20], unlockLvl: 8 }, 
                { id: 'susb9', name: 'Susb9', tech: 'Susb9', sub: 'Susb9 / 7sus(b9)', iv: [0,5,7,10,13], unlockLvl: 10 },
                { id: '7sus4', name: '7sus4', tech: '7sus4', sub: 'Sus4 / 7sus', iv: [0,5,7,10], unlockLvl: 12 },
                { id: 'maj7s11', name: 'M7#11', tech: 'M7#11', sub: 'Lydien / M7#11', iv: [0,4,7,11,18], unlockLvl: 14 },
                { id: 'minmaj7', name: 'mM7', tech: 'mM7', sub: 'mM7 / -Δ', iv: [0,3,7,11], unlockLvl: 16 },
                { id: 'maj9', name: 'M9', tech: 'Maj9', sub: 'Maj9 / M9', iv: [0,4,7,11,14], unlockLvl: 18 },
                { id: 'min9', name: 'm9', tech: 'min9', sub: 'min9 / m9', iv: [0,3,7,10,14], unlockLvl: 20 }
            ]
        },
        laboratory: {
            id: 'laboratory',
            name: "Le Laboratoire",
            mode: "lab",
            description: "Architectures & Espaces Modernes.",
            chords: [
                { 
                    id: 'struct_36', name: 'Structure 3-6', tech: '3/6', sub: 'Struct. A', unlockLvl: 1,
                    configs: [
                        { id: 0, name: '8ve dim (3m↓)', sub: '6m - 3m', iv: [0,3,11] },
                        { id: 1, name: '8ve dim (3m↑)', sub: '3m - 6m', iv: [0,8,11] },
                        { id: 2, name: '8ve aug (3M↓)', sub: '6M - 3M', iv: [0,4,13] },
                        { id: 3, name: '8ve aug (3M↑)', sub: '3M - 6M', iv: [0,9,13] }
                    ]
                },
                { 
                    id: 'struct_45tr', name: 'Structure 4/5-Tr', tech: '4/5-Tr', sub: 'Struct. B', unlockLvl: 5,
                    configs: [
                        { id: 0, name: '8ve dim (4J↓)', sub: '4J + Tr', iv: [0,5,11] },
                        { id: 1, name: '8ve dim (4J↑)', sub: 'Tr + 4J', iv: [0,6,11] },
                        { id: 2, name: '8ve aug (5J↓)', sub: '5J + Tr', iv: [0,7,13] },
                        { id: 3, name: '8ve aug (5J↑)', sub: 'Tr + 5J', iv: [0,6,13] }
                    ]
                },
                { 
                    id: 'trichord', name: 'Trichordes', tech: '3-X', sub: 'Texture', unlockLvl: 10,
                    configs: [
                        { id: 0, name: 'Chromatique', sub: '1/2 + 1/2', iv: [0,1,2] },
                        { id: 1, name: 'Viennois', sub: '1/2 + Tr', iv: [0,1,6] },
                        { id: 2, name: 'Par Tons', sub: '1 + 1', iv: [0,2,4] },
                        { id: 3, name: 'Octatonique', sub: '1/2 + 3M', iv: [0,1,4] }
                    ]
                },
                { 
                    id: 'sus_sym', name: 'Suspendus', tech: 'Sus', sub: 'Symétrie', unlockLvl: 15,
                    configs: [
                        { id: 0, name: 'Sus 2', sub: '2M + 4J', iv: [0,2,7] },
                        { id: 1, name: 'Sus 4', sub: '4J + 2M', iv: [0,5,7] },
                        { id: 2, name: 'Quartal', sub: '4J + 4J', iv: [0,5,10] },
                        { id: 3, name: 'Quintal', sub: '5J + 5J', iv: [0,7,14] }
                    ]
                }
            ]
        }
    },
    invs: [ 
        { id: 0, name: 'État Fondamental', sub: 'Basse = Tonique', corr: 'Fond.', figure: ['7'], type: 'inv' }, 
        { id: 1, name: '1er Renversement', sub: 'Basse = Tierce', corr: '1er', figure: ['6','5'], type: 'inv' }, 
        { id: 2, name: '2ème Renversement', sub: 'Basse = Quinte', corr: '2ème', figure: ['4','3'], type: 'inv' }, 
        { id: 3, name: '3ème Renversement', sub: 'Basse = 7ème', corr: '3ème', figure: ['2'], type: 'inv' } 
    ],
    voicings: [ 
        { id: 0, name: 'Position Serrée', sub: 'Close', corr: 'Close', type: 'voc' }, 
        { id: 1, name: 'Drop 2', sub: 'Ouvert', corr: 'Drop 2', type: 'voc' },
        { id: 2, name: 'Shell Voicing', sub: 'Main Gauche', corr: 'Shell', type: 'voc' },
        { id: 3, name: 'Rootless', sub: 'Sans Basse', corr: 'Rootless', type: 'voc' }
    ],
    ranks: [ 
    {t:"Tourneur de pages enthousiaste",i:"📄"}, 
    {t:"Régisseur distrait",i:"🔦"}, 
    {t:"Déchiffreur du dimanche",i:"👓"}, 
    {t:"Spécialiste des cordes à vide",i:"🎻"}, 
    {t:"Harmoniste du Soir",i:"🌇"}, 
    {t:"Critique Musical Assassin",i:"📰"}, 
    {t:"Rebelle des Mouvements Contraires",i:"🎸"}, 
    {t:"Médiateur de Tensions Harmoniques",i:"🤝"}, 
    {t:"Trader en Emprunts Tonaux",i:"📉"}, // AJOUTÉ ICI
    {t:"Expert en Retards à répétitions",i:"🏃"}, 
    {t:"Serrurier des Clés d'Ut",i:"🔑"}, 
    {t:"Supersoliste incompris",i:"🌟"}, 
    {t:"Avocat du Diabolus (in Musica)",i:"⚖️"}, 
    {t:"Chef d'orchestre tyrannique",i:"🪄"}, 
    {t:"Einstein de l’Oreille Relative",i:"⚛️"}, 
    {t:"Debussyste Daltonien",i:"🎨"}, 
    {t:"Tueur en série dodécaphonique",i:"🔪"}, 
    {t:"Ministre des Fonctions harmoniques",i:"💼"}, 
    {t:"Météorologue du Temps Fort",i:"🌩️"}, 
    {t:"Réincarnation de Bach",i:"👑"} 
    ],
    chords: [],
    currentInvs: []
};

export const CODEX_DATA = {
    // --- ACADEMY CHORDS ---
    maj7: { 
        flavor: "La Stabilité Colorée", 
        theory: "<strong>Structure :</strong> Fondamentale + Tierce Maj + Quinte Juste + 7ème Maj.<br><strong>Fonction :</strong> Ier ou IVe degré. Inspire la stabilité, le rêve, la romance.", 
        coach: "Intervalles : 2 tons, 1.5 ton, 2 tons. Accord signature de la 1ère 'Gymnopédie' de Satie.",
        tags: ["#Stable", "#JazzClassique", "#IerDegré"],
        examples: [
            { title: "Gymnopédie No.1 (Satie)", url: "https://www.youtube.com/watch?v=S-Xm7s9eGxU" },
            { title: "Don't Know Why (Norah Jones)", url: "https://www.youtube.com/watch?v=tO4dxvguQDk" },
            { title: "Mr Sandman (The Chordettes)", url: "https://www.youtube.com/watch?v=CX45pYvxDiA&list=RDCX45pYvxDiA&start_radio=1" }
        ]
    },
    min7: { 
        flavor: "La Sous-Dominante Majeure", 
        theory: "<strong>Structure :</strong> Fondamentale + Tierce min + Quinte Juste + 7ème min.<br><strong>Fonction :</strong> IIe, IIIe ou VIe degré. Le pilier des cadences II-V-I.", 
        coach: "Intervalles : 1.5 ton, 2 tons, 1.5 ton. Stable, pas de triton.",
        tags: ["#Mélancolique", "#Doux", "#Pilier"],
        examples: [
            { title: "So What (Miles Davis)", url: "https://www.youtube.com/watch?v=zqNTltOGh5c" },
            { title: "Just the Two of Us", url: "https://www.youtube.com/watch?v=Uw5OLnN7UvM&list=RDUw5OLnN7UvM&start_radio=1" },
            { title: "Moanin' (Art Blakey)", url: "https://www.youtube.com/watch?v=Cv9NSR-2DwM&list=RDCv9NSR-2DwM&start_radio=1" }
        ]
    },
    dom7: { 
        flavor: "La Tension Harmonique", 
        theory: "<strong>Structure :</strong> Fondamentale + Tierce Maj + Quinte Juste + 7ème min.<br><strong>Fonction :</strong> Ve degré (Dominante). Contient un triton (3 tons) qui appelle une résolution.", 
        coach: "La tierce veut monter, la 7ème veut descendre.",
        tags: ["#Tension", "#Blues", "#Résolution"],
        examples: [
            { title: "I Feel Good (James Brown)", url: "https://www.youtube.com/watch?v=U5TqIdff_DQ" },
            { title: "Cadence Parfaite : V7 -> I", url: "" }
        ]
    },
    hdim7: { 
        flavor: "La Sous-Dominante mineure", 
        theory: "<strong>Structure :</strong> Fondamentale + Tierce min + Quinte bémol + 7ème min.<br><strong>Fonction :</strong> IIe degré en mineur. Prépare la tension de la dominante.", 
        coach: "Appelé aussi 'Demi-Diminué'. Très utilisé en Jazz mineur.",
        tags: ["#Sombre", "#Jazz", "#II-V-I Mineur"],
        examples: [
            { title: "Stella by Starlight", url: "https://www.youtube.com/watch?v=XGx1HvLV_NQ&list=RDXGx1HvLV_NQ&start_radio=1" },
            { title: "I Will Survive", url: "https://www.youtube.com/watch?v=6dYWe1c3OyU&list=RD6dYWe1c3OyU&start_radio=1" }
        ]
    },
    dim7: { 
        flavor: "La Symétrie Tendue", 
        theory: "<strong>Structure :</strong> Empilement strict de tierces mineures.<br><strong>Fonction :</strong> Accord de passage ou Dominante sans fondamentale. Symétrique : chaque note peut être la fondamentale.", 
        coach: "Deux Tritons enchâssés. Le suspens au cinéma",
        tags: ["#Horreur", "#Symétrie", "#Passage"],
        examples: [
            { title: "Toccata & Fugue (Bach)", url: "https://youtu.be/erXG9vnN-GI?list=RDerXG9vnN-GI&t=24" },
            { title: "Effet de Tension et de Suspens au Cinéma", url: "" }
        ]
    },
    minmaj7: { 
        flavor: "La Dissonance Moderne", 
        theory: "<strong>Structure :</strong> Parfait mineur + 7ème Maj.<br><strong>Fonction :</strong> Ier degré en mineur harmonique. Forte dissonance interne (7M vs 3m).", 
        coach: "Sombre en bas, Perçant en haut.",
        tags: ["#Mystère", "#Hitchcock", "#Dissonance"],
        examples: [
            { title: "James Bond Theme", url: "https://www.youtube.com/watch?v=U9FzgsF2T-s" },
            { title: "Harlem Nocturne", url: "https://www.youtube.com/watch?v=uIkekMoEQY4&list=RDuIkekMoEQY4&start_radio=1" }
        ]
    },

    // --- ACADEMY INVERSIONS (Techniques) ---
    inv_0: { flavor: "L'Ancrage.", theory: "<strong>Basse :</strong> La Tonique (1).<br>L'état le plus stable et le plus lourd. Toutes les notes reposent sur leur fondation naturelle.", coach: "C'est l'accord 'bloc' standard. Le son est compact et solide.", tags: ["#Base", "#Solide"], examples: [] },
    inv_1: { flavor: "La Coloration.", theory: "<strong>Basse :</strong> La Tierce (3).<br>Plus léger, il donne envie de bouger. La basse n'est pas la racine, ce qui crée un mouvement mélodique.", coach: "Écoute la basse : elle chante une mélodie, elle ne fait pas juste 'boum'.", tags: ["#Mélodie", "#Léger"], examples: [] },
    inv_2: { flavor: "L'Instabilité.", theory: "<strong>Basse :</strong> La Quinte (5).<br>Historiquement considéré comme une dissonance dans la version à 3 sons (Quarte et Sixte). Il appelle une résolution vers la tonique.", coach: "On a l'impression que l'accord est 'suspendu' en l'air.", tags: ["#Suspension", "#Attente"], examples: [] },
    inv_3: { flavor: "La Tension.", theory: "<strong>Basse :</strong> La 7ème (7).<br>L'état le plus instable. La 7ème à la basse veut impérativement descendre d'un degré.", coach: "La basse est très proche de la tonique (1 ton ou 1/2 ton), ça frotte !", tags: ["#Frottement", "#Passage"], examples: [] },

    // --- JAZZ CHORDS (Extensions & Modes) ---
    maj69: { flavor: "La Stabilité Pentatonique.", theory: "<strong>Structure :</strong> Triade Maj + 6te + 9ème.<br><strong>Fonction :</strong> Ier degré stable. Couleur pastorale sans tension de sensible.", coach: "Son pentatonique.", tags: ["#Stabilité_Tonale", "#Couleur_Modale", "#Bossa"], examples: [{title: "Girl from Ipanema", url: ""}] },
    min6: { flavor: "La Couleur Dorienne.", theory: "<strong>Structure :</strong> Triade min + 6te Maj.<br><strong>Fonction :</strong> Ier degré (Dorien) ou IVe degré mineur. Caractérisé par le triton (3m/6M).", coach: "Triton entre 3m et 6M.", tags: ["#Dorien", "#Fonction_Tonique", "#Couleur_Cinéma"], examples: [{title: "Pink Panther", url: ""}] },
    dom13: { flavor: "La Dominante Brillante.", theory: "<strong>Structure :</strong> Dominante + 13ème (6te).<br><strong>Fonction :</strong> V7 enrichi par la treizième majeure, apportant une clarté 'Majeure'.", coach: "Son brillant.", tags: ["#Extension_Dominante", "#Couleur_Brillante"], examples: [{title: "James Brown", url: ""}] },
    alt: { flavor: "La Tension Chromatique.", theory: "<strong>Structure :</strong> V7 + b5/#5 + b9/#9.<br><strong>Fonction :</strong> Résolution V -> I mineur. Toutes les tensions possibles sont présentes.", coach: "Tension maximale.", tags: ["#Gamme_Altérée", "#Tension_Chromatique"], examples: [] },
    susb9: { flavor: "La Dominante Phrygienne.", theory: "<strong>Structure :</strong> V7sus4 + b9.<br><strong>Fonction :</strong> Accord de dominante sur pédale, typique de la cadence Andalouse.", coach: "Couleur Espagnole.", tags: ["#Mode_Phrygien", "#Dominante_Sus"], examples: [{title: "Spain (Corea)", url: ""}] },
    '7sus4': { flavor: "La Suspension Modale.", theory: "<strong>Structure :</strong> Fondamentale + 4te + 5te + 7m.<br><strong>Fonction :</strong> V7 non résolu. Couleur Mixolydienne sans tierce directrice.", coach: "Quartal.", tags: ["#Mixolydien", "#Modal", "#Suspension"], examples: [{title: "Maiden Voyage", url: ""}] },
    maj7s11: { flavor: "L'Extension Lydienne.", theory: "<strong>Structure :</strong> Maj7 + #11 (Triton).<br><strong>Fonction :</strong> IVe degré. La #11 supprime la 'note à éviter' (quarte juste).", coach: "Lydien.", tags: ["#Mode_Lydien", "#Polytonalité"], examples: [{title: "Simpsons Theme", url: ""}] },
    maj9: { flavor: "L'Expansion Tonique.", theory: "<strong>Structure :</strong> Maj7 + 9ème Maj.<br><strong>Fonction :</strong> Ier degré enrichi. Élargissement de l'ambitus sans changer la fonction.", coach: "Richesse harmonique.", tags: ["#Extension_Naturelle", "#Ballade"], examples: [] },
    min9: { flavor: "L'Enrichissement Mineur.", theory: "<strong>Structure :</strong> min7 + 9ème Maj.<br><strong>Fonction :</strong> IIe ou VIe degré. Adoucit la rigueur de l'accord mineur de base.", coach: "Couleur douce.", tags: ["#Enrichissement", "#Smooth"], examples: [] },
    // --- JAZZ VOICINGS (Techniques) ---
    voc_0: { flavor: "La Densité.", theory: "<strong>Technique :</strong> Toutes les notes sont contenues dans une seule octave.<br>Utile pour le 'Comping' rythmique main gauche.", coach: "Ça sonne un peu 'boueux' dans les graves, à utiliser dans le registre médium.", tags: ["#Comping", "#Serré"], examples: [] },
    voc_1: { flavor: "L'Ouverture.", theory: "<strong>Technique :</strong> Drop 2.<br>On prend la 2ème note la plus aiguë d'un accord serré et on la baisse d'une octave.", coach: "Le standard des arrangeurs et des guitaristes. Ça laisse respirer l'harmonie.", tags: ["#Guitare", "#Arrangement", "#Clarté"], examples: ["Wes Montgomery", "Bill Evans"] },
    voc_2: { flavor: "L'Essentiel.", theory: "<strong>Technique :</strong> Shell (Coquille).<br>On ne joue que la Fondamentale, la Tierce et la 7ème (parfois la quinte est omise).", coach: "Style Bud Powell. C'est le squelette harmonique pur.", tags: ["#Bebop", "#Squelette"], examples: ["Bud Powell", "Thelonious Monk"] },
    voc_3: { flavor: "L'Abstraction.", theory: "<strong>Technique :</strong> Rootless (Sans Fondamentale).<br>La basse est jouée par le contrebassiste. Le piano joue 3-5-7-9.", coach: "Style Bill Evans. Très sophistiqué, ça flotte car on n'entend pas le '1'.", tags: ["#Moderne", "#Trio", "#Flottant"], examples: ["Bill Evans Trio", "Herbie Hancock"] },

    // --- LAB STRUCTURES ---
    struct_36: { 
        flavor: "Dissonance Arrondie", 
        theory: "<strong>Physique Acoustique :</strong> Alternance stricte de consonances imparfaites (Tierces et Sixtes).<br>Absence totale de quintes justes et de quartes. Crée une texture homogène sans 'centre' fort.", 
        coach: "Différenciez les 3ces et les 6tes par leur espacement.",
        tags: ["#Consonance", "#Homogène", "#SansQuinte"],
        examples: ["Musique minimaliste", "Études de intervalles"]
    },
    struct_45tr: { 
        flavor: "Dissonance Anguleuse", 
        theory: "<strong>Physique Acoustique :</strong> Empilement d'intervalles 'durs' (Quartes, Quintes) et du Triton (3 tons).<br>Génère une forte tension structurelle sans fonction tonale classique.", 
        coach: "Repérez l'intervalle Juste à la sonorité dure, froide.",
        tags: ["#Dissonance", "#Moderne", "#Mécanique"],
        examples: ["Bartók (Mikrokosmos)", "Stravinsky"]
    },
    trichord: { 
        flavor: "Agrégat et Densité", 
        theory: "<strong>Physique Acoustique :</strong> Clusters (Agrégats) de 3 notes confinées dans un espace réduit.<br>L'ambitus total ne dépasse pas la Tierce Majeure. Crée des battements rapides.", 
        coach: "Repérez l'organisation du son en terme de densité.",
        tags: ["#Cluster", "#Battements", "#Texture"],
        examples: ["Ligeti (Atmosphères)", "Penderecki"]
    },
    sus_sym: { 
        flavor: "Espace suspendu", 
        theory: "<strong>Physique Acoustique :</strong> Accords construits par symétrie intervallique (2nde+2nde ou 4te+4te).<br>L'absence de tierce rend le mode (Majeur/Mineur) indéterminé.", 
        coach: "Son très ouvert, sans tierce majeure ni mineure.",
        tags: ["#Ouvert", "#Symétrique", "#Ambigu"],
        examples: ["Debussy (Gammes par tons)", "McCoy Tyner (Quartal)"]
    }
};

export const checkRankColl = (d, type, limit) => {
    const list = (type === 'c') ? DB.sets.academy.chords : DB.invs; 
    const stats = (type === 'c') ? d.stats.c : d.stats.i;
    if(!stats) return false;
    return list.every(x => (stats[x.id] && stats[x.id].ok >= limit));
};

export const BADGES = [
    // --- V5.2 CATEGORIE: ARÈNE (Défis & Social) ---
    { id: 'b_rituel', category: 'arena', icon: '📅', title: "Le Rituel", desc: "Jouer au Défi du Jour 3 jours consécutifs", check: (d) => d.arenaStats && d.arenaStats.currentStreak >= 3 },
    { id: 'b_maitre', category: 'arena', icon: '🎲', title: "Le Maître du Jeu", desc: "Créer un défi personnalisé", check: (d) => d.arenaStats && d.arenaStats.challengesCreated >= 1 },
    { id: 'b_champ', category: 'arena', icon: '⚔️', title: "Le Champion", desc: "Score cumulé en Arène > 1000 pts", check: (d) => d.arenaStats && d.arenaStats.totalScore >= 1000 },
    
    // BADGES DE RANG (Basés sur le classement instantané ou session)
    { id: 'b_emp', category: 'arena', icon: '🦅', title: "L'Empereur", desc: "Finir 1er du Daily (min. 20 joueurs)", check: (d, s) => s.challengeRank === 1 && s.challengeTotalPlayers >= 20 },
    { id: 'b_olymp', category: 'arena', icon: '🏅', title: "L'Olympien", desc: "Top 3 sur 5 Daily différents (min. 20 joueurs)", check: (d) => d.arenaStats && d.arenaStats.podiumDates && d.arenaStats.podiumDates.length >= 5 },
    { id: 'b_out', category: 'arena', icon: '📉', title: "L'Outsider", desc: "Top 10 du Daily (min. 20 joueurs)", check: (d, s) => s.challengeRank <= 10 && s.challengeTotalPlayers >= 20 },

    // BADGES SECRETS ARÈNE (CORRIGÉS POUR VÉRIFIER LONGUEUR 20)
    { id: 'b_aube', category: 'arena', secret: true, icon: '🌅', title: "L'Aube Nouvelle", desc: "L'avenir appartient à ceux qui se lèvent tôt (6h-9h)", check: (d, s) => { if(!s.isChallenge) return false; const h = new Date().getHours(); return h >= 6 && h < 9; }},
    { id: 'b_crash', category: 'arena', secret: true, icon: '😵', title: "Le Crash Test", desc: "Un score parfait... dans le mauvais sens (0/20)", check: (d, s) => s.isChallenge && s.challengeGlobalOk === 0 && s.challengeGlobalTot >= 20 },
    { id: 'b_speed', category: 'arena', secret: true, icon: '🏎️', title: "Speedrunner", desc: "Réflexion pure < 60s sur 20 questions", check: (d, s) => s.isChallenge && s.challengeNetTime > 0 && s.challengeNetTime < 60000 && s.lastChallengeLength === 20 },

    // --- SUPER-CATÉGORIE: CARRIÈRE (Gameplay, Modes, Sets) ---
    // CORE (Général)
    { id: 'b_appr', category: 'career', setID: 'core', icon: '👶', title: "L'Apprenti", desc: "Jouer 100 accords au total", check: (d) => d.stats.totalPlayed >= 100 },
    { id: 'b_achar', category: 'career', setID: 'core', icon: '🏋️', title: "L'Acharné", desc: "Jouer 500 accords au total", check: (d) => d.stats.totalPlayed >= 500 },
    { id: 'b_reg', category: 'career', setID: 'core', icon: '📏', title: "Le Régulier", desc: "Série de 10 sans faute", check: (d, s) => s.streak >= 10 },
    { id: 'b_inv', category: 'career', setID: 'core', icon: '🛡️', title: "L'Invincible", desc: "Série de 30 sans faute", check: (d, s) => s.streak >= 30 },
    { id: 'b_snip', category: 'career', setID: 'core', icon: '🎯', title: "Le Sniper", desc: "Série de 15 sans faute sans aides", check: (d, s) => s.cleanStreak >= 15 },
    { id: 'b_metro', category: 'career', setID: 'core', icon: '⏱️', title: "Métronome", desc: "10 bonnes réponses rapides à la suite", check: (d, s) => s.fastStreak >= 10 },
    { id: 'b_expl', category: 'career', setID: 'core', icon: '🧭', title: "L'Explorateur", desc: "Finir une partie dans les 4 modes", check: (d) => d.stats.modesPlayed && d.stats.modesPlayed.length >= 4 },
    { id: 'b_ecl', category: 'career', setID: 'core', icon: '⚡', title: "L'Éclair", desc: "3 réponses < 2s d'affilée", check: (d, s) => s.fastStreak >= 3 },
    { id: 'b_bolt', category: 'career', setID: 'core', icon: '🏃', title: "Usain Bolt", desc: "Score 2 000 pts (Sprint)", check: (d, s) => s.mode === 'sprint' && s.score >= 2000 },
    { id: 'b_pres', category: 'career', setID: 'core', icon: '⏲️', title: "Sous Pression", desc: "Survivre 2 minutes (Chrono)", check: (d, s) => s.mode === 'chrono' && (Date.now() - s.startTime) >= 120000 },
    { id: 'b_phen', category: 'career', setID: 'core', icon: '🐦‍🔥', title: "Le Phénix", desc: "1 vie -> 1 000 pts (Chrono/Sprint)", check: (d, s) => s.lowLifeRecovery && s.score >= 1000 },
    { id: 'b_goldear', category: 'career', setID: 'core', icon: '👂', title: "Oreille d'Or", desc: "20 sans faute en mode Inverse", check: (d, s) => s.mode === 'inverse' && s.streak >= 20 },
    { id: 'b_comp', category: 'career', setID: 'core', icon: '🎼', title: "Le Compositeur", desc: "Série de 10 sans faute (Inverse)", check: (d, s) => s.mode === 'inverse' && s.streak >= 10 },
    { id: 'b_pur', category: 'career', setID: 'core', icon: '🧐', title: "Le Puriste", desc: "Série de 25 sans faute avec TOUS réglages", check: (d, s) => s.fullConfigStreak >= 25 },
    
    // ACADEMY
    { id: 'b_ency', category: 'career', setID: 'academy', icon: '📚', title: "L'Encyclopédie", desc: "Valider les 21 combinaisons uniques (Acad.)", check: (d) => d.currentSet === 'academy' && d.stats.combos && d.stats.combos.length >= 21 },
    { id: 'b_init', category: 'career', setID: 'academy', icon: '🥉', title: "L'Initié", desc: "Rang Bronze min. sur les 6 accords académiques", check: (d) => checkRankColl(d, 'c', 20) },
    { id: 'b_conf', category: 'career', setID: 'academy', icon: '🥈', title: "Le Confirmé", desc: "Rang Argent min. sur les 6 accords académiques", check: (d) => checkRankColl(d, 'c', 50) },
    { id: 'b_virt', category: 'career', setID: 'academy', icon: '🥇', title: "Le Virtuose", desc: "Rang Or sur les 6 accords académiques", check: (d) => checkRankColl(d, 'c', 100) },
    { id: 'b_bat', category: 'career', setID: 'academy', icon: '🔨', title: "Le Bâtisseur", desc: "Rang Bronze min. sur les 4 renversements (Acad.)", check: (d) => checkRankColl(d, 'i', 20) },
    { id: 'b_ing', category: 'career', setID: 'academy', icon: '📐', title: "L'Ingénieur", desc: "Rang Argent min. sur les 4 renversements (Acad.)", check: (d) => checkRankColl(d, 'i', 50) },
    { id: 'b_arch', category: 'career', setID: 'academy', icon: '🏗️', title: "L'Architecte", desc: "Rang Or sur les 4 renversements (Acad.)", check: (d) => checkRankColl(d, 'i', 100) },
    { id: 'b_duke', category: 'career', setID: 'academy', icon: '🎩', title: "The Duke", desc: "10 réussites consécutives sur Maj7/min7 (Acad.)", check: (d) => d.currentSet === 'academy' && d.stats.str_jazz >= 10 },
    { id: 'b_007', category: 'career', setID: 'academy', icon: '🕵️', title: "Agent 007", desc: "10 réussites consécutives sur MinMaj7", check: (d) => d.currentSet === 'academy' && d.stats.str_007 >= 10 },
    { id: 'b_dem', category: 'career', setID: 'academy', icon: '💣', title: "Démineur", desc: "10 réussites consécutives sur Dim7", check: (d) => d.currentSet === 'academy' && d.stats.str_dim >= 10 },
    { id: 'b_acro', category: 'career', setID: 'academy', icon: '🤸', title: "L'Acrobate", desc: "10 réussites consécutives sur Renversements", check: (d) => d.currentSet === 'academy' && d.stats.str_inv >= 10 },
    { id: 'b_grand', category: 'career', setID: 'academy', icon: '🌊', title: "Grand Large", desc: "Série de 15 sans faute en Mode Ouvert (Acad.)", check: (d, s) => d.currentSet === 'academy' && s.openStreak >= 15 },

    // JAZZ
    { id: 'b_blue', category: 'career', setID: 'jazz', icon: '🎷', title: "Blue Note", desc: "Réussir 50 accords Jazz (Club)", check: (d) => { if(d.currentSet !== 'jazz' || !d.stats.v) return false; let tot = 0; for(let k in d.stats.v) tot += d.stats.v[k].ok; return tot >= 50; }},
    { id: 'b_velvet', category: 'career', setID: 'jazz', icon: '🧤', title: "Doigts de Velours", desc: "Série de 10 sur Voicing Rootless", check: (d, s) => d.currentSet === 'jazz' && s.rootlessStreak >= 10 },
    { id: 'b_alt', category: 'career', setID: 'jazz', icon: '💥', title: "Altered Beast", desc: "20 réussites sur l'accord Altéré", check: (d) => d.currentSet === 'jazz' && (d.stats.c['alt']?.ok || 0) >= 20 },
    { id: 'b_bebop', category: 'career', setID: 'jazz', icon: '🎺', title: "Bebop Flow", desc: "5 réponses rapides en mode Jazz", check: (d, s) => s.fastStreak >= 5 && d.currentSet === 'jazz' },

    // LAB
    { id: 'b_lab', category: 'career', setID: 'laboratory', icon: '🧪', title: "Rat de Labo", desc: "Réussir 50 accords Laboratoire", check: (d) => { if(d.currentSet !== 'laboratory' || !d.stats.l) return false; let tot = 0; for(let k in d.stats.l) tot += d.stats.l[k].ok; return tot >= 50; }},
    { id: 'b_geo', category: 'career', setID: 'laboratory', icon: '📐', title: "L'Œil du Géomètre", desc: "Série de 15 sur les Structures (36/45tr)", check: (d, s) => d.currentSet === 'laboratory' && s.geoStreak >= 15 },
    { id: 'b_cryst', category: 'career', setID: 'laboratory', icon: '💠', title: "Cristallographe", desc: "Série de 10 sur Structure 3-6", check: (d, s) => d.currentSet === 'laboratory' && s.str36Streak >= 10 },
    { id: 'b_tri', category: 'career', setID: 'laboratory', icon: '😈', title: "Détecteur de Tritons", desc: "Tirer le Diabolus in Musica par la queue", check: (d, s) => d.currentSet === 'laboratory' && s.str45Streak >= 10 },
    { id: 'b_arch_abs', category: 'career', setID: 'laboratory', icon: '🏗️', title: "L'Architecte Abstrait", desc: "50 réussites sur Struct 3-6 ET 45tr", check: (d) => d.currentSet === 'laboratory' && (d.stats.c['struct_36']?.ok || 0) >= 50 && (d.stats.c['struct_45tr']?.ok || 0) >= 50 },
    { id: 'b_quant', category: 'career', setID: 'laboratory', icon: '⚛️', title: "Oreille Quantique", desc: "Série de 10 sur Trichordes", check: (d, s) => d.currentSet === 'laboratory' && s.triStreak >= 10 },
    { id: 'b_sym', category: 'career', setID: 'laboratory', icon: '🦋', title: "Symétrie Parfaite", desc: "30 réussites sur Suspendus", check: (d) => d.currentSet === 'laboratory' && (d.stats.c['sus_sym']?.ok || 0) >= 30 },

    // --- SUPER-CATÉGORIE: HÉRITAGE (Lore & Progression) ---
    { 
        id: 'b_leg', category: 'lore', setID: 'lore', icon: '👑', title: "La Légende", 
        desc: "Débloquer tous les badges Généraux et Académiques", 
        check: (d) => {
            const visibleTargets = BADGES.filter(b => !b.secret && (b.setID === 'core' || b.setID === 'academy'));
            const playerUnlocked = d.badges.filter(bid => {
                const b = BADGES.find(x => x.id === bid);
                return b && (b.setID === 'core' || b.setID === 'academy');
            });
            return playerUnlocked.length >= visibleTargets.length;
        } 
    },

    // EASTER EGGS
    { id: 'b_sceptic', category: 'lore', setID: 'lore', secret: true, icon: '🤔', title: "Le Sceptique", desc: "La patience est une vertu (5 Replay)", check: (d, s) => s.replayCount > 5 },
    { id: 'b_auto', category: 'lore', setID: 'lore', secret: true, icon: '🤖', title: "L'Automate", desc: "Votre régularité n'est plus humaine (Série 50)", check: (d, s) => s.streak >= 50 },
    { id: 'b_dj', category: 'lore', setID: 'lore', secret: true, icon: '🎧', title: "Le DJ", desc: "Remix en cours... (Spam Rejouer)", check: (d, s) => s.djClickTimes.length >= 5 },
    { id: 'b_ind', category: 'lore', setID: 'lore', secret: true, icon: '🤷', title: "L'Indécis", desc: "Il n'y a que les imbéciles qui ne changent pas d'avis", check: (d, s) => {
        const h = s.selectionHistory;
        if(h.length < 3) return false;
        const last = h[h.length-1];
        const prev = h[h.length-2];
        const ante = h[h.length-3];
        return last === ante && last !== prev;
    }},
    { id: 'b_deja', category: 'lore', setID: 'lore', secret: true, icon: '🐈', title: "Déjà-Vu", desc: "Une faille dans la matrice ?", check: (d, s) => s.dejaVu === true },
    { id: 'b_surv', category: 'lore', setID: 'lore', secret: true, icon: '🚑', title: "Le Survivant", desc: "Ce qui ne vous tue pas vous donne de l'XP", check: (d, s) => (s.mode === 'chrono' || s.mode === 'sprint') && s.lives === 1 && s.score >= 500 },
    { id: 'b_mono', category: 'lore', setID: 'lore', secret: true, icon: '🥋', title: "Monomaniaque", desc: "Plus un esprit se limite, plus il touche à l'infini", check: (d, s) => s.monoStreak >= 20 },
    { id: 'b_fast', category: 'lore', setID: 'lore', secret: true, icon: '🐆', title: "Instinct Primal", desc: "Plus rapide que la pensée (<1s)", check: (d, s) => s.lastReactionTime < 1000 },
    { id: 'b_pure', category: 'lore', setID: 'lore', secret: true, icon: '✨', title: "L'Audiophile", desc: "Série de 10 sans jamais réécouter", check: (d, s) => s.pureStreak >= 10 },
    { id: 'b_razor', category: 'lore', setID: 'lore', secret: true, icon: '💣', title: "Le Fil du Rasoir", desc: "L'efficacité sous pression maximale (<2s)", check: (d, s) => s.razorTriggered === true },
    { id: 'b_curieux', category: 'lore', setID: 'lore', secret: true, icon: '👆', title: "Touche-à-tout", desc: "La curiosité est un vilain défaut ?", check: (d, s) => s.titleClicks >= 10 },
    { id: 'b_jack', category: 'lore', setID: 'lore', secret: true, icon: '🎰', title: "Jackpot", desc: "La chance sourit aux audacieux (3x même type)", check: (d, s) => s.jackpotStreak >= 3 },
    { id: 'b_alchi', category: 'lore', setID: 'lore', secret: true, icon: '⚗️', title: "L'Alchimiste", desc: "Transmuter les 12 tons en Or (Cycle complet)", check: (d, s) => s.collectedRoots && s.collectedRoots.size >= 12 }
];

// GÉNÉRATION DES BADGES SECRETS DE MATIÈRE
LORE_MATERIALS.forEach((m, i) => {
    BADGES.push({
        id: `b_mat_${i}`,
        category: 'lore',
        setID: 'lore',
        secret: true,
        icon: m.icon || '💠',
        title: `L'Éveil ${m.particle}${m.name}`,
        desc: `Atteindre la Maîtrise ${m.particle}${m.name} (Niveau ${i*5 + 1})`,
        check: (d) => d.mastery >= (i * 5 + 1)
    });
});

export const PHYSICAL_MAP = {
    'Digit1': 0, 'Digit2': 1, 'Digit3': 2, 'Digit4': 3, 'Digit5': 4, 'Digit6': 5,
    'Numpad1': 0, 'Numpad2': 1, 'Numpad3': 2, 'Numpad4': 3, 'Numpad5': 4, 'Numpad6': 5,
    'KeyQ': 0, 'KeyW': 1, 'KeyE': 2, 'KeyR': 3, 'KeyT': 4, 'KeyY': 5, 'KeyZ': 5
};

export const COACH_DB = {
    start: [
        "Bienvenue. Prenez une grande respiration avant de commencer.",
        "Fermez les yeux. Votre oreille voit mieux quand vos yeux sont clos.",
        "Ne cherchez pas à deviner. Écoutez la résonance jusqu'au bout.",
        "Arpègez l'accord dans ta tête, cela vous aidera à vous orienter.",
        "L'objectif n'est pas la vitesse, mais la précision de votre sensation."
    ],
    // High accuracy, high streak
    streak: [
        "Votre cerveau anticipe la couleur avant même la fin de l'accord.",
        "Vous êtes en état de flux (Flow). Ne forcez rien, laissez venir.",
        "Vos connexions neuronales se renforcent à chaque bonne réponse.",
        "Vous ne réfléchissez plus, vous faites confiance à votre intuition.",
        "Excellent. Gardez cette détente, c'est là que réside la justesse."
    ],
    // Fast but inaccurate
    speed_warn: [
        "Votre temps de réponse est inférieur au temps de résonance nécessaire à une analyse fiable.",
        "La précipitation nuit à l'ancrage mémoriel. Prenez le temps de confirmer votre intuition.",
        "Vous répondez avant d'avoir entendu la couleur complète de l'accord. Ralentissez.",
        "L'harmonie s'apprécie dans la durée. Laissez le son résonner."
    ],
    // High level advice
    master: [
        "Votre niveau est excellent. Essayez d'accélérer votre cadence pour travailler votre intuition",
        "Bravo! Vous pouvez essayer les positions 'Ouvertes' pour augmenter la difficulté",
        "Concentrez-vous sur la 'texture' du son plutôt que sur les notes.",
        "L'harmonie n'a plus de secrets pour vous.",
        "Vous entendez les couleurs avec une clarté impressionnante."
    ],
    // General Theory
    theory: [
        "Rappel : Un intervalle de 3 tons est appelé Triton. C'est l'intervalle le plus instable.",
        "En jazz, la 3ème et la 7ème sont appelées 'Notes Guides'. Elles définissent la qualité de l'accord.",
        "La quinte abaissée (b5) est caractéristique des accords diminués et demi-diminués.",
        "Une cadence est une progression d'accords qui marque une ponctuation musicale."
    ],
    // Encouragement (Diesel / Struggle)
    effort: [
        "La neuroplasticité exige de la répétition. Chaque erreur corrigée renforce le réseau neuronal.",
        "L'apprentissage de l'harmonie est non-linéaire. La stagnation précède souvent une progression soudaine.",
        "Continuez. La distinction des couleurs harmoniques se construit par accumulation d'expériences.",
        "Ne vous découragez pas. L'oreille relative est une compétence qui se forge par le travail."
    ],
    // Critical / Fatigue
    critical: [
        "Saturation auditive détectée. La discrimination des fréquences baisse après 20 minutes d'effort intense.",
        "Votre taux d'erreur augmente significativement. Une courte pause permettrait de réinitialiser votre écoute.",
        "La fatigue mentale altère le jugement des intervalles. Revenez plus tard pour consolider vos acquis.",
        "L'entraînement auditif est un sprint, pas un marathon. Reposez votre oreille.",
        "Attention à la saturation. Une pause n'est pas du temps perdu, c'est une phase d'intégration."
    ],
    // Breakthrough (Low stats -> High streak)
    breakthrough: [
        "Excellente séquence. Vous semblez avoir assimilé la structure interne de ces accords.",
        "Votre perception s'affine. Vous identifiez désormais les tensions avec justesse.",
        "C'est un palier de progression. Votre oreille commence à classer les couleurs automatiquement.",
        "La corrélation entre le son et la théorie est établie. Continuez ainsi."
    ],
    // Doubter (High acc, slow time, many replays)
    patience: [
        "L'analyse statistique montre que votre premier choix est souvent le bon. Fiez-vous à votre instinct.",
        "L'hésitation introduit du bruit mental. Validez votre première impression.",
        "Vous avez l'oreille juste. N'intellectualisez pas trop le processus."
    ],
    weakness: {
        maj7: [
            {t:"Sensation", m:"Le Maj7 est stable, mais on peut chercher la 7ème, à 1/2 ton de l'octave."},
            {t:"Technique", m:"Intervalles : 2 tons, 1.5 ton, 2 tons. On retrouve la couleur de la première 'Gymnopédie' d'Eric Satie."},
            {t:"Astuce", m:"Si vous n'entendez pas la couleur, la visualisation du clavier est une aide précieuse."},
            {t:"Couleur", m:"La sonorité de cet accord est caractéristique du Jazz, avec une couleur Majeure très stable."},
            {t:"Mélodie", m:"À l'état fondamental, l'arpège correspond aux quatre premières notes de la mélodie de 'Mr. Sandman'."}
        ],
        min7: [
            {t:"Sensation", m:"C'est un accord doux et stable, sans le frottement du Maj7 ni la tension du Dom7."},
            {t:"Technique", m:"Il est neutre et contemplatif."},
            {t:"Astuce", m:"Il sonne 'jazz' mais sans agressivité."},
            {t:"Fonction", m:"Cet accord correspond naturellement au deuxième degré d'une tonalité Majeure."},
            {t:"Structure", m:"Les renversements du min7 ont une sonorité presque Majeure."}
        ],
        dom7: [
            {t:"Sensation", m:"Il contient un Triton. C'est cette tension qui appelle une résolution."},
            {t:"Technique", m:"La tierce veut monter, la 7ème veut descendre. C'est un accord tendu."},
            {t:"Astuce", m:"Repérez le côté instable lié au Vème degré."},
            {t:"Fonction", m:"Identifiez la tension caractéristique de la Dominante qui appelle une résolution vers la Tonique."},
            {t:"Singularité", m:"C'est le seul accord Majeur qui contient une 7ème mineure."}
        ],
        hdim7: [
            {t:"Sensation", m:"La couleur est sombre et tendue. Elle évoque les films noirs."},
            {t:"Technique", m:"Appelé aussi Demi-Diminué. Le pivot du mode mineur."},
            {t:"Astuce", m:"Plus sombre que le mineur 7, mais moins dramatique que le diminué complet."},
            {t:"Structure", m:"C'est un accord mineur avec une quinte diminuée (bémol 5). Il est sombre et instable."},
            {t:"Fonction", m:"Cet accord correspond naturellement au deuxième degré d'une tonalité mineure."}
        ],
        dim7: [
            {t:"Sensation", m:"Symétrique et angoissant. Sa sonorité est associée aux effets spectaculaires et dramatiques au cinéma."},
            {t:"Technique", m:"Empilement de tierces mineures. Il est composé de deux tritons enchâssés."},
            {t:"Astuce", m:"Chacune des notes de l'accord peut jouer le rôle de sensible."},
            {t:"Symétrie", m:"L'accord est symétrique : il divise l'octave en quatre parties égales de 1,5 tons."},
            {t:"Piège", m:"Composé uniquement de tierces mineures, cet accord retombe sur ses notes initiales lors de l'arpège."}
        ],
        minmaj7: [
            {t:"Sensation", m:"Une sonorité dramatique. Une base sombre avec une pointe acide."},
            {t:"Technique", m:"Mineur avec une 7ème Majeure. Forte dissonance interne."},
            {t:"Astuce", m:"Repère la dissonance particulièrement forte de l'accord, surtout lorsqu'il est renversé."},
            {t:"Cinéma", m:"C'est l'accord final emblématique du thème de James Bond."},
            {t:"Image", m:"Imaginez un accord mineur classique perturbé par une note sensible très aiguë."}
        ],
        // --- Ajouter ceci dans COACH_DB.weakness (data.js) ---
        inv_0: [
            {t:"Fondamentale", m:"L'état fondamental est le plus stable. La basse est la fondamentale."},
            {t:"Repère", m:"L'accord est constitué uniquement de tierces superposées."},
            {t:"Intervalle", m:"L'accord ne comporte pas de dissonnance de seconde."}
        ],
        inv_1: [
            {t:"Fluidité", m:"Le 1er renversement place la Tierce à la basse. Il est moins stable que l'état fondamental."},
            {t:"Couleur", m:"Attention, la couleur de l'accord peut être opposée à la couleur du renversement, notamment pour m7."},
            {t:"Dissonance", m:"La dissonance se situe en haut de l'accord."}
        ],
        inv_2: [
            {t:"Suspension", m:"La Quinte est à la basse. L'accord est suspensif et instable."},
            {t:"Confusion", m:"C'est souvent le renversement le plus difficile à identifier."},
            {t:"Dissonance", m:"La dissonance se situe au milieu de l'accord."}
        ],
        inv_3: [
            {t:"Tension", m:"La 7ème est à la basse. C'est très instable !"},
            {t:"Frottement", m:"Il y a souvent une seconde (1 ton ou 1/2 ton) entre la basse et la tonique."},
            {t:"Mouvement", m:"La basse (7ème) appelle une résolution descendante sur l'accord suivant."},
            {t:"Dissonance", m:"La dissonance se situe en bas de l'accord."}
        ]
    }
};
