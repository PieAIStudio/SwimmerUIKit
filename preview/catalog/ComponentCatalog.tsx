import { useEffect, useState, type ReactNode } from 'react';
import { GameButton } from '../../src/GameButton';
import { useSystemReducedMotion } from '../../src/reducedMotion';
import {
  CONTROL_RECIPES,
  ControlRecipe,
  recipeCode,
  type RecipeId,
  type RecipeMaterial,
  type RecipeState,
} from './recipes';
import type { GameButtonVariant } from '../../src/GameButton';
import './catalog.css';

function initial(key: string): string | null {
  return typeof window === 'undefined'
    ? null
    : new URLSearchParams(window.location.search).get(key);
}
function initialRecipe(): RecipeId {
  return CONTROL_RECIPES.find((item) => item.id === initial('component'))?.id ?? 'button';
}

export function ComponentCatalog(): ReactNode {
  const [recipe, setRecipe] = useState<RecipeId>(initialRecipe);
  const [query, setQuery] = useState('');
  const [material, setMaterial] = useState<RecipeMaterial>(() =>
    initial('material') === 'matte' ? 'matte' : initial('material') === 'flat' ? 'flat' : 'glossy',
  );
  const [state, setState] = useState<RecipeState>(() =>
    initial('state') === 'disabled'
      ? 'disabled'
      : initial('state') === 'invalid'
        ? 'invalid'
        : 'ready',
  );
  const [tone, setTone] = useState<GameButtonVariant>(() =>
    ['primary', 'secondary', 'success', 'danger', 'ghost'].includes(initial('tone') ?? '')
      ? (initial('tone') as GameButtonVariant)
      : 'primary',
  );
  const [compare, setCompare] = useState(
    () => initial('compare') === 'true' || !initial('component'),
  );
  const [notice, setNotice] = useState('');
  const reduced = useSystemReducedMotion();
  const item = CONTROL_RECIPES.find((entry) => entry.id === recipe)!;
  const effectiveState =
    state === 'invalid' && recipe !== 'input' && recipe !== 'select' ? 'ready' : state;
  const canCompare = item.liquid && recipe !== 'segmented';
  const comparing = canCompare && compare;
  const effectiveMaterial = item.liquid ? material : 'flat';
  const code = recipeCode({ recipe, material: effectiveMaterial, state: effectiveState, tone });
  const filtered = CONTROL_RECIPES.filter((entry) =>
    `${entry.title} ${entry.api} ${entry.liquid ? '液体 哑光 高光' : '普通'} ${entry.hint}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('component', recipe);
    url.searchParams.set('material', effectiveMaterial);
    url.searchParams.set('state', effectiveState);
    url.searchParams.set('tone', tone);
    url.searchParams.set('compare', String(comparing));
    window.history.replaceState(null, '', url);
  }, [recipe, effectiveMaterial, effectiveState, tone, comparing]);

  async function copy(text: string, label: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(`${label}已复制。`);
    } catch {
      setNotice('浏览器不允许自动复制。代码已完整展示，可手动选择复制；链接可从地址栏复制。');
    }
  }

  return (
    <main className="kit-catalog">
      <header className="kit-catalog-hero">
        <p className="kit-catalog-eyebrow">SWIMMER UI KIT · 组件与材质</p>
        <h1>先选用途，再选手感。</h1>
        <p>普通黏土、哑光液体、高光液体。先点一下，再调材质与状态，把能运行的代码带走。</p>
        <div className="kit-catalog-links">
          <a href="/?view=reference">完整组件、主题与 token 总览 →</a>
        </div>
      </header>
      <div className="kit-catalog-layout">
        <aside className="kit-catalog-sidebar" aria-label="按用途选择组件">
          <label className="kit-catalog-search">
            找一个组件
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="按钮、下拉、GameToggle…"
            />
          </label>
          <p className="kit-catalog-caption">
            {CONTROL_RECIPES.length} 组常用示例 ·{' '}
            {CONTROL_RECIPES.filter((entry) => entry.liquid).length} 类液体控件
          </p>
          <nav aria-label="组件目录">
            {filtered.map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-current={recipe === entry.id ? 'true' : undefined}
                onClick={() => {
                  setRecipe(entry.id);
                  setCompare(false);
                  setNotice('');
                }}
              >
                <span>{entry.title}</span>
                <small>{entry.api}</small>
                <em>{entry.liquid ? '普通 / 哑光 / 高光' : '普通材质'}</em>
              </button>
            ))}
          </nav>
          {!filtered.length && <p role="status">没有匹配的组件。试试“按钮”或清空搜索。</p>}
        </aside>
        <section className="kit-catalog-workbench" aria-labelledby="kit-component-title">
          <header className="kit-catalog-heading">
            <p className="kit-catalog-eyebrow">可用组件 · {item.api}</p>
            <h2 id="kit-component-title">{item.title}</h2>
            <p>{item.hint}</p>
          </header>
          <div className={comparing ? 'kit-catalog-stage is-comparing' : 'kit-catalog-stage'}>
            {(comparing ? (['matte', 'glossy'] as const) : [effectiveMaterial]).map((finish) => (
              <section
                className="kit-catalog-sample"
                key={`${recipe}-${finish}-${effectiveState}`}
                aria-label={`${item.title} · ${finish}`}
              >
                <h3>
                  {finish === 'matte' ? '哑光液体' : finish === 'glossy' ? '高光液体' : '普通黏土'}
                  <small>
                    {finish === 'matte'
                      ? '轮廓与动作表达柔软'
                      : finish === 'glossy'
                        ? '同一轮廓，增加受控反光'
                        : '可靠、安静的日常表面'}
                  </small>
                </h3>
                <ControlRecipe
                  recipe={recipe}
                  material={finish}
                  state={effectiveState}
                  tone={tone}
                />
              </section>
            ))}
          </div>
          <div className="kit-catalog-controls">
            <label>
              材质
              <select
                value={effectiveMaterial}
                disabled={!item.liquid}
                onChange={(event) => setMaterial(event.currentTarget.value as RecipeMaterial)}
              >
                <option value="flat">普通黏土 · Flat</option>
                <option value="matte">哑光液体 · Matte</option>
                <option value="glossy">高光液体 · Glossy</option>
              </select>
            </label>
            <label>
              状态
              <select
                value={effectiveState}
                onChange={(event) => setState(event.currentTarget.value as RecipeState)}
              >
                <option value="ready">正常可用</option>
                <option value="disabled">禁用 / 暂不可操作</option>
                {(recipe === 'input' || recipe === 'select') && (
                  <option value="invalid">校验错误</option>
                )}
              </select>
            </label>
            {recipe === 'button' && (
              <label>
                操作语义
                <select
                  value={tone}
                  onChange={(event) => setTone(event.currentTarget.value as GameButtonVariant)}
                >
                  <option value="primary">主操作</option>
                  <option value="secondary">次操作</option>
                  <option value="success">成功</option>
                  <option value="danger">危险</option>
                  <option value="ghost">弱操作</option>
                </select>
              </label>
            )}
            {canCompare && (
              <label className="kit-catalog-compare">
                <input
                  type="checkbox"
                  checked={comparing}
                  onChange={(event) => setCompare(event.currentTarget.checked)}
                />
                并排比较两种液体
              </label>
            )}
          </div>
          {!item.liquid && (
            <p className="kit-catalog-note">
              这个控件以阅读或编辑为主，保留普通材质。没有隐藏的液体模式，也不会为了凑齐表格让文字流动。
            </p>
          )}
          {recipe === 'segmented' && (
            <p className="kit-catalog-note">
              此控件同时使用底座和指示器两组表面。一次只展示一种材质，避免对照页抢占产品的共享动效预算。
            </p>
          )}
          {effectiveState === 'disabled' && (
            <p className="kit-catalog-note">
              禁用的按钮、图标按钮、开关、分段选择与选择框回到普通表面；进度仍可读，调整滑杆不可操作。
            </p>
          )}
          <p className="kit-catalog-caption">
            {reduced
              ? '系统已开启减少动效：状态直接到位，控件仍可操作。'
              : '跟随系统的“减少动效”设置；没有待机循环动画。'}{' '}
            焦点与按下状态请用 Tab、空格或鼠标直接体验。
          </p>
          <section className="kit-catalog-code" aria-label="完整可运行代码">
            <div className="kit-catalog-code-head">
              <h3>
                拿走这个例子{' '}
                <small>
                  {effectiveMaterial} · {effectiveState}
                </small>
              </h3>
              <div className="kit-recipe-actions">
                <GameButton onClick={() => void copy(code, '代码')}>复制代码</GameButton>
                <GameButton onClick={() => void copy(window.location.href, '当前配置链接')}>
                  复制配置链接
                </GameButton>
              </div>
            </div>
            <p>
              代码使用上方“材质”选中的一套；并排对照不改变它。安装已发布的精确版本，在 React
              页面渲染 <code>{'<Example />'}</code>。
            </p>
            <pre tabIndex={0}>
              <code>{code}</code>
            </pre>
            <p role="status" className="kit-catalog-caption">
              {notice}
            </p>
          </section>
          <details className="kit-catalog-details">
            <summary>边界与选型：什么时候不该用液体？</summary>
            <p>
              液体只突出一层操作意图，不覆盖长文、表单正文或整张模态框。这里的哑光／高光不是另一套金属效果，
              <code>LiquidMetalButton</code> 仍是独立的决策面特效。
            </p>
            <p>
              下拉选择使用原生
              select，弹出菜单会随操作系统而不同。需要搜索、多选标签或虚拟列表时，先评审成熟
              headless 实现；这不是本组件隐含支持的功能。
            </p>
            <p>
              十二个命名形态是“怎样动”，不是十二个成品控件。高级图像融合与 donor
              研究留在材料页和来源文档中，不变成按钮使用前置知识。
            </p>
          </details>
        </section>
      </div>
    </main>
  );
}
