import { useEffect, useState, type ReactNode } from 'react';
import { GameButton } from '../../src/controls/GameButton/GameButton';
import type { GameButtonVariant } from '../../src/controls/GameButton/GameButton';
import { GAME_UI_STYLES, type GameUiStyle } from '../../src/tokens/styles';
import {
  CONTROL_RECIPES,
  ControlRecipe,
  recipeCode,
  type RecipeId,
  type RecipeState,
} from './recipes';
import './catalog.css';
import { SurfaceLevels } from './SurfaceLevels';

const names: Record<GameUiStyle, string> = {
  candy: '彩色',
  pastel: '淡彩',
  mist: '雾色',
  grey: '灰阶',
  outline: '包边',
  ink: '黑白包边',
};
const initial = (key: string) =>
  typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get(key);

export function ComponentCatalog(): ReactNode {
  const [recipe, setRecipe] = useState<RecipeId>(
    () => CONTROL_RECIPES.find((item) => item.id === initial('component'))?.id ?? 'button',
  );
  const [query, setQuery] = useState('');
  const [uiStyle, setStyle] = useState<GameUiStyle>(
    () => GAME_UI_STYLES.find((value) => value === initial('style')) ?? 'pastel',
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
  const [notice, setNotice] = useState('');
  const item = CONTROL_RECIPES.find((entry) => entry.id === recipe)!;
  const effectiveState =
    state === 'invalid' && recipe !== 'input' && recipe !== 'select' ? 'ready' : state;
  const code = recipeCode({ recipe, uiStyle, state: effectiveState, tone });
  const filtered = CONTROL_RECIPES.filter((entry) =>
    `${entry.title} ${entry.api} ${entry.hint}`.toLowerCase().includes(query.toLowerCase().trim()),
  );
  useEffect(() => {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries({
      component: recipe,
      style: uiStyle,
      state: effectiveState,
      tone,
    }))
      url.searchParams.set(key, value);
    url.searchParams.delete('material');
    url.searchParams.delete('compare');
    window.history.replaceState(null, '', url);
  }, [recipe, uiStyle, effectiveState, tone]);
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice('已复制。');
    } catch {
      setNotice('浏览器未允许自动复制；下方代码可手动选择复制。');
    }
  }
  return (
    <main className="kit-catalog">
      <header className="kit-catalog-hero">
        <p className="kit-catalog-eyebrow">SWIMMER UI KIT · 3.0</p>
        <h1>平面水滴，轻轻按下。</h1>
        <p>
          普通控件共用一个轮廓，风格和明暗分别选择。只有推动下一步的主按钮是潮汐液体，一屏最多一个。
        </p>
        <div className="kit-catalog-links">
          <a href="/?view=reference">组件与 token 总览 →</a>
        </div>
      </header>
      <SurfaceLevels />
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
          <p className="kit-catalog-caption">{CONTROL_RECIPES.length} 组示例 · 六套风格</p>
          <nav aria-label="组件目录">
            {filtered.map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-current={recipe === entry.id ? 'true' : undefined}
                onClick={() => {
                  setRecipe(entry.id);
                  setNotice('');
                }}
              >
                <span>{entry.title}</span>
                <small>{entry.api}</small>
                <em>{entry.liquid ? '主线 CTA' : '平面控件'}</em>
              </button>
            ))}
          </nav>
          {!filtered.length ? <p role="status">没有匹配的组件。试试“按钮”或清空搜索。</p> : null}
        </aside>
        <section className="kit-catalog-workbench" aria-labelledby="kit-component-title">
          <header className="kit-catalog-heading">
            <p className="kit-catalog-eyebrow">{item.api}</p>
            <h2 id="kit-component-title">{item.title}</h2>
            <p>{item.hint}</p>
          </header>
          <div className="kit-catalog-stage">
            <section
              className="kit-catalog-sample"
              aria-label={`${item.title} · ${names[uiStyle]}`}
            >
              <ControlRecipe
                key={recipe}
                recipe={recipe}
                uiStyle={uiStyle}
                state={effectiveState}
                tone={tone}
              />
            </section>
          </div>
          <div className="kit-catalog-controls">
            <label>
              风格
              <select
                value={uiStyle}
                onChange={(event) => setStyle(event.currentTarget.value as GameUiStyle)}
              >
                {GAME_UI_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {names[style]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              状态
              <select
                value={effectiveState}
                onChange={(event) => setState(event.currentTarget.value as RecipeState)}
              >
                <option value="ready">正常可用</option>
                <option value="disabled">禁用</option>
                {recipe === 'input' || recipe === 'select' ? (
                  <option value="invalid">校验错误</option>
                ) : null}
              </select>
            </label>
            {recipe === 'button' ? (
              <label>
                操作语义
                <select
                  value={tone}
                  onChange={(event) => setTone(event.currentTarget.value as GameButtonVariant)}
                >
                  {['primary', 'secondary', 'success', 'danger', 'ghost'].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
          <div className="kit-recipe-actions">
            <GameButton onClick={() => void copy(code)}>复制代码</GameButton>
            <GameButton onClick={() => void copy(window.location.href)}>复制示例链接</GameButton>
          </div>
          <p role="status">{notice}</p>
          <pre className="kit-catalog-code">
            <code>{code}</code>
          </pre>
        </section>
      </div>
    </main>
  );
}
