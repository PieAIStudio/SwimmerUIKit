import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Button } from './Button';

describe('Button fullWidth is an opt-in layout contract', () => {
  it('keeps default full-width behaviour unchanged while primary has the new CTA paint', () => {
    const html = renderToStaticMarkup(<Button variant="primary">Go</Button>);
    expect(html.match(/<button\b/g)).toHaveLength(1);
    expect(html).toContain('class="game-ui-button game-ui-button--primary"');
    expect(html).toContain('type="button"');
    expect(html).toContain('data-game-ui-cta="true"');
    expect(html).not.toContain('game-ui-button--full-width');
    expect(
      renderToStaticMarkup(
        <Button fullWidth={false} variant="primary">
          Go
        </Button>,
      ),
    ).toBe(renderToStaticMarkup(<Button variant="primary">Go</Button>));
  });

  it('does not leak the layout prop to native DOM', () => {
    const html = renderToStaticMarkup(
      <Button fullWidth type="submit" name="start">
        Go
      </Button>,
    );
    expect(html).toContain('game-ui-button--full-width');
    expect(html).toContain('type="submit"');
    expect(html).toContain('name="start"');
    expect(html).not.toContain('fullWidth=');
    expect(html).not.toContain('fullwidth=');
  });

  it('keeps one native button and uses the existing press form for a liquid CTA', () => {
    const html = renderToStaticMarkup(
      <Button fullWidth variant="primary">
        Go
      </Button>,
    );
    expect(html.match(/<button\b/g)).toHaveLength(1);
    expect(html).toContain('game-ui-button-frame');
    expect(html).toContain('data-full-width="true"');
    expect(html).toContain('game-ui-button--full-width');
    expect(html).toContain('data-liquid-form="press"');
    expect(html).toContain('aria-hidden="true"');
  });

  it('keeps the disabled fallback flat, including full-width layout', () => {
    const html = renderToStaticMarkup(
      <Button fullWidth disabled>
        Wait
      </Button>,
    );
    expect(html).toContain('game-ui-button--full-width');
    expect(html).toContain('disabled=""');
    expect(html).not.toContain('game-ui-liquid-surface');
  });
});

describe('Button pending is busy, never disabled', () => {
  it('marks a pending CTA busy and keeps it a clickable liquid CTA', () => {
    const html = renderToStaticMarkup(
      <Button pending variant="primary">
        保存中
      </Button>,
    );
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('data-game-ui-pending="true"');
    expect(html).toContain('data-liquid-form="press"');
    expect(html).toContain('data-liquid-breathing="true"');
    expect(html).not.toContain('disabled=""');
    expect(html).toContain('data-game-ui-cta="true"');
  });

  it('keeps other variants busy with their droplet and no disabled state', () => {
    const html = renderToStaticMarkup(<Button pending>保存中</Button>);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('class="game-ui-droplet"');
    expect(html).not.toContain('disabled=""');
    expect(html).not.toContain('data-liquid-breathing');
  });

  it('leaves an ordinary button without busy or pending markers', () => {
    const html = renderToStaticMarkup(<Button variant="primary">开始学习</Button>);
    expect(html).not.toContain('aria-busy');
    expect(html).not.toContain('data-game-ui-pending');
    expect(html).not.toContain('data-liquid-breathing');
  });

  it('does not leak the pending prop into the native button', () => {
    const html = renderToStaticMarkup(<Button pending>Go</Button>);
    expect(html).not.toMatch(/\spending=/);
  });
});
