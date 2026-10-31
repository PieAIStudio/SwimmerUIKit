import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  Dialog,
  EmptyState,
  Field,
  FirstSessionOnboarding,
  HistoryPanel,
  LoadingState,
  RadialMenu,
  Slider,
  StageTile,
} from '../src';

// Public root exports that had no direct test. Server markup is enough here:
// these parts own semantics and attributes, not interaction state.

describe('Field', () => {
  it('shows the hint until there is an error, and announces the error', () => {
    const hinted = renderToStaticMarkup(
      <Field hint="Six digits" label="Code">
        <input />
      </Field>,
    );
    expect(hinted).toContain('game-ui-field-hint">Six digits<');
    expect(hinted).not.toContain('role="alert"');
    expect(hinted).not.toContain('data-invalid');

    const failed = renderToStaticMarkup(
      <Field error="Too short" hint="Six digits" label="Code">
        <input />
      </Field>,
    );
    expect(failed).not.toContain('Six digits');
    expect(failed).toContain('<span class="game-ui-field-error" role="alert">Too short</span>');
    expect(failed).toContain('data-invalid="true"');
  });

  it('wraps the control in its label and hides the required star from speech', () => {
    const html = renderToStaticMarkup(
      <Field className="wide" label="Name" required>
        <input id="n" />
      </Field>,
    );
    expect(html).toMatch(/^<label class="game-ui-field wide">/);
    expect(html).toContain('<input id="n"/>');
    expect(html).toContain('Name<span aria-hidden="true" class="game-ui-field-required"> *</span>');
  });
});

describe('EmptyState', () => {
  it('renders only the parts it is given', () => {
    const bare = renderToStaticMarkup(<EmptyState title="Nothing yet" />);
    expect(bare).toBe(
      '<div class="game-ui-empty-state"><strong class="game-ui-empty-state-title">Nothing yet</strong></div>',
    );
    const full = renderToStaticMarkup(
      <EmptyState action={<button>Add</button>} description="Add one" icon="plus" title="Empty" />,
    );
    expect(full).toContain('<svg');
    expect(full).toContain('game-ui-empty-state-body">Add one<');
    expect(full).toContain('game-ui-empty-state-action"><button>Add</button>');
  });
});

describe('LoadingState', () => {
  it('is a polite status while loading and an alert on error', () => {
    const loading = renderToStaticMarkup(<LoadingState label="Loading" />);
    expect(loading).toContain('role="status"');
    expect(loading).toContain('data-loading-tone="loading"');
    const failed = renderToStaticMarkup(<LoadingState label="Failed" tone="error" />);
    expect(failed).toContain('role="alert"');
    expect(failed).toContain('data-loading-tone="error"');
    expect(failed).toContain('<span>Failed</span>');
  });
});

describe('Dialog', () => {
  it('is a modal dialog named by its own heading', () => {
    const html = renderToStaticMarkup(<Dialog title="Leave game?">Progress is saved.</Dialog>);
    const labelledBy = /aria-labelledby="([^"]+)"/.exec(html)?.[1];
    expect(labelledBy).toBeTruthy();
    expect(html).toContain(`<h2 id="${labelledBy}">Leave game?</h2>`);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('game-ui-dialog-body">Progress is saved.<');
  });

  it('gives two dialogs different heading ids', () => {
    const html = renderToStaticMarkup(
      <>
        <Dialog title="A">a</Dialog>
        <Dialog title="B">b</Dialog>
      </>,
    );
    const ids = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(2);
  });
});

describe('HistoryPanel', () => {
  it('lists each entry in order with its kind, speaker and meta', () => {
    const html = renderToStaticMarkup(
      <HistoryPanel
        entries={[
          { id: '1', kind: 'human', meta: '10:01', speaker: 'You', text: 'Hello' },
          { id: '2', kind: 'system', meta: '10:02', speaker: 'Game', text: 'Saved' },
        ]}
        label="Chat history"
      />,
    );
    expect(html).toContain('aria-label="Chat history"');
    expect(html.indexOf('Hello')).toBeLessThan(html.indexOf('Saved'));
    expect(html).toContain('data-entry-kind="human"');
    expect(html).toContain('data-entry-kind="system"');
    expect(html).toContain('<strong>You</strong><span>10:01</span>');
  });

  it('renders an empty named region when there are no entries', () => {
    expect(renderToStaticMarkup(<HistoryPanel entries={[]} label="History" />)).toBe(
      '<section aria-label="History" class="game-ui-history"></section>',
    );
  });
});

describe('RadialMenu', () => {
  it('is a named group of buttons placed by index, not an ARIA menu', () => {
    const html = renderToStaticMarkup(
      <RadialMenu
        items={[
          { id: 'a', label: 'Attack' },
          { id: 'b', label: 'Block' },
          { id: 'c', label: 'Cast' },
        ]}
        label="Actions"
      />,
    );
    expect(html).toContain('role="group"');
    expect(html).not.toContain('role="menu');
    expect(html).toContain('--radial-count:3');
    expect(html.match(/<button/g)).toHaveLength(3);
    expect(html.match(/type="button"/g)).toHaveLength(3);
    expect(html).toContain('--radial-index:2');
  });
});

describe('StageTile', () => {
  it('reports selection as a pressed state and switches the badge tone', () => {
    const idle = renderToStaticMarkup(
      <StageTile badge="New" kicker="Daily" summary="Three rounds" title="Sprint" />,
    );
    expect(idle).toContain('aria-pressed="false"');
    expect(idle).toContain('type="button"');
    expect(idle).toContain('data-stage-tone="daily"');
    expect(idle).toContain('data-badge-tone="neutral"');

    const picked = renderToStaticMarkup(
      <StageTile badge="New" kicker="Daily" selected summary="x" title="Sprint" tone="portal" />,
    );
    expect(picked).toContain('aria-pressed="true"');
    expect(picked).toContain('data-stage-tone="portal"');
    expect(picked).toContain('data-badge-tone="success"');
  });
});

describe('FirstSessionOnboarding', () => {
  const labels = {
    badge: 'Welcome',
    body: 'Three steps',
    skip: 'Skip',
    start: 'Start',
    steps: [
      { title: 'Pick', body: 'Pick a stage' },
      { title: 'Play', body: 'Play a round' },
    ],
    title: 'First game',
  };

  it('renders nothing while closed', () => {
    expect(
      renderToStaticMarkup(
        <FirstSessionOnboarding labels={labels} onDismiss={() => {}} open={false} />,
      ),
    ).toBe('');
  });

  it('is a labelled dialog with numbered steps and two dismiss actions', () => {
    const html = renderToStaticMarkup(
      <FirstSessionOnboarding labels={labels} onDismiss={() => {}} open />,
    );
    const labelledBy = /aria-labelledby="([^"]+)"/.exec(html)?.[1];
    expect(html).toContain(`<h2 id="${labelledBy}">First game</h2>`);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('<span>01</span><strong>Pick</strong>');
    expect(html).toContain('<span>02</span><strong>Play</strong>');
    expect(html).toContain('>Start<');
    expect(html).toContain('>Skip<');
  });
});

describe('Slider', () => {
  it('is read-only without onChange and editable with it', () => {
    const fixed = renderToStaticMarkup(<Slider label="Volume" max={10} min={0} value={4} />);
    expect(fixed).toContain('type="range"');
    expect(fixed).toContain('readOnly=""');
    expect(fixed).toContain('aria-label="Volume"');
    expect(fixed).toContain('value="4"');

    const live = renderToStaticMarkup(<Slider label="Volume" onChange={() => {}} value={4} />);
    expect(live).not.toContain('readOnly');
  });
});
