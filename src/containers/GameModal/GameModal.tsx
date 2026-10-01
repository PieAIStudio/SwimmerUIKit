import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { joinClasses } from '../shared/classes';
import { WindowGlyph } from '../GameWindowPanel/GameWindowPanel';

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
  /** Keep children mounted while closed to preserve their local state. Closed content stays inert. */
  keepMounted?: boolean;
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
  keepMounted = false,
  onClose,
  open,
  position = 'center',
  size = 'md',
  title,
}: GameModalProps): ReactNode {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const modalFrameRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [contentInert, setContentInert] = useState(!open);

  useEffect(() => {
    const dialog = dialogRef.current;
    const frame = modalFrameRef.current;
    if (!dialog || !frame) return;
    if (open) {
      if (contentInert) {
        frame.removeAttribute('aria-hidden');
        frame.removeAttribute('inert');
      }
      if (!dialog.open) dialog.showModal();
      setContentInert(false);
      return;
    }
    if (dialog.open) dialog.close();
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('inert', '');
    setContentInert(true);
  }, [contentInert, open]);

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
      <div
        aria-hidden={contentInert ? true : undefined}
        className="game-ui-modal-frame"
        inert={contentInert || undefined}
        ref={modalFrameRef}
      >
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
        <div className="game-ui-modal-body">{open || keepMounted ? children : null}</div>
        {footer ? <footer className="game-ui-modal-footer">{footer}</footer> : null}
      </div>
    </dialog>
  );
}
