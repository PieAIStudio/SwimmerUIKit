import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GameButton } from './GameButton';
import {
  LIQUID_FORM_NAMES,
  LIQUID_FORMS,
  liquidFormGroup,
  liquidFormItem,
} from './liquidGooeyForms';
import { LIQUID_GOOEY_FILTER_DEFAULTS } from './liquidGooeyFilter';

function compact(markup: string): string {
  return markup.replace(/\s+/g, ' ');
}

describe('liquid forms', () => {
  /*
    The one rule the whole set exists to keep. University verified in production
    that waviness on a static rounded rectangle reads as a rendering defect, so
    a form shipping a non-zero resting waviness would be shipping that defect
    under a friendly name.
  */
  it('rests every form at zero waviness', () => {
    const wobbly = LIQUID_FORM_NAMES.filter((form) => LIQUID_FORMS[form].group.waviness !== 0);
    expect(wobbly).toEqual([]);
  });

  it('keeps the kit default at rest too, so an unconfigured surface does not wobble', () => {
    expect(LIQUID_GOOEY_FILTER_DEFAULTS.waviness).toBe(0);
  });

  /*
    Merge radius and edge hardness are the two knobs that decide whether a form
    reads as liquid, and they are supposed to trade against each other across
    the set. If `merge` ever stopped being the softest, widest-reaching form,
    the vocabulary would have collapsed into arbitrary presets.
  */
  it('puts merge at the reaching end and press at the crisp end', () => {
    const blurs = LIQUID_FORM_NAMES.map((form) => LIQUID_FORMS[form].group.blur);
    const contrasts = LIQUID_FORM_NAMES.map((form) => LIQUID_FORMS[form].group.contrast);
    expect(LIQUID_FORMS.merge.group.blur).toBe(Math.max(...blurs));
    expect(LIQUID_FORMS.merge.group.contrast).toBe(Math.min(...contrasts));
    expect(LIQUID_FORMS.press.group.contrast).toBe(Math.max(...contrasts));
  });

  it('gives every form a summary a picker can show', () => {
    const silent = LIQUID_FORM_NAMES.filter((form) => LIQUID_FORMS[form].summary.trim() === '');
    expect(silent).toEqual([]);
  });

  /*
    Overrides merge into the bundle rather than replacing it. A caller that
    changes one knob must not silently lose the other three, because then it
    would be claiming a form it is no longer using.
  */
  it('merges overrides into a form instead of replacing the bundle', () => {
    const group = liquidFormGroup('press', { blur: 9 });
    expect(group.blur).toBe(9);
    expect(group.contrast).toBe(LIQUID_FORMS.press.group.contrast);
    expect(group.waviness).toBe(0);

    const item = liquidFormItem('press', { morph: { bounce: 0.9 } });
    expect(item.morph?.bounce).toBe(0.9);
    expect(item.morph?.shape).toBe(LIQUID_FORMS.press.item.morph?.shape);
    expect(item.transition).toBe(LIQUID_FORMS.press.item.transition);
  });
});

describe('GameButton surface axis', () => {
  /*
    The default path has to stay byte-identical. `surface` is new, every
    existing call site omits it, and a wrapper appearing around every button in
    six products would be a silent layout change rather than a new feature.
  */
  it('renders exactly the same markup when no surface is asked for', () => {
    const before = compact(renderToStaticMarkup(<GameButton variant="primary">Go</GameButton>));
    const after = compact(
      renderToStaticMarkup(
        <GameButton surface="flat" variant="primary">
          Go
        </GameButton>,
      ),
    );
    expect(after).toBe(before);
    expect(before).not.toContain('game-ui-liquid-surface');
  });

  /*
    The liquid body is decoration; the control underneath it must survive
    unchanged. This is the property that makes the pattern safe to adopt widely
    — the silhouette deforms, the real button never does, so the hit target,
    the focus ring and the text stay exactly where they were.
  */
  it('keeps a real button with its classes and label under the liquid body', () => {
    const html = compact(
      renderToStaticMarkup(
        <GameButton surface="liquid" variant="danger">
          Delete
        </GameButton>,
      ),
    );
    expect(html).toContain('game-ui-liquid-surface');
    expect(html).toContain('data-liquid-form="press"');
    expect(html).toContain('game-ui-button game-ui-button--danger');
    expect(html).toContain('Delete');
    expect(html).toContain('<button');
  });

  /*
    Tone and surface are separate axes on purpose; this is the combination that
    folding 'liquid' into `variant` would have made unsayable.
  */
  it('lets a destructive action still be liquid', () => {
    const html = compact(
      renderToStaticMarkup(
        <GameButton surface="liquid" variant="danger">
          Delete
        </GameButton>,
      ),
    );
    expect(html).toContain('game-ui-button--danger');
    expect(html).toContain('game-ui-liquid-surface');
  });
});
