export interface GameInteractionAudioParam {
  exponentialRampToValueAtTime(value: number, endTime: number): void;
  setValueAtTime(value: number, startTime: number): void;
}

export interface GameInteractionGainNode {
  connect(destination: unknown): void;
  gain: GameInteractionAudioParam;
}

export interface GameInteractionOscillatorNode {
  connect(destination: GameInteractionGainNode): void;
  frequency: GameInteractionAudioParam;
  start(when?: number): void;
  stop(when?: number): void;
  type: OscillatorType;
}

export interface GameInteractionAudioContext {
  createGain(): GameInteractionGainNode;
  createOscillator(): GameInteractionOscillatorNode;
  currentTime: number;
  destination: unknown;
  resume(): Promise<void>;
  state: AudioContextState;
  suspend?: () => Promise<void>;
}

export interface GameInteractionSoundOptions {
  enabled?: boolean;
  masterVolume?: number;
  sfxVolume?: number;
}

let sharedAudioContext: AudioContext | null = null;
let visibilityHandlerInstalled = false;

function clampUnitInterval(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0, value));
}

function installVisibilityHandler() {
  if (visibilityHandlerInstalled || typeof document === 'undefined') return;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && sharedAudioContext?.state === 'running') {
      void sharedAudioContext.suspend();
    }
  });
  visibilityHandlerInstalled = true;
}

function resolveAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return null;
  installVisibilityHandler();
  sharedAudioContext ??= new window.AudioContext();
  return sharedAudioContext;
}

function adaptAudioContext(audioContext: AudioContext): GameInteractionAudioContext {
  const gainNodes = new WeakMap<GameInteractionGainNode, GainNode>();

  return {
    createGain: () => {
      const gainNode = audioContext.createGain();
      const wrappedGain: GameInteractionGainNode = {
        connect: (destination: unknown) => {
          if (destination instanceof AudioNode) gainNode.connect(destination);
        },
        gain: gainNode.gain,
      };
      gainNodes.set(wrappedGain, gainNode);
      return wrappedGain;
    },
    createOscillator: () => {
      const oscillatorNode = audioContext.createOscillator();
      return {
        connect: (destination: GameInteractionGainNode) => {
          const gainNode = gainNodes.get(destination);
          if (gainNode) oscillatorNode.connect(gainNode);
        },
        frequency: oscillatorNode.frequency,
        start: (when?: number) => oscillatorNode.start(when),
        stop: (when?: number) => oscillatorNode.stop(when),
        get type() {
          return oscillatorNode.type;
        },
        set type(value: OscillatorType) {
          oscillatorNode.type = value;
        },
      };
    },
    currentTime: audioContext.currentTime,
    destination: audioContext.destination,
    resume: () => audioContext.resume(),
    state: audioContext.state,
    suspend: () => audioContext.suspend(),
  };
}

export function playGameInteractionSoundForContext(
  audioContext: GameInteractionAudioContext,
  options: GameInteractionSoundOptions = {},
): boolean {
  if (options.enabled === false) return false;

  const gainPeak = 0.06 * clampUnitInterval(options.masterVolume) * clampUnitInterval(options.sfxVolume);
  if (gainPeak <= 0) return false;

  if (audioContext.state === 'suspended') void audioContext.resume();
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(420, now);
  oscillator.frequency.exponentialRampToValueAtTime(620, now + 0.045);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.055);

  return true;
}

export function playGameInteractionSound(options: GameInteractionSoundOptions = {}): boolean {
  const audioContext = resolveAudioContext();
  if (!audioContext) return false;
  return playGameInteractionSoundForContext(adaptAudioContext(audioContext), options);
}
