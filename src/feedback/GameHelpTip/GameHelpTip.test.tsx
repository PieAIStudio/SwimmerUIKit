import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { GameHelpTip } from './GameHelpTip';

it('renders a named non-submit help control without requiring a browser', () => {
  const html = renderToStaticMarkup(
    <GameHelpTip label="备份说明">下载备份后，请另外保存一份。</GameHelpTip>,
  );
  expect(html).toContain('type="button"');
  expect(html).toContain('aria-label="备份说明"');
  expect(html).not.toContain('role="dialog"');
  expect(html).not.toContain('下载备份后');
});
