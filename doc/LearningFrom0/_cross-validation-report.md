# 文档交叉验证报告

## 验证范围

- **文档**：SwimmerUIKit LearningFrom0 系列（00-index、01、02、03、04）
- **验证日期**：2026-06-26
- **对照的真相来源**：
  - `src/index.ts`（导出清单，组件+令牌完整列表）
  - `src/tokens.ts` + `src/clay/tokens.ts`（令牌定义，TypeScript 端实际值类型）
  - `src/theme.css`（CSS 变量实际数值，`:root` 定义）
  - `src/GameButton.tsx`（GameButton 的 props 和 variant 枚举）
  - `package.json`（包名、版本、peerDependencies、发布 registry）
  - `README.md`（导出列表权威说明）

---

## 验证结果摘要

| 分类 | 数量 |
| --- | --- |
| ✅ 准确 | 22 |
| ⚠️ 简化但不误导 | 6 |
| 🔶 简化但可能误导 | 3 |
| ❌ 错误 | 3 |
| 🔍 无法验证 | 0 |

---

## 已修正的问题

### ❌ 错误 1：02篇组件清单遗漏 `GameHudActions`

- **文档原文**：mindmap 中"信息展示"分类只列了 `GameHud 游戏 HUD 栏`
- **实际情况**：`src/index.ts` 第 6 行单独导出 `GameHudActions`（与 `GameHud` 是两个独立组件）
- **真相来源**：`src/index.ts:6`、`README.md` Exports 列表
- **修正内容**：在 mindmap"信息展示"分类下增加 `GameHudActions HUD 操作栏`

---

### ❌ 错误 2：02篇"约 23 个组件"数量错误

- **文档原文**："约 23 个，涵盖按钮、弹窗、HUD、新手引导等游戏 UI 场景"
- **实际情况**：`src/index.ts` 实际导出组件 25 个（GameButton、GameDialog、GameHistoryPanel、GameHudActions、GameIconButton、GamePanel、GamePrompt、GameRadialMenu、GameSegmentedControl、GameSlider、GameTabs、GameToast、GameToggle、GameTooltip、FirstSessionHud、FirstSessionOnboarding、GameUiPreview、GameAssetIcon、GameBadge、GameCardFan、GameHud、GameLanguageMenu、GameLoadingState、GameOrientationGate、GameStageTile）
- **真相来源**：`src/index.ts` 完整枚举
- **修正内容**："约 23 个"改为"约 25 个"

---

### ❌ 错误 3：00-index 和 04篇的第 05 篇悬空链接

- **文档原文**：`00-index.md` 目录表 `[05](./05-mental-model-overview.md)` 带有超链接；`04-use-in-new-app.md` 末尾 `**下一篇：** [05 - 中级总览...](./05-mental-model-overview.md)`
- **实际情况**：`/doc/LearningFrom0/` 目录下不存在 `05-mental-model-overview.md`
- **真相来源**：文件系统 `ls /doc/LearningFrom0/`（只有 00~04）
- **修正内容**：
  - `00-index.md`：`[05](./05-mental-model-overview.md)` 改为 `05（待撰写）`（去掉悬空链接）
  - `04-use-in-new-app.md`：去掉末尾的 markdown 链接，改为纯文字"05 - 中级总览：这套库的内部设计逻辑（待撰写）"

---

## 🔶 可能误导的声明（已修正）

### 🔶 可能误导 1：02篇令牌表"数字化"写法混淆 TypeScript 值类型

- **文档原文**：令牌表格写 `hud=20`、`modal=80`、`toast=100`、`fast=120ms`
- **实际情况**：`CLAY_LAYER_TOKENS`、`CLAY_MOTION_TOKENS` 等在 TypeScript 端存的是 CSS 变量字符串（如 `'var(--game-ui-z-hud)'`、`'var(--game-ui-motion-fast)'`），括号里的数字是 CSS 文件 `:root` 中这些变量的实际值，不是 TypeScript 的值。唯一存真实数字的是 `CLAY_TARGET_TOKENS`。
- **误导风险**：读者看到 `hud=20` 会以为 `CLAY_LAYER_TOKENS.hud === 20`，实际是字符串
- **修正内容**：
  - 把"等号写法"改为括号注释（`hud(z:20)`、`fast(120ms)`）以示区分
  - 补全 `CLAY_RADIUS_TOKENS` 的 `panel(26px)` 条目（之前完全遗漏）
  - 补全 `CLAY_ELEVATION_TOKENS` 的 `stroke` 键（之前遗漏）
  - 补全 `CLAY_MOTION_TOKENS` 的 `base(220ms)` 键（之前遗漏）
  - 在令牌分类表下方增加解释性引用块，说明 TypeScript 端 vs CSS 端的区别，并特别指出 `CLAY_TARGET_TOKENS` 是唯一存数字的例外

---

## ⚠️ 合理简化（不需要修正，记录在案）

1. **01篇 `CLAY_RADIUS_TOKENS` 圆角举例**：只提了 `999px` 圆角，没列全部键名——对初学者理解"圆角规格表"的概念不影响

2. **02篇 `playGameInteractionSound` 只提主函数**：实际还导出了 `playGameInteractionSoundForContext`（带 AudioContext 参数的高级版本），对初学者不需要知道

3. **02篇 `CLAY_COLOR_TOKENS` 举例只列4个颜色**：实际 tokens 有 17 个颜色键（含 `shadow`、`glass`、`nightGlass` 等），举例选取代表性颜色是合理的教学简化

4. **02篇 `getClayIconPath` 说明**："默认返回内嵌 SVG"是正确的主路径描述，对初学者适用

5. **03篇 `peerDependencies` 表格**：教程列出了4个 peer（react、react-dom、tailwindcss、@tailwindcss/vite），与 `package.json` 的 `peerDependencies` 完全一致 ✅

6. **04篇 `npm run dev` 端口 5174**：与 `package.json` `scripts.dev` 中 `--port 5174` 一致 ✅

---

## 验证通过的声明（抽样）

- ✅ 包名 `@pieaistudio/swimmer-ui-kit` → `package.json` `name` 字段完全一致
- ✅ 当前版本 `0.1.1` → `package.json` `version: "0.1.1"`
- ✅ 发布在 GitHub 私有 registry → `package.json` `publishConfig.registry: "https://npm.pkg.github.com"`
- ✅ `import '@pieaistudio/swimmer-ui-kit/styles.css'` 路径有效 → `package.json` `exports["./styles.css"]: "./dist/styles.css"`
- ✅ `peerDependencies` react/react-dom >=19.0.0、tailwindcss/vite >=4.0.0 → `package.json` 完全一致
- ✅ `CLAY_COLOR_TOKENS.orange = '#e8743b'` → `src/clay/tokens.ts:10`
- ✅ `CLAY_SEMANTIC_TOKENS.surface = 'var(--game-ui-surface)'` → `src/clay/tokens.ts:24`
- ✅ `CLAY_SEMANTIC_TOKENS.accent = 'var(--game-ui-accent)'` → `src/clay/tokens.ts:30`
- ✅ CSS 变量 `--game-ui-accent: #e8743b` → `src/theme.css:43`
- ✅ CSS 变量 `--game-ui-bg: #f3e8d8` (底色米黄) → `src/theme.css:35`
- ✅ `--game-ui-surface: rgba(255, 248, 236, 0.78)` → `src/theme.css:37`
- ✅ 弹窗阴影 `0 32px 90px rgba(48,30,18,0.38)` → `src/theme.css:74`（完整值还含 inset 部分，教程省略了 inset 但核心值准确）
- ✅ `--game-ui-radius-bead: 999px`（最小控件也是 999px 圆角）→ `src/theme.css:67`
- ✅ `--game-ui-weight-title: 930`（标题字重 930）→ `src/theme.css:34`
- ✅ `GameButton` variant 枚举 `primary/secondary/ghost/danger/success` → `src/GameButton.tsx:5`
- ✅ `GameButton` 默认 variant 是 `secondary` → `src/GameButton.tsx:19`
- ✅ `GameButton` sound 默认值 `false` → `src/GameButton.tsx:17`
- ✅ `CLAY_TARGET_TOKENS.touchMinimumPx = 44`（最小触控面积 44px）→ `src/clay/tokens.ts:110`
- ✅ `CLAY_TARGET_TOKENS.mobileLandscapeProofWidthPx = 844` → `src/clay/tokens.ts:118`
- ✅ `CLAY_UI_TOKENS.semantic.surface` 访问方式 → `src/clay/tokens.ts:133`（`CLAY_UI_TOKENS.semantic = CLAY_SEMANTIC_TOKENS`）
- ✅ `GAME_UI_TOKENS.surface` 直接访问 → `src/tokens.ts:29`（展开合并含 `CLAY_SEMANTIC_TOKENS`）
- ✅ `--game-ui-font-md: 0.95rem`（普通字体大小 0.95rem）→ `src/theme.css:26`

---

## 开放问题

1. **05篇是否计划撰写**：目录和第04篇结尾都预告了"中级总览篇"，但文件不存在。建议确认写作计划并更新目录。

2. **`GAME_UI_PREVIEW_MESSAGES` 未在教程中提及**：这是从 `previewStates` 导出的数据，属于预览工具内部使用，对初学者教程不影响——但如果未来有"预览工具"篇，可以补充。

3. **教程02 `GameButton` sound prop 示例使用了 `sound = false` 的简化写法**：教程03第72行的伪代码 `export function GameButton({ children, onClick, sound = false })` 省略了实际的 TypeScript 类型 `GameInteractionSoundOptions | false`，但对初学者理解概念没有误导，列为合理简化。

4. **`getClayCatalogPaths` 和 `getClaySourceAssetPath` 未在教程提及**：这两个辅助函数属于高级用法（获取图标目录路径），对初学者教程范围不影响。

---

*本报告由 doc-cross-validator 技能生成，2026-06-26*
