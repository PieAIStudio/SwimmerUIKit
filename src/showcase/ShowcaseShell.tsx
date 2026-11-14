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
  const shortName = kit.shortName ?? kit.name.split('/').at(-1) ?? kit.name;
  return (
    <div
      className="game-ui-showcase-shell"
      data-game-ui-theme={theme}
      data-game-ui-style="grey"
      data-game-ui-kit-type={kit.type}
    >
      <header className="game-ui-showcase-topbar">
        <a className="game-ui-showcase-wordmark" href="./" aria-label={shortName + ' showcase'}>
          {shortName}
        </a>
        <nav aria-label={zh ? '展示导航' : 'Showcase navigation'}>
          <a href="#what">{zh ? '说明' : 'What it is'}</a>
          <a href="#try">{zh ? '试用' : 'Try it live'}</a>
          <a href="#plug">{zh ? '接入' : 'How to plug in'}</a>
        </nav>
        <div className="game-ui-showcase-actions">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            static
            data-game-ui-control="liquid-presence"
            className="game-ui-showcase-toggle"
            aria-label={zh ? '切换主题' : 'Toggle theme'}
            onClick={onThemeChange}
          >
            {theme === 'dark' ? (zh ? '浅色' : 'Light') : zh ? '深色' : 'Dark'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            static
            data-game-ui-control="liquid-presence"
            className="game-ui-showcase-toggle"
            aria-label={zh ? '切换语言' : 'Toggle language'}
            onClick={onLanguageChange}
          >
            {zh ? 'EN' : '中文'}
          </Button>
        </div>
      </header>
      <main className="game-ui-showcase-container">
        <div className="game-ui-showcase-main">
          <section id="what" className="game-ui-showcase-block game-ui-showcase-block--what">
            <p className="game-ui-showcase-kicker">
              {kit.type} · {kit.name}
            </p>
            <h1>{shortName}</h1>
            <p className="game-ui-showcase-lead">{text(kit.what)}</p>
            <p className="game-ui-showcase-consumers">
              <strong>{zh ? '使用方' : 'Used by'}</strong> · {text(kit.consumers)}
            </p>
          </section>
          <section id="try" className="game-ui-showcase-block">
            <h2>{zh ? '现场试用' : 'Try it live'}</h2>
            {demo}
            {children}
          </section>
          <section id="plug" className="game-ui-showcase-block">
            <h2>{zh ? '如何接入' : 'How to plug in'}</h2>
            <CodeSample
              lines={kit.code}
              copyLabel={zh ? '复制代码' : 'Copy code'}
              copiedLabel={zh ? '已复制' : 'Copied'}
            />
          </section>
        </div>
        <aside
          className="game-ui-showcase-rail"
          aria-label={zh ? '状态与更新' : 'Status and updates'}
        >
          <StatusList
            kit={kit}
            language={language}
            statusTitle={zh ? '状态' : 'Status'}
            updatesTitle={zh ? '更新' : 'Updates'}
          />
        </aside>
      </main>
      <footer className="game-ui-showcase-footer">
        {shortName} · v{kit.version}
      </footer>
    </div>
  );
}
