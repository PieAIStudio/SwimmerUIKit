import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  flip,
  offset,
  type Placement,
  safePolygon,
  shift,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react';
import { DropletSurface } from '../../controls/DropletSurface/DropletSurface';
import { GameTabs } from '../../controls/GameTabs/GameTabs';
import { useSystemReducedMotion } from '../../tokens/reducedMotion';

export type GameHelpMedia =
  | {
      kind: 'video';
      /** Ordered sources, e.g. webm then mp4. */
      sources: readonly { src: string; type: 'video/webm' | 'video/mp4' }[];
      poster: string;
      alt: string;
      width: number;
      height: number;
    }
  | { kind: 'image'; src: string; alt: string; width: number; height: number };

export interface GameHelpCardTopic {
  id: string;
  /** Tab label when there are several topics. */
  label: string;
  title: string;
  /** 1–3 short lines; "\n" breaks a line. */
  body: string;
  media?: GameHelpMedia;
}

export interface GameHelpCardProps {
  /** One focusable trigger element (e.g. a GameIconButton link or button). */
  children: ReactElement;
  /** Accessible name of the card, e.g. "怎么用". */
  label: string;
  /** 1 to 4 topics; more than one shows tabs. */
  topics: readonly GameHelpCardTopic[];
  /** Optional link at the bottom, e.g. the full guide. */
  link?: { href: string; label: string };
  placement?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  /** Hover intent delay in ms; default 200. */
  openDelay?: number;
}

type TriggerProps = {
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  onPointerDown?: (event: PointerEvent<HTMLElement>) => void;
  ref?: Ref<HTMLElement>;
};

const CLOSE_DELAY_MS = 150;

/**
 * A non-modal hover/focus/tap card that teaches one short idea. Floating UI owns
 * collision, hover intent, focus order and dismissal, as in GameHelpTip. The
 * card is portalled into the closest native dialog and built on the static
 * droplet surface, so it adds no liquid engine and no LiquidPopover.
 */
export function GameHelpCard({
  children,
  label,
  topics,
  link,
  placement = 'bottom',
  align = 'center',
  openDelay = 200,
}: GameHelpCardProps): ReactNode {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [portalRoot, setPortalRoot] = useState<HTMLElement | undefined>(undefined);
  const triggerRef = useRef<HTMLElement | null>(null);
  // Mouse and touch focus are not keyboard entry: a pointer press focuses the
  // trigger after pointerdown, and that focus must not open the card.
  const pointerTypeRef = useRef<string | undefined>(undefined);
  const pointerFocusRef = useRef(false);
  // Focus returned by Escape must not reopen the card that Escape just closed.
  const suppressFocusOpenRef = useRef(false);

  const setCardOpen = (next: boolean) => {
    // Every opening starts from the first topic; the chosen tab lasts only while open.
    if (next) setSelectedId('');
    setOpen(next);
  };

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange(next, event, reason) {
      if (!next && reason === 'escape-key') {
        // Escape dismisses this card, not the enclosing native dialog. When the
        // focus was inside the card, return it to the trigger.
        event?.preventDefault();
        event?.stopPropagation();
        const trigger = triggerRef.current;
        if (trigger && refs.floating.current?.contains(document.activeElement)) {
          suppressFocusOpenRef.current = true;
          trigger.focus();
          suppressFocusOpenRef.current = false;
        }
      }
      setCardOpen(next);
    },
    placement: (align === 'center' ? placement : `${placement}-${align}`) as Placement,
    strategy: 'fixed',
    middleware: [offset(8), flip(), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });
  const hover = useHover(context, {
    mouseOnly: true,
    move: false,
    delay: { open: openDelay, close: CLOSE_DELAY_MS },
    handleClose: safePolygon(),
  });
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss]);

  const childRef = (children.props as TriggerProps).ref;
  const setReference = useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node;
      refs.setReference(node);
      setPortalRoot(node?.closest('dialog') ?? undefined);
      if (typeof childRef === 'function') childRef(node);
      else if (childRef) (childRef as { current: HTMLElement | null }).current = node;
    },
    [childRef, refs],
  );

  const active = topics.find((topic) => topic.id === selectedId) ?? topics[0];
  if (!active) return children;
  const childProps = children.props as TriggerProps;
  const floatingId = `${id}-card`;
  const tabsId = `${id}-tabs`;
  const tabId = (topicId: string) => `${tabsId}-${topicId}`;
  const panelId = (topicId: string) => `${id}-panel-${topicId}`;

  const trigger = cloneElement(children as ReactElement<Record<string, unknown>>, {
    ...getReferenceProps({
      onPointerDown(event: PointerEvent<HTMLElement>) {
        pointerTypeRef.current = event.pointerType;
        pointerFocusRef.current = true;
        childProps.onPointerDown?.(event);
      },
      onFocus(event: FocusEvent<HTMLElement>) {
        const fromPointer = pointerFocusRef.current;
        pointerFocusRef.current = false;
        if (!fromPointer && !open && !suppressFocusOpenRef.current) setCardOpen(true);
        childProps.onFocus?.(event);
      },
      onBlur(event: FocusEvent<HTMLElement>) {
        pointerFocusRef.current = false;
        childProps.onBlur?.(event);
      },
      onClick(event: MouseEvent<HTMLElement>) {
        const touch = pointerTypeRef.current === 'touch';
        pointerTypeRef.current = undefined;
        if (touch && !open) {
          // The first tap only opens the card; the second tap is the action.
          event.preventDefault();
          event.stopPropagation();
          setCardOpen(true);
          return;
        }
        childProps.onClick?.(event);
      },
      onKeyDown(event: KeyboardEvent<HTMLElement>) {
        if (open && event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          setCardOpen(false);
          return;
        }
        childProps.onKeyDown?.(event);
      },
    }),
    ref: setReference,
    'aria-expanded': open,
    'aria-controls': open ? floatingId : undefined,
  });

  return (
    <>
      {trigger}
      {open && (
        <FloatingPortal root={portalRoot}>
          <FloatingFocusManager
            context={context}
            modal={false}
            initialFocus={-1}
            returnFocus={false}
            order={['reference', 'content']}
          >
            <div
              ref={refs.setFloating}
              id={floatingId}
              role="dialog"
              aria-label={label}
              className="game-ui-help-card"
              style={floatingStyles}
              {...getFloatingProps()}
            >
              <ThemeMirror source={triggerRef.current} />
              {/* The painted card is a child of the mirrored theme and style scope. */}
              <div className="game-ui-help-card-paint" data-game-ui-paint="">
                <DropletSurface static />
                <div className="game-ui-help-card-content">
                  {topics.length > 1 ? (
                    <GameTabs
                      id={tabsId}
                      activeId={active.id}
                      aria-label={label}
                      tabs={topics.map((topic) => ({
                        id: topic.id,
                        label: topic.label,
                        panelId: panelId(topic.id),
                      }))}
                      onSelect={setSelectedId}
                    />
                  ) : null}
                  {topics.length > 1 ? (
                    topics.map((topic) => (
                      <div
                        key={topic.id}
                        id={panelId(topic.id)}
                        role="tabpanel"
                        aria-labelledby={tabId(topic.id)}
                        hidden={topic.id !== active.id}
                      >
                        <HelpTopic topic={topic} showMedia={topic.id === active.id} />
                      </div>
                    ))
                  ) : (
                    <HelpTopic topic={active} showMedia />
                  )}
                  {link ? (
                    <a className="game-ui-help-card-link" href={link.href}>
                      {link.label}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}

const THEME_ATTRIBUTES = ['data-game-ui-theme', 'data-game-ui-style'];
const MIRROR_ATTRIBUTES = ['class', 'style', ...THEME_ATTRIBUTES];

/**
 * The portal leaves the themed subtree. Copy the nearest theme and style
 * attributes and the theme-level --game-ui-* tokens of the themed ancestor onto
 * this card, then follow later changes there. The trigger's own paint state is
 * not copied, so hover or pressed colours never leak into the card.
 */
function ThemeMirror({ source }: { source: HTMLElement | null }) {
  const probe = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const layer = probe.current?.parentElement;
    if (!layer || !source) return;
    const themed = (node: Element) =>
      node.closest('[data-game-ui-theme], [data-game-ui-style]') ?? document.documentElement;
    const sync = () => {
      const host = themed(source);
      for (const name of THEME_ATTRIBUTES) {
        const value = host.closest(`[${name}]`)?.getAttribute(name);
        if (value) layer.setAttribute(name, value);
        else layer.removeAttribute(name);
      }
      const computed = getComputedStyle(host);
      for (const token of computed) {
        // The theme's default droplet radius is 999px. The card owns its own
        // radius, so an inherited copy must not override the card rule.
        if (!token.startsWith('--game-ui-') || token === '--game-ui-droplet-radius') continue;
        const value = computed.getPropertyValue(token).trim();
        if (layer.style.getPropertyValue(token) !== value) layer.style.setProperty(token, value);
      }
    };
    const observer = new MutationObserver(sync);
    for (let node: Element | null = themed(source); node; node = node.parentElement)
      observer.observe(node, { attributes: true, attributeFilter: MIRROR_ATTRIBUTES });
    sync();
    return () => observer.disconnect();
  }, [source]);
  return <span ref={probe} hidden />;
}

function HelpTopic({ topic, showMedia }: { topic: GameHelpCardTopic; showMedia: boolean }) {
  return (
    <>
      <h3 className="game-ui-help-card-title">{topic.title}</h3>
      <p className="game-ui-help-card-body">{topic.body}</p>
      {showMedia && topic.media ? <HelpMedia media={topic.media} /> : null}
    </>
  );
}

function HelpMedia({ media }: { media: GameHelpMedia }) {
  if (media.kind === 'image') {
    return (
      <img
        className="game-ui-help-card-media"
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        decoding="async"
        style={{ aspectRatio: `${media.width} / ${media.height}` }}
      />
    );
  }
  return <HelpVideo media={media} />;
}

function HelpVideo({ media }: { media: Extract<GameHelpMedia, { kind: 'video' }> }) {
  const reduced = useSystemReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  // This element exists only while its topic is open and selected, so the
  // cleanup is the pause for closing, switching topic and unmounting alike.
  useEffect(() => {
    const element = video.current;
    if (!element || reduced) return;
    element.play().catch(() => undefined);
    return () => element.pause();
  }, [reduced]);
  return (
    <video
      ref={video}
      className="game-ui-help-card-media"
      width={media.width}
      height={media.height}
      style={{ aspectRatio: `${media.width} / ${media.height}` }}
      poster={media.poster}
      muted
      loop
      playsInline
      preload="metadata"
      role="img"
      aria-label={media.alt}
    >
      {media.sources.map((source) => (
        <source key={source.src} src={source.src} type={source.type} />
      ))}
    </video>
  );
}
