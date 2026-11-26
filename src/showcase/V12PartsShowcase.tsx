import { useState, type ReactNode } from 'react';

import { FadeDivider } from '../controls/FadeDivider/FadeDivider';
import {
  RadialLiquidMenu,
  type RadialLiquidMenuItem,
} from '../game/RadialLiquidMenu/RadialLiquidMenu';
import { OrbTabBar, type OrbTabSlots } from '../game/OrbTabBar/OrbTabBar';
import { V12_THEMES, type V12Theme } from '../tokens/v12Theme';

type ShowcaseLanguage = 'en' | 'zh';

export interface V12PartsShowcaseProps {
  language?: ShowcaseLanguage;
}

const RADIAL_ITEMS: readonly RadialLiquidMenuItem[] = [
  { id: 'move', label: 'Move', icon: <span>↗</span> },
  { id: 'look', label: 'Look', icon: <span>◌</span> },
  { id: 'use', label: 'Use', icon: <span>✦</span> },
  { id: 'map', label: 'Map', icon: <span>⌖</span> },
];

const ORB_TABS: OrbTabSlots = [
  { id: 'home', label: 'Home', icon: <span>⌂</span> },
  { id: 'map', label: 'Map', icon: <span>⌖</span> },
  { id: 'log', label: 'Log', icon: <span>≡</span> },
  { id: 'more', label: 'More', icon: <span>⋯</span> },
];

const THEME_LABELS: Record<V12Theme, string> = {
  lagoon: 'Lagoon',
  'lagoon-light': 'Lagoon light',
  blossom: 'Blossom',
  graphite: 'Graphite',
  paper: 'Paper',
};

export function V12PartsShowcase({ language = 'en' }: V12PartsShowcaseProps): ReactNode {
  const [activeId, setActiveId] = useState('home');
  const isZh = language === 'zh';

  return (
    <section className="kit-v12-parts" aria-labelledby="kit-v12-parts-title">
      <div className="kit-v12-parts__heading">
        <p className="kit-v12-parts__eyebrow">{isZh ? 'OnePlace v12' : 'OnePlace v12'}</p>
        <h2 id="kit-v12-parts-title">
          {isZh ? '真实 Kit 部件' : 'UIKit parts from the prototype'}
        </h2>
        <p>
          {isZh
            ? '五套主题、桌面径向液体菜单与 390px 手机 OrbTabBar，共用烘焙霜面令牌。'
            : 'Five themes, a desktop radial liquid menu, and a 390px phone OrbTabBar share baked frost tokens.'}
        </p>
      </div>
      <div className="kit-v12-parts__grid">
        {V12_THEMES.map((theme) => (
          <article className="kit-v12-theme-card" data-v12-theme={theme} key={theme}>
            <header className="kit-v12-theme-card__header">
              <h3>{THEME_LABELS[theme]}</h3>
              <span>{theme}</span>
            </header>
            <div className="kit-v12-theme-card__desktop">
              <p className="kit-v12-theme-card__label">
                {isZh ? '桌面 · RadialLiquidMenu' : 'Desktop · RadialLiquidMenu'}
              </p>
              <RadialLiquidMenu
                defaultOpen
                items={RADIAL_ITEMS}
                label={isZh ? '快速操作' : 'Quick actions'}
                orbSpeed={2.4}
                theme={theme}
                trigger={<span aria-hidden="true">+</span>}
                triggerLabel={isZh ? '打开快速操作' : 'Open quick actions'}
              />
              <FadeDivider theme={theme} />
              <FadeDivider orientation="vertical" theme={theme} />
              <div className="kit-v12-frost-panel">
                <strong>{isZh ? '烘焙霜面面板' : 'Baked frost panel'}</strong>
                <span>{isZh ? '不使用实时模糊' : 'Opaque surface, no live blur'}</span>
              </div>
            </div>
            <div className="kit-v12-theme-card__phone">
              <p className="kit-v12-theme-card__label">{isZh ? '手机 · 390px' : 'Phone · 390px'}</p>
              <OrbTabBar
                activeId={activeId}
                label={isZh ? '主导航' : 'Primary navigation'}
                onOrbClick={() => setActiveId('home')}
                onSelect={setActiveId}
                orb={<span aria-hidden="true">+</span>}
                orbLabel={isZh ? '打开游戏菜单' : 'Open game menu'}
                orbSpeed={2.4}
                tabs={ORB_TABS}
                theme={theme}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default V12PartsShowcase;
