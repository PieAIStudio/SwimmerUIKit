export interface DropletPose {
  x: number;
  y: number;
  amplitude: number;
  phase: number;
}
export interface DropletSpring {
  value: DropletPose;
  velocity: DropletPose;
  target: DropletPose;
}
const keys = ['x', 'y', 'amplitude', 'phase'] as const;
const zero = (): DropletPose => ({ x: 0, y: 0, amplitude: 0, phase: 0 });
export const restingPose = (amplitude: number): DropletPose => ({
  x: 1,
  y: 1,
  amplitude,
  phase: 0,
});
/*
 * Twice the first flat press (squash 0.10 to 0.20, spread 0.045 to 0.09), with
 * the same spread-to-squash ratio. The droplet only scales in place: no
 * sideways translation, so the press reads as squash and not as a glitch.
 */
export const pressedPose = (amplitude: number): DropletPose => ({
  x: 1.09,
  y: 0.8,
  amplitude: amplitude * 1.75 + 0.65,
  phase: 0.8,
});

export function createDropletSpring(amplitude: number): DropletSpring {
  return { value: restingPose(amplitude), velocity: zero(), target: restingPose(amplitude) };
}
export function snapDropletSpring(spring: DropletSpring, pose: DropletPose): void {
  spring.value = { ...pose };
  spring.target = { ...pose };
  spring.velocity = zero();
}

/** Fixed bounded substeps keep a stalled frame from adding energy. The damping
 * is deliberately below critical damping: a released edge crosses rest once. */
export function advanceDropletSpring(spring: DropletSpring, seconds: number): boolean {
  let remaining = Math.min(0.064, Math.max(0, Number.isFinite(seconds) ? seconds : 0));
  while (remaining > 0) {
    const dt = Math.min(1 / 120, remaining);
    for (const key of keys) {
      spring.velocity[key] +=
        (320 * (spring.target[key] - spring.value[key]) - 14 * spring.velocity[key]) * dt;
      spring.value[key] += spring.velocity[key] * dt;
    }
    remaining -= dt;
  }
  const moving = keys.some(
    (key) =>
      Math.abs(spring.value[key] - spring.target[key]) > 0.0008 ||
      Math.abs(spring.velocity[key]) > 0.008,
  );
  if (!moving) snapDropletSpring(spring, spring.target);
  return moving;
}
