import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GameCollectibleCard, GameCollectibleCardSlot } from './GameCollectibleCard';

const BASE = {
  title: 'Prompt',
  caption: 'What you ask the model to do',
  setLabel: 'AI basics',
  label: 'Prompt: just collected. Tap to turn over',
} as const;

describe('GameCollectibleCard', () => {
  it('frames the card by rarity, with a gem on rare and a crown and foil on legendary', () => {
    const common = renderToStaticMarkup(<GameCollectibleCard {...BASE} rarity="common" />);
    const rare = renderToStaticMarkup(<GameCollectibleCard {...BASE} rarity="rare" />);
    const legendary = renderToStaticMarkup(<GameCollectibleCard {...BASE} rarity="legendary" />);
    expect(common).toContain('game-ui-collect-card--common');
    expect(common).not.toContain('game-ui-collect-card-inlay');
    expect(rare).toContain('game-ui-collect-card-gem');
    expect(rare).not.toContain('game-ui-collect-card-foil');
    expect(legendary).toContain('game-ui-collect-card-crown');
    expect(legendary).toContain('game-ui-collect-card-foil');
  });

  it('is one button named by the product, its face hidden from the reading order', () => {
    const html = renderToStaticMarkup(
      <GameCollectibleCard {...BASE} rarity="rare" rarityLabel="Known" sticker="NEW!" />,
    );
    expect(html).toContain('aria-label="Prompt: just collected. Tap to turn over"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('class="game-ui-collect-card-face" aria-hidden="true"');
    expect(html).toContain('NEW!');
    expect(html).toContain('Known');
  });

  it('lights as many pips as it is told', () => {
    const html = renderToStaticMarkup(
      <GameCollectibleCard {...BASE} rarity="rare" pips={{ filled: 2, total: 3 }} />,
    );
    expect(html.match(/data-on="true"/g)).toHaveLength(2);
    expect(html.match(/<i/g)).toHaveLength(3);
  });

  it('starts face down when asked, and shows the spotlight only for the reveal', () => {
    const down = renderToStaticMarkup(
      <GameCollectibleCard {...BASE} rarity="legendary" defaultFaceDown spotlight />,
    );
    expect(down).toContain('game-ui-collect-card--down');
    expect(down).toContain('game-ui-collect-card--spotlight');
    expect(down).toContain('aria-pressed="true"');
    const plain = renderToStaticMarkup(<GameCollectibleCard {...BASE} rarity="legendary" />);
    expect(plain).not.toContain('--spotlight');
  });

  it('shows an uncollected card as a slot that says what unlocks it', () => {
    const html = renderToStaticMarkup(<GameCollectibleCardSlot label="Unlocks at lesson 9" />);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Unlocks at lesson 9"');
    expect(html).not.toContain('<button');
  });
});
