import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LiquidGroup } from './LiquidGroup';
import { LiquidSurface } from './LiquidSurface';
import { GameButton } from './GameButton';
import { GameSelect } from './GameSelect';
import { GameInput, GameTextArea } from './GameForms';
import { GameProgress } from './GameDisplay';
import { GameIconButton, GameToggle, GameSegmentedControl } from './GameSurfaces';
import { liquidFinishGloss } from './liquidGooeyFinish';

describe('liquid finish is an opt-in material, not another engine', () => {
  it('keeps historical lighting when omitted, including engaged form lighting', () => {
    for (const value of [0, 2, 5]) expect(liquidFinishGloss(undefined, value)).toBe(value);
    expect(liquidFinishGloss('matte', 5)).toBe(0);
    expect(liquidFinishGloss('glossy', 0)).toBe(5);
    expect(liquidFinishGloss('glossy', 2)).toBe(2);
  });
  it('removes only the specular pass for matte and keeps explicit raw gloss authoritative', () => {
    const matte = renderToStaticMarkup(
      <LiquidGroup liquidFinish="matte">
        <span />
      </LiquidGroup>,
    );
    const glossy = renderToStaticMarkup(
      <LiquidGroup liquidFinish="glossy">
        <span />
      </LiquidGroup>,
    );
    const explicit = renderToStaticMarkup(
      <LiquidGroup liquidFinish="glossy" gloss={0}>
        <span />
      </LiquidGroup>,
    );
    expect(matte).not.toContain('feSpecularLighting');
    expect(glossy).toContain('feSpecularLighting');
    expect(explicit).not.toContain('feSpecularLighting');
    expect(matte).toContain('feGaussianBlur');
  });
  it('keeps the press form on both materials and never forwards finish to native controls', () => {
    for (const liquidFinish of ['matte', 'glossy'] as const) {
      const html = renderToStaticMarkup(
        <GameButton surface="liquid" liquidFinish={liquidFinish}>
          Go
        </GameButton>,
      );
      expect(html).toContain('data-liquid-form="press"');
      expect(html).not.toMatch(/<button[^>]*(liquidFinish|liquid-finish|surface=)/);
      const body = renderToStaticMarkup(
        <LiquidSurface form="set" active liquidFinish={liquidFinish}>
          Set
        </LiquidSurface>,
      );
      if (liquidFinish === 'glossy') expect(body).toContain('surfaceScale="2"');
      else expect(body).not.toContain('feSpecularLighting');
    }
  });
  it('does not draw an inviting liquid surface on disabled controls', () => {
    for (const node of [
      <GameButton key="button" disabled surface="liquid">
        Wait
      </GameButton>,
      <GameIconButton key="icon" disabled surface="liquid" label="Wait">
        ★
      </GameIconButton>,
      <GameToggle key="toggle" checked disabled surface="liquid" label="Wait" />,
      <GameSegmentedControl
        key="segmented"
        disabled
        activeId="one"
        label="Wait"
        options={[{ id: 'one', label: 'One' }]}
      />,
      <GameSelect key="select" disabled surface="liquid">
        <option>Wait</option>
      </GameSelect>,
    ])
      expect(renderToStaticMarkup(node)).not.toContain('data-liquid-gooey-silhouette');
  });
});

describe('native selection and quiet variants', () => {
  it('keeps invalid semantics consistent on ordinary fields and honors explicit ARIA', () => {
    expect(renderToStaticMarkup(<GameInput invalid />)).toContain('aria-invalid="true"');
    expect(renderToStaticMarkup(<GameTextArea invalid />)).toContain('aria-invalid="true"');
    expect(renderToStaticMarkup(<GameInput invalid aria-invalid={false} />)).toContain(
      'aria-invalid="false"',
    );
  });
  it('preserves native form attributes, groups, invalid semantics and multi-select fallback', () => {
    const html = renderToStaticMarkup(
      <GameSelect surface="liquid" name="course" defaultValue="one" required invalid>
        <optgroup label="Courses">
          <option value="one">One</option>
          <option disabled value="two">
            Two
          </option>
        </optgroup>
      </GameSelect>,
    );
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('name="course"');
    expect(html).toContain('<optgroup label="Courses">');
    expect(html).toContain('selected=""');
    expect(html).toContain('data-liquid-gooey-silhouette');
    for (const props of [{ multiple: true }, { size: 4 }]) {
      const list = renderToStaticMarkup(
        <GameSelect {...props} surface="liquid">
          <option>One</option>
        </GameSelect>,
      );
      expect(list).not.toContain('data-liquid-gooey-silhouette');
    }
  });
  it('keeps old default group markup unchanged and offers filter-free progress and selection', () => {
    expect(
      renderToStaticMarkup(
        <GameSegmentedControl
          activeId="one"
          label="Pick"
          options={[{ id: 'one', label: 'One' }]}
          surface="flat"
        />,
      ),
    ).not.toContain('data-liquid-gooey-silhouette');
    expect(
      renderToStaticMarkup(<GameProgress label="Progress" value={50} surface="flat" />),
    ).not.toContain('data-liquid-gooey-silhouette');
  });
  it('makes visual and accessible progress agree for invalid numeric inputs', () => {
    for (const [value, max, expected] of [
      [-10, 100, 0],
      [150, 100, 100],
      [NaN, 100, 0],
      [30, 0, 30],
      [30, Infinity, 30],
    ]) {
      const html = renderToStaticMarkup(
        <GameProgress label="Progress" value={value!} max={max!} />,
      );
      expect(html).toContain(`aria-valuenow="${expected}"`);
      expect(html).toContain('aria-valuemax="100"');
      expect(html).not.toContain('NaN');
    }
  });
});
