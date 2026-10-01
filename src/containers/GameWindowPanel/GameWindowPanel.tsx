import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { joinClasses } from '../shared/classes';

/* ------------------------------------------------------------------ */
/* GameWindowPanel                                                     */
/* ------------------------------------------------------------------ */

export type GameWindowState = 'normal' | 'minimized' | 'maximized';

export interface GameWindowPanelLabels {
  close: string;
  maximize: string;
  minimize: string;
  restore: string;
}

const WINDOW_DEFAULT_LABELS: GameWindowPanelLabels = {
  close: 'Close',
  maximize: 'Maximize',
  minimize: 'Minimize',
  restore: 'Restore',
};

export interface GameWindowPanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Allow the maximize button. Defaults to true. */
  allowMaximize?: boolean;
  /** Allow the minimize button. Defaults to true. */
  allowMinimize?: boolean;
  children: ReactNode;
  className?: string;
  /** Uncontrolled initial state. Defaults to 'normal'. */
  defaultState?: GameWindowState;
  footer?: ReactNode;
  icon?: ReactNode;
  labels?: Partial<GameWindowPanelLabels>;
  /** Rendering a close button requires an onClose handler. */
  onClose?: () => void;
  onStateChange?: (state: GameWindowState) => void;
  /** Controlled window state. Leave undefined for uncontrolled usage. */
  state?: GameWindowState;
  title: string;
}

export function WindowGlyph({
  kind,
}: {
  kind: 'close' | 'maximize' | 'minimize' | 'restore';
}): ReactNode {
  const paths: Record<typeof kind, string> = {
    close: 'M3 3l8 8M11 3l-8 8',
    maximize: 'M3 5V3h2M9 3h2v2M11 9v2H9M5 11H3V9',
    minimize: 'M3 7h8',
    restore: 'M4 6h6v5H4zM6 6V4h6v5h-2',
  };
  return (
    <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 14 14" width="14">
      <path d={paths[kind]} stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export function GameWindowPanel({
  allowMaximize = true,
  allowMinimize = true,
  children,
  className,
  defaultState = 'normal',
  footer,
  icon,
  labels,
  onClose,
  onStateChange,
  state,
  title,
  ...props
}: GameWindowPanelProps): ReactNode {
  const [uncontrolledState, setUncontrolledState] = useState<GameWindowState>(defaultState);
  const windowState = state ?? uncontrolledState;
  const text = { ...WINDOW_DEFAULT_LABELS, ...labels };

  const setWindowState = (next: GameWindowState) => {
    if (state === undefined) setUncontrolledState(next);
    onStateChange?.(next);
  };

  const isMinimized = windowState === 'minimized';
  const isMaximized = windowState === 'maximized';

  return (
    <section
      {...props}
      aria-label={title}
      className={joinClasses('game-ui-window', className)}
      data-window-state={windowState}
      role="group"
    >
      <header className="game-ui-window-titlebar">
        {icon ? (
          <span aria-hidden="true" className="game-ui-window-icon">
            {icon}
          </span>
        ) : null}
        <h3 className="game-ui-window-title">{title}</h3>
        <span className="game-ui-window-actions">
          {allowMinimize ? (
            <button
              aria-label={isMinimized ? text.restore : text.minimize}
              className="game-ui-icon-button game-ui-window-button"
              onClick={() => setWindowState(isMinimized ? 'normal' : 'minimized')}
              type="button"
            >
              <WindowGlyph kind={isMinimized ? 'restore' : 'minimize'} />
            </button>
          ) : null}
          {allowMaximize ? (
            <button
              aria-label={isMaximized ? text.restore : text.maximize}
              className="game-ui-icon-button game-ui-window-button"
              onClick={() => setWindowState(isMaximized ? 'normal' : 'maximized')}
              type="button"
            >
              <WindowGlyph kind={isMaximized ? 'restore' : 'maximize'} />
            </button>
          ) : null}
          {onClose ? (
            <button
              aria-label={text.close}
              className="game-ui-icon-button game-ui-window-button"
              onClick={onClose}
              type="button"
            >
              <WindowGlyph kind="close" />
            </button>
          ) : null}
        </span>
      </header>
      <div className="game-ui-window-region">
        <div className="game-ui-window-clip">
          <div className="game-ui-window-body">{children}</div>
          {footer ? <footer className="game-ui-window-footer">{footer}</footer> : null}
        </div>
      </div>
    </section>
  );
}
