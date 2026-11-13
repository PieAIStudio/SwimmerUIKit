import type { ReactNode } from 'react';
import { Button } from '@pieai/swimmer-ui-kit';
import { CodeSample } from './CodeSample';
import { StatusList } from './StatusList';
import type { KitManifest, ShowcaseDemo, ShowcaseLanguage, ShowcaseTheme } from './types';

export interface ShowcaseShellProps {
  kit: KitManifest;
  demo: ShowcaseDemo;
  language?: ShowcaseLanguage;
  theme?: ShowcaseTheme;
  onLanguageChange?: () => void;
  onThemeChange?: () => void;
  children?: ReactNode;
}
export function ShowcaseShell({
  children,
  demo,
  kit,
  language = 'en',
  onLanguageChange,
  onThemeChange,
  theme = 'light',
}: ShowcaseShellProps): ReactNode {
  const text = (value: { en: string; zh: string }) => value[language];
  const zh = language === 'zh';
  return (
    <div className="game-ui-showcase-shell" data-game-ui-theme={theme} data-game-ui-style="grey">
      <header className="game-ui-showcase-topbar">
        <a className="game-ui-showcase-wordmark" href="./">
          SWIMMER / KIT SHOWCASE
        </a>
        <nav aria-label="Page links">
          <a href="#what">{zh ? '说明' : 'What it is'}</a>
          <a href="#try">{zh ? '试用' : 'Try it live'}</a>
          <a href="#plug">{zh ? '接入' : 'How to plug in'}</a>
        </nav>
        <div className="game-ui-showcase-actions">
          <Button type="button" onClick={onThemeChange}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
          <Button type="button" onClick={onLanguageChange}>
            {zh ? 'EN' : '中文'}
          </Button>
        </div>
      </header>
      <main className="game-ui-showcase-container">
        <div className="game-ui-showcase-main">
          <section id="what" className="game-ui-showcase-block">
            <p className="game-ui-showcase-kicker">
              {kit.type} kit · {kit.name}
            </p>
            <h1>{kit.name}</h1>
            <p className="game-ui-showcase-lead">{text(kit.what)}</p>
            <p className="game-ui-showcase-consumers">{text(kit.consumers)}</p>
          </section>
          <section id="try" className="game-ui-showcase-block">
            <h2>{zh ? '现场试用' : 'Try it live'}</h2>
            {demo}
          </section>
          <section id="plug" className="game-ui-showcase-block">
            <h2>{zh ? '如何接入' : 'How to plug in'}</h2>
            <CodeSample lines={kit.code} copyLabel={zh ? '复制代码' : 'Copy code'} />
          </section>
          {children}
        </div>
        <aside className="game-ui-showcase-rail">
          <StatusList
            kit={kit}
            language={language}
            statusTitle={zh ? '状态' : 'Status'}
            updatesTitle={zh ? '更新' : 'Updates'}
          />
        </aside>
      </main>
      <footer className="game-ui-showcase-footer">
        {text(kit.tagline)} ·{' '}
        {zh ? '样例数据记录于本展示页。' : 'Demo data recorded for this showcase.'}
      </footer>
    </div>
  );
}
