// Web Audio Procedural Bollywood Hook Synthesizer & Stream Player
// Concurrency-safe, leak-free singleton with lifecycle and visibility hooks

class AudioEngine {
  private ctx: AudioContext | null = null;
  private activeNodes: { stop: () => void }[] = [];
  private htmlAudio: HTMLAudioElement | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying: boolean = false;
  private stopTimer: number | null = null;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private playbackId: number = 0;
  private onStopListeners: Set<() => void> = new Set();

  constructor() {
    // Automatically stop audio if user switches browser tab or minimizes window
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stop();
        }
      });
      window.addEventListener('pagehide', () => this.stop());
      window.addEventListener('beforeunload', () => this.stop());
    }
  }

  public subscribeStop(listener: () => void): () => void {
    this.onStopListeners.add(listener);
    return () => this.onStopListeners.delete(listener);
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.analyser && this.ctx) {
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  /**
   * Immediately terminates all active audio playback (both HTML5 and Web Audio synth).
   * Increments playbackId so any pending asynchronous promises or timers are invalidated.
   */
  public stop() {
    this.playbackId++;

    if (this.stopTimer !== null) {
      window.clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }

    // Stop and clear all active Web Audio synth nodes
    this.activeNodes.forEach(node => {
      try { node.stop(); } catch (_) {}
    });
    this.activeNodes = [];

    // Pause the active HTML5 audio element
    if (this.htmlAudio) {
      try {
        this.htmlAudio.pause();
        this.htmlAudio.currentTime = 0;
      } catch (_) {}
      this.htmlAudio = null;
    }

    // Double safety: Pause all cached audio elements to prevent overlapping sounds
    this.audioCache.forEach(audio => {
      try {
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      } catch (_) {}
    });

    this.isPlaying = false;
    this.onStopListeners.forEach(listener => {
      try { listener(); } catch (_) {}
    });
  }

  public preloadAudio(url: string | undefined, startOffset: number = 5.0) {
    if (!url || !url.startsWith('http')) return;
    if (!this.audioCache.has(url)) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = url;
      audio.addEventListener('loadedmetadata', () => {
        try {
          audio.currentTime = startOffset;
        } catch (_) {}
      }, { once: true });
      audio.load();
      this.audioCache.set(url, audio);
    }
  }

  public playClip(
    riffNotes: string | undefined,
    sourceUrl: string | undefined,
    allowedDurationSeconds: number,
    startOffsetSeconds: number = 5.0,
    onEnded?: () => void
  ) {
    // 1. Immediately kill any currently playing audio before starting new playback
    this.stop();
    this.initContext();

    const currentId = this.playbackId;
    this.isPlaying = true;

    if (sourceUrl && (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://'))) {
      this.playHtmlAudio(sourceUrl, allowedDurationSeconds, startOffsetSeconds, currentId, onEnded);
    } else if (riffNotes && riffNotes.trim().length > 0) {
      this.playSynthRiff(riffNotes, allowedDurationSeconds, currentId, onEnded);
    } else {
      const defaultRiff = "C4:0.25,E4:0.25,G4:0.5,C5:0.5,B4:0.25,A4:0.25,G4:0.5,F4:0.25,E4:0.25,D4:0.5";
      this.playSynthRiff(defaultRiff, allowedDurationSeconds, currentId, onEnded);
    }
  }

  private playHtmlAudio(
    url: string,
    maxDuration: number,
    startOffset: number,
    sessionPlaybackId: number,
    onEnded?: () => void
  ) {
    let audio = this.audioCache.get(url);
    if (!audio) {
      audio = new Audio(url);
      audio.preload = 'auto';
      this.audioCache.set(url, audio);
    }

    this.htmlAudio = audio;

    let hasEnded = false;
    const triggerEnd = () => {
      if (hasEnded || this.playbackId !== sessionPlaybackId) return;
      hasEnded = true;
      this.stop();
      if (onEnded) onEnded();
    };

    const targetEndTime = startOffset + maxDuration;

    const timeUpdateHandler = () => {
      if (this.playbackId !== sessionPlaybackId) {
        audio.removeEventListener('timeupdate', timeUpdateHandler);
        return;
      }
      if (audio.currentTime >= targetEndTime) {
        audio.removeEventListener('timeupdate', timeUpdateHandler);
        triggerEnd();
      }
    };

    const startPlaying = () => {
      // Abort if stop() was called during async loading
      if (this.playbackId !== sessionPlaybackId) {
        try { audio.pause(); } catch (_) {}
        return;
      }

      try {
        audio.currentTime = startOffset;
      } catch (_) {}

      audio.removeEventListener('timeupdate', timeUpdateHandler);
      audio.addEventListener('timeupdate', timeUpdateHandler);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // If stopped while waiting for play() to resolve, stop immediately!
          if (this.playbackId !== sessionPlaybackId) {
            try {
              audio.pause();
              audio.currentTime = 0;
            } catch (_) {}
            return;
          }

          this.isPlaying = true;
          if (this.stopTimer !== null) {
            window.clearTimeout(this.stopTimer);
          }
          this.stopTimer = window.setTimeout(() => {
            triggerEnd();
          }, maxDuration * 1000);
        }).catch(err => {
          console.warn("Audio playback issue or interrupted:", err?.name || err);
          if (this.playbackId === sessionPlaybackId) {
            triggerEnd();
          }
        });
      }
    };

    if (audio.readyState >= 1) {
      startPlaying();
    } else {
      const metadataHandler = () => {
        audio.removeEventListener('loadedmetadata', metadataHandler);
        if (this.playbackId === sessionPlaybackId) {
          startPlaying();
        }
      };
      audio.addEventListener('loadedmetadata', metadataHandler, { once: true });
      audio.load();
    }
  }

  private playSynthRiff(riff: string, maxDuration: number, sessionPlaybackId: number, onEnded?: () => void) {
    if (!this.ctx || !this.analyser) return;

    const startTime = this.ctx.currentTime + 0.05;
    let accumulatedTime = 0;

    // Master volume gain
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.35, startTime);
    masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Warm Lowpass Filter (emulates Indian Harmonium / Reeds)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, startTime);
    filter.Q.setValueAtTime(3, startTime);
    filter.connect(masterGain);

    const noteTokens = riff.split(',').map(s => s.trim()).filter(Boolean);

    for (const token of noteTokens) {
      const [pitch, durStr] = token.split(':');
      const noteDuration = parseFloat(durStr || '0.3');
      const freq = this.noteToFrequency(pitch);

      if (freq > 0 && accumulatedTime < maxDuration) {
        const noteStart = startTime + accumulatedTime;
        const actualNoteDuration = Math.min(noteDuration, maxDuration - accumulatedTime);

        // Dual Oscillator: Sawtooth (warm reed) + Triangle (body)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, noteStart);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 1.002, noteStart); // slight chorus detune

        // ADSR envelope
        noteGain.gain.setValueAtTime(0, noteStart);
        noteGain.gain.linearRampToValueAtTime(0.5, noteStart + Math.min(0.04, actualNoteDuration * 0.2));
        noteGain.gain.exponentialRampToValueAtTime(0.001, noteStart + actualNoteDuration);

        osc1.connect(noteGain);
        osc2.connect(noteGain);
        noteGain.connect(filter);

        osc1.start(noteStart);
        osc2.start(noteStart);

        const stopAt = noteStart + actualNoteDuration;
        osc1.stop(stopAt);
        osc2.stop(stopAt);

        this.activeNodes.push({
          stop: () => {
            try { osc1.stop(); osc2.stop(); } catch (_) {}
          }
        });
      }

      accumulatedTime += noteDuration;
      if (accumulatedTime >= maxDuration) {
        break;
      }
    }

    // Strict cutoff timer matching allowedDurationSeconds
    this.stopTimer = window.setTimeout(() => {
      if (this.playbackId === sessionPlaybackId) {
        this.stop();
        if (onEnded) onEnded();
      }
    }, maxDuration * 1000);
  }

  private noteToFrequency(note: string): number {
    if (!note) return 0;
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const regex = /^([A-G][#b]?)([0-8])$/i;
    const match = note.match(regex);
    if (!match) return 0;

    let pitch = match[1].toUpperCase();
    const octave = parseInt(match[2], 10);

    if (pitch === 'DB') pitch = 'C#';
    if (pitch === 'EB') pitch = 'D#';
    if (pitch === 'GB') pitch = 'F#';
    if (pitch === 'AB') pitch = 'G#';
    if (pitch === 'BB') pitch = 'A#';

    const semitone = notes.indexOf(pitch);
    if (semitone === -1) return 0;

    const midi = (octave + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioEngine = new AudioEngine();
