import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { GameHelpCard } from './GameHelpCard';
import { GameButton } from '../../controls/GameButton/GameButton';

it('renders a closed trigger with collapsed state and no card, media or request', () => {
  const html = renderToStaticMarkup(
    <GameHelpCard
      label="怎么用"
      topics={[
        {
          id: 'save',
          label: '保存',
          title: '点一下就保存',
          body: '第一行。\n第二行。',
          media: {
            kind: 'image',
            src: 'help.png',
            alt: '按钮',
            width: 480,
            height: 270,
          },
        },
      ]}
    >
      <GameButton>怎么用</GameButton>
    </GameHelpCard>,
  );
  expect(html).toContain('aria-expanded="false"');
  expect(html).not.toContain('aria-controls');
  expect(html).not.toContain('role="dialog"');
  expect(html).not.toContain('help.png');
  expect(html).not.toContain('点一下就保存');
});
