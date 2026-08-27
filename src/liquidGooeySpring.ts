/** Small spring-to-easing compiler used by the shared group clock. */

export interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export type TransitionPreset = 'snappy' | 'smooth' | 'bouncy';

export type Transition = TransitionPreset | SpringConfig | { duration: number; ease?: string };

export interface ResolvedTransition {
  duration: number;
  easing: string;
}

export const presets: Record<TransitionPreset, Required<SpringConfig>> = {
  snappy: { stiffness: 480, damping: 34, mass: 1 },
  smooth: { stiffness: 190, damping: 26, mass: 1 },
  bouncy: { stiffness: 320, damping: 17, mass: 1 },
};

const DT = 1 / 240;

function simulate(config: Required<SpringConfig>): {
  duration: number;
  values: number[];
  overshoots: boolean;
} {
  let x = 0;
  let velocity = 0;
  let time = 0;
  let settledAt = -1;
  let max = 0;
  const values: number[] = [0];
  while (time < 10) {
    const acceleration = (-config.stiffness * (x - 1) - config.damping * velocity) / config.mass;
    velocity += acceleration * DT;
    x += velocity * DT;
    time += DT;
    values.push(x);
    if (x > max) max = x;
    if (Math.abs(x - 1) < 0.001 && Math.abs(velocity) < 0.02) {
      if (settledAt < 0) settledAt = time;
      if (time - settledAt >= 0.064) break;
    } else {
      settledAt = -1;
    }
  }
  const duration = settledAt > 0 ? settledAt : time;
  const sampleCount = Math.round(Math.min(120, Math.max(24, duration * 90)));
  const lastIndex = Math.min(values.length - 1, duration / DT);
  const sampled: number[] = [];
  for (let i = 0; i <= sampleCount; i += 1) {
    const index = Math.min(values.length - 1, Math.round((i / sampleCount) * lastIndex));
    sampled.push(Math.round((values[index] ?? 1) * 1e4) / 1e4);
  }
  sampled[sampled.length - 1] = 1;
  return { duration, values: sampled, overshoots: max > 1.001 };
}

let linearSupport: boolean | null = null;

function supportsLinear(): boolean {
  if (linearSupport === null) {
    linearSupport =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('transition-timing-function', 'linear(0, 1)');
  }
  return linearSupport;
}

const transitionCache = new Map<string, ResolvedTransition>();
const evaluatorCache = new Map<string, (progress: number) => number>();

/** Evaluate linear(), cubic-bezier(), and the common CSS timing keywords. */
export function easingFunction(spec: string): (progress: number) => number {
  const cached = evaluatorCache.get(spec);
  if (cached) return cached;
  const linear = /^linear\(([^)]+)\)$/.exec(spec.trim());
  const bezier = /^cubic-bezier\(([^)]+)\)$/.exec(spec.trim());
  let fn: (progress: number) => number;
  if (linear) {
    const values = (linear[1] ?? '').split(',').map(Number);
    fn = (progress) => {
      if (progress <= 0) return values[0] ?? 0;
      if (progress >= 1) return values[values.length - 1] ?? 1;
      const scaled = progress * (values.length - 1);
      const index = Math.floor(scaled);
      const start = values[index] ?? 0;
      const end = values[index + 1] ?? start;
      return start + (end - start) * (scaled - index);
    };
  } else if (bezier) {
    const [x1 = 0, y1 = 0, x2 = 1, y2 = 1] = (bezier[1] ?? '').split(',').map(Number);
    fn = (progress) => {
      if (progress <= 0) return 0;
      if (progress >= 1) return 1;
      let low = 0;
      let high = 1;
      for (let i = 0; i < 24; i += 1) {
        const mid = (low + high) / 2;
        const x = 3 * mid * (1 - mid) * (1 - mid) * x1 + 3 * mid * mid * (1 - mid) * x2 + mid ** 3;
        if (x < progress) low = mid;
        else high = mid;
      }
      const u = (low + high) / 2;
      return 3 * u * (1 - u) * (1 - u) * y1 + 3 * u * u * (1 - u) * y2 + u ** 3;
    };
  } else if (spec === 'ease') {
    fn = easingFunction('cubic-bezier(0.25, 0.1, 0.25, 1)');
  } else if (spec === 'ease-in') {
    fn = easingFunction('cubic-bezier(0.42, 0, 1, 1)');
  } else if (spec === 'ease-out') {
    fn = easingFunction('cubic-bezier(0, 0, 0.58, 1)');
  } else if (spec === 'ease-in-out') {
    fn = easingFunction('cubic-bezier(0.42, 0, 0.58, 1)');
  } else {
    fn = (progress) => Math.min(1, Math.max(0, progress));
  }
  evaluatorCache.set(spec, fn);
  return fn;
}

export function resolveTransition(
  transition: Transition | undefined,
  reducedMotion = false,
): ResolvedTransition {
  if (reducedMotion) return { duration: 0, easing: 'linear' };
  const config = transition ?? 'smooth';
  if (typeof config === 'object' && 'duration' in config) {
    return {
      duration: Math.max(0, config.duration),
      easing: config.ease ?? 'cubic-bezier(0.22, 1, 0.36, 1)',
    };
  }
  const spring: Required<SpringConfig> =
    typeof config === 'string'
      ? presets[config]
      : { stiffness: 300, damping: 24, mass: 1, ...config };
  const key = `${spring.stiffness}/${spring.damping}/${spring.mass}/${supportsLinear()}`;
  let resolved = transitionCache.get(key);
  if (!resolved) {
    const simulation = simulate(spring);
    resolved = {
      duration: Math.round(simulation.duration * 1000),
      easing: supportsLinear()
        ? `linear(${simulation.values.join(', ')})`
        : simulation.overshoots
          ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'cubic-bezier(0.22, 1, 0.36, 1)',
    };
    transitionCache.set(key, resolved);
  }
  return resolved;
}
