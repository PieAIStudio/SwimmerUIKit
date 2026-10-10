# @pieai/swimmer-ui-kit

Swimmer 的共享 React UI：普通控件是平面水滴，主线 CTA 是潮汐液体。支持六套风格与独立明暗，表单、焦点、键盘和编辑内容仍由原生 DOM 承接。它不拥有产品数据、模型调用、账号验证或支付。

**3.0.0 与 3.1.0 已发布到 npm latest（3.1.0 于 2026-10-10 发布，新增账号菜单与 GameTooltip 位置选项）。3.2.0 为本地候选（新增 GameHelpCard），待发布到 npm latest；发布前 latest 仍为 3.1.0。** 3.0.0-rc.1 与 rc.3 已发布到 npm next。现有产品继续锁定精确版本；主动升级先读[迁移表](docs/reference/migration-3.0.md)，发布证据见[当前工作](docs/reference/execution/current-work.md)。本仓库不自动升级任何产品。

## 安装与最小使用

React / React DOM 需要 19 或以上。发布前的候选评审时安装交付回执里的本地 tarball，先核对 SHA-256；发布后使用 Owner 批准的精确 npm 版本。不要把相邻仓库源码当生产依赖。

```sh
# 显式选择精确版本；不要用 latest 或范围自动升级
pnpm add --save-exact @pieai/swimmer-ui-kit@3.1.0
# 发布前或离线验收，安装回执中经过 SHA-256 核对的同版本 tarball
pnpm add --save-exact /path/to/swimmer-ui-kit-3.1.0.tgz
```

```tsx
import { GameButton } from '@pieai/swimmer-ui-kit';
import '@pieai/swimmer-ui-kit/styles.css';

export function Actions() {
  return (
    <section data-game-ui-theme="light" data-game-ui-style="pastel">
      <GameButton>看看详情</GameButton>
      <GameButton variant="primary">继续下一步</GameButton>
    </section>
  );
}
```

一屏最多一个 primary。危险操作用 danger：红字、普通底色；不会变成另一个液体 CTA。安装包是 ESM-only；主样式是标准 CSS，不要求 Tailwind 或产品的 CSS 预处理器。

图标直接用 `<GameIcon icon="check" />`，没有图片请求或初始化；尺寸为16 / 20 / 24px。默认英文与中文字体声明已随 styles.css 加载；中文按字符块请求，fonts.css 也可单独使用。

App Router 可以从 Server Component 直接挂载 UIKit 组件；事件、ref 与受控状态放在宿主 Client Component，CSS 在 layout 导入。组件入口和 React 共享分块已有 client boundary，不需要产品重复包装导出；纯图标数据从 icon-paths 子入口读取。具体边界见[主题与液体](docs/reference/theme-and-liquid.md)。

## 去哪里看

| 需要 | 入口 |
| --- | --- |
| 选组件、正确使用 | [组件选择指南](docs/reference/component-selection-guide.md) |
| 主题、液体、可选特效 | [主题与液体](docs/reference/theme-and-liquid.md) |
| 改配色、字体和样式 | [设计 token](docs/reference/design-tokens.md) |
| 全部公开名字 | [生成的 API 清单](docs/reference/public-api-inventory.md) |
| 迁移与候选验收 | [3.0 迁移表](docs/reference/migration-3.0.md) |
| 工作状态与证据 | [当前工作](docs/reference/execution/current-work.md) |

本机 `pnpm dev` 打开组件目录，`pnpm storybook` 打开故事；端口被占就换空闲端口，别停止其他项目的服务。已部署网站不是本机 3.0 候选的证明。

## 开发与交付

```sh
pnpm install --frozen-lockfile
pnpm verify
pnpm docs:check
pnpm build-storybook
```

公共 API 变更后运行 pnpm api:inventory。提交/推送只保存代码，不发 npm，也不部署网站。发布需完整本机门禁和明确授权；S14 已完成，首轮失败及再授权成功均有回执；已有单次授权已经使用，后续发布须另行明确批准。包级门禁与下游产品真实接入验收分别记录。

维护者检查真实包体使用 `pnpm check:packed .scratch/<candidate>.tgz`：五个 JS 入口（含独立图标路径）、React 共享分块边界、严格类型消费、资源原字节和迁移检查器都从 tarball 验证。该命令只创建仓库内隔离夹具，不安装到产品、不发布。 另用 `pnpm check:next-consumer .scratch/<candidate>.tgz` 安装真实候选到临时 Next 项目，检查构建、启动、水合、链接、液体交互与窄屏；发布工作流也执行此门禁。

源码公开可读，使用受 [PieAI Limited Use License](LICENSE) 约束，并非开源许可。字体和图标路径遵循各自第三方许可证；来源看 [NOTICE](NOTICE) 与 [donor 索引](donors-individual.md)。
