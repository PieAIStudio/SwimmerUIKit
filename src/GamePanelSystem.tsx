import {
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';

/*
 * Game panel system: collapsible panels, minimizable/maximizable windows, and
 * a real modal built on the native <dialog> element. Zero runtime deps —
 * the browser provides focus trap, Esc, top layer, and backdrop for modals;
 * CSS grid-row interpolation provides height animation everywhere.
 */

function joinClasses(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------ */
/* GameCollapsiblePanel                                                */
/* ------------------------------------------------------------------ */

export interface GameCollapsiblePanelLabels {
  collapse: string;
  expand: string;
}

const COLLAPSIBLE_DEFAULT_LABELS: GameCollapsiblePanelLabels = {
  collapse: 'Collapse',
  expand: 'Expand',
};

export interface GameCollapsiblePanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  children: ReactNode;
  className?: string;
  /** Controlled open state. Leave undefined for uncontrolled usage. */
  open?: boolean;
  /** Uncontrolled initial state. Defaults to true (expanded). */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Extra header actions rendered next to the toggle (e.g. icon buttons). */
  actions?: ReactNode;
  labels?: Partial<GameCollapsiblePanelLabels>;
  title: string;
  tone?: 'default' | 'strong';
}

export function GameCollapsiblePanel({
  actions,
  children,
  className,
  defaultOpen = true,
  labels,
  onOpenChange,
  open,
  title,
  tone = 'default',
  ...props
}: GameCollapsiblePanelProps): ReactNode {
  const regionId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;
  const text = { ...COLLAPSIBLE_DEFAULT_LABELS, ...labels };

  const toggle = () => {
    const next = !isOpen;
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  return (
    <section
      {...props}
      className={joinClasses('game-ui-collapsible', className)}
      data-open={isOpen}
      data-panel-tone={tone}
    >
      <header className="game-ui-collapsible-header">
        <h3 className="game-ui-collapsible-heading">
          <button
            aria-controls={regionId}
            aria-expanded={isOpen}
            className="game-ui-collapsible-toggle"
            onClick={toggle}
            title={isOpen ? text.collapse : text.expand}
            type="button"
          >
            <span aria-hidden="true" className="game-ui-collapsible-chevron" />
            <span className="game-ui-collapsible-title">{title}</span>
          </button>
        </h3>
        {actions ? <span className="game-ui-collapsible-actions">{actions}</span> : null}
      </header>
      <div className="game-ui-collapsible-region" id={regionId}>
        <div className="game-ui-collapsible-clip">
          <div className="game-ui-collapsible-content">{children}</div>
        </div>
      </div>
    </section>
  );
}

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

function WindowGlyph({ kind }: { kind: 'close' | 'maximize' | 'minimize' | 'restore' }): ReactNode {
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

/* ------------------------------------------------------------------ */
/* GameModal                                                           */
/* ------------------------------------------------------------------ */

export interface GameModalProps {
  children: ReactNode;
  className?: string;
  /** Close when the backdrop is clicked. Defaults to true. */
  closeOnBackdrop?: boolean;
  closeLabel?: string;
  footer?: ReactNode;
  /** Called for every close intent: Esc, backdrop click, and close button. */
  onClose: () => void;
  open: boolean;
  /**
   * `'bottom'` anchors the frame to the viewport's bottom edge (rounded top
   * corners only, safe-area-aware padding, slide-up entrance) for mobile
   * action sheets — same native <dialog> underneath, so focus trap/Esc/
   * backdrop/top-layer come free either way. Defaults to `'center'`.
   */
  position?: 'center' | 'bottom';
  size?: 'sm' | 'md' | 'lg';
  title: string;
}

export function GameModal({
  children,
  className,
  closeLabel = 'Close',
  closeOnBackdrop = true,
  footer,
  onClose,
  open,
  position = 'center',
  size = 'md',
  title,
}: GameModalProps): ReactNode {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (closeOnBackdrop && event.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      aria-labelledby={titleId}
      className={joinClasses('game-ui-modal', className)}
      data-position={position}
      data-size={size}
      onCancel={(event) => {
        // Keep React state authoritative: swallow the native close and report.
        event.preventDefault();
        onClose();
      }}
      onClick={handleBackdropClick}
      ref={dialogRef}
    >
      <div className="game-ui-modal-frame">
        <header className="game-ui-modal-header">
          <h2 className="game-ui-modal-title" id={titleId}>
            {title}
          </h2>
          <button
            aria-label={closeLabel}
            className="game-ui-icon-button game-ui-window-button"
            onClick={onClose}
            type="button"
          >
            <WindowGlyph kind="close" />
          </button>
        </header>
        <div className="game-ui-modal-body">{open ? children : null}</div>
        {footer ? <footer className="game-ui-modal-footer">{footer}</footer> : null}
      </div>
    </dialog>
  );
}
