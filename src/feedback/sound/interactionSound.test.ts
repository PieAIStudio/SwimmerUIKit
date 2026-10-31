import { describe, expect, it, vi } from 'vitest';

import {
  playGameCardRevealSound,
  playGameCardRevealSoundForContext,
  playGameInteractionSound,
  playGameInteractionSoundForContext,
  type InteractionAudioContext,
} from './interactionSound';

type Call = [string, number, number];

function fakeContext(state: AudioContextState = 'running') {
  const calls: { gain: Call[]; frequency: Call[]; started: number[]; stopped: number[] } = {
    gain: [],
    frequency: [],
    started: [],
    stopped: [],
  };
  const param = (log: Call[]) => ({
    setValueAtTime: (value: number, time: number) => log.push(['set', value, time]),
    exponentialRampToValueAtTime: (value: number, time: number) => log.push(['ramp', value, time]),
  });
  const types: OscillatorType[] = [];
  const destination = { id: 'speakers' };
  const gainTargets: unknown[] = [];
  const resume = vi.fn(async () => {});
  const context: InteractionAudioContext = {
    currentTime: 10,
    destination,
    state,
    resume,
    createGain: () => ({ gain: param(calls.gain), connect: (target) => gainTargets.push(target) }),
    createOscillator: () => {
      const oscillator = {
        type: 'sine' as OscillatorType,
        frequency: param(calls.frequency),
        connect: () => {},
        start: (when?: number) => {
          types.push(oscillator.type);
          calls.started.push(when ?? Number.NaN);
        },
        stop: (when?: number) => calls.stopped.push(when ?? Number.NaN),
      };
      return oscillator;
    },
  };
  return { calls, context, destination, gainTargets, resume, types };
}

function peak(gain: Call[]): number {
  return Math.max(...gain.map(([, value]) => value));
}

describe('playGameInteractionSoundForContext', () => {
  it('plays one short triangle blip routed to the destination', () => {
    const { calls, context, destination, gainTargets, resume, types } = fakeContext();
    expect(playGameInteractionSoundForContext(context)).toBe(true);
    expect(types).toEqual(['triangle']);
    expect(calls.started).toEqual([10]);
    expect(calls.stopped[0]).toBeCloseTo(10.055);
    expect(gainTargets).toEqual([destination]);
    expect(peak(calls.gain)).toBeCloseTo(0.06);
    // Exponential ramps cannot reach 0, so the envelope starts and ends just above it.
    expect(calls.gain[0]).toEqual(['set', 0.0001, 10]);
    expect(calls.gain.at(-1)?.[1]).toBe(0.0001);
    expect(resume).not.toHaveBeenCalled();
  });

  it('scales the peak by master and effects volume, clamped to 0..1', () => {
    const half = fakeContext();
    playGameInteractionSoundForContext(half.context, { masterVolume: 0.5, sfxVolume: 0.5 });
    expect(peak(half.calls.gain)).toBeCloseTo(0.015);

    const loud = fakeContext();
    playGameInteractionSoundForContext(loud.context, { masterVolume: 4, sfxVolume: 2 });
    expect(peak(loud.calls.gain)).toBeCloseTo(0.06);
  });

  it('stays silent when disabled or muted, without touching the context', () => {
    for (const options of [{ enabled: false }, { masterVolume: 0 }, { sfxVolume: -1 }]) {
      const { calls, context, resume } = fakeContext('suspended');
      expect(playGameInteractionSoundForContext(context, options)).toBe(false);
      expect(calls.started).toEqual([]);
      expect(resume).not.toHaveBeenCalled();
    }
  });

  it('resumes a suspended context before playing', () => {
    const { calls, context, resume } = fakeContext('suspended');
    expect(playGameInteractionSoundForContext(context)).toBe(true);
    expect(resume).toHaveBeenCalledOnce();
    expect(calls.started).toHaveLength(1);
  });
});

describe('playGameCardRevealSoundForContext', () => {
  it('adds no bell for common, one for rare and two for legendary', () => {
    const tones = (rarity: 'common' | 'rare' | 'legendary') => {
      const { context, types } = fakeContext();
      expect(playGameCardRevealSoundForContext(context, rarity)).toBe(true);
      return types;
    };
    expect(tones('common')).toEqual(['triangle']);
    expect(tones('rare')).toEqual(['triangle', 'sine']);
    expect(tones('legendary')).toEqual(['triangle', 'sine', 'sine']);
  });

  it('starts each bell after the sweep and respects mute', () => {
    const { calls, context } = fakeContext();
    playGameCardRevealSoundForContext(context, 'legendary', { masterVolume: 0.5 });
    expect(calls.started[0]).toBe(10);
    expect(calls.started[1]).toBeCloseTo(10.08);
    expect(calls.started[2]).toBeCloseTo(10.17);
    expect(peak(calls.gain)).toBeCloseTo(0.025);

    const muted = fakeContext();
    expect(playGameCardRevealSoundForContext(muted.context, 'rare', { enabled: false })).toBe(
      false,
    );
    expect(muted.calls.started).toEqual([]);
  });
});

describe('browser entry points without Web Audio', () => {
  it('return false instead of throwing during a server render', () => {
    expect(typeof window).toBe('undefined');
    expect(playGameInteractionSound()).toBe(false);
    expect(playGameCardRevealSound('rare')).toBe(false);
  });
});
