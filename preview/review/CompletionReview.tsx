import { forwardRef, useRef, useState, type ComponentProps } from 'react';
import { GameButton, GameIconButton, GameIcon, GameInput } from '../../src/index';
import { LiquidPopover } from '../../src/liquid-presence';
import '../../src/presence/presence.css';
import './completion-review.css';

const RouterLink = forwardRef<HTMLAnchorElement, ComponentProps<'a'>>((props, ref) => (
  <a {...props} ref={ref} data-router-link="true" />
));

export function CompletionControls() {
  const [open, setOpen] = useState(false);
  const source = useRef<HTMLButtonElement>(null);
  return (
    <main className="completion-review">
      <h1>链接仍是链接，操作仍是操作。</h1>
      <section aria-label="链接与小号">
        <h2>同一套水滴</h2>
        <div className="completion-review-row">
          <GameButton href="#sample-destination">查看原文</GameButton>
          <GameButton href="#sample-destination" size="sm">
            小号链接
          </GameButton>
          <GameIconButton href="#sample-destination" label="打开原文" size="sm">
            <GameIcon icon="external" size="sm" />
          </GameIconButton>
          <GameButton href="#sample-destination" linkComponent={RouterLink}>
            路由链接
          </GameButton>
          <GameButton href="#sample-destination" disabled>
            暂不可进入
          </GameButton>
        </div>
        <p>小号高32像素。按下只改变背景，文字和点击区域不缩小。</p>
        <GameButton href="#sample-destination" variant="primary">
          开始阅读
        </GameButton>
      </section>
      <section aria-label="液体面板">
        <h2>需要时打开，用完回到原处</h2>
        <GameButton ref={source} aria-expanded={open} onClick={() => setOpen(!open)}>
          打开液体面板
        </GameButton>
        <LiquidPopover open={open} onOpenChange={setOpen} source={source} title="保留你的发现">
          <p>面板已经是液体，内部按钮保持平面。按 Esc 或点外面可关闭。</p>
          <label>
            你的笔记
            <GameInput aria-label="你的笔记" defaultValue="继续手头的事" />
          </label>
          <div className="completion-review-row">
            <GameButton onClick={() => setOpen(false)}>收下</GameButton>
            <GameButton onClick={() => setOpen(false)}>稍后再说</GameButton>
          </div>
        </LiquidPopover>
      </section>
      <section id="sample-destination" tabIndex={-1}>
        <h2>原文就在这里</h2>
        <p>导航由浏览器或产品路由完成，没有伪造点击。</p>
      </section>
    </main>
  );
}
