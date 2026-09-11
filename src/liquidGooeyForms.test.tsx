import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GameButton } from './GameButton';
import {
  LIQUID_FORM_NAMES,
  LIQUID_FORMS,
  LIQUID_REST_EDGE_LIMITS,
  liquidFormGroup,
  liquidFormItem,
} from './liquidGooeyForms';
import { LIQUID_GOOEY_FILTER_DEFAULTS } from './liquidGooeyFilter';

function compact(markup: string): string {
  return markup.replace(/\s+/g, ' ');
}

describe('liquid forms', () => {
  /*
    This assertion used to read 「every form rests at waviness 0」, and that was
    the wrong invariant. The production finding behind it is real — a static
    edge can absolutely read as breakage — but the cause is the wavelength, not
    the amplitude. Rendered side by side at button scale, 6 / 0.018 is visible
    jitter and 3 / 0.008 is one slow undulation that reads as a liquid surface
    standing still. So the rule is a band, not a zero.
  */
  it('keeps every resting edge inside the band that still reads as a surface', () => {
    const tooLoud = LIQUID_FORM_NAMES.filter(
      (form) =>
        LIQUID_FORMS[form].group.waviness > LIQUID_REST_EDGE_LIMITS.waviness ||
        LIQUID_FORMS[form].group.wavinessFreq > LIQUID_REST_EDGE_LIMITS.wavinessFreq,
    );
    expect(tooLoud).toEqual([]);
  });

  /*
    The old kit default has to stay outside the band, or the band means nothing.
  */
  it('leaves the noisy old default outside that band', () => {
    expect(
      6 > LIQUID_REST_EDGE_LIMITS.waviness || 0.018 > LIQUID_REST_EDGE_LIMITS.wavinessFreq,
    ).toBe(true);
  });

  /*
    An unconfigured surface still rests flat. A consumer that never picked a
    form has not opted into a shaped edge, and the kit should not give it one.
  */
  it('keeps the unconfigured default flat', () => {
    expect(LIQUID_GOOEY_FILTER_DEFAULTS.waviness).toBe(0);
  });

  /*
    The two group forms say what they mean through the relationship between
    bodies, so a shaped outline there is noise competing with the message.
  */
  it('keeps the edges of the two group forms flat', () => {
    expect(LIQUID_FORMS.merge.group.waviness).toBe(0);
    expect(LIQUID_FORMS.follow.group.waviness).toBe(0);
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
    expect(group.waviness).toBe(LIQUID_FORMS.press.group.waviness);
    expect(group.wavinessFreq).toBe(LIQUID_FORMS.press.group.wavinessFreq);

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
