/*
 * One component, two renderers, one set of tokens. Default is CSS so a
 * page of these cannot spend WebGL contexts. WebGL is an upgrade, not a
 * mode the host has to remember. We do not iframe the ThreeUI HTML page:
 * that wrapper hardcodes #0e0f12, cannot see our CSS variables, and
 * steals focus. The shader is inlined in liquidMetalWebGL.ts (MIT).
 */
import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from 'react';

import { playGameInteractionSound, type GameInteractionSoundOptions } from './interactionSound';
import {
  releaseLiquidMetalContext,
  shouldAttemptWebGL,
  tryAcquireLiquidMetalContext,
  type LiquidMetalRendererMode,
} from './liquidMetalBudget';
import { attachLiquidMetalWebGL, type LiquidMetalWebGLHandle } from './liquidMetalWebGL';

export type { LiquidMetalRendererMode };

export interface LiquidMetalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  sound?: GameInteractionSoundOptions | false;
  /**
   * `auto` (default) starts on CSS and upgrades to WebGL when the four
   * gates pass. `css` never spends a context — needed so a side-by-side
   * demo can show the fallback without the CSS column taking the slot
   * the WebGL column needs. `webgl` still respects the gates; it is not
   * a way to bypass reduced-motion or the budget.
   */
  renderer?: LiquidMetalRendererMode;
}

export function LiquidMetalButton({
  children,
  className,
  onClick,
  sound = false,
  type = 'button',
  renderer = 'auto',
  ...props
}: LiquidMetalButtonProps): ReactNode {
  const hostRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeRenderer, setActiveRenderer] = useState<'css' | 'webgl'>('css');

  useEffect(() => {
    const host = hostRef.current;
    const button = buttonRef.current;
    const canvas = canvasRef.current;
    if (!host || !button || !canvas) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    let claimed = false;
    let handle: LiquidMetalWebGLHandle | null = null;
    let cancelled = false;

    const dropContext = (): void => {
      handle?.dispose();
      handle = null;
      if (claimed) {
        releaseLiquidMetalContext();
        claimed = false;
      }
      if (!cancelled) setActiveRenderer('css');
    };

    const tryUpgrade = (): void => {
      if (cancelled || handle) return;
      const attempt = shouldAttemptWebGL({
        renderer,
        hasWebGL2: typeof WebGL2RenderingContext !== 'undefined',
        prefersReducedMotion: media.matches,
        isInViewport: inView,
      });
      if (!attempt) return;
      if (!tryAcquireLiquidMetalContext()) return;
      claimed = true;
      handle = attachLiquidMetalWebGL(canvas, button, host);
      if (!handle) {
        releaseLiquidMetalContext();
        claimed = false;
        return;
      }
      setActiveRenderer('webgl');
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        inView = Boolean(entry?.isIntersecting);
        if (handle) {
          // Off-screen we pause the loop but keep the context: destroying
          // it to "save" a slot and then rebuilding on scroll is the hitch
          // this pause exists to avoid.
          if (inView && document.visibilityState !== 'hidden') handle.resume();
          else handle.pause();
        } else {
          tryUpgrade();
        }
      },
      { rootMargin: '80px' },
    );
    observer.observe(host);

    const onVisibility = (): void => {
      if (!handle) return;
      if (document.visibilityState === 'hidden' || !inView) handle.pause();
      else handle.resume();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const onMotion = (): void => {
      if (media.matches) {
        // Newly-requested reduced motion: drop the shader rather than keep
        // a still WebGL context the user just asked us not to spend.
        dropContext();
        return;
      }
      tryUpgrade();
    };
    media.addEventListener('change', onMotion);

    tryUpgrade();

    return () => {
      cancelled = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      media.removeEventListener('change', onMotion);
      dropContext();
    };
  }, [renderer]);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (sound) playGameInteractionSound(sound);
    onClick?.(event);
  };

  const classes = ['game-ui-liquid-metal', className].filter(Boolean).join(' ');

  return (
    <span ref={hostRef} className="game-ui-liquid-metal-host" data-renderer={activeRenderer}>
      <span aria-hidden="true" className="game-ui-liquid-metal-plate" />
      <canvas ref={canvasRef} aria-hidden="true" className="game-ui-liquid-metal-canvas" />
      <button className={classes} onClick={handleClick} ref={buttonRef} type={type} {...props}>
        <span className="game-ui-liquid-metal-label">{children}</span>
      </button>
    </span>
  );
}
