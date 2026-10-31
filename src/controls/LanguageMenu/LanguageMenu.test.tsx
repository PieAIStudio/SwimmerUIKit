import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { LanguageMenu, type LanguageMenuProps } from './LanguageMenu';

type Option = LanguageMenuProps['options'][number];

const CALLBACK: Option[] = [
  { id: 'en', label: 'English', meta: 'EN' },
  { id: 'zh', label: '简体中文', meta: '中文' },
  { id: 'ja', label: '日本語', meta: 'JA' },
];

function triggerLabel(props: Partial<LanguageMenuProps> & Pick<LanguageMenuProps, 'options'>) {
  const html = renderToStaticMarkup(<LanguageMenu label="Language" {...props} />);
  return /<\/svg><span>([^<]*)<\/span><\/button>/.exec(html)?.[1];
}

describe('LanguageMenu trigger (closed menu)', () => {
  it('starts closed as a menu button, with no popover in the markup', () => {
    const html = renderToStaticMarkup(<LanguageMenu label="Language" options={CALLBACK} />);
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('role="menu"');
  });

  it('labels the trigger with the first option, defaultValue, or the controlled value', () => {
    expect(triggerLabel({ options: CALLBACK })).toBe('English');
    expect(triggerLabel({ options: CALLBACK, defaultValue: 'ja' })).toBe('日本語');
    expect(triggerLabel({ options: CALLBACK, defaultValue: 'ja', value: 'zh' })).toBe('简体中文');
  });

  it('lets currentLabel override the derived label', () => {
    expect(triggerLabel({ options: CALLBACK, value: 'zh', currentLabel: 'Chinese' })).toBe(
      'Chinese',
    );
  });

  it('renders an empty label instead of throwing when there are no options', () => {
    expect(triggerLabel({ options: [] })).toBe('');
  });

  it('labels a route menu with the route the host marks current', () => {
    // Only the second route is marked current. The first route has no
    // `current` flag and used to count as current too (it matches the default
    // first-option selection), so the trigger named the wrong language.
    const routes: Option[] = [
      { id: 'en', label: 'English', meta: 'English', href: '/en' },
      { id: 'zh', label: '简体中文', meta: 'Chinese', href: '/zh', current: true },
    ];
    expect(triggerLabel({ options: routes })).toBe('简体中文');
  });

  it('falls back to the selected id for a route menu with no current flags', () => {
    const routes: Option[] = [
      { id: 'en', label: 'English', meta: 'English', href: '/en' },
      { id: 'zh', label: '简体中文', meta: 'Chinese', href: '/zh' },
    ];
    expect(triggerLabel({ options: routes })).toBe('English');
    expect(triggerLabel({ options: routes, value: 'zh' })).toBe('简体中文');
  });
});
