import type { BlobBox } from './geometry';
import type { MoveTarget } from './move';

/** Internal extension seam. The engine still owns measurement, time and budget.
 * Optional effects supply geometry only; the core never imports their code. */
export interface LiquidDeformation {
  padding(group: HTMLElement | null, box: BlobBox): number;
  paint(input: {
    group: HTMLElement | null;
    host: HTMLElement;
    target: MoveTarget;
    box: BlobBox;
    dt: number;
    snap: boolean;
  }): {
    path: string;
    transform: string;
    fingerprint: string;
    moving: boolean;
  };
  reset(host: HTMLElement): void;
}
