import type { LiquidDeformation } from '../../liquid/deformation';
import {
  advanceBend,
  bendFilterPadding,
  createBendState,
  resolveBendOptions,
  snapBendState,
  type BendState,
  type BendTuning,
} from './physics';

/** One item owns one deformation instance. No observer or animation clock here. */
export function createBendDeformation(tuning?: BendTuning): LiquidDeformation {
  let state: BendState | null = null;
  let lastVars: string | null = null;
  return {
    padding: (group, box) => bendFilterPadding(box, resolveBendOptions(group, tuning)),
    paint: ({ group, host, target, box, dt, snap }) => {
      state ??= createBendState(target);
      if (snap) snapBendState(state, target);
      const frame = advanceBend(
        state,
        target,
        box,
        snap ? 0 : dt,
        resolveBendOptions(group, tuning),
      );
      const x = Math.round((Number.isFinite(frame.bendX) ? frame.bendX : 0) * 10) / 10;
      const y = Math.round((Number.isFinite(frame.bendY) ? frame.bendY : 0) * 10) / 10;
      const key = `${x},${y}`;
      if (lastVars !== key) {
        host.style.setProperty('--lg-bend-x', `${x}px`);
        host.style.setProperty('--lg-bend-y', `${y}px`);
        host.style.setProperty('--lg-bend-xn', String(x));
        host.style.setProperty('--lg-bend-yn', String(y));
        lastVars = key;
      }
      return frame;
    },
    reset: (host) => {
      state = null;
      if (lastVars !== null)
        for (const name of ['--lg-bend-x', '--lg-bend-y', '--lg-bend-xn', '--lg-bend-yn'])
          host.style.removeProperty(name);
      lastVars = null;
    },
  };
}
