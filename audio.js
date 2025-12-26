
export const Piano = {
    activeNotes: [], 
    startMidi: 48, numWhiteKeys: 18, 
    
    // Helper to draw a specific piano state to a canvas
    drawToCanvas(canvas, activeNotes, startMidi = 48, forceFit = false) {
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        
        // Calculate scale
        let sMidi = startMidi;
        let nWhite = this.numWhiteKeys;

        if(forceFit && activeNotes.length > 0) {
             const min = Math.min(...activeNotes);
             const max = Math.max(...activeNotes);
             sMidi = Math.floor((min - 5) / 12) * 12; 
             if (min - sMidi > 10) sMidi += 5;
             const range = max - sMidi + 5; 
             nWhite = Math.ceil((range / 12) * 7);
             if(nWhite < 10) nWhite = 10;
        }

        const wW = canvas.width / nWhite;
        const wH = canvas.height;
        const bW = wW * 0.65;
        const bH = wH * 0.6;
        const pattern = [0,1,0,1,0,0,1,0,1,0,1,0]; 
        
        ctx.clearRect(0,0,canvas.width, canvas.height);

        // Draw Whites
        let whiteIdx = 0;
        for(let i=0; i < nWhite * 2.5; i++) { 
            const midi = sMidi + i;
            const noteInOctave = midi % 12;
            if(!pattern[noteInOctave]) {
                const x = whiteIdx * wW;
                const isActive = activeNotes.includes(midi);
                
                ctx.fillStyle = isActive ? '#a5b4fc' : '#cbd5e1'; // Solid colors
                ctx.fillRect(x+1, 0, wW-2, wH);
                
                // Shadow for depth
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.fillRect(x+1, wH-10, wW-2, 10);
                
                if(isActive) {
                     ctx.shadowBlur = 15; ctx.shadowColor = '#6366f1';
                     ctx.fillStyle = '#818cf8';
                     ctx.fillRect(x+1, 0, wW-2, wH);
                     ctx.shadowBlur = 0;
                }
                
                whiteIdx++;
                if(whiteIdx >= nWhite) break;
            }
        }
        
        // Draw Blacks
        whiteIdx = 0;
        for(let i=0; i < nWhite * 2.5; i++) {
            const midi = sMidi + i;
            const noteInOctave = midi % 12;
            if(!pattern[noteInOctave]) {
                whiteIdx++;
                if(whiteIdx >= nWhite) break;
            } else {
                const x = (whiteIdx * wW) - (bW/2);
                const isActive = activeNotes.includes(midi);
                ctx.fillStyle = isActive ? '#d946ef' : '#1e293b'; // Solid dark
                ctx.fillRect(x, 0, bW, bH);
                
                ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                ctx.strokeRect(x, 0, bW, bH);
            }
        }
    },

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },
    
    resize() {
        const canvas = document.getElementById('pianoCanvas');
        if(canvas) this.drawToCanvas(canvas, this.activeNotes, this.startMidi, true);
    },

    visualize(notes, targetCanvas = null) {
        if(targetCanvas) {
            // Static/One-off draw for Codex or other UI
            this.drawToCanvas(targetCanvas, notes, 48, true);
        } else {
            // Main Game Animation
            const canvas = document.getElementById('pianoCanvas');
            canvas.classList.add('show');
            document.getElementById('visualizer').style.opacity = '0.1';
            
            this.activeNotes = [];
            this.drawToCanvas(canvas, [], 48, true);
            
            notes.forEach((n, i) => {
                setTimeout(() => {
                    this.activeNotes.push(n);
                    this.drawToCanvas(canvas, this.activeNotes, 48, true);
                }, i * 120); 
            });

            // FIX: Increased timeout from 2000 to 5000 for better analysis time
            setTimeout(() => {
                this.activeNotes = [];
                canvas.classList.remove('show');
                document.getElementById('visualizer').style.opacity = '0.5';
            }, notes.length * 120 + 5000);
        }
    }
};

export const Audio = {
    ctx: null, master: null, reverb: null, samples: {}, baseUrl: 'https://tonejs.github.io/audio/salamander/',
    sampleMap: { 36: 'C2.mp3', 39: 'Ds2.mp3', 42: 'Fs2.mp3', 45: 'A2.mp3', 48: 'C3.mp3', 51: 'Ds3.mp3', 54: 'Fs3.mp3', 57: 'A3.mp3', 60: 'C4.mp3', 63: 'Ds4.mp3', 66: 'Fs4.mp3', 69: 'A4.mp3', 72: 'C5.mp3', 75: 'Ds5.mp3', 78: 'Fs5.mp3', 81: 'A5.mp3', 84: 'C6.mp3' },
    init() { if (this.ctx) return; const AC = window.AudioContext || window.webkitAudioContext; this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = 1.0; this.reverb = this.ctx.createConvolver(); this.reverb.buffer = this.createReverbImpulse(2.0); const revGain = this.ctx.createGain(); revGain.gain.value = 0.3; this.master.connect(this.ctx.destination); this.master.connect(this.reverb); this.reverb.connect(revGain); revGain.connect(this.ctx.destination); this.loop(); this.loadSamples(); },
    createReverbImpulse(duration) { const rate = this.ctx.sampleRate, length = rate * duration, impulse = this.ctx.createBuffer(2, length, rate), L = impulse.getChannelData(0), R = impulse.getChannelData(1); for (let i = 0; i < length; i++) { const decay = Math.pow(1 - i / length, 3); L[i] = (Math.random() * 2 - 1) * decay; R[i] = (Math.random() * 2 - 1) * decay; } return impulse; },
    async loadSamples() { window.UI.msg("Chargement Piano...", "correction"); const promises = Object.keys(this.sampleMap).map(async (midi) => { try { const response = await fetch(this.baseUrl + this.sampleMap[midi]); if(!response.ok) throw new Error('Network'); const buff = await response.arrayBuffer(); this.samples[midi] = await this.ctx.decodeAudioData(buff); } catch (e) { } }); await Promise.all(promises); if(Object.keys(this.samples).length > 5) window.UI.msg("Piano Activé", "correct"); else { window.UI.msg("Erreur Réseau", "wrong"); } setTimeout(() => window.UI.msg("Prêt ?"), 2000); },
    playNote(midi, time, velocity = 0.5) { 
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        if (!this.ctx) return; 
        this.playSampledNote(midi, time, velocity); 
    },
    playSampledNote(midi, time, velocity) { 
        const available = Object.keys(this.samples).map(Number).sort((a,b)=>a-b);
        if(available.length === 0) return;
        let closest = available[0], minDiff = Math.abs(midi - closest); for (let n of available) { const diff = Math.abs(midi - n); if (diff < minDiff) { minDiff = diff; closest = n; } } const src = this.ctx.createBufferSource(); src.buffer = this.samples[closest]; src.playbackRate.value = Math.pow(2, (midi - closest) / 12); const g = this.ctx.createGain(); g.gain.setValueAtTime(0, time); g.gain.linearRampToValueAtTime(velocity, time + 0.01); g.gain.exponentialRampToValueAtTime(0.001, time + 4.0); src.connect(g); g.connect(this.master); src.start(time); 
    },
    playPureTone(f, t, dur=0.5, type='sine') { 
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        const o = this.ctx.createOscillator(); o.type = type; o.frequency.value = f; const g = this.ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.1, t + 0.05); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.1); 
    },
    chord(notes, arp = false) { 
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); 
        if (!this.ctx) this.init(); 
        const now = this.ctx.currentTime; 
        notes.forEach((n, i) => { const humanize = arp ? 0 : Math.random() * 0.04; const t = now + (arp ? i * 0.12 : humanize); const vel = Math.max(0.4, 0.85 - (n / 140)); this.playNote(n, t, vel); }); 
        
        // FIX: REMOVED AUTO-VISUALIZATION HERE TO PREVENT SPOILERS ON HINT
    },
    sfx(k) { 
        if(!this.ctx) return; const now = this.ctx.currentTime; 
        if (k === 'win') {
            [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => this.playPureTone(f, now + i*0.05, 0.8, 'sine'));
        } 
        else if (k === 'lose') { this.playPureTone(180, now, 0.3); this.playPureTone(130, now + 0.15, 0.4, 'triangle'); } 
        else if (k === 'lvl') {
            [523, 659, 783, 1046, 1318, 1568].forEach((f,i) => this.playPureTone(f, now + i * 0.06, 0.4, 'sine'));
        }
        else if (k === 'badge') {
            [523.25, 659.25, 783.99, 880.00, 1046.50].forEach((f, i) => this.playPureTone(f, now + i * 0.08, 0.5, 'triangle'));
            this.playPureTone(261.63, now, 1.0, 'sine');
        }
        else if (k === 'rankup') {
            [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
                this.playPureTone(f, now + i * 0.04, 0.6, 'triangle'); 
            });
        }
        else if (k === 'prestige') {
            const arp = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98, 2093.00];
            arp.forEach((f, i) => { this.playPureTone(f, now + i * 0.1, 0.3, 'triangle'); });
            setTimeout(() => { [523.25, 659.25, 783.99, 1046.50].forEach(f => this.playPureTone(f, this.ctx.currentTime, 2.0, 'sine')); }, 1500);
        }
        else if (k === 'max') {
            this.playPureTone(130.81, now, 3.0, 'sine'); 
            this.playPureTone(196.00, now, 3.0, 'sine');
            [1046, 1318, 1568, 2093].forEach((f, i) => this.playPureTone(f, now + i*0.1, 1.5, 'triangle'));
        }
        else if (k === 'book') { 
            const noise = this.ctx.createBufferSource();
            const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.4, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < buffer.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5; 
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, now);
            filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0.8, now);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            noise.connect(filter); filter.connect(g); g.connect(this.master);
            noise.start(now);
        }
        else if (k === 'flip') { 
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0.1, now);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.connect(g); g.connect(this.master);
            osc.start(now); osc.stop(now + 0.1);
        }
        // --- NEW CODEX SFX ---
        else if (k === 'codex_open') {
            // High tech swoosh
            const osc = this.ctx.createOscillator();
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.1, now + 0.1);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.connect(g); g.connect(this.master);
            osc.start(now); osc.stop(now + 0.3);
        }
        else if (k === 'codex_select') {
            // Short tech blip
            const osc = this.ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(1200, now);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0.05, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.connect(g); g.connect(this.master);
            osc.start(now); osc.stop(now + 0.05);
        }
        else if (k === 'card_open') {
            // Soft slide/pop
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0.1, now);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.connect(g); g.connect(this.master);
            osc.start(now); osc.stop(now + 0.2);
        }
        // --- MODAL SFX ---
        else if (k === 'modal_open') {
            // Swoosh doux universel
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(1000, now + 0.2);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.08, now + 0.05);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.connect(g); g.connect(this.master);
            osc.start(now); osc.stop(now + 0.2);
        }
        else if (k === 'modal_settings') {
            // Blip tech discret
            const osc = this.ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(1000, now);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0.06, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.connect(g); g.connect(this.master);
            osc.start(now); osc.stop(now + 0.1);
        }
        else if (k === 'modal_stats') {
            // Swoosh montant (analyse de données)
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.08, now + 0.05);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.connect(g); g.connect(this.master);
            osc.start(now); osc.stop(now + 0.2);
        }
        else if (k === 'modal_profile') {
            // Accord doux (personnel)
            [261.63, 329.63, 392.00].forEach((f, i) => {
                this.playPureTone(f, now + i * 0.02, 0.25, 'sine');
            });
        }
        else if (k === 'modal_arena') {
            // Son énergique (défi)
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.12, now + 0.05);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.connect(g); g.connect(this.master);
            osc.start(now); osc.stop(now + 0.25);
        }
        // --- BUTTON SFX ---
        else if (k === 'button_click') {
            // Blip très court
            const osc = this.ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(1500, now);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0.04, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.connect(g); g.connect(this.master);
            osc.start(now); osc.stop(now + 0.05);
        }
        else if (k === 'button_replay') {
            // Blip court
            const osc = this.ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, now);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0.05, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.connect(g); g.connect(this.master);
            osc.start(now); osc.stop(now + 0.08);
        }
        else if (k === 'mode_switch') {
            // Transition douce
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.06, now + 0.03);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.connect(g); g.connect(this.master);
            osc.start(now); osc.stop(now + 0.15);
        }
        // --- BUTTON CONFIRM/CANCEL SFX ---
        else if (k === 'button_confirm') {
            // Son de confirmation positive
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // Do
            osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // Mi
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.08, now + 0.05);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.connect(g); g.connect(this.master);
            osc.start(now); osc.stop(now + 0.2);
        }
        else if (k === 'button_cancel') {
            // Son d'annulation (descendant)
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.06, now + 0.05);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.connect(g); g.connect(this.master);
            osc.start(now); osc.stop(now + 0.15);
        }
        // --- TOGGLE SFX ---
        else if (k === 'toggle_on') {
            // Son de toggle activé (montant)
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.06, now + 0.03);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.connect(g); g.connect(this.master);
            osc.start(now); osc.stop(now + 0.1);
        }
        else if (k === 'toggle_off') {
            // Son de toggle désactivé (descendant)
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(350, now + 0.1);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.06, now + 0.03);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.connect(g); g.connect(this.master);
            osc.start(now); osc.stop(now + 0.1);
        }
    },
    loop() { const cvs = document.getElementById('visualizer'); const c = cvs.getContext('2d'); const draw = () => { requestAnimationFrame(draw); if(!this.ctx) return; if (cvs.width !== cvs.clientWidth) { cvs.width = cvs.clientWidth; cvs.height = cvs.clientHeight; } c.clearRect(0,0,cvs.width,cvs.height); if(Math.random() > 0.92) { c.fillStyle = `rgba(99, 102, 241, ${Math.random()*0.2})`; const w = Math.random() * cvs.width; const x = Math.random() * cvs.width; c.fillRect(x, 0, w/4, cvs.height); } }; draw(); }
};
