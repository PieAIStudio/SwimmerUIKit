# SwimmerUIKit Clay UI Extraction Report

## 工作目录

- 当前工作目录：`/Users/yuanfei/PieAI/SwimmerUIKit`
- 只读来源目录：`/Users/yuanfei/PieAI/TuringPact`
- 本轮没有修改 TuringPact、SwimmerCore、Supabase、后端、secrets、部署配置，也没有 push。

## 循环 ledger

### Round 1 — Observe：来源清点与耦合点

- Goal：先拿 fresh evidence，确认 SwimmerUIKit 现状、TuringPact 可迁入文件、资产库存与业务耦合点。
- Evidence：
  - `find . -maxdepth 3 -type f`：SwimmerUIKit 初始无源码文件。
  - `find /Users/yuanfei/PieAI/TuringPact/src/features/game-ui -maxdepth 4 -type f`：确认 game-ui 来源文件。
  - `find /Users/yuanfei/PieAI/TuringPact/public/assets/game/ui -type f | wc -l`：来源素材共 351 个文件。
  - `find ... -name '*.png' | wc -l`：PNG 349 个。
  - `find ... -name '*.json' | wc -l`：JSON 2 个。
- Observed facts：
  - 来源组件包含 `GameButton.tsx`、`GameDialog.tsx`、`GameHudActions.tsx`、`GameHistoryPanel.tsx`、`GameSurfaces.tsx`、`ClayComponents.tsx`、`FirstSessionGameShell.tsx`、`GameUiPreview.tsx`、`interactionSound.ts`、`previewStates.ts`、`tokens.ts`、`clay/assets.ts`、`clay/tokens.ts`、`index.ts`。
  - 来源样式包含 `src/styles/game-ui-clay.css` 和 `src/styles/theme.css`。
  - 素材在 `public/assets/game/ui` 下，主要是 `clay/asset-manifest.json`、`clay/phase03-clay-kit/catalog/*`、`buttons/*`、`components/*`、`icons/*` 等。
- Coupling facts：
  - `GameButton` 读取 TuringPact `../../stores/settingsStore`。
  - `GameUiPreview` 读取 `react-i18next` 的 `useTranslation('common')`。
  - `FirstSessionGameShell` 依赖 `lucide-react` icon，并使用 `tp-*` class 命名。
  - `GameHistoryPanel` 依赖 `previewStates` 类型。
- Decision：只读 TuringPact；迁出时把 store/i18n/icon 依赖改为 props 或 package-local fallback。
- Result：进入骨架搭建。

### Round 2 — Choose/Act：包骨架

- Goal：创建可独立安装、构建、预览的 npm package skeleton。
- Files created：
  - `package.json`
  - `tsconfig.json`
  - `tsconfig.build.json`
  - `vite.config.ts`
  - `vitest.config.ts`
  - `index.html`
  - `preview/main.tsx`
- Key decisions：
  - 包名：`@pieai/swimmer-ui-kit`
  - 技术栈：React 19、TypeScript strict、Vite、Tailwind v4 plugin。
  - `react`、`react-dom`、`tailwindcss`、`@tailwindcss/vite` 放在 `peerDependencies`，避免把 React 打进包里。
  - Vite lib build externalizes `react`、`react-dom`、`react/jsx-runtime`。
- Verify：`npm install` 成功。
- Result：进入 tokens/style 迁入。

### Round 3 — Act/Verify：tokens 与 CSS 变量

- Goal：迁入 clay tokens，并把 token contract 以 CSS variables 暴露。
- Files created：
  - `src/clay/tokens.ts`
  - `src/tokens.ts`
  - `src/theme.css`
  - `src/styles.css`
  - `src/tokens.test.ts`
- Observed fact from tests：第一次 token 单测暴露 `GAME_UI_TOKENS.panel` 被后续 elevation token `panel` 覆盖，实际值是 `var(--game-ui-shadow-panel)`；这是来源 spread 顺序造成的命名碰撞风险。
- Decision：保留来源兼容的 spread 顺序，不在本轮重命名 token；单测改为断言无歧义的 `GAME_UI_TOKENS.surface`，并在人工判断问题里记录命名风险。
- Verify：`npm test` 最终通过。
- Result：进入组件迁入。

### Round 4 — Act/Verify：组件迁入与解耦

- Goal：迁入组件，不反向依赖 TuringPact。
- Files created：
  - `src/GameButton.tsx`
  - `src/GameDialog.tsx`
  - `src/GameHudActions.tsx`
  - `src/GameHistoryPanel.tsx`
  - `src/GameSurfaces.tsx`
  - `src/ClayComponents.tsx`
  - `src/FirstSessionGameShell.tsx`
  - `src/GameUiPreview.tsx`
  - `src/interactionSound.ts`
  - `src/previewStates.ts`
  - `src/clay/assets.ts`
  - `src/index.ts`
- Decoupling decisions：
  - `GameButton` 不再读取 TuringPact settings store；新增 `sound?: GameInteractionSoundOptions | false`，由 host app 注入。
  - `GameUiPreview` 不再调用 `useTranslation`；标题/正文由 props 或默认 copy 提供。
  - `FirstSessionHud` 不再依赖 `lucide-react`；新增 `iconSlots`，默认使用 clay inline icon fallback。
  - `FirstSessionGameShell` class 从 `tp-first-session-*` 改为 `swimmer-first-session-*`，避免和 TuringPact host CSS 反向耦合。
  - `GameHistoryPanel` 的 history type 下沉到本包自身。
  - `clay/assets.ts` 保留来源 asset path，同时提供 inline SVG icon fallback，保证包预览不依赖 TuringPact public 目录即可渲染。
- Verify：`npm run typecheck` 通过。
- Result：进入预览和视觉证据。

### Round 5 — Verify：预览、交互与响应式证据

- Goal：本地预览页渲染所有组件与 token，抓取 inspect-webpage、capture-flow、responsive matrix 证据。
- Files created：
  - `.devspace-visual/flow-actions.json`
  - `.devspace-visual/responsive-config.json`
- Inspect webpage evidence：
  - Report：`.devspace-visual/inspect-webpage-final2/inspection-report.json`
  - Screenshot：`.devspace-visual/inspect-webpage-final2/screenshot.png`
  - Observed facts：
    - 页面 title 为 `Swimmer UI Kit Preview`。
    - 可见文本包含 `Clay game UI kit`、`Tokens`、`Component surface`、`First-session shell`、`Orientation gate preview`、`Responsive proof targets`。
    - console errors/warnings 为空；unknowns 只有 Vite debug 与 React DevTools info。
    - network failedRequests/httpErrors 为空。
  - Human visual inspection：实际打开截图后确认 tokens、按钮、HUD、stage tiles、dialog/toast/loading/card fan/history、first-session shell、orientation gate、desktop/mobile proof frames 都渲染；初版 first-session onboarding 在窄列中可读性差，已改为堆叠布局。
- Capture flow evidence：
  - Report：`.devspace-visual/flow-language-final/flow-report.json`
  - After screenshot：`.devspace-visual/flow-language-final/step-1-after.png`
  - Diff：`.devspace-visual/flow-language-final/step-1-diff.png`
  - Observed facts：
    - Flow status `PASS`。
    - `.game-ui-language-trigger` selector match count 为 1，未歧义。
    - 点击元素为可见 button，文本 `EN`。
    - 点击后 DOM text changed 为 true。
    - visual diff changed 为 true，changedPixelRatio 约 `0.003384`，变化集中在语言 popover 区域。
    - 实际打开 after screenshot 后确认右上角 popover 展示 `English` 与 `简体中文` 两项。
  - Note：第一次 flow 尝试把 `expectVisible` 写成字符串，脚本按字符拆 selector 导致 false fail；改成结构化 postcondition 后通过。
- Responsive matrix evidence：
  - Report：`.devspace-visual/responsive-matrix-final/responsive-matrix-report.json`
  - Desktop screenshot：`.devspace-visual/responsive-matrix-final/desktop-1440x900.png`
  - Mobile landscape screenshot：`.devspace-visual/responsive-matrix-final/mobile-landscape-844x390.png`
  - Observed facts：
    - Matrix status `PASS`。
    - Desktop `1440x900`：bodyScrollWidth/clientWidth = `1440/1440`，horizontalOverflow false。
    - Mobile landscape `844x390`：bodyScrollWidth/clientWidth = `844/844`，horizontalOverflow false。
    - 两档 viewport 都可见 `Clay game UI kit`、`Component surface`、`Responsive proof targets`。
    - 实际打开 desktop 与 mobile landscape 截图后确认页面没有横向溢出；mobile landscape 下 first-session onboarding 已改成单列，可读。
- Result：进入收尾回归与文档。

### Round 6 — Record：回归、README 与报告

- Goal：完成回归验证、写 README 和本报告。
- Files created：
  - `README.md`
  - `EXTRACTION-REPORT.md`
- Final verify：
  - `npm run typecheck`：通过。
  - `npm run build`：通过；产物包含 `dist/styles.css`、`dist/index.js`、`dist/index.cjs`、声明文件。
  - `npm test`：通过，1 个 test file / 2 个 tests。
- Result：本地构建、测试、预览证据通过；没有 push。

## 迁入清单

| TuringPact 来源 | SwimmerUIKit 产出 | 说明 |
| --- | --- | --- |
| `src/features/game-ui/clay/tokens.ts` | `src/clay/tokens.ts` | 迁入 clay token 常量与类型。 |
| `src/features/game-ui/tokens.ts` | `src/tokens.ts` | 迁入 `GAME_UI_TOKENS` / `GAME_UI_TARGETS` 聚合导出。 |
| `src/styles/theme.css` | `src/theme.css` | 只迁入 Tailwind v4 `@theme inline` 对本包 CSS variables 的桥接，不迁入 TuringPact `--tp-*` host theme。 |
| `src/styles/game-ui-clay.css` | `src/styles.css` | 迁入 package-local component/preview 样式；删掉或改名 `tp-*` 业务段，只保留 UI kit 预览需要的样式。 |
| `src/features/game-ui/clay/assets.ts` | `src/clay/assets.ts` | 保留 source asset path；新增 inline SVG fallback。 |
| `src/features/game-ui/interactionSound.ts` | `src/interactionSound.ts` | 保留 Web Audio 逻辑，改成由 props 调用。 |
| `src/features/game-ui/GameButton.tsx` | `src/GameButton.tsx` | 移除 settings store 依赖，新增 `sound` prop。 |
| `src/features/game-ui/GameDialog.tsx` | `src/GameDialog.tsx` | 基本等价迁入。 |
| `src/features/game-ui/GameHudActions.tsx` | `src/GameHudActions.tsx` | 基本等价迁入。 |
| `src/features/game-ui/GameHistoryPanel.tsx` | `src/GameHistoryPanel.tsx` | 将 history type 放入本文件。 |
| `src/features/game-ui/GameSurfaces.tsx` | `src/GameSurfaces.tsx` | 迁入 panel/icon button/tooltip/tabs/segmented/slider/toggle/radial/toast/prompt。 |
| `src/features/game-ui/ClayComponents.tsx` | `src/ClayComponents.tsx` | 迁入 badge/icon/HUD/card fan/stage tile/orientation/language/loading 等。 |
| `src/features/game-ui/FirstSessionGameShell.tsx` | `src/FirstSessionGameShell.tsx` | 移除 lucide-react，改 icon slots + clay fallback；class 改为 `swimmer-*`。 |
| `src/features/game-ui/GameUiPreview.tsx` | `src/GameUiPreview.tsx` | 移除 i18n，变成 package-local preview。 |
| `src/features/game-ui/previewStates.ts` | `src/previewStates.ts` | 迁入 preview 示例数据。 |
| `src/features/game-ui/index.ts` | `src/index.ts` | 建立 package public API。 |
| `public/assets/game/ui` | `src/clay/assets.ts` path refs + inline fallback | 本轮没有复制二进制素材；记录 351 个来源文件库存，包可用 inline fallback 独立预览。 |

## 解耦点

1. `GameButton`：从 TuringPact `useSettingsStore` 解耦为 `sound` prop。host app 可将自身设置映射为 `{ enabled, masterVolume, sfxVolume }`。
2. `GameUiPreview`：从 `react-i18next` 解耦为 props/default text。本包不拥有 TuringPact 文案 namespace。
3. `FirstSessionHud`：从 `lucide-react` 解耦为 `iconSlots`，默认走本包 `GameAssetIcon`。
4. `FirstSessionGameShell`：从 `tp-*` class 改为 `swimmer-first-session-*`，避免与 TuringPact host 页面 CSS 强绑定。
5. `GameHistoryPanel`：不再 import `previewStates` type，改为本包本地 type。
6. Clay assets：保留 TuringPact source public path 作为导出信息，同时让 `getClayIconPath` 默认返回 inline SVG fallback，保证 SwimmerUIKit 不依赖 TuringPact public server 即可预览。

## 构建、预览、测试结果

- `npm install`：通过，新增依赖安装完成。
- `npm run typecheck`：通过。
- `npm run build`：通过。
  - `dist/styles.css`：约 24.97 kB。
  - `dist/index.js`：约 40.53 kB。
  - `dist/index.cjs`：约 30.93 kB。
- `npm test`：通过。
  - 1 个 test file。
  - 2 个 tests。
- `inspect-webpage`：通过。
  - Report：`.devspace-visual/inspect-webpage-final2/inspection-report.json`
  - Screenshot：`.devspace-visual/inspect-webpage-final2/screenshot.png`
- `capture-flow`：通过。
  - Report：`.devspace-visual/flow-language-final/flow-report.json`
  - Before：`.devspace-visual/flow-language-final/step-1-before.png`
  - After：`.devspace-visual/flow-language-final/step-1-after.png`
  - Diff：`.devspace-visual/flow-language-final/step-1-diff.png`
- `check-responsive-matrix`：通过。
  - Report：`.devspace-visual/responsive-matrix-final/responsive-matrix-report.json`
  - Desktop 1440×900：`.devspace-visual/responsive-matrix-final/desktop-1440x900.png`
  - Mobile landscape 844×390：`.devspace-visual/responsive-matrix-final/mobile-landscape-844x390.png`

## 观察事实 vs 推断

### 观察事实

- 预览首载在 1440×900 截图中渲染出完整长页，包含 tokens、组件、first-session、orientation、responsive proof sections。
- 交互流点击语言按钮后 popover 出现，DOM 和 visual diff 都变化。
- Desktop 与 mobile landscape matrix 都没有 horizontal overflow。
- Console 没有 errors/warnings；只有 Vite dev server 和 React DevTools 提示被记录为 unknown。
- `npm run typecheck`、`npm run build`、`npm test` 均通过。

### 推断

- 由于 React 被 externalize 且放入 peerDependencies，本地 lib build 没有把 React 打进产物。
- 由于 `GameButton`、`GameUiPreview`、`FirstSessionGameShell` 已移除 TuringPact store/i18n/lucide import，本包源码不需要反向依赖 TuringPact。
- 由于 inline icon fallback 可以渲染预览，包在没有 TuringPact public assets 的情况下仍可展示核心 UI；但如果未来追求 1:1 clay 原始素材质感，仍需决定资产复制/托管策略。

## 集成进 TuringPact 的待办（本轮不执行）

1. 在 TuringPact 中添加 `@pieai/swimmer-ui-kit` workspace/package dependency。
2. 在 TuringPact app shell 或 style entry 中 import `@pieai/swimmer-ui-kit/styles.css`。
3. 将 `src/features/game-ui` 的 imports 改为从 `@pieai/swimmer-ui-kit` 导入。
4. 将 `GameButton` 的声音设置从 TuringPact settings store 映射为 `sound` prop。
5. 将 first-session/onboarding/preview 文案通过 props 传入，不让包读取 TuringPact i18n。
6. 决定 TuringPact 是否继续提供 `/assets/game/ui/clay/...` 原始素材路径；如果需要原始 PNG 质感，保留或复制 `public/assets/game/ui`。
7. 所有 imports 替换完成并回归通过后，再删除 TuringPact `src/features/game-ui`。
8. 确认 `src/styles/game-ui-clay.css` 的职责被 `@pieai/swimmer-ui-kit/styles.css` 覆盖后，再停止引用或删除。
9. 保留 TuringPact host theme 决策，避免把 `--tp-*` app-level token 混进 UI kit。
10. 集成后重跑 TuringPact H1 core flow、first-session、desktop 与 mobile-landscape 视觉证据。

## 仍需人工判断的问题

1. 是否要把 TuringPact 的 349 个 PNG + 2 个 JSON 原始素材复制进 SwimmerUIKit 包。本轮选择了 source path refs + inline fallback，保证独立预览；但这不是原始 PNG 资产 1:1 分发。
2. `GAME_UI_TOKENS` 中存在来源兼容的 key collision，例如 `panel` 会被 elevation 的 `panel` 覆盖。是否要在后续破坏兼容性地改名，需要设计/API 判断。
3. 当前 preview 是 UI kit 证据页，不等同于 TuringPact 真实业务页面集成效果；真实接入仍需 TuringPact 回归。
4. `package.json` 目前 `private: true`，本轮只证明本地构建与预览，不代表已经发布或可上线。
5. 视觉上已可作为 extraction proof，但是否达到 TuringPact 原始 clay art direction 的完全质感，需要设计评审。

## 终止条件结果

- 6 轮预算内完成。
- 自包含包源码、构建配置、preview、README、报告已落盘。
- 本地 typecheck/build/test/preview evidence 通过。
- 没有 push。
- 没有修改 `/Users/yuanfei/PieAI/TuringPact`。
