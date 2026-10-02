import { useRef, useState } from 'react';
import {
  GameButton,
  GameIconButton,
  GameTabs,
  GameToggle,
  GameCheckbox,
  GameSegmentedControl,
  GameListRow,
  GameInput,
  GameTextArea,
  GameSelect,
  GameField,
  GameProgress,
} from '../../src/index';
import { LiquidReveal, LiquidPresence } from '../../src/liquid-presence';
import { GAME_UI_STYLES, type GameUiStyle, type GameUiTheme } from '../../src/tokens/styles';
import '../../src/presence/presence.css';
import './theme-review.css';

/** The review and Storybook use the actual public components. No reference
 * prototype markup, separate painted buttons or imitation liquid renderer. */
export function ThemeReview({
  uiStyle = 'pastel',
  theme = 'light',
}: {
  uiStyle?: GameUiStyle;
  theme?: GameUiTheme;
}) {
  const [selected, setSelected] = useState('notes');
  const [checked, setChecked] = useState(false);
  const [count, setCount] = useState(0);
  const [guideOpen, setGuideOpen] = useState(false);
  const guideTarget = useRef<HTMLButtonElement>(null);
  return (
    <main className="theme-review" data-game-ui-theme={theme} data-game-ui-style={uiStyle}>
      <header className="theme-review-heading">
        <p>SWIMMER · 3.0</p>
        <h1>一点点不规整，轻轻按下。</h1>
        <p>普通控件是平面水滴。选中不鼓起来，只有下一步是液体。</p>
        <code>
          {uiStyle} / {theme}
        </code>
      </header>
      <section className="theme-review-section" aria-labelledby="review-actions">
        <h2 id="review-actions">日常操作</h2>
        <div className="theme-review-actions">
          <GameButton data-review="ordinary" hue="sky">
            看看详情
          </GameButton>
          <GameButton hue="coral">稍后再说</GameButton>
          <GameButton variant="ghost" hue="grape">
            返回
          </GameButton>
          <GameButton variant="success">已完成</GameButton>
          <GameButton variant="danger">删除</GameButton>
          <GameIconButton
            label="收藏"
            aria-pressed={checked}
            onClick={() => setChecked((value) => !value)}
          >
            ☆
          </GameIconButton>
          <GameButton disabled>暂不可用</GameButton>
        </div>
      </section>
      <div className="theme-review-columns">
        <section className="theme-review-section" aria-labelledby="review-selection">
          <h2 id="review-selection">选中只是选中，不变大</h2>
          <GameTabs
            hue="grape"
            activeId={selected}
            onSelect={setSelected}
            tabs={[
              { id: 'lesson', label: '章节' },
              { id: 'notes', label: '笔记' },
              { id: 'practice', label: '练习' },
            ]}
            aria-label="阅读页签"
          />
          <GameSegmentedControl
            hue="coral"
            activeId={selected}
            onSelect={setSelected}
            label="内容类型"
            options={[
              { id: 'lesson', label: '章节' },
              { id: 'notes', label: '笔记' },
              { id: 'practice', label: '练习' },
            ]}
          />
          <GameListRow
            hue="sun"
            title="保留自己的发现"
            description="一列的两端始终对齐。"
            selected={selected === 'notes'}
            onSelect={() => setSelected('notes')}
            actions={<GameIconButton label="条目设置">···</GameIconButton>}
          />
          <GameListRow
            hue="sky"
            title="回看之前的练习"
            description="文字、焦点与点击位置不变。"
            selected={selected === 'practice'}
            onSelect={() => setSelected('practice')}
          />
          <div className="theme-review-actions">
            <GameToggle
              hue="leaf"
              label="学习提醒"
              checked={checked}
              onClick={() => setChecked((value) => !value)}
            />
            <GameCheckbox
              hue="pink"
              label="保存进度"
              checked={checked}
              onChange={(event) => setChecked(event.currentTarget.checked)}
            />
          </div>
          <GameProgress label="完成进度" value={45} showValue />
        </section>
        <section className="theme-review-section" aria-labelledby="review-fields">
          <h2 id="review-fields">输入保持安静</h2>
          <GameField label="你的名字" hint="切换风格不会清空正在输入的内容。">
            <GameInput defaultValue="小游" hue="sky" />
          </GameField>
          <GameField label="学习方向">
            <GameSelect defaultValue="think" hue="grape">
              <option value="think">思考与表达</option>
              <option value="code">编程入门</option>
            </GameSelect>
          </GameField>
          <GameField label="记下一点发现">
            <GameTextArea rows={2} defaultValue="先动手试一试，再看看发生了什么。" hue="sun" />
          </GameField>
          <GameButton
            variant="primary"
            fullWidth
            data-review="cta"
            onClick={() => setCount((value) => value + 1)}
          >
            继续下一步
          </GameButton>
          <output aria-live="polite">已继续 {count} 次</output>
        </section>
      </div>
      <section className="theme-review-section" aria-labelledby="review-presence">
        <h2 id="review-presence">同一套涟的重量</h2>
        <div className="theme-review-material">
          <LiquidPresence
            size={72}
            // This demo deliberately opens the guide from its own target.
            // Closing is handled by the toggle and the guide's native button.
            dismissOnTargetClick={false}
            target={
              guideOpen && guideTarget.current
                ? {
                    key: 'theme-review-guide',
                    label: '回看说明',
                    contextElement: guideTarget.current,
                    getRect: () => guideTarget.current!.getBoundingClientRect(),
                  }
                : null
            }
            onDismiss={() => setGuideOpen(false)}
            guideContent={
              <div data-review="guide-content">
                <strong>涟的引导也是同一种液体面板。</strong>
                <p>风格和明暗跟随原来的页面；弹出的文字仍然清晰可读。</p>
                <GameButton onClick={() => setGuideOpen(false)}>明白了</GameButton>
              </div>
            }
          />
          <LiquidReveal>
            <strong>把发现留在这里</strong>
            <p>与主按钮共享柔和高光、潮汐渐变和贴地的影子。文字仍然是清晰的原生内容。</p>
            <GameButton
              ref={guideTarget}
              data-review="guide-target"
              onClick={() => setGuideOpen((value) => !value)}
            >
              看看涟的引导
            </GameButton>
          </LiquidReveal>
        </div>
      </section>
    </main>
  );
}

export function ThemeReviewPage() {
  const query = new URLSearchParams(window.location.search);
  const [uiStyle, setStyle] = useState<GameUiStyle>(
    () => GAME_UI_STYLES.find((value) => value === query.get('style')) ?? 'pastel',
  );
  const [theme, setTheme] = useState<GameUiTheme>(() =>
    query.get('theme') === 'dark' ? 'dark' : 'light',
  );
  return (
    <>
      <nav className="theme-review-switches" aria-label="主题评审切换">
        <label>
          风格
          <select
            value={uiStyle}
            onChange={(event) => setStyle(event.currentTarget.value as GameUiStyle)}
          >
            {GAME_UI_STYLES.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          明暗
          <select
            value={theme}
            onChange={(event) => setTheme(event.currentTarget.value as GameUiTheme)}
          >
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </label>
      </nav>
      <ThemeReview uiStyle={uiStyle} theme={theme} />
    </>
  );
}
