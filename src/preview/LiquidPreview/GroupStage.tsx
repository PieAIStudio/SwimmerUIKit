import { type CSSProperties, type ReactNode } from 'react';

import { LiquidGroup } from '../../liquid/LiquidGroup/LiquidGroup';

import { liquidFormGroup, liquidFormItem, type LiquidForm } from '../../liquid/forms';
import { SLOT } from './constants';

/*
 * The relationship forms, each with the smallest arrangement that shows what it
 * says. These are hand-built rather than driven by a table because the whole
 * point of a relationship form is that the caller arranges the items — a
 * generic harness would be inventing an arrangement and then presenting it as
 * the form, which is the thing the `kind` split exists to stop.
 */
export function GroupStage({
  form,
  engaged,
  fill,
}: {
  form: LiquidForm;
  engaged: boolean;
  fill: string;
}): ReactNode {
  const group = liquidFormGroup(form);
  const item = liquidFormItem(form);
  const shared = {
    blur: group.blur,
    contrast: group.contrast,
    filterPadding: group.filterPadding,
    fill,
    gloss: group.gloss,
  };
  const itemProps = {
    ...(item.effect === undefined ? {} : { effect: item.effect }),
    ...(item.morph === undefined ? {} : { morph: item.morph }),
    ...(item.transition === undefined ? {} : { transition: item.transition }),
    ...(group.blob > 0 ? { blob: { amplitude: group.blob, lobes: group.lobes } } : {}),
  };
  const dot = (size: number): CSSProperties => ({ width: size, height: size, display: 'block' });

  if (form === 'merge' || form === 'split') {
    // Merge closes the gap, split opens it. Same two bodies, read in opposite
    // directions, which is exactly what the two forms are.
    const apart = form === 'merge' ? (engaged ? 0 : 30) : engaged ? 32 : 0;
    return (
      <LiquidGroup {...shared} aria-hidden="true" className="game-ui-liquid-page__stage">
        <LiquidGroup.Item {...itemProps} radius={999} x={-apart}>
          <span style={dot(46)} />
        </LiquidGroup.Item>
        <LiquidGroup.Item {...itemProps} radius={999} x={apart}>
          <span style={dot(46)} />
        </LiquidGroup.Item>
      </LiquidGroup>
    );
  }

  if (form === 'follow') {
    /*
     * A marker needs somewhere to go, or it is just a rounded rectangle that
     * slides. The three slots are plain DOM on the crisp layer above the goo —
     * the same division every liquid surface in the kit uses, and the reason
     * the marker can deform while the labels it is pointing at stay readable.
     */
    return (
      <span className="game-ui-liquid-page__rail">
        <LiquidGroup {...shared} aria-hidden="true" className="game-ui-liquid-page__stage">
          <LiquidGroup.Item {...itemProps} radius={14} x={engaged ? SLOT : -SLOT}>
            <span style={{ width: SLOT, height: 34, display: 'block' }} />
          </LiquidGroup.Item>
        </LiquidGroup>
        <span aria-hidden="true" className="game-ui-liquid-page__rail-slots">
          <span data-on={engaged ? undefined : 'true'}>one</span>
          <span>two</span>
          <span data-on={engaged ? 'true' : undefined}>three</span>
        </span>
      </span>
    );
  }

  /*
   * bead: a scatter that can find itself.
   *
   * Engaged pulls the droplets in to a quarter of their spread rather than to
   * a single point. Stacked exactly on top of each other they fuse into one
   * smooth capsule, which is a pill — the one shape that says nothing about
   * having been made of droplets. Landing them close but not coincident is
   * what leaves the lumps, and the lumps are the whole sentence.
   */
  const beads = [
    [-46, -13],
    [-19, 11],
    [5, -15],
    [29, 9],
    [50, -7],
  ] as const;
  const GATHER = 0.24;
  return (
    <LiquidGroup {...shared} aria-hidden="true" className="game-ui-liquid-page__stage">
      {beads.map(([x, y], index) => (
        <LiquidGroup.Item
          {...itemProps}
          key={index}
          delay={index * 40}
          radius={999}
          x={engaged ? x * GATHER : x}
          y={engaged ? y * GATHER : y}
        >
          <span style={dot(22)} />
        </LiquidGroup.Item>
      ))}
    </LiquidGroup>
  );
}
