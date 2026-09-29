import { describe, expect, it } from 'vitest';
import { relativeCardTilt } from './gameCardOrientation';

describe('relative card orientation', () => {
  const centre = { beta: 60, gamma: 5 };
  it('calibrates at the held position and bounds tilt independently of the raw sensor', () => {
    expect(relativeCardTilt(60, 5, centre, 0)).toEqual({ x: 0, y: 0 });
    expect(relativeCardTilt(70, 15, centre, 0)).toEqual({ x: 0.5, y: 0.5 });
    expect(relativeCardTilt(180, -90, centre, 0)).toEqual({ x: -1, y: 1 });
  });
  it('keeps screen directions in landscape and upside-down portrait', () => {
    expect(relativeCardTilt(70, 5, centre, 90)).toEqual({ x: 0.5, y: 0 });
    expect(relativeCardTilt(70, 5, centre, 270)).toEqual({ x: -0.5, y: -0 });
    expect(relativeCardTilt(60, 15, centre, 180)).toEqual({ x: -0.5, y: -0 });
  });
  it('rejects null and non-finite readings, including an invalid calibration or rotation', () => {
    expect(relativeCardTilt(null, 0, centre, 0)).toBeNull();
    expect(relativeCardTilt(0, null, centre, 0)).toBeNull();
    expect(relativeCardTilt(NaN, 0, centre, 0)).toBeNull();
    expect(relativeCardTilt(0, Infinity, centre, 0)).toBeNull();
    expect(relativeCardTilt(0, 0, { beta: NaN, gamma: 0 }, 0)).toBeNull();
    expect(relativeCardTilt(0, 0, centre, NaN)).toBeNull();
  });
});
