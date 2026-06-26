import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import {
  CLAY_GAME_SPRITES,
  CLAY_GAME_SPRITE_NAMES,
  CLAY_ICON_NAMES,
  GameAssetIcon,
  GameBadge,
  getClayIconStyles,
  type ClayIconName,
  type ClayIconStyle,
} from '../index';

const GAME_ICONS = CLAY_ICON_NAMES.filter((name) => getClayIconStyles(name).includes('game'));
const LINE_ICONS = CLAY_ICON_NAMES.filter((name) => getClayIconStyles(name).includes('line'));
const BOTH_ICONS = CLAY_ICON_NAMES.filter((name) => getClayIconStyles(name).length === 2);

function FamilyGrid({ names, style }: { names: readonly ClayIconName[]; style: ClayIconStyle }): ReactNode {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(94px, 1fr))', gap: 10 }}>
      {names.map((name) => (
        <figure
          key={name}
          style={{ display: 'grid', justifyItems: 'center', gap: 7, margin: 0, padding: '12px 6px', borderRadius: 16, background: 'rgba(255,248,236,.62)', boxShadow: '0 6px 18px rgba(76,52,28,.12)' }}
        >
          <GameAssetIcon icon={name} size="lg" style={style} />
          <figcaption style={{ fontSize: 11, fontWeight: 720, color: '#7b6652', textAlign: 'center', overflowWrap: 'anywhere' }}>{name}</figcaption>
        </figure>
      ))}
    </div>
  );
}

const meta = {
  title: 'Clay/Foundations/Icon families',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '黏土图标分两族:**游戏风(game · 主用)**——立体、彩色的黏土实物,玩家可见处默认用它;**线性(line · 备选)**——扁平白色线条图标,用于密集工具栏或立体图标显得太重的场合。`<GameAssetIcon style="game|line" />` 切换,缺省走游戏风。部分图标只存在于一族,会自动回退。',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const GamePrimary: Story = {
  name: '游戏风 · 主用',
  render: () => <FamilyGrid names={GAME_ICONS} style="game" />,
};

export const LineAlternate: Story = {
  name: '线性 · 备选',
  render: () => <FamilyGrid names={LINE_ICONS} style="line" />,
};

export const GameSprites: Story = {
  name: '游戏素材 · 装饰',
  render: () => (
    <div style={{ display: 'grid', gap: 14 }}>
      <p style={{ margin: 0, fontSize: 12, color: '#7b6652', maxWidth: 640 }}>
        同一套黏土包里的<strong>战利品、武器、货币与奖励</strong>。用于奖励弹窗、背包、胜利结算等场景,
        <strong>不用于按钮或工具栏</strong>。刻意不放进 UI 图标集(<code>CLAY_ICON_VARIANTS</code>),
        改由 <code>CLAY_GAME_SPRITES</code> 单独导出,以免污染界面词汇。
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(94px, 1fr))', gap: 10 }}>
        {CLAY_GAME_SPRITE_NAMES.map((name) => (
          <figure
            key={name}
            style={{ display: 'grid', justifyItems: 'center', gap: 7, margin: 0, padding: '12px 6px', borderRadius: 16, background: 'rgba(255,248,236,.62)', boxShadow: '0 6px 18px rgba(76,52,28,.12)' }}
          >
            <span className="game-ui-asset-icon" data-icon-size="lg" data-icon-style="game" aria-hidden>
              <img alt="" src={CLAY_GAME_SPRITES[name]} />
            </span>
            <figcaption style={{ fontSize: 11, fontWeight: 720, color: '#7b6652', textAlign: 'center', overflowWrap: 'anywhere' }}>{name}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  ),
};

export const SideBySide: Story = {
  name: '同名两族对照',
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {BOTH_ICONS.map((name) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <strong style={{ width: 96, color: '#4a2f1f' }}>{name}</strong>
          <GameAssetIcon icon={name} size="lg" style="game" />
          <GameBadge tone="success">game</GameBadge>
          <GameAssetIcon icon={name} size="lg" style="line" />
          <GameBadge>line</GameBadge>
        </div>
      ))}
    </div>
  ),
};
