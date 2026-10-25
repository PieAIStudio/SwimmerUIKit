import type { ReactNode } from 'react';
import { type SurfaceDensity, type SurfaceLayout } from '../shared/surfaceTypes';

export type ShellPlatform = 'mac' | 'windows';
export type ShellLook = 'glass' | 'aura';

export interface ShellProps {
  /** Main host surface, usually a game scene or a tool page. */
  children: ReactNode;
  /** Asset/library rail. Kept slot-based so the kit never imports app runtime state. */
  assetLibrary?: ReactNode;
  /** Bottom or floating object/placement controls. */
  bottomBar?: ReactNode;
  /** Explicit compact density for tool chrome and host-owned slots. */
  compact?: boolean;
  className?: string;
  density?: SurfaceDensity;
  /** Persistent HUD, facts, chips, or app navigation. */
  hud?: ReactNode;
  /**
   * Tool-shell surface. `glass` frosts the sidebar; `aura` paints one static
   * spectral glow (`--swimmer-aura`) under sidebar and main, with no blur.
   */
  look?: ShellLook;
  /** Optional navigation shown when the tool shell becomes a single column. */
  mobileNav?: ReactNode;
  layout?: SurfaceLayout;
  /** Optional movement affordance, usually `MovementPad`. */
  movementPad?: ReactNode;
  /** Modal, toast, onboarding, or non-blocking overlays. */
  overlay?: ReactNode;
  /** Platform voice for the tool shell; it never guesses the host OS. */
  platform?: ShellPlatform;
  /** Explicitly hold non-essential shell motion still. */
  reducedMotion?: boolean;
  /** Secondary panel slot for inspector/debug/user-owned sidebars. */
  sidePanel?: ReactNode;
  /** Tool navigation or account rail. Its contents remain host-owned. */
  sidebar?: ReactNode;
  sidebarLabel?: string;
  /** Accessible label for the whole surface. */
  title: string;
  /** Window chrome slot for tool title, status, or host controls. */
  windowBar?: ReactNode;
}

export function Shell({
  assetLibrary,
  bottomBar,
  children,
  className,
  compact = false,
  density = 'comfortable',
  hud,
  layout = 'auto',
  look = 'glass',
  mobileNav,
  movementPad,
  overlay,
  platform = 'mac',
  reducedMotion = false,
  sidePanel,
  sidebar,
  sidebarLabel,
  title,
  windowBar,
}: ShellProps): ReactNode {
  const classes = ['game-ui-shell', className].filter(Boolean).join(' ');
  const toolShell = sidebar !== undefined;
  return (
    <section
      aria-label={title}
      className={classes}
      data-compact={compact ? 'true' : undefined}
      data-density={compact ? 'dense' : density}
      data-game-ui-density={compact ? 'compact' : undefined}
      data-layout={layout}
      data-platform={toolShell ? platform : undefined}
      data-reduced-motion={reducedMotion ? 'true' : undefined}
      data-tool-shell={toolShell ? 'true' : undefined}
      data-tool-look={toolShell && look === 'aura' ? 'aura' : undefined}
    >
      {sidebar !== undefined ? (
        <>
          <aside aria-label={sidebarLabel} className="game-ui-shell-sidebar">
            {sidebar}
          </aside>
          <div className="game-ui-shell-main">
            {windowBar ? <header className="game-ui-shell-window-bar">{windowBar}</header> : null}
            <div className="game-ui-shell-scene">{children}</div>
          </div>
        </>
      ) : (
        <div className="game-ui-shell-scene">{children}</div>
      )}
      {mobileNav ? <div className="game-ui-shell-mobile-nav">{mobileNav}</div> : null}
      {hud ? <div className="game-ui-shell-hud">{hud}</div> : null}
      {assetLibrary ? <aside className="game-ui-shell-library">{assetLibrary}</aside> : null}
      {sidePanel ? <aside className="game-ui-shell-side-panel">{sidePanel}</aside> : null}
      {movementPad ? <div className="game-ui-shell-movement">{movementPad}</div> : null}
      {bottomBar ? <div className="game-ui-shell-bottom-bar">{bottomBar}</div> : null}
      {overlay ? <div className="game-ui-shell-overlay">{overlay}</div> : null}
    </section>
  );
}
