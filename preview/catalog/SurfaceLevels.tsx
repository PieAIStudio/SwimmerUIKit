import { useState } from 'react';
import { GamePanel } from '../../src/containers/GamePanel/GamePanel';
import { GameInput } from '../../src/controls/GameInput/GameInput';
import { GameButton } from '../../src/controls/GameButton/GameButton';
import { GameModal } from '../../src/containers/GameModal/GameModal';
import './surface-levels.css';

/** Real shared components, not a second theme palette painted for a screenshot. */
export function SurfaceLevels() {
  const [open, setOpen] = useState(false);
  return (
    <section className="kit-surface-levels" aria-label="界面层级">
      <header>
        <h2>大底、面板、输入、浮层。</h2>
        <p>颜色只跟随明暗；只有临时浮层抬起来。</p>
      </header>
      <div className="kit-surface-grid">
        <div data-surface-sample="bg" className="kit-surface-base">
          <strong>大底</strong>
          <p>页面留白。</p>
        </div>
        <GamePanel title="面板" data-surface-sample="surface">
          <p>承载一组内容。</p>
          <GameInput
            aria-label="写在凹入的区域"
            placeholder="输入的地方再深一点"
            data-surface-sample="sunken"
          />
        </GamePanel>
        <div className="kit-surface-raised" data-surface-sample="raised">
          <strong>浮层</strong>
          <p>短暂出现，不抢走主线。</p>
          <GameButton onClick={() => setOpen(true)}>打开真实弹窗</GameButton>
        </div>
      </div>
      <GameModal open={open} onClose={() => setOpen(false)} title="内容仍在原处">
        <p>浮层使用 raised；关闭后回到原来的按钮。</p>
        <GameButton onClick={() => setOpen(false)}>返回</GameButton>
      </GameModal>
    </section>
  );
}
