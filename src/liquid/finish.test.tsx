import { LIQUID_MATERIAL, TIDE_FILL } from './material/weight';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LiquidGroup } from './LiquidGroup/LiquidGroup';
import { LiquidSurface } from './LiquidSurface/LiquidSurface';
import { Button } from '../controls/Button/Button';
import { Select } from '../controls/Select/Select';
import { Input } from '../controls/Input/Input';

import { TextArea } from '../controls/TextArea/TextArea';
import { Progress } from '../feedback/Progress/Progress';
import { IconButton } from '../controls/IconButton/IconButton';

import { Toggle } from '../controls/Toggle/Toggle';

import { SegmentedControl } from '../controls/SegmentedControl/SegmentedControl';
describe('one shared thin material', () => {
  it('keeps the named material exact and independent of a skin switch', () => {
    expect(LIQUID_MATERIAL).toMatchObject({
      blur: 5,
      contrast: 18,
      gloss: 1.5,
      blob: 3.5,
      lobes: 3,
    });
    expect(TIDE_FILL).toEqual({
      top: 'var(--swimmer-game-cta-from)',
      bottom: 'var(--swimmer-game-cta-to)',
      sheen: 0.3,
    });
  });
  it('gives the primitive thin default light while preserving explicit raw geometry controls', () => {
    const thin = renderToStaticMarkup(
      <LiquidGroup>
        <span />
      </LiquidGroup>,
    );
    const explicit = renderToStaticMarkup(
      <LiquidGroup gloss={0}>
        <span />
      </LiquidGroup>,
    );
    expect(thin).toContain('surfaceScale="1.5"');
    expect(thin).toContain('feGaussianBlur');
    expect(explicit).not.toContain('feSpecularLighting');
  });
  it('keeps the press action and allows set to harden without another finish', () => {
    const html = renderToStaticMarkup(<Button variant="primary">Go</Button>);
    expect(html).toContain('data-liquid-form="press"');
    expect(html).not.toMatch(/<button[^>]*(liquidFinish|liquid-finish|surface=)/);
    const set = renderToStaticMarkup(
      <LiquidSurface form="set" active>
        Set
      </LiquidSurface>,
    );
    expect(set).not.toContain('feSpecularLighting');
  });
  it('does not draw an inviting liquid surface on disabled controls', () => {
    for (const node of [
      <Button key="button" disabled>
        Wait
      </Button>,
      <IconButton key="icon" disabled label="Wait">
        ★
      </IconButton>,
      <Toggle key="toggle" checked disabled label="Wait" />,
      <SegmentedControl
        key="segmented"
        disabled
        activeId="one"
        label="Wait"
        options={[{ id: 'one', label: 'One' }]}
      />,
      <Select key="select" disabled>
        <option>Wait</option>
      </Select>,
    ])
      expect(renderToStaticMarkup(node)).not.toContain('data-liquid-gooey-silhouette');
  });
});

describe('native selection and quiet variants', () => {
  it('keeps invalid semantics consistent on ordinary fields and honors explicit ARIA', () => {
    expect(renderToStaticMarkup(<Input invalid />)).toContain('aria-invalid="true"');
    expect(renderToStaticMarkup(<TextArea invalid />)).toContain('aria-invalid="true"');
    expect(renderToStaticMarkup(<Input invalid aria-invalid={false} />)).toContain(
      'aria-invalid="false"',
    );
  });
  it('preserves native form attributes, groups, invalid semantics and multi-select fallback', () => {
    const html = renderToStaticMarkup(
      <Select name="course" defaultValue="one" required invalid>
        <optgroup label="Courses">
          <option value="one">One</option>
          <option disabled value="two">
            Two
          </option>
        </optgroup>
      </Select>,
    );
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('name="course"');
    expect(html).toContain('<optgroup label="Courses">');
    expect(html).toContain('selected=""');
    expect(html).not.toContain('data-liquid-gooey-silhouette');
    for (const props of [{ multiple: true }, { size: 4 }]) {
      const list = renderToStaticMarkup(
        <Select {...props}>
          <option>One</option>
        </Select>,
      );
      expect(list).not.toContain('data-liquid-gooey-silhouette');
    }
  });
  it('keeps old default group markup unchanged and offers filter-free progress and selection', () => {
    expect(
      renderToStaticMarkup(
        <SegmentedControl activeId="one" label="Pick" options={[{ id: 'one', label: 'One' }]} />,
      ),
    ).not.toContain('data-liquid-gooey-silhouette');
    expect(renderToStaticMarkup(<Progress label="Progress" value={50} />)).not.toContain(
      'data-liquid-gooey-silhouette',
    );
  });
  it('makes visual and accessible progress agree for invalid numeric inputs', () => {
    for (const [value, max, expected] of [
      [-10, 100, 0],
      [150, 100, 100],
      [NaN, 100, 0],
      [30, 0, 30],
      [30, Infinity, 30],
    ]) {
      const html = renderToStaticMarkup(<Progress label="Progress" value={value!} max={max!} />);
      expect(html).toContain(`aria-valuenow="${expected}"`);
      expect(html).toContain('aria-valuemax="100"');
      expect(html).not.toContain('NaN');
    }
  });
});
