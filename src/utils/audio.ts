/**
 * Audio synthesis and Speech Engine for Literacy App
 * Uses Web Audio API for zero-latency playful sound effects
 * and Web Speech API (pt-BR) with natural Brazilian voices for reading syllables and words aloud.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ptVoice: SpeechSynthesisVoice | null = null;
  private availablePtVoices: SpeechSynthesisVoice[] = [];
  private preferredVoiceURI: string | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
    this.initVoice();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoice();
        this.notifyListeners();
      };
    }
  }

  public onVoicesChanged(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => {
      try {
        l();
      } catch {
        // ignore
      }
    });
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Sort and prioritize natural Brazilian voices.
   * Gives higher weight to high-fidelity neural and desktop voices.
   */
  private scoreVoice(voice: SpeechSynthesisVoice): number {
    let score = 0;
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();

    // Must be Portuguese
    if (lang.includes('pt-br') || lang === 'pt_br') {
      score += 100;
    } else if (lang.startsWith('pt')) {
      score += 20; // fallback (e.g. pt-PT)
    } else {
      return -100;
    }

    // High quality natural neural voices
    if (name.includes('natural') || name.includes('online')) score += 50;
    if (name.includes('francisca') || name.includes('antonio')) score += 40;
    if (name.includes('google') && (lang.includes('br') || name.includes('brasil'))) score += 35;
    if (name.includes('maria') || name.includes('luciana') || name.includes('felipe')) score += 30;
    if (name.includes('letícia') || name.includes('rodrigo')) score += 25;

    // Prefer default voices if flagged
    if (voice.default) score += 5;

    return score;
  }

  public initVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();

    // Filter only Portuguese voices
    const ptVoices = voices
      .filter(v => {
        const lang = v.lang.toLowerCase();
        return lang.includes('pt-br') || lang.startsWith('pt');
      })
      .sort((a, b) => this.scoreVoice(b) - this.scoreVoice(a));

    this.availablePtVoices = ptVoices;

    // Check if user has a preferred voice selected
    if (this.preferredVoiceURI) {
      const found = ptVoices.find(v => v.voiceURI === this.preferredVoiceURI);
      if (found) {
        this.ptVoice = found;
        return;
      }
    }

    // Otherwise choose highest scoring voice
    this.ptVoice = ptVoices[0] || null;
  }

  public getAvailablePtVoices(): SpeechSynthesisVoice[] {
    if (this.availablePtVoices.length === 0) {
      this.initVoice();
    }
    return this.availablePtVoices;
  }

  public getSelectedVoice(): SpeechSynthesisVoice | null {
    if (!this.ptVoice) {
      this.initVoice();
    }
    return this.ptVoice;
  }

  public setPreferredVoice(voiceURI: string) {
    this.preferredVoiceURI = voiceURI;
    this.initVoice();
  }

  /**
   * Automatic emotion and context detection for dynamic voice delivery
   */
  public detectEmotion(text: string): SpeechEmotion {
    const lower = text.toLowerCase().trim();
    if (
      lower.includes('parabéns') ||
      lower.includes('muito bem') ||
      lower.includes('incrível') ||
      lower.includes('ótimo') ||
      lower.includes('conseguiu') ||
      lower.includes('oba') ||
      lower.includes('vitória') ||
      lower.includes('show') ||
      lower.endsWith('!')
    ) {
      return 'celebrating';
    }
    if (
      lower.includes('?') ||
      lower.startsWith('qual') ||
      lower.startsWith('o que') ||
      lower.startsWith('quem') ||
      lower.startsWith('quantas') ||
      lower.startsWith('onde')
    ) {
      return 'question';
    }
    if (
      lower.includes('tente') ||
      lower.includes('quase') ||
      lower.includes('vamos lá') ||
      lower.includes('de novo') ||
      lower.includes('atenção') ||
      lower.includes('escute')
    ) {
      return 'encouraging';
    }
    if (lower.length <= 4 && !lower.includes(' ')) {
      return 'phonetic';
    }
    return 'neutral';
  }

  /**
   * Phonetic helper: Ensures isolated vowels and short letters are clearly pronounced
   * without robotic clipping or English letter names.
   */
  private preparePedagogicalText(text: string): string {
    const trimmed = text.trim();

    // Isolated uppercase vowels often sound muffled or conjunction-like in speech engines
    if (trimmed.length === 1) {
      const char = trimmed.toUpperCase();
      switch (char) {
        case 'A':
          return 'letra Á';
        case 'E':
          return 'letra É';
        case 'I':
          return 'letra Í';
        case 'O':
          return 'letra Ó';
        case 'U':
          return 'letra Ú';
        default:
          return `letra ${char}`;
      }
    }

    // Add natural breathing pauses so speech doesn't sound rushed
    let formatted = text
      .replace(/([.!?])\s+/g, '$1 , ')
      .replace(/:\s+/g, ': , ');

    return formatted;
  }

  // Play a gentle playful chirp when Mascot starts speaking
  playMascotChirp() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const notes = [659.25, 880]; // E5 to A5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.09);
      });
    } catch {
      // Audio not permitted yet
    }
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
   * Dynamic speech engine: Modulates pitch and rate dynamically according to emotion,
   * sentence context, and child attention needs.
   */
  speakText(
    text: string,
    rateOrOptions: number | SpeakOptions = 0.85,
    callbackOnEnd?: () => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (typeof rateOrOptions === 'object') {
        rateOrOptions.onEnd?.();
      } else {
        callbackOnEnd?.();
      }
      return;
    }

    const options: SpeakOptions =
      typeof rateOrOptions === 'number'
        ? { rate: rateOrOptions, onEnd: callbackOnEnd }
        : rateOrOptions;

    const baseRate = options.rate ?? 0.85;
    const emotion = options.emotion || this.detectEmotion(text);

    // Calculate dynamic pitch and cadence variations
    let dynamicPitch = options.pitch ?? 1.0;
    let dynamicRate = baseRate;

    switch (emotion) {
      case 'celebrating':
      case 'happy':
        dynamicPitch = 1.12; // Expressive joyful rise
        dynamicRate = Math.min(1.05, baseRate * 1.08);
        break;
      case 'question':
      case 'thinking':
        dynamicPitch = 1.05; // Intonational upward inquiry / curious contemplation
        dynamicRate = Math.max(0.78, baseRate * 0.95);
        break;
      case 'encouraging':
        dynamicPitch = 0.98; // Warm, reassuring tone
        dynamicRate = Math.max(0.8, baseRate * 0.92);
        break;
      case 'phonetic':
        dynamicPitch = 1.0;
        dynamicRate = Math.max(0.72, baseRate * 0.88); // Crisp articulation
        break;
      case 'story':
        dynamicPitch = 1.02;
        dynamicRate = Math.max(0.82, baseRate * 0.96);
        break;
      case 'neutral':
      default:
        dynamicPitch = 1.0;
        dynamicRate = baseRate;
        break;
    }

    if (options.playMascotChirp) {
      this.playMascotChirp();
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech immediately

      const processedText = this.preparePedagogicalText(text);
      const utterance = new SpeechSynthesisUtterance(processedText);
      utterance.lang = 'pt-BR';
      utterance.rate = dynamicRate;
      utterance.pitch = dynamicPitch;

      if (!this.ptVoice) {
        this.initVoice();
      }

      if (this.ptVoice) {
        utterance.voice = this.ptVoice;
      }

      utterance.onend = () => {
        options.onEnd?.();
      };

      utterance.onerror = () => {
        options.onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      options.onEnd?.();
    }
  }

  /**
   * Speak syllables one by one with a lively, dynamic pedagogical cadence,
   * with rising excitement as the syllables join together! (e.g. "BO... LA... BOLA!")
   */
  speakSyllablesSlowly(syllables: string[], fullWord: string, rate: number = 0.8) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (!this.ptVoice) {
      this.initVoice();
    }

    let currentIndex = 0;
    const speakNext = () => {
      if (currentIndex < syllables.length) {
        const syl = syllables[currentIndex];
        currentIndex++;
        const utt = new SpeechSynthesisUtterance(syl);
        utt.lang = 'pt-BR';
        utt.rate = Math.max(0.72, rate * 0.9);
        utt.pitch = 0.98; // Solid deliberate syllable tone
        if (this.ptVoice) utt.voice = this.ptVoice;

        utt.onstart = () => {
          this.playPop();
        };

        utt.onend = () => {
          setTimeout(speakNext, 340); // Clear pedagogical pause between syllables
        };
        utt.onerror = () => {
          setTimeout(speakNext, 180);
        };
        window.speechSynthesis.speak(utt);
      } else {
        // Speak the blended full word with vibrant celebratory inflection!
        setTimeout(() => {
          this.playStarDing();
          const fullUtt = new SpeechSynthesisUtterance(fullWord);
          fullUtt.lang = 'pt-BR';
          fullUtt.rate = Math.min(1.05, rate * 1.1);
          fullUtt.pitch = 1.1; // Triumphant joined word pitch
          if (this.ptVoice) fullUtt.voice = this.ptVoice;
          window.speechSynthesis.speak(fullUtt);
        }, 220);
      }
    };

    speakNext();
  }
}

export type SpeechEmotion =
  | 'neutral'
  | 'celebrating'
  | 'happy'
  | 'thinking'
  | 'question'
  | 'encouraging'
  | 'story'
  | 'phonetic';

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  emotion?: SpeechEmotion;
  playMascotChirp?: boolean;
  onEnd?: () => void;
}

export const soundEngine = new SoundEngine();
