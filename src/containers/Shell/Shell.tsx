import type { ReactNode } from 'react';
import { type SurfaceDensity, type SurfaceLayout } from '../shared/surfaceTypes';

export interface ShellProps {
  /** Main game runtime surface, usually the host app canvas or 3D scene. */
  children: ReactNode;
  /** Asset/library rail. Kept slot-based so the kit never imports app runtime state. */
  assetLibrary?: ReactNode;
  /** Bottom or floating object/placement controls. */
  bottomBar?: ReactNode;
  className?: string;
  density?: SurfaceDensity;
  /** Persistent HUD, facts, chips, or app-owned navigation. */
  hud?: ReactNode;
  layout?: SurfaceLayout;
  /** Optional movement affordance, usually `MovementPad`. */
  movementPad?: ReactNode;
  /** Modal, toast, onboarding, or non-blocking overlays. */
  overlay?: ReactNode;
  /** Secondary panel slot for inspector/debug/user-owned sidebars. */
  sidePanel?: ReactNode;
  /** Accessible label for the whole game surface. */
  title: string;
}

/** Game scene shell. Tool windows use ToolWindow instead; this shell owns no tool chrome. */
export function Shell({
  assetLibrary,
  bottomBar,
  children,
  className,
  density = 'comfortable',
  hud,
  layout = 'auto',
  movementPad,
  overlay,
  sidePanel,
  title,
}: ShellProps): ReactNode {
  const classes = ['game-ui-shell', className].filter(Boolean).join(' ');
  return (
    <section aria-label={title} className={classes} data-density={density} data-layout={layout}>
      <div className="game-ui-shell-scene">{children}</div>
      {hud ? <div className="game-ui-shell-hud">{hud}</div> : null}
      {assetLibrary ? <aside className="game-ui-shell-library">{assetLibrary}</aside> : null}
      {sidePanel ? <aside className="game-ui-shell-side-panel">{sidePanel}</aside> : null}
      {movementPad ? <div className="game-ui-shell-movement">{movementPad}</div> : null}
      {bottomBar ? <div className="game-ui-shell-bottom-bar">{bottomBar}</div> : null}
      {overlay ? <div className="game-ui-shell-overlay">{overlay}</div> : null}
    </section>
  );
}
