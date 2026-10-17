/**
 * Audio synthesis and Speech Engine for Literacy App
 * Uses Web Audio API for zero-latency playful sound effects
 * and Web Speech API (pt-BR) for reading syllables and words aloud.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ptVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.initVoice();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoice();
      };
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private initVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Prefer Portuguese Brazilian voice
    this.ptVoice = voices.find(v => v.lang.toLowerCase().includes('pt-br')) ||
                   voices.find(v => v.lang.toLowerCase().startsWith('pt')) ||
                   null;
  }

  // Play a soft playful tap sound when touching syllables/buttons
  playPop() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio not permitted yet
    }
  }

  // Play rewarding positive chime when completing a syllable or task
  playSuccessChime() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
      });
    } catch {
      // Audio not permitted yet
    }
  }

  // Play star sound when earning points/stars
  playStarDing() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime); // E6
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio not permitted yet
    }
  }

  // Gentle, positive, non-punitive boing sound for trying again
  playGentleTryAgain() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio not permitted yet
    }
  }

  // Play celebration fanfare for trail milestones and graduation
  playCelebrationFanfare() {
    this.playLevelUpFanfare();
  }

  // Play level-up celebration fanfare
  playLevelUpFanfare() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const notes = [
        { f: 523.25, t: 0, d: 0.12 },
        { f: 659.25, t: 0.12, d: 0.12 },
        { f: 783.99, t: 0.24, d: 0.15 },
        { f: 1046.5, t: 0.40, d: 0.4 },
      ];
      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.t);
        gain.gain.setValueAtTime(0.28, ctx.currentTime + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.t + n.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + n.t);
        osc.stop(ctx.currentTime + n.t + n.d);
      });
    } catch {
      // Audio not permitted yet
    }
  }

  /**
   * Speak a syllable, word, or sentence with Portuguese pronunciation.
   * Can speak slowly for children with phonological processing difficulties.
   */
  speakText(text: string, rate: number = 0.85, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = rate; // slightly slower for better phoneme perception
      utterance.pitch = 1.15; // slightly higher pitch feels friendly and clear to kids

      if (this.ptVoice) {
        utterance.voice = this.ptVoice;
      } else {
        this.initVoice();
        if (this.ptVoice) {
          utterance.voice = this.ptVoice;
        }
      }

      utterance.onend = () => {
        onEnd?.();
      };

      utterance.onerror = () => {
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      onEnd?.();
    }
  }

  /**
   * Speak syllables one by one with a clear pedagogical pause between them,
   * then speak the whole blended word! (e.g. "BO... LA... BOLA!")
   */
  speakSyllablesSlowly(syllables: string[], fullWord: string, rate: number = 0.8) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    let currentIndex = 0;
    const speakNext = () => {
      if (currentIndex < syllables.length) {
        const syl = syllables[currentIndex];
        currentIndex++;
        const utt = new SpeechSynthesisUtterance(syl);
        utt.lang = 'pt-BR';
        utt.rate = rate;
        utt.pitch = 1.1;
        if (this.ptVoice) utt.voice = this.ptVoice;
        utt.onend = () => {
          setTimeout(speakNext, 300); // 300ms pause between syllables
        };
        window.speechSynthesis.speak(utt);
      } else {
        // Speak full word at the end
        setTimeout(() => {
          const fullUtt = new SpeechSynthesisUtterance(fullWord);
          fullUtt.lang = 'pt-BR';
          fullUtt.rate = rate * 1.05;
          fullUtt.pitch = 1.2;
          if (this.ptVoice) fullUtt.voice = this.ptVoice;
          window.speechSynthesis.speak(fullUtt);
        }, 200);
      }
    };

    speakNext();
  }
}

export const soundEngine = new SoundEngine();
