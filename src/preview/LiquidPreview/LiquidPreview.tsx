import { useEffect, useState, type ReactNode } from 'react';

import { type LiquidFinish } from '../../liquid/finish';

import { GameBadge } from '../../feedback/GameBadge/GameBadge';

import { GameLanguageMenu } from '../../controls/GameLanguageMenu/GameLanguageMenu';

import { GameButton, type GameButtonVariant } from '../../controls/GameButton/GameButton';
import { type Lang } from './copyTypes';
import { COPY } from './copy';
import { FinishContext } from './context';
import { TONES } from './constants';
import { Shelf } from './Shelf';
import { Sizes } from './Sizes';
import { Tones } from './Tones';
import { States } from './States';

export function LiquidPreview(): ReactNode {
  const [lang, setLang] = useState<Lang>('zh-CN');
  const [finish, setFinish] = useState<LiquidFinish>('glossy');
  const [view, setView] = useState(() => {
    if (typeof window === 'undefined') return 'shelf';
    return /liquid-(sizes|tones|states|knobs)-title/.exec(window.location.hash)?.[1] ?? 'shelf';
  });
  const [tone, setTone] = useState<GameButtonVariant>('primary');
  const copy = COPY[lang];

  useEffect(() => {
    document.documentElement.dataset.gameUiPreview = 'clay';
    return () => {
      delete document.documentElement.dataset.gameUiPreview;
    };
  }, []);

  return (
    <FinishContext.Provider value={finish}>
      <main
        aria-label="Swimmer UI Kit liquid surface"
        className="game-ui-preview game-ui-clay-preview game-ui-liquid-page"
      >
        <header className="game-ui-preview-hero">
          <GameBadge tone="ai">@pieai/swimmer-ui-kit</GameBadge>
          <GameLanguageMenu
            currentLabel={copy.triggerLabel}
            label={copy.langMenuLabel}
            onSelect={(id) => setLang(id as Lang)}
            options={[
              { id: 'en', label: 'English', meta: 'Page copy' },
              { id: 'zh-CN', label: '简体中文', meta: '页面文案' },
            ]}
            value={lang}
          />
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroBody}</p>
          <p className="game-ui-liquid-page__rule">{copy.heroRule}</p>
          <p>
            <a href="/">先选成品控件：按钮、开关、进度、下拉 →</a>
          </p>
        </header>

        <section className="game-ui-preview-section" aria-label="材料实验选择">
          <p>
            这里展示的是动作形态，不是成品控件。只挂载当前实验，保留两组共享动效预算，不把其余示例静默降级。
          </p>
          <label>
            液体材质{' '}
            <select
              value={finish}
              onChange={(event) => setFinish(event.currentTarget.value as LiquidFinish)}
            >
              <option value="matte">哑光 · Matte</option>
              <option value="glossy">高光 · Glossy</option>
            </select>
          </label>
          <div className="game-ui-liquid-demo-controls" role="group" aria-label="材料实验类别">
            {(['shelf', 'sizes', 'tones', 'states', 'knobs'] as const).map((key) => (
              <GameButton
                key={key}
                aria-pressed={view === key}
                onClick={() => {
                  setView(key);
                  window.history.replaceState(null, '', `#liquid-${key}-title`);
                }}
              >
                {copy.sections[key]}
              </GameButton>
            ))}
          </div>
        </section>

        {view === 'shelf' && (
          <section aria-labelledby="liquid-shelf-title" className="game-ui-preview-section">
            <h2 id="liquid-shelf-title">{copy.sections.shelf}</h2>
            <p className="game-ui-liquid-page__prose">{copy.shelfBody}</p>
            <div
              className="game-ui-liquid-page__tone-picker"
              role="group"
              aria-label={copy.tonePicker}
            >
              <span>{copy.tonePicker}</span>
              {TONES.map((option) => (
                <GameButton
                  aria-pressed={tone === option}
                  key={option}
                  onClick={() => setTone(option)}
                  variant={tone === option ? option : 'ghost'}
                >
                  {option}
                </GameButton>
              ))}
            </div>
            <h3>
              {copy.bodies} <small className="game-ui-liquid-page__hint">{copy.bodiesHint}</small>
            </h3>
            <Shelf copy={copy} kind="body" tone={tone} />
            <h3>
              {copy.groups} <small className="game-ui-liquid-page__hint">{copy.groupsHint}</small>
            </h3>
            <Shelf copy={copy} kind="group" tone={tone} />
          </section>
        )}

        {view === 'sizes' && (
          <section aria-labelledby="liquid-sizes-title" className="game-ui-preview-section">
            <h2 id="liquid-sizes-title">{copy.sections.sizes}</h2>
            <p className="game-ui-liquid-page__prose">{copy.sizesBody}</p>
            <Sizes copy={copy} />
          </section>
        )}

        {view === 'tones' && (
          <section aria-labelledby="liquid-tones-title" className="game-ui-preview-section">
            <h2 id="liquid-tones-title">{copy.sections.tones}</h2>
            <p className="game-ui-liquid-page__prose">{copy.tonesBody}</p>
            <Tones copy={copy} />
          </section>
        )}

        {view === 'states' && (
          <section aria-labelledby="liquid-states-title" className="game-ui-preview-section">
            <h2 id="liquid-states-title">{copy.sections.states}</h2>
            <p className="game-ui-liquid-page__prose">{copy.statesBody}</p>
            <States copy={copy} />
          </section>
        )}

        {view === 'knobs' && (
          <section aria-labelledby="liquid-knobs-title" className="game-ui-preview-section">
            <h2 id="liquid-knobs-title">{copy.sections.knobs}</h2>
            <p className="game-ui-liquid-page__prose">{copy.knobsBody}</p>
            <dl className="game-ui-liquid-page__glossary">
              {copy.knobRows.map(([name, text]) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>{text}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </main>
    </FinishContext.Provider>
  );
}
