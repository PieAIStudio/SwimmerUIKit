import { DropletSurface } from '../../controls/DropletSurface/DropletSurface';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { HelpLoop } from '../HelpLoop/HelpLoop';
import { ThemeMirror } from '../shared/ThemeMirror';
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';

export interface HelpTipProps {
  /** Accessible name of the help button, in the product's language. */
  label: string;
  /** Legacy text-only explanation, also used when caption is omitted. */
  children?: string;
  /** Text-free, noninteractive drawing. Author motion with CSS (see HelpLoop). */
  media?: ReactNode;
  /** Still key frame for prefers-reduced-motion. */
  poster?: ReactNode;
  /** One app-localized sentence; also the tooltip's accessible name. */
  caption?: string;
}

/** Optional help, not an action menu or a place to hide required information.
 * Floating UI owns collision avoidance, hover/focus/click and dismissal. The
 * native help button never submits its surrounding form. Inside a native modal
 * the portal stays in that modal's top layer, not in the inert document body.
 */
export function HelpTip({ label, children, media, poster, caption }: HelpTipProps): ReactNode {
  const [open, setOpen] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | undefined>(undefined);
  const text = caption ?? children ?? '';
  useEffect(() => {
    // NODE_ENV is left for the consuming app's bundler, unlike import.meta.env.DEV.
    if (
      process.env.NODE_ENV !== 'production' &&
      !media &&
      (text.length > 60 || /[.!?。！？]\s*\S/u.test(text))
    ) {
      console.warn(
        '[HelpTip] Prefer a text-free picture and one short caption (about 60 characters).',
      );
    }
  }, [media, text]);
  const { refs, floatingStyles, context } = useFloating<HTMLButtonElement>({
    open,
    onOpenChange(next, event, reason) {
      // A hover-opened tip may not own keyboard focus. Prevent the native
      // dialog's Escape default at the library dismissal boundary, not only
      // on the trigger. No custom document listeners or second popup engine.
      if (!next && reason === 'escape-key') {
        event?.preventDefault();
        event?.stopPropagation();
      }
      setOpen(next);
    },
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset(8), flip(), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });
  const setReference = useCallback(
    (node: HTMLButtonElement | null) => {
      refs.setReference(node);
      setPortalRoot(node?.closest('dialog') ?? undefined);
    },
    [refs],
  );
  const hover = useHover(context, {
    mouseOnly: true,
    move: false,
    delay: { open: 300, close: 120 },
    handleClose: safePolygon(),
  });
  const focus = useFocus(context);
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    click,
    dismiss,
    role,
  ]);

  return (
    <>
      <button
        ref={setReference}
        type="button"
        className="game-ui-help-trigger"
        aria-label={label}
        {...getReferenceProps({
          onKeyDown(event) {
            if (open && event.key === 'Escape') {
              // Escape dismisses this help, not the enclosing native dialog.
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
            }
          },
        })}
        data-game-ui-paint=""
      >
        <DropletSurface />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M9.8 8.5a2.5 2.5 0 0 1 4.7 1.2c0 1.8-2.5 1.9-2.5 3.6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="12" cy="16.7" r="1" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <FloatingPortal root={portalRoot}>
          <div
            ref={refs.setFloating}
            className="game-ui-help-tip"
            style={floatingStyles}
            {...getFloatingProps()}
            aria-label={text}
          >
            <ThemeMirror source={refs.domReference.current} />
            {media && <HelpLoop poster={poster}>{media}</HelpLoop>}
            {text}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
