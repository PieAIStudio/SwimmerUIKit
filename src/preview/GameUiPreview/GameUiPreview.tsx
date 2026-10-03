import { useEffect, useState, type ReactNode } from 'react';

import { GameBadge } from '../../feedback/GameBadge/GameBadge';

import { GameLanguageMenu } from '../../controls/GameLanguageMenu/GameLanguageMenu';

import { GameButton } from '../../controls/GameButton/GameButton';

import { GameHistoryPanel } from '../../containers/GameHistoryPanel/GameHistoryPanel';

import { GamePanel } from '../../containers/GamePanel/GamePanel';
import { CopyContext } from './context';
import { PREVIEW_COPY } from './data/copy';
import { type PreviewLang } from './data/copyTypes';
import { ButtonStates } from './sections/ButtonStates';
import { FirstSessionSamples } from './sections/FirstSessionSamples';
import { FormsAndDisplay } from './sections/FormsAndDisplay';
import { HudAndStage } from './sections/HudAndStage';
import { IconGallery } from './sections/IconGallery';
import { LiquidSurfaceShowcase } from './sections/LiquidSurfaceShowcase';
import { ModalAndStates } from './sections/ModalAndStates';
import { OverlayGlassCompare } from './sections/OverlayGlassCompare';
import { ResponsiveProofFrames } from './sections/ResponsiveProofFrames';
import { TokenGroup, tokenGroups } from './sections/TokenGroup';
import { TokenSwatches } from './sections/TokenSwatches';
import { TypographyScale } from './sections/TypographyScale';

export interface GameUiPreviewProps {
  title?: string;
  body?: string;
}

export function GameUiPreview({ title, body }: GameUiPreviewProps): ReactNode {
  const [lang, setLang] = useState<PreviewLang>('en');
  const copy = PREVIEW_COPY[lang];
  const heroTitle = title && lang === 'en' ? title : copy.heroTitle;
  const heroBody = body && lang === 'en' ? body : copy.heroBody;

  useEffect(() => {
    document.documentElement.dataset.gameUiPreview = 'reference';
    return () => {
      delete document.documentElement.dataset.gameUiPreview;
    };
  }, []);

  return (
    <CopyContext.Provider value={copy}>
      <main aria-label="Swimmer UI Kit preview" className="game-ui-preview game-ui-preview-canvas">
        <header className="game-ui-preview-hero">
          <GameBadge tone="ai">@pieai/swimmer-ui-kit</GameBadge>
          <GameLanguageMenu
            currentLabel={copy.triggerLabel}
            label={copy.langMenuLabel}
            onSelect={(id) => setLang(id as PreviewLang)}
            options={[
              { id: 'en', label: 'English', meta: 'DOM UI labels' },
              { id: 'zh-CN', label: '简体中文', meta: 'Host app owned copy' },
            ]}
            value={lang}
          />
          <h1>{heroTitle}</h1>
          <p>{heroBody}</p>
        </header>

        <section
          aria-labelledby="game-ui-preview-start-title"
          className="game-ui-preview-section game-ui-preview-start"
        >
          <h2 id="game-ui-preview-start-title">
            {lang === 'zh-CN' ? '从这里开始：选组件' : 'Start here: choose a component'}
          </h2>
          <nav
            aria-label={lang === 'zh-CN' ? '按用途找组件' : 'Find a component by task'}
            className="game-ui-preview-two-up"
          >
            <a className="game-ui-liquid-showcase__link" href="#game-ui-preview-cta-title">
              {lang === 'zh-CN' ? '主按钮 / 液体 CTA' : 'Primary button / liquid CTA'}
            </a>
            <a className="game-ui-liquid-showcase__link" href="#game-ui-preview-forms-title">
              {lang === 'zh-CN' ? '表单与输入' : 'Forms and inputs'}
            </a>
            <a className="game-ui-liquid-showcase__link" href="#game-ui-preview-components-title">
              {lang === 'zh-CN' ? '控件与面板' : 'Controls and panels'}
            </a>
            <a className="game-ui-liquid-showcase__link" href="#game-ui-preview-liquid-title">
              {lang === 'zh-CN' ? '液体表面与形态入口' : 'Liquid surfaces and forms'}
            </a>
          </nav>
          <h3 id="game-ui-preview-cta-title">
            GameButton · {lang === 'zh-CN' ? '主操作按钮' : 'Primary action'}
          </h3>
          <p className="game-ui-small-copy">
            {lang === 'zh-CN'
              ? 'variant 说用途，surface 说表面。开始、继续、进入课程不需要先学物理参数。点击示例只展示交互，不会导航。'
              : 'variant chooses the tone; surface chooses the material. Start, continue or enter a course without learning physics knobs. These examples do not navigate.'}
          </p>
          <div className="game-ui-preview-two-up">
            <GamePanel title={lang === 'zh-CN' ? '普通主按钮' : 'Ordinary primary action'}>
              <GameButton variant="primary">
                {lang === 'zh-CN' ? '开始学习' : 'Start learning'}
              </GameButton>
              <pre>
                <code>{'<GameButton variant="primary">Start learning</GameButton>'}</code>
              </pre>
            </GamePanel>
            <GamePanel title={lang === 'zh-CN' ? '全宽液体主按钮' : 'Full-width liquid CTA'}>
              <GameButton fullWidth variant="primary">
                {lang === 'zh-CN' ? '进入课程' : 'Enter course'}
              </GameButton>
              <pre>
                <code>
                  {
                    '<GameButton variant="primary"\n  surface="liquid" fullWidth>\n  Enter course\n</GameButton>'
                  }
                </code>
              </pre>
            </GamePanel>
          </div>
        </section>

        <section aria-labelledby="game-ui-preview-token-title" className="game-ui-preview-section">
          <h2 id="game-ui-preview-token-title">{copy.sections.tokens}</h2>
          <TokenSwatches />
          <div className="game-ui-token-ledger">
            {tokenGroups.map((group) => (
              <TokenGroup
                key={group.id}
                id={group.id}
                label={copy.tokenGroups[group.id] ?? group.id}
                tokens={group.tokens}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="game-ui-preview-icons-title" className="game-ui-preview-section">
          <h2 id="game-ui-preview-icons-title">{copy.sections.icons}</h2>
          <p className="game-ui-small-copy">{copy.iconsIntro}</p>
          <IconGallery />
        </section>

        <section aria-labelledby="game-ui-preview-type-title" className="game-ui-preview-section">
          <h2 id="game-ui-preview-type-title">{copy.sections.typography}</h2>
          <TypographyScale />
        </section>

        <section
          aria-labelledby="game-ui-preview-components-title"
          className="game-ui-preview-section"
        >
          <h2 id="game-ui-preview-components-title">{copy.sections.components}</h2>
          <ButtonStates />
          <HudAndStage />
          <ModalAndStates />
          <GameHistoryPanel entries={copy.history} label={copy.historyLabel} />
        </section>

        <section aria-labelledby="game-ui-preview-forms-title" className="game-ui-preview-section">
          <h2 id="game-ui-preview-forms-title">{copy.sections.forms}</h2>
          <FormsAndDisplay />
        </section>

        <section
          aria-labelledby="game-ui-preview-overlay-glass-title"
          className="game-ui-preview-section"
        >
          <h2 id="game-ui-preview-overlay-glass-title">{copy.sections.overlayGlass}</h2>
          <p className="game-ui-small-copy">
            Official HUD-on-scene tone: dark translucent glass, thin light border, no flat cast
            shadow, compact density. Use on any container that wraps scene-overlay chrome (3D
            tavern, cinematic stage). Nest inside light or dark theme.
          </p>
          <OverlayGlassCompare />
        </section>

        <section aria-labelledby="game-ui-preview-liquid-title" className="game-ui-preview-section">
          <h2 id="game-ui-preview-liquid-title">{copy.sections.liquid}</h2>
          <p className="game-ui-small-copy">{copy.liquid.body}</p>
          <LiquidSurfaceShowcase />
        </section>

        <section
          aria-labelledby="game-ui-preview-first-session-title"
          className="game-ui-preview-section"
        >
          <h2 id="game-ui-preview-first-session-title">{copy.sections.firstSession}</h2>
          <FirstSessionSamples />
        </section>

        <section
          aria-labelledby="game-ui-preview-responsive-title"
          className="game-ui-preview-section"
        >
          <h2 id="game-ui-preview-responsive-title">{copy.sections.responsive}</h2>
          <ResponsiveProofFrames />
        </section>
      </main>
    </CopyContext.Provider>
  );
}
